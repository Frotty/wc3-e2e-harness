"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  enterMapLoadConfirmation,
  loadingComplete,
  unpauseComplete,
} = require("../src/runner/run.cjs");
const { createLifecycle } = require("../src/lifecycle/machine.cjs");
const { createSimClock } = require("../src/lifecycle/clock.cjs");

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

test("map-load confirmation leaves the UNPAUSE deadline before settling", () => {
  const clock = createSimClock();
  const machine = createLifecycle({ clock });
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");

  enterMapLoadConfirmation(machine);

  assert.equal(machine.state, "RUNNING");
  assert.deepEqual(machine.tick(), { ok: true });
});
