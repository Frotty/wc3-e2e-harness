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
  const activePath = path.join(dir, ".active");
  fs.writeFileSync(activePath, `${process.pid}\n`, "utf8");
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
    complete() {
      try {
        fs.unlinkSync(activePath);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    },
    get droppedEvents() {
      return droppedEvents;
    },
  };
}

function pruneArtifactRoot({
  root,
  keep = 20,
  currentDir = null,
  isPidRunning = pidIsRunning,
  now = Date.now(),
  staleIncompleteMs = 60 * 60 * 1000,
}) {
  if (!root || !Number.isInteger(keep) || keep < 0 || !fs.existsSync(root)) return 0;
  const current = currentDir ? path.resolve(currentDir) : null;
  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(root, entry.name);
      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(dir).mtimeMs;
      } catch {
        return null;
      }
      return { dir, mtimeMs };
    })
    .filter(Boolean)
    .filter(({ dir }) => dir !== current)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const removable = entries.filter(({ dir, mtimeMs }) => {
    let run = null;
    try {
      run = JSON.parse(fs.readFileSync(path.join(dir, "run.json"), "utf8"));
    } catch {
      // A directory still being allocated is protected briefly; an old
      // incomplete directory is safe to reap on the next invocation.
    }
    if (fs.existsSync(path.join(dir, ".active"))) {
      let activePid = run && Number.isInteger(run.runnerPid) ? run.runnerPid : null;
      if (activePid === null) {
        try {
          const parsedPid = Number.parseInt(fs.readFileSync(path.join(dir, ".active"), "utf8"), 10);
          if (Number.isInteger(parsedPid)) activePid = parsedPid;
        } catch {
          // Treat an unreadable marker as active until its stale age grace
          // period has elapsed.
        }
      }
      if (activePid === null || isPidRunning(activePid)) return false;
    }
    if (run && Number.isInteger(run.runnerPid) && isPidRunning(run.runnerPid)) return false;
    if (fs.existsSync(path.join(dir, "result.json"))) return true;
    return now - mtimeMs >= staleIncompleteMs;
  });

  let removed = 0;
  for (const { dir } of removable.slice(keep)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      removed++;
    } catch {
      // Best-effort retention; never hide the run itself because an old
      // diagnostic directory is locked or disappears concurrently.
    }
  }
  return removed;
}

function pidIsRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

module.exports = { createArtifactWriter, pruneArtifactRoot };
