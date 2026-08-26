"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createArtifactWriter, pruneArtifactRoot } = require("../src/artifacts.cjs");

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

test("artifact retention removes old inactive runs but preserves active runs", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wc3-e2e-artifact-retention-"));
  try {
    const active = path.join(root, "active");
    const old = path.join(root, "old");
    const recent = path.join(root, "recent");
    fs.mkdirSync(active);
    fs.mkdirSync(old);
    fs.mkdirSync(recent);
    fs.writeFileSync(path.join(active, "run.json"), JSON.stringify({ runnerPid: process.pid }));
    fs.writeFileSync(path.join(active, "result.json"), "{}\n");
    fs.writeFileSync(path.join(old, "result.json"), "{}\n");
    fs.writeFileSync(path.join(recent, "result.json"), "{}\n");
    const oldTime = new Date(Date.now() - 10_000);
    fs.utimesSync(old, oldTime, oldTime);
    fs.utimesSync(path.join(old, "result.json"), oldTime, oldTime);

    const removed = pruneArtifactRoot({
      root,
      keep: 1,
      currentDir: active,
    });

    assert.equal(removed, 1);
    assert.equal(fs.existsSync(active), true);
    assert.equal(fs.existsSync(recent), true);
    assert.equal(fs.existsSync(old), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
