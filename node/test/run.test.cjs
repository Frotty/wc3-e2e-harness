"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  buildLaunchArgs,
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

// Since Warcraft III v3 a launch without `-editor` sits at the login screen forever. The run then ends
// `process-exit-without-terminal-snapshot`, which reads exactly like a hung map or a broken fixture, so
// losing this flag costs a debugging session before anyone suspects the launch line. Pin it in both forms.
test("every launch form passes -editor so the v3 client does not demand a login", () => {
  assert.equal(buildLaunchArgs({ wgcSpeed: 16, loadFile: "suite.wgc", gameArgs: "" })[0], "-editor");
  assert.equal(buildLaunchArgs({ wgcSpeed: 0, loadFile: "suite.w3x" })[0], "-editor");
});

test("wgc launches load the generated config and keep extra game args", () => {
  assert.deepEqual(
    buildLaunchArgs({ wgcSpeed: 16, loadFile: "suite.wgc", gameArgs: "-swapspeed  -nowfpause" }),
    ["-editor", "-loadfile", "suite.wgc", "-swapspeed", "-nowfpause"],
  );
});

test("a speedless launch is windowed and unpaused, and tolerates absent game args", () => {
  assert.deepEqual(
    buildLaunchArgs({ wgcSpeed: 0, loadFile: "suite.w3x" }),
    ["-editor", "-launch", "-windowmode", "windowed", "-nowfpause", "-loadfile", "suite.w3x"],
  );
});
