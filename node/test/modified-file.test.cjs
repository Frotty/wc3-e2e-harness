"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createModifiedFileReader } = require("../src/protocol/modified-file.cjs");

test("modified file reader skips unchanged files and retries after replacement", () => {
  let stat = { size: 4, mtimeMs: 10, ctimeMs: 10, birthtimeMs: 1 };
  let reads = 0;
  const fakeFs = {
    statSync() {
      return stat;
    },
    readFileSync() {
      reads++;
      return "data";
    },
  };
  const reader = createModifiedFileReader(fakeFs);

  assert.equal(reader.read("out.pld"), "data");
  assert.equal(reader.read("out.pld"), null);
  assert.equal(reads, 1);

  stat = { ...stat, ctimeMs: 11 };
  assert.equal(reader.read("out.pld"), "data");
  assert.equal(reads, 2);
});

test("modified file reader forgets a file while it is absent", () => {
  let present = true;
  const fakeFs = {
    statSync() {
      if (!present) throw new Error("missing");
      return { size: 1, mtimeMs: 1, ctimeMs: 1, birthtimeMs: 1 };
    },
    readFileSync() {
      return "x";
    },
  };
  const reader = createModifiedFileReader(fakeFs);

  assert.equal(reader.read("out.pld"), "x");
  present = false;
  assert.equal(reader.read("out.pld"), null);
  present = true;
  assert.equal(reader.read("out.pld"), "x");
});

test("modified file reader retries a failed read with unchanged metadata", () => {
  let reads = 0;
  const fakeFs = {
    statSync() {
      return { size: 1, mtimeMs: 1, ctimeMs: 1, birthtimeMs: 1 };
    },
    readFileSync() {
      reads++;
      if (reads === 1) throw new Error("writer still has the file open");
      return "terminal";
    },
  };
  const reader = createModifiedFileReader(fakeFs);

  assert.equal(reader.read("out.pld"), null);
  assert.equal(reader.read("out.pld"), "terminal");
  assert.equal(reader.read("out.pld"), null);
  assert.equal(reads, 2);
});
