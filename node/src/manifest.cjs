"use strict";

/* Project manifest validation (plan: "Distribution"). Strict: unknown or
 * missing fields are errors — the runner exits with code 2 before doing
 * anything else on an invalid manifest.
 */

const ROOT_FIELDS = ["projectId", "fileIoAbilityId", "build", "suites"];
const BUILD_FIELDS = ["command"];
const SUITE_FIELDS = ["name", "timeoutMs"];

function validateManifest(manifest) {
  const errors = [];
  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
    return { ok: false, errors: ["manifest must be an object"] };
  }
  for (const key of Object.keys(manifest)) {
    if (!ROOT_FIELDS.includes(key)) errors.push(`unknown field: ${key}`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.projectId ?? "")) {
    errors.push("projectId must be a lowercase slug");
  }
  if (!/^[\x21-\x7e]{4}$/.test(manifest.fileIoAbilityId ?? "")) {
    errors.push("fileIoAbilityId must be a 4-character rawcode (must match the map's FILE_IO_ABIL_ID override)");
  }
  const build = manifest.build;
  if (typeof build !== "object" || build === null) {
    errors.push("build must be an object");
  } else {
    for (const key of Object.keys(build)) {
      if (!BUILD_FIELDS.includes(key)) errors.push(`unknown field: build.${key}`);
    }
    if (typeof build.command !== "string" || build.command.length === 0) {
      errors.push("build.command must be a non-empty string");
    }
  }
  const suites = manifest.suites;
  if (typeof suites !== "object" || suites === null || Array.isArray(suites)) {
    errors.push("suites must be an object keyed by suite id");
  } else {
    if (Object.keys(suites).length === 0) errors.push("suites must not be empty");
    for (const [suiteId, suite] of Object.entries(suites)) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(suiteId)) errors.push(`suite id must be a lowercase slug: ${suiteId}`);
      if (typeof suite !== "object" || suite === null) {
        errors.push(`suite ${suiteId} must be an object`);
        continue;
      }
      for (const key of Object.keys(suite)) {
        if (!SUITE_FIELDS.includes(key)) errors.push(`unknown field: suites.${suiteId}.${key}`);
      }
      if (typeof suite.name !== "string" || suite.name.length === 0) {
        errors.push(`suites.${suiteId}.name must be a non-empty string`);
      }
      if (!Number.isInteger(suite.timeoutMs) || suite.timeoutMs <= 0) {
        errors.push(`suites.${suiteId}.timeoutMs must be a positive integer`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

module.exports = { validateManifest };
