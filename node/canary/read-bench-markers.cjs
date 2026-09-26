"use strict";

/* Prints the block timings of a canary bench suite (bench-unit-index,
 * bench-collections).
 *
 * Warcraft's Lua has no wall clock, so a bench suite brackets every block with
 * two Preload marker files, bench-<block>-start.txt and bench-<block>-end.txt;
 * the elapsed time is the difference of their modification times. Blocks are
 * listed in the order they ran. When the suite has an "empty" block, its time
 * is the cost of writing the markers themselves and is reported separately.
 *
 * When an "empty" block exists it runs first, and markers older than it are
 * ignored as leftovers of an earlier run:
 *
 *   node node/canary/run-canary.cjs --suite=bench-collections
 *   node node/canary/read-bench-markers.cjs [--json]
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const channelDir = path.join(os.homedir(), "Documents", "Warcraft III", "CustomMapData", "wc3-e2e", "canary");

function readBlocks() {
  const starts = new Map();
  const ends = new Map();
  for (const name of fs.readdirSync(channelDir)) {
    const match = /^bench-(.+)-(start|end)\.txt$/.exec(name);
    if (!match) continue;
    const mtime = fs.statSync(path.join(channelDir, name)).mtimeMs;
    (match[2] === "start" ? starts : ends).set(match[1], mtime);
  }
  // A suite with an "empty" block runs it first, so its start anchors the
  // latest run: older markers from an earlier run are skipped.
  const anchor = starts.get("empty") ?? -Infinity;
  const blocks = [];
  for (const [block, startMs] of starts) {
    const endMs = ends.get(block);
    if (endMs === undefined || endMs < startMs || startMs < anchor) continue;
    blocks.push({ block, startMs, ms: Math.round(endMs - startMs) });
  }
  blocks.sort((a, b) => a.startMs - b.startMs);
  return blocks;
}

const blocks = readBlocks();
const empty = blocks.find((b) => b.block === "empty");
const overhead = empty ? empty.ms : 0;
const rows = blocks
  .filter((b) => b.block !== "empty")
  .map((b) => ({ block: b.block, ms: b.ms, net: Math.max(0, b.ms - overhead) }));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ markerOverheadMs: overhead, blocks: rows }, null, 2));
} else {
  if (empty) console.log(`marker overhead ${overhead} ms (subtracted as "net")`);
  const width = Math.max(...rows.map((r) => r.block.length));
  for (const r of rows) {
    console.log(`${r.block.padEnd(width)}  ${String(r.ms).padStart(6)} ms  net ${String(r.net).padStart(6)} ms`);
  }
}
