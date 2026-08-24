"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { encodeSnapshotFile, makeIdentity } = require("../src/protocol/snapshot.cjs");
const { selectSnapshot, createChannelReader } = require("../src/protocol/channel.cjs");

const ABIL = "E2EF";
const identity = makeIdentity({
  projectId: "zombie-defense",
  buildId: "build-1",
  runId: "run-1",
  nonce: "abc123",
  suiteId: "za-1",
});

function snap(overrides) {
  return encodeSnapshotFile(ABIL, {
    ...identity,
    seq: 1,
    state: "READY",
    gameTime: 0,
    heartbeat: 0,
    payload: {},
    ...overrides,
  });
}

test("alternating-file selection: highest valid sequence wins", () => {
  const a = snap({ seq: 3, state: "RUNNING", heartbeat: 2 });
  const b = snap({ seq: 4, state: "RUNNING", heartbeat: 3 });
  const result = selectSnapshot(ABIL, [a, b], { identity, lastSeq: 2, lastState: "RUNNING" });
  assert.equal(result.accepted.seq, 4);
});

test("a truncated newer write cannot hide an older valid snapshot", () => {
  const older = snap({ seq: 3, state: "RUNNING", heartbeat: 2 });
  const newerTruncated = snap({ seq: 4, state: "RUNNING", heartbeat: 3 }).slice(0, 80);
  const result = selectSnapshot(ABIL, [older, newerTruncated], { identity, lastSeq: 2, lastState: "RUNNING" });
  assert.equal(result.accepted.seq, 3);
  assert.equal(result.rejected.length, 1);
});

test("stale run id and nonce are rejected", () => {
  const staleRun = encodeSnapshotFile(ABIL, {
    ...identity,
    runId: "run-0",
    seq: 9,
    state: "READY",
    gameTime: 0,
    heartbeat: 0,
    payload: {},
  });
  const staleNonce = encodeSnapshotFile(ABIL, {
    ...identity,
    nonce: "zzz999",
    seq: 10,
    state: "READY",
    gameTime: 0,
    heartbeat: 0,
    payload: {},
  });
  const result = selectSnapshot(ABIL, [staleRun, staleNonce], { identity, lastSeq: -1, lastState: null });
  assert.equal(result.accepted, null);
  assert.deepEqual(result.rejected.map((r) => r.reason), ["identity-mismatch", "identity-mismatch"]);
});

test("duplicate and out-of-order sequences are rejected", () => {
  const dup = snap({ seq: 5, state: "RUNNING" });
  const older = snap({ seq: 4, state: "RUNNING" });
  const result = selectSnapshot(ABIL, [dup, older], { identity, lastSeq: 5, lastState: "RUNNING" });
  assert.equal(result.accepted, null);
  assert.equal(result.rejected.length, 2);
});

test("illegal state transitions are rejected", () => {
  // terminal is final: PASS -> RUNNING is illegal
  const afterPass = selectSnapshot(ABIL, [snap({ seq: 7, state: "RUNNING" })], {
    identity,
    lastSeq: 6,
    lastState: "PASS",
  });
  assert.equal(afterPass.accepted, null);
  assert.match(afterPass.rejected[0].reason, /illegal-transition-PASS->RUNNING/);

  // A fast suite can overwrite RUNNING before the watcher reads it.
  const readyToPass = selectSnapshot(ABIL, [snap({ seq: 2, state: "PASS" })], {
    identity,
    lastSeq: 1,
    lastState: "READY",
  });
  assert.equal(readyToPass.accepted.state, "PASS");
});

test("an immediate terminal snapshot is valid when intermediate states were missed", () => {
  const result = selectSnapshot(ABIL, [snap({ seq: 4, state: "PASS" })], {
    identity,
    lastSeq: -1,
    lastState: null,
  });
  assert.equal(result.accepted.state, "PASS");
});

test("RUNNING is legal from null (missed READY) and channel reader tracks state", () => {
  const reader = createChannelReader(ABIL, identity);
  const first = reader.poll([snap({ seq: 2, state: "RUNNING", heartbeat: 1 }), null]);
  assert.equal(first.accepted.state, "RUNNING");
  const terminal = reader.poll([null, snap({ seq: 3, state: "PASS", heartbeat: 1 })]);
  assert.equal(terminal.accepted.state, "PASS");
  const afterTerminal = reader.poll([snap({ seq: 4, state: "RUNNING" }), null]);
  assert.equal(afterTerminal.accepted, null);
});

test("LOADED is legal after READY and when READY was overwritten", () => {
  const afterReady = selectSnapshot(ABIL, [snap({ seq: 2, state: "LOADED" })], {
    identity,
    lastSeq: 1,
    lastState: "READY",
  });
  assert.equal(afterReady.accepted.state, "LOADED");

  const lateLoaded = selectSnapshot(ABIL, [snap({ seq: 3, state: "LOADED" })], {
    identity,
    lastSeq: 2,
    lastState: null,
  });
  assert.equal(lateLoaded.accepted.state, "LOADED");
});
