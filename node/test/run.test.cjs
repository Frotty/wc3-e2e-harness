"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const {
  enterMapLoadConfirmation,
  acquireRunLock,
  loadingComplete,
  mapStartupTimedOut,
  resolveGameArgs,
  terminalSnapshotAllowed,
  unpauseComplete,
} = require("../src/runner/run.cjs");
const { createLifecycle } = require("../src/lifecycle/machine.cjs");
const { createSimClock } = require("../src/lifecycle/clock.cjs");

test("loading completes once READY is observed", () => {
  assert.equal(loadingComplete({ ready: true, loaded: false, running: false, verdict: null }), true);
  assert.equal(loadingComplete({ ready: false, loaded: false, running: false, verdict: null }), false);
});

test("map startup watchdog fails only before any map-side evidence", () => {
  assert.equal(mapStartupTimedOut({ startedAt: 1_000, now: 21_000, timeoutMs: 20_000, ready: false, loaded: false, running: false, verdict: null }), true);
  assert.equal(mapStartupTimedOut({ startedAt: 1_000, now: 21_000, timeoutMs: 20_000, ready: true, loaded: false, running: false, verdict: null }), false);
  assert.equal(mapStartupTimedOut({ startedAt: null, now: 21_000, timeoutMs: 20_000, ready: false, loaded: false, running: false, verdict: null }), false);
  assert.equal(mapStartupTimedOut({ startedAt: 1_000, now: 21_000, timeoutMs: null, ready: false, loaded: false, running: false, verdict: null }), false);
});

test("map-load-only does not accept PASS without load evidence", () => {
  assert.equal(terminalSnapshotAllowed({ mapLoadOnly: true, state: "PASS", loaded: false, running: false }), false);
  assert.equal(terminalSnapshotAllowed({ mapLoadOnly: true, state: "PASS", loaded: true, running: false }), true);
  assert.equal(terminalSnapshotAllowed({ mapLoadOnly: true, state: "PASS", loaded: false, running: true }), true);
  assert.equal(terminalSnapshotAllowed({ mapLoadOnly: true, state: "FAIL", loaded: false, running: false }), true);
  assert.equal(terminalSnapshotAllowed({ mapLoadOnly: false, state: "PASS", loaded: false, running: false }), true);
});

test("same project channel cannot be claimed twice", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wc3-e2e-lock-test-"));
  const lockPath = path.join(root, "run.lock");
  const release = acquireRunLock(lockPath, { pid: process.pid, startedAt: Date.now(), runId: "first" });
  try {
    assert.throws(
      () => acquireRunLock(lockPath, { pid: process.pid, startedAt: Date.now(), runId: "second" }),
      /project-run-already-active/,
    );
  } finally {
    release();
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("map-load-only unpauses until LOADED or its following RUNNING signal", () => {
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: false, running: false, verdict: null }), false);
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: true, running: false, verdict: null }), true);
  assert.equal(unpauseComplete({ mapLoadOnly: true, loaded: false, running: true, verdict: null }), true);
  assert.equal(unpauseComplete({ mapLoadOnly: false, loaded: true, running: false, verdict: null }), false);
  assert.equal(unpauseComplete({ mapLoadOnly: false, loaded: true, running: true, heartbeat: 0, verdict: null }), false);
  assert.equal(unpauseComplete({ mapLoadOnly: false, loaded: true, running: true, heartbeat: 1, verdict: null }), true);
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

test("an unfocused run keeps the no-pause guard even when the caller replaces the game args", () => {
  // The WGC branch forwards gameArgs verbatim, so a caller-supplied string is the whole command line.
  // Without -nowfpause an unfocused game pauses and the suite stalls before LOADED.
  assert.match(resolveGameArgs("-launch", false), /-nowfpause/);
});

test("a focused run leaves the caller's game args alone", () => {
  assert.equal(resolveGameArgs("-launch -windowmode windowed", true), "-launch -windowmode windowed");
});

test("the no-pause guard is not duplicated when the caller already passed it", () => {
  const args = resolveGameArgs("-nowfpause -launch", false);
  assert.equal(args.match(/-nowfpause/g).length, 1);
});

test("windowed mode is still forced for callers that do not ask for it", () => {
  assert.match(resolveGameArgs("-launch", true), /-windowmode windowed/);
});
