"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { parseTasklistPids, pidsNotIn } = require("../src/runner/win32.cjs");
const { editorEvidenceIsFresh, mapTitleMatches } = require("../src/runner/world-editor.cjs");

test("PID ownership preserves processes present before the run", () => {
  assert.deepEqual(pidsNotIn(new Set([101, 202, 303]), new Set([101, 303])), [202]);
});

test("tasklist parsing recognizes both World Editor image names", () => {
  const output = '"World Editor.exe","101","Console","1","10,000 K"\r\n' +
    '"WorldEditor.exe","202","Console","1","10,000 K"\r\n' +
    '"Warcraft III.exe","303","Console","1","10,000 K"';
  assert.deepEqual([...parseTasklistPids(output, ["World Editor.exe", "WorldEditor.exe"])], [101, 202]);
});

test("World Editor readiness accepts a map name in the window title", () => {
  assert.equal(mapTitleMatches("World Editor - ExampleMap", "examplemap"), true);
  assert.equal(mapTitleMatches("World Editor", "ExampleMap"), false);
});

test("World Editor readiness requires fresh evidence for existing processes", () => {
  const existingPids = new Set([101]);
  const initialTitles = new Map([[101, "World Editor"]]);

  assert.equal(editorEvidenceIsFresh(202, "World Editor - ExampleMap", existingPids, initialTitles), true);
  assert.equal(editorEvidenceIsFresh(101, "World Editor", existingPids, initialTitles), false);
  assert.equal(editorEvidenceIsFresh(101, "World Editor - ExampleMap", existingPids, initialTitles), true);
});
