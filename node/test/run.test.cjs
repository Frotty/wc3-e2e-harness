"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { loadingComplete } = require("../src/runner/run.cjs");

test("map-load-only waits for LOADED instead of treating READY as success", () => {
  assert.equal(loadingComplete({ mapLoadOnly: true, ready: true, loaded: false, running: false, verdict: null }), false);
  assert.equal(loadingComplete({ mapLoadOnly: true, ready: true, loaded: true, running: false, verdict: null }), true);
});

test("normal runs may finish loading after READY", () => {
  assert.equal(loadingComplete({ mapLoadOnly: false, ready: true, loaded: false, running: false, verdict: null }), true);
  assert.equal(loadingComplete({ mapLoadOnly: true, ready: false, loaded: false, running: true, verdict: null }), true);
});
