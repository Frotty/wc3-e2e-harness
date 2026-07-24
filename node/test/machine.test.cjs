"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createSimClock } = require("../src/lifecycle/clock.cjs");
const { createLifecycle } = require("../src/lifecycle/machine.cjs");

function makeMachine(overrides = {}) {
  const clock = createSimClock(0);
  const machine = createLifecycle({
    clock,
    deadlines: { launch: 1000, ready: 1000, suite: 10_000, heartbeatStall: 500, quit: 1000, ...overrides.deadlines },
    maxStallRecoveries: overrides.maxStallRecoveries ?? 2,
  });
  return { clock, machine };
}

test("per-state deadline failure", () => {
  const { clock, machine } = makeMachine();
  machine.enter("LAUNCH");
  clock.advance(999);
  assert.deepEqual(machine.tick(), { ok: true });
  clock.advance(2);
  assert.equal(machine.tick().failed, "launch-deadline-exceeded");
});

test("terminal snapshot short-circuits every remaining deadline", () => {
  const { clock, machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  assert.equal(machine.state, "RUNNING");
  machine.noteTerminal("PASS");
  assert.equal(machine.state, "RESULT");
  clock.advance(1_000_000); // no deadline can fail a decided run
  assert.deepEqual(machine.tick(), { ok: true });
  assert.equal(machine.verdict, "PASS");
});

test("heartbeat stall recovers up to the limit then fails", () => {
  const { clock, machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  machine.noteHeartbeat(1);

  clock.advance(600);
  assert.deepEqual(machine.tick(), { recover: "heartbeat-stall", attempt: 1 });
  clock.advance(600);
  assert.deepEqual(machine.tick(), { recover: "heartbeat-stall", attempt: 2 });
  clock.advance(600);
  assert.equal(machine.tick().failed, "heartbeat-stall-unrecovered");
});

test("an advancing heartbeat resets recovery attempts", () => {
  const { clock, machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  machine.noteHeartbeat(1);
  clock.advance(600);
  assert.equal(machine.tick().recover, "heartbeat-stall");
  machine.noteHeartbeat(2); // recovery worked
  clock.advance(400);
  assert.deepEqual(machine.tick(), { ok: true });
});

test("stall detection is suspended during intentional menu work", () => {
  const { clock, machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  machine.noteHeartbeat(1);
  machine.suspendStallDetection(true);
  clock.advance(5000); // F10 menu open: game time frozen, heartbeats stopped
  assert.deepEqual(machine.tick(), { ok: true });
  machine.suspendStallDetection(false);
  machine.noteHeartbeat(2);
  clock.advance(400);
  assert.deepEqual(machine.tick(), { ok: true });
});

test("process exit without terminal snapshot is a failure", () => {
  const { machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  machine.noteProcessExit();
  assert.equal(machine.failure.reason, "process-exit-without-terminal-snapshot");
  assert.equal(machine.tick().failed, "process-exit-without-terminal-snapshot");
});

test("process exit after terminal snapshot completes the run", () => {
  const { machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  machine.enter("LOADING");
  machine.enter("UNPAUSE");
  machine.enter("READY");
  machine.noteReady();
  machine.noteTerminal("FAIL");
  machine.noteProcessExit();
  assert.equal(machine.state, "COLLECT");
  assert.equal(machine.verdict, "FAIL");
  assert.equal(machine.failure, null);
});

test("lifecycle cannot move backwards", () => {
  const { machine } = makeMachine();
  machine.enter("LAUNCH");
  machine.enter("WINDOW");
  assert.throws(() => machine.enter("LAUNCH"));
});
