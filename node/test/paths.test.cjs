"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

const { findWorldEditorExe } = require("../src/runner/paths.cjs");

test("World Editor discovery checks beside the Warcraft III executable first", () => {
  const exeDir = path.join("Games", "Warcraft III", "_retail_", "x86_64");
  const wc3Exe = path.join(exeDir, "Warcraft III.exe");
  const expected = path.join(exeDir, "World Editor.exe");
  const existing = new Set([expected]);
  assert.equal(findWorldEditorExe({ wc3Exe, existsSync: (file) => existing.has(file) }), expected);
});
