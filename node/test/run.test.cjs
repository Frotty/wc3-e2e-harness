"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { loadingComplete, unpauseComplete } = require("../src/runner/run.cjs");

test("loading completes once READY is observed", () => {
  assert.equal(loadingComplete({ ready: true, loaded: false, running: false, verdict: null }), true);
  assert.equal(loadingComplete({ ready: false, loaded: false, running: false, verdict: null }), false);
});

test("map-load-only unpauses until LOADED or its following RUNNING signal", () => {
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: false, running: false, verdict: null }), false);
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: true, running: false, verdict: null }), true);
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: false, running: true, verdict: null }), true);
  assert.equal(unpauseComplete({ mapLoadOnly: false, loaded: true, running: false, verdict: null }), false);
});
