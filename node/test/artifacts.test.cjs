"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createArtifactWriter } = require("../src/artifacts.cjs");

test("timeline stays bounded and reports dropped events", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wc3-e2e-artifacts-"));
  try {
    const writer = createArtifactWriter({ dir, maxTimelineBytes: 200 });
    let written = 0;
    for (let i = 0; i < 50; i++) {
      if (writer.appendTimeline({ at: i, event: "heartbeat", value: i })) written++;
    }
    assert.ok(written > 0 && written < 50);
    assert.ok(fs.statSync(path.join(dir, "timeline.ndjson")).size <= 200);
    const result = writer.writeResult({ verdict: "FAIL" });
    assert.equal(result.timeline.droppedEvents, 50 - written);
    const onDisk = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
    assert.equal(onDisk.verdict, "FAIL");
    assert.equal(onDisk.timeline.droppedEvents, 50 - written);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
