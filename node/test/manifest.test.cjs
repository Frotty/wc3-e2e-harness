"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { validateManifest } = require("../src/manifest.cjs");

const valid = {
  projectId: "zombie-defense",
  fileIoAbilityId: "AM04",
  build: { command: "grill build Zombie_Defense_02-folder.w3x --dev" },
  suites: {
    "za-1": { name: "zombie far-hole", timeoutMs: 120000 },
  },
};

test("valid manifest passes", () => {
  assert.deepEqual(validateManifest(valid), { ok: true, errors: [] });
});

test("unknown fields are errors (strict schema)", () => {
  const result = validateManifest({ ...valid, extra: true });
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /unknown field: extra/);
  const nested = validateManifest({ ...valid, suites: { "za-1": { name: "x", timeoutMs: 1, bogus: 1 } } });
  assert.equal(nested.ok, false);
});

test("missing and malformed fields are errors", () => {
  assert.equal(validateManifest({}).ok, false);
  assert.equal(validateManifest({ ...valid, projectId: "Bad Slug" }).ok, false);
  assert.equal(validateManifest({ ...valid, fileIoAbilityId: "TOOLONG" }).ok, false);
  assert.equal(validateManifest({ ...valid, build: {} }).ok, false);
  assert.equal(validateManifest({ ...valid, suites: {} }).ok, false);
  assert.equal(validateManifest({ ...valid, suites: { "za-1": { name: "x", timeoutMs: 0 } } }).ok, false);
});
