"use strict";

// Injectable clocks so lifecycle behavior is testable without Warcraft III
// (plan Phase 1 exit: "lifecycle simulations are deterministic").
function createRealClock() {
  return { now: () => Date.now() };
}

function createSimClock(start = 0) {
  let current = start;
  return {
    now: () => current,
    advance(ms) {
      if (ms < 0) throw new Error("SimClock cannot go backwards");
      current += ms;
      return current;
    },
  };
}

module.exports = { createRealClock, createSimClock };
