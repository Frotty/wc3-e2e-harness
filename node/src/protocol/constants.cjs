"use strict";

// Must match E2E_PROTOCOL_VERSION in wurst/E2E.wurst. Bumped on every protocol change.
const PROTOCOL_VERSION = 1;

// stdlib FileIO limits (wurstStdlib2 ChunkedString / FileIO).
const CHUNK_SIZE = 200;
const CHUNKS_PER_FILE = 64;

// Snapshot states the map emits on the output channel.
const SNAPSHOT_STATES = ["READY", "RUNNING", "PASS", "FAIL"];
const TERMINAL_STATES = ["PASS", "FAIL"];

// Legal state transitions for the output channel reader. `null` is "nothing
// accepted yet". READY can be observed late or missed entirely (A/B holds only
// the two most recent snapshots), so RUNNING is legal from null.
const LEGAL_TRANSITIONS = {
  null: ["READY", "RUNNING"],
  READY: ["READY", "RUNNING"],
  RUNNING: ["RUNNING", "PASS", "FAIL"],
  PASS: [],
  FAIL: [],
};

// Identity fields that must match the active run exactly for a snapshot to be
// accepted (plan: "Snapshot envelope").
const IDENTITY_FIELDS = ["v", "projectId", "buildId", "runId", "nonce", "suiteId"];

module.exports = {
  PROTOCOL_VERSION,
  CHUNK_SIZE,
  CHUNKS_PER_FILE,
  SNAPSHOT_STATES,
  TERMINAL_STATES,
  LEGAL_TRANSITIONS,
  IDENTITY_FIELDS,
};
