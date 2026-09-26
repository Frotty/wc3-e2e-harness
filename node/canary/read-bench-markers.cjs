"use strict";

/* Prints the block timings of the bench-unit-index canary suite.
 *
 * Warcraft's Lua has no wall clock, so the suite brackets every block with two
 * Preload marker files (canary/wurst/UnitIndexBench.wurst); the elapsed time is
 * the difference of their modification times. Run after the suite:
 *
 *   node node/canary/run-canary.cjs --suite=bench-unit-index
 *   node node/canary/read-bench-markers.cjs
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const channelDir = path.join(os.homedir(), "Documents", "Warcraft III", "CustomMapData", "wc3-e2e", "canary");
const markers = new Map();
for (const name of fs.readdirSync(channelDir)) {
  const match = /^bench-(.+)\.txt$/.exec(name);
  if (match) markers.set(match[1], fs.statSync(path.join(channelDir, name)).mtimeMs);
}
for (const store of ["hashmap", "userdata", "keyedmap"]) {
  for (const op of ["read", "write"]) {
    const start = markers.get(`${store}-${op}-start`);
    const end = markers.get(`${store}-${op}-end`);
    const text = start !== undefined && end !== undefined ? `${Math.round(end - start)} ms` : "missing";
    console.log(`${store.padEnd(9)} ${op.padEnd(6)} ${text}`);
  }
}
