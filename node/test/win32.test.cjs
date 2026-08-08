"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { pidsNotIn } = require("../src/runner/win32.cjs");

test("PID ownership preserves processes present before the run", () => {
  assert.deepEqual(pidsNotIn(new Set([101, 202, 303]), new Set([101, 303])), [202]);
});
