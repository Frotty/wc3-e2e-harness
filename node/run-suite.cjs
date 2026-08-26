#!/usr/bin/env node
"use strict";

/* Small CLI for consumers that do not need a project-owned runner.
 * Build the map separately, then select one map/suite explicitly here. */

const fs = require("node:fs");
const path = require("node:path");
const { runSuite } = require("./src/runner/run.cjs");
const { validateManifest } = require("./src/manifest.cjs");

function option(name, fallback = undefined) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit === undefined ? fallback : hit.slice(prefix.length);
}

function has(name) {
  return process.argv.includes(`--${name}`);
}

function fail(message) {
  console.error(`wc3-e2e-harness: ${message}`);
  console.error("Usage: node run-suite.cjs --project-id=slug --ability-id=RAW4 --suite=id --map=map.w3x [options]");
  process.exitCode = 2;
}

function loadManifest() {
  const manifestPath = option("manifest");
  if (!manifestPath) return null;
  const fullPath = path.resolve(manifestPath);
  if (!fs.existsSync(fullPath)) throw new Error(`manifest not found: ${fullPath}`);
  const manifest = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const validation = validateManifest(manifest);
  if (!validation.ok) throw new Error(`invalid manifest: ${validation.errors.join("; ")}`);
  return manifest;
}

async function main() {
  let manifest;
  try {
    manifest = loadManifest();
  } catch (error) {
    fail(error.message);
    return;
  }

  const projectId = option("project-id", manifest?.projectId);
  const abilityId = option("ability-id", manifest?.fileIoAbilityId);
  const suiteId = option("suite", Object.keys(manifest?.suites ?? {})[0]);
  const mapPath = option("map");
  if (!projectId || !abilityId || !suiteId || !mapPath) {
    fail("--project-id, --ability-id, --suite, and --map are required (or provide a manifest for the first three)");
    return;
  }
  const manifestSuite = manifest?.suites?.[suiteId];
  const timeoutMs = Number(option("timeout-ms", manifestSuite?.timeoutMs ?? 120_000));
  const startupTimeoutMs = Number(option("startup-timeout-ms", 20_000));
  const speed = Number(option("speed", "0"));
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) return fail("--timeout-ms must be a positive integer");
  if (!Number.isInteger(startupTimeoutMs) || startupTimeoutMs <= 0) return fail("--startup-timeout-ms must be a positive integer");
  if (!Number.isFinite(speed) || speed < 0) return fail("--speed must be a non-negative number");

  try {
    const result = await runSuite({
      projectId,
      abilityId,
      suiteId,
      mapPath: path.resolve(mapPath),
      suiteTimeoutMs: timeoutMs,
      startupTimeoutMs,
      wgcSpeed: speed,
      keepOpen: has("keep-open"),
      mapLoadOnly: has("map-load-only"),
      artifactRoot: path.resolve(option("artifact-root", path.join("artifacts", projectId))),
    });
    console.log(JSON.stringify({
      verdict: result.verdict,
      failure: result.failure,
      readyObserved: result.readyObserved,
      loadedObserved: result.loadedObserved,
      runningObserved: result.runningObserved,
      payload: result.payload,
      artifactDir: result.artifactDir,
    }));
    process.exitCode = result.exitCode;
  } catch (error) {
    fail(error.message);
  }
}

main();
