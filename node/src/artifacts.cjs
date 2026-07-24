"use strict";

const fs = require("node:fs");
const path = require("node:path");

/* Compact artifact writer (plan: "Artifacts"). Bounded by construction:
 * the timeline stops growing at maxTimelineBytes and records how much was
 * dropped, so a long-running failure cannot produce unbounded artifacts.
 */
function createArtifactWriter({ dir, maxTimelineBytes = 4 * 1024 * 1024 }) {
  fs.mkdirSync(dir, { recursive: true });
  const timelinePath = path.join(dir, "timeline.ndjson");
  let timelineBytes = 0;
  let droppedEvents = 0;

  return {
    dir,
    writeRun(run) {
      fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(run, null, 2) + "\n", "utf8");
    },
    appendTimeline(event) {
      const line = JSON.stringify(event) + "\n";
      if (timelineBytes + line.length > maxTimelineBytes) {
        droppedEvents++;
        return false;
      }
      fs.appendFileSync(timelinePath, line, "utf8");
      timelineBytes += line.length;
      return true;
    },
    writeResult(result) {
      const full = { ...result, timeline: { bytes: timelineBytes, droppedEvents } };
      fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(full, null, 2) + "\n", "utf8");
      return full;
    },
    get droppedEvents() {
      return droppedEvents;
    },
  };
}

module.exports = { createArtifactWriter };
