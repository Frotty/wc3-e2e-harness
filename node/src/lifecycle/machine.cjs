"use strict";

/* Runner-side lifecycle state machine (plan: "Run Lifecycle" / "Timeouts").
 *
 * PREPARE -> LAUNCH -> WINDOW -> LOADING -> UNPAUSE
 *         -> READY -> RUNNING -> RESULT -> QUIT -> COLLECT
 *
 * Pure state + clock: the WC3 driver (Phase 3) feeds it events; tests feed it
 * a simulation clock. Invariants encoded here:
 *  - every non-terminal state has a deadline; exceeding it fails the run
 *  - a terminal snapshot short-circuits everything and moves to RESULT
 *  - process exit without a terminal snapshot is a failure
 *  - heartbeat stall in RUNNING is recoverable up to maxStallRecoveries,
 *    and stall detection can be suspended during intentional menu work
 */

const STATE_ORDER = [
  "PREPARE",
  "LAUNCH",
  "WINDOW",
  "LOADING",
  "UNPAUSE",
  "READY",
  "RUNNING",
  "RESULT",
  "QUIT",
  "COLLECT",
  "DONE",
];

const DEADLINE_KEYS = {
  PREPARE: "prepare",
  LAUNCH: "launch",
  WINDOW: "window",
  LOADING: "loading",
  UNPAUSE: "unpause",
  READY: "ready",
  RUNNING: "suite",
  RESULT: null, // bounded by suite + heartbeat deadlines (plan: Timeouts)
  QUIT: "quit",
  COLLECT: "collect",
};

const DEFAULT_DEADLINES_MS = {
  prepare: 30_000,
  launch: 30_000,
  window: 20_000,
  loading: 90_000,
  unpause: 30_000,
  ready: 20_000,
  suite: 120_000, // overridden per suite from the manifest
  quit: 20_000,
  collect: 20_000,
  heartbeatStall: 15_000,
};

function createLifecycle({ clock, deadlines = {}, maxStallRecoveries = 3 } = {}) {
  if (!clock) throw new Error("createLifecycle requires a clock");
  const limits = { ...DEFAULT_DEADLINES_MS, ...deadlines };

  let state = "PREPARE";
  let enteredAt = clock.now();
  let verdict = null; // "PASS" | "FAIL" once a terminal snapshot is seen
  let failure = null; // { reason, state } once the run is failed
  let readyObserved = false;
  let lastHeartbeatAt = null;
  let lastHeartbeatValue = -1;
  let stallRecoveries = 0;
  let stallSuspended = false;
  const timeline = [];

  function record(event, detail = {}) {
    timeline.push({ at: clock.now(), state, event, ...detail });
  }

  function enter(next) {
    const from = STATE_ORDER.indexOf(state);
    const to = STATE_ORDER.indexOf(next);
    if (to < 0) throw new Error(`Unknown state: ${next}`);
    if (to <= from) throw new Error(`Illegal lifecycle move ${state} -> ${next}`);
    record("enter", { to: next });
    state = next;
    enteredAt = clock.now();
  }

  function fail(reason) {
    if (failure) return;
    failure = { reason, state };
    record("fail", { reason });
  }

  return {
    get state() {
      return state;
    },
    get verdict() {
      return verdict;
    },
    get failure() {
      return failure;
    },
    get readyObserved() {
      return readyObserved;
    },
    get timeline() {
      return timeline;
    },

    enter,

    noteReady() {
      readyObserved = true;
      record("ready-observed");
      if (state === "READY") enter("RUNNING");
    },

    noteHeartbeat(value) {
      if (value > lastHeartbeatValue) {
        lastHeartbeatValue = value;
        lastHeartbeatAt = clock.now();
        stallRecoveries = 0;
        record("heartbeat", { value });
      }
    },

    noteTerminal(result) {
      if (result !== "PASS" && result !== "FAIL") throw new Error(`Invalid terminal: ${result}`);
      if (verdict) return;
      verdict = result;
      record("terminal", { result });
      // Short-circuit: whatever state we were in, the run has its answer.
      if (STATE_ORDER.indexOf(state) < STATE_ORDER.indexOf("RESULT")) {
        state = "RESULT";
        enteredAt = clock.now();
      }
    },

    noteFailure(reason) {
      if (typeof reason !== "string" || reason.length === 0) {
        throw new Error("noteFailure requires a non-empty reason");
      }
      fail(reason);
    },

    noteProcessExit() {
      record("process-exit");
      if (verdict) {
        // Exit after a terminal snapshot: quit already achieved.
        if (STATE_ORDER.indexOf(state) < STATE_ORDER.indexOf("COLLECT")) {
          state = "COLLECT";
          enteredAt = clock.now();
        }
      } else {
        fail("process-exit-without-terminal-snapshot");
      }
    },

    suspendStallDetection(suspended) {
      stallSuspended = suspended;
      record(suspended ? "stall-detection-suspended" : "stall-detection-resumed");
    },

    // Called periodically by the runner loop. Returns
    //   { ok: true } | { recover: "heartbeat-stall" } | { failed: reason }
    tick() {
      if (failure) return { failed: failure.reason };
      if (verdict && (state === "RESULT" || state === "DONE")) return { ok: true };
      const now = clock.now();

      if (state === "RUNNING" && !stallSuspended && lastHeartbeatAt !== null) {
        if (now - lastHeartbeatAt > limits.heartbeatStall) {
          if (stallRecoveries >= maxStallRecoveries) {
            fail("heartbeat-stall-unrecovered");
            return { failed: failure.reason };
          }
          stallRecoveries++;
          lastHeartbeatAt = now; // grant the recovery attempt a fresh window
          record("stall-recovery", { attempt: stallRecoveries });
          return { recover: "heartbeat-stall", attempt: stallRecoveries };
        }
      }

      const key = DEADLINE_KEYS[state];
      if (key && now - enteredAt > limits[key]) {
        fail(`${state.toLowerCase()}-deadline-exceeded`);
        return { failed: failure.reason };
      }
      return { ok: true };
    },
  };
}

module.exports = { createLifecycle, STATE_ORDER, DEFAULT_DEADLINES_MS };
