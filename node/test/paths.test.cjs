"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

const { findWorldEditorExe, findWc3Exe } = require("../src/runner/paths.cjs");

test("World Editor discovery checks beside the Warcraft III executable first", () => {
  const exeDir = path.join("Games", "Warcraft III", "_retail_", "x86_64");
  const wc3Exe = path.join(exeDir, "Warcraft III.exe");
  const expected = path.join(exeDir, "World Editor.exe");
  const existing = new Set([expected]);
  assert.equal(findWorldEditorExe({ wc3Exe, existsSync: (file) => existing.has(file) }), expected);
});

test("Warcraft III discovery prefers WC3_EXE_PATH when it points at a real file", () => {
  const override = "E:\\Battlenet\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe";
  const existing = new Set([override]);
  assert.equal(
    findWc3Exe({ env: { WC3_EXE_PATH: override }, existsSync: (file) => existing.has(file) }),
    override,
  );
});

test("Warcraft III discovery falls back to the default candidates when WC3_EXE_PATH is unset", () => {
  const defaultCandidate = "C:\\Program Files\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe";
  const existing = new Set([defaultCandidate]);
  assert.equal(
    findWc3Exe({ env: {}, existsSync: (file) => existing.has(file) }),
    defaultCandidate,
  );
});

test("Warcraft III discovery falls back to the default candidates when WC3_EXE_PATH points nowhere", () => {
  const defaultCandidate = "C:\\Program Files\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe";
  const existing = new Set([defaultCandidate]);
  assert.equal(
    findWc3Exe({ env: { WC3_EXE_PATH: "Z:\\nonexistent.exe" }, existsSync: (file) => existing.has(file) }),
    defaultCandidate,
  );
});
