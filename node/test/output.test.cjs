"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { collapsingLogger, digestLines } = require("../src/output.cjs");

test("a repeated line prints once and then its count", () => {
  const out = [];
  const log = collapsingLogger((line) => out.push(line));
  for (let i = 0; i < 35; i++) log("  LOADING: Space (focus=true sent=true)");
  log("  READY (seq 1)");
  log.flush();
  assert.deepEqual(out, ["  LOADING: Space (focus=true sent=true)", "  (previous line x35)", "  READY (seq 1)"]);
});

test("flush with no repeats prints nothing extra", () => {
  const out = [];
  const log = collapsingLogger((line) => out.push(line));
  log("a");
  log("b");
  log.flush();
  assert.deepEqual(out, ["a", "b"]);
});

test("the digest keeps the verdict, failures and named metrics, and drops the bulk", () => {
  const metrics = { "winner-code": 2 };
  for (let i = 0; i < 116; i++) metrics[`bulk-${i}`] = i;
  const lines = digestLines(
    {
      verdict: "FAIL",
      heartbeats: 395,
      payload: { asserts: 63, failed: 2, failedIds: "a,b", metrics, events: { "kind|x": 3 } },
    },
    { suiteId: "ai-counter", headlineMetrics: ["winner-code", "absent"] },
  );
  const text = lines.join("\n");
  assert.match(text, /ai-counter: FAIL {2}asserts 61\/63/);
  assert.match(text, /failed: a,b/);
  assert.match(text, /metrics: winner-code=2$/m);
  assert.match(text, /kind\|x x3/);
  assert.match(text, /\(117 metrics in result\.json\)/);
  assert.doesNotMatch(text, /bulk-/);
  assert.ok(lines.length <= 10, `digest ran to ${lines.length} lines`);
});

test("the digest says when the harness dropped metrics or event kinds", () => {
  const text = digestLines({
    verdict: "PASS",
    payload: { asserts: 1, failed: 0, metrics: { a: 1 }, metricsDropped: 3, eventKindsDropped: 2 },
  }).join("\n");
  assert.match(text, /3 DROPPED/);
  assert.match(text, /2 event kinds DROPPED/);
});

test("the digest bounds how many event kinds it prints", () => {
  const events = {};
  for (let i = 0; i < 40; i++) events[`kind-${i}`] = 1;
  const lines = digestLines({ verdict: "PASS", payload: { asserts: 1, failed: 0, events } }, { maxEventKinds: 20 });
  assert.ok(lines.some((line) => line.includes("20 more kinds")));
  assert.ok(lines.length < 30);
});

test("a headline id that is not a metric is skipped, even one Object.prototype defines", () => {
  const lines = digestLines(
    { verdict: "PASS", payload: { asserts: 1, failed: 0, metrics: { real: 7 } } },
    { headlineMetrics: ["toString", "constructor", "hasOwnProperty", "real"] },
  );
  const text = lines.join("\n");
  assert.match(text, /^metrics: real=7$/m);
  assert.doesNotMatch(text, /toString|constructor|function/);
});

test("a metric whose value is falsy is still a headline", () => {
  const text = digestLines(
    { verdict: "PASS", payload: { asserts: 1, failed: 0, metrics: { zero: 0 } } },
    { headlineMetrics: ["zero"] },
  ).join("\n");
  assert.match(text, /metrics: zero=0/);
});
