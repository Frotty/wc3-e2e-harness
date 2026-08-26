"use strict";

/* Canary CLI over the production runner (src/runner/run.cjs).
 *
 *   node node/canary/run-canary.cjs --map=<freshly-built-map.w3x>
 *        [--suite=canary-pass] [--wgc-speed=0] [--runs=1] [--speeds=1,6,8] [--keep-open]
 *
 * --runs with --speeds cycles the speed matrix for the release-gate soak
 * (100 consecutive mixed-speed runs); it stops at the first failure.
 * Exit codes: 0 expected outcome observed, 1 wrong/missing outcome, 2 infra.
 */

const fs = require("node:fs");
const path = require("node:path");

const { runSuite } = require("../src/runner/run.cjs");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PROJECT_ID = "canary";
const ABILITY_ID = "$wsl"; // stdlib FileIO default; canary has no custom override
const SUITE_TIMEOUTS_MS = {
  "canary-pass": 120_000,
  "canary-fail": 120_000,
  "canary-stall": 60_000,
  "canary-delay": 180_000,
  "canary-empty": 120_000,
  "map-driven": 120_000,
};

function argumentValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

async function main() {
  const suite = argumentValue("suite", "canary-pass");
  const expected = suite === "canary-fail" ? "FAIL" : "PASS";
  const expectEmpty = suite === "canary-empty";
  // canary-stall never finishes by design: the correct runner behavior is a
  // bounded heartbeat-stall failure, not a verdict.
  const expectStall = suite === "canary-stall";
  const timeoutMs = SUITE_TIMEOUTS_MS[suite];
  if (!timeoutMs) {
    console.error(`Unknown canary suite: ${suite}`);
    return 2;
  }
  const mapPath = argumentValue("map");
  if (!mapPath || !fs.existsSync(mapPath)) {
    console.error("A freshly built map is required; build it in an isolated consumer/temp directory and pass --map=<path>.");
    return 2;
  }
  const runs = Number(argumentValue("runs", "1"));
  const speeds = argumentValue("speeds", argumentValue("wgc-speed", "0"))
    .split(",")
    .map((s) => Number(s.trim()));
  const keepOpen = process.argv.includes("--keep-open");

  for (let i = 0; i < runs; i++) {
    const speed = speeds[i % speeds.length];
    if (runs > 1) console.log(`--- run ${i + 1}/${runs} (${speed > 1 ? `${speed}x` : "1x"}) ---`);
    const result = await runSuite({
      projectId: PROJECT_ID,
      abilityId: ABILITY_ID,
      suiteId: suite,
      mapPath: path.resolve(mapPath),
      suiteTimeoutMs: timeoutMs,
      wgcSpeed: speed > 1 ? speed : 0,
      keepOpen,
      artifactRoot: path.join(REPO_ROOT, "artifacts", "canary"),
      deadlines: expectStall ? { heartbeatStall: 10_000 } : {},
    });
    const loadEvidence = result.readyObserved || result.loadedObserved || result.runningObserved;
    const ok = expectStall
      ? result.verdict === null && result.failure === "heartbeat-stall-after-suite-start"
      : result.verdict === expected && loadEvidence && (expectEmpty || (result.runningObserved && result.heartbeats >= 1));
    console.log(
      `verdict=${result.verdict ?? "none"} expected=${expectStall ? "stall-failure" : expected} ` +
        `heartbeats=${result.heartbeats} shutdown=${result.shutdown}` +
        `${result.failure ? ` failure=${result.failure}` : ""}`,
    );
    console.log(`${ok ? "CANARY PASS" : "CANARY FAIL"} (${suite})  artifacts: ${result.artifactDir}`);
    if (!ok) return 1;
  }
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error?.stack || String(error));
    process.exitCode = 2;
  },
);
