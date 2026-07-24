"use strict";

/* Canary round-trip runner (plan Phase 2 exit criterion): arms the canary
 * map, launches Warcraft III, and validates the full state sequence
 * READY -> RUNNING -> heartbeats -> PASS/FAIL over the real file protocol.
 *
 * Keyboard input is minimal on purpose: the loading screen needs Space, sent
 * best-effort via WScript.Shell. The hardened Win32 agent is Phase 3 work; if
 * key delivery fails here, press Space in the game window manually.
 *
 * Usage:
 *   node node/canary/run-canary.cjs [--suite=canary-pass] [--map=<path>] [--keep-open]
 *
 * Exit codes: 0 expected outcome observed, 1 wrong/missing outcome, 2 infra.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn, spawnSync } = require("node:child_process");

const { encodeFrame } = require("../src/protocol/frame.cjs");
const { encodeFileText } = require("../src/protocol/fileio.cjs");
const { makeIdentity } = require("../src/protocol/snapshot.cjs");
const { createChannelReader } = require("../src/protocol/channel.cjs");
const { createArtifactWriter } = require("../src/artifacts.cjs");

const PROJECT_ID = "canary";
const ABILITY_ID = "E2EF"; // wurst/FileIO_config.wurst
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function argumentValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

function findCustomMapData() {
  const home = os.homedir();
  const candidates = [
    path.join(home, "Documents"),
    path.join(home, "OneDrive", "Documents"),
    path.join(home, "OneDrive", "Dokumente"),
    path.join(home, "Dokumente"),
  ]
    .map((docs) => path.join(docs, "Warcraft III", "CustomMapData"))
    .filter((dir) => fs.existsSync(path.dirname(dir)));
  return candidates.find((dir) => fs.existsSync(dir)) || candidates[0] || null;
}

function findWc3Exe() {
  const candidates = [
    "C:\\Program Files (x86)\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe",
    "C:\\Program Files\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe",
    "C:\\Program Files (x86)\\Warcraft III\\x86_64\\Warcraft III.exe",
    "C:\\Program Files\\Warcraft III\\x86_64\\Warcraft III.exe",
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function wc3IsRunning() {
  const result = spawnSync("tasklist", ["/FI", "IMAGENAME eq Warcraft III.exe", "/FO", "CSV", "/NH"], {
    encoding: "utf8",
    shell: false,
  });
  return /Warcraft III\.exe/i.test(String(result.stdout || ""));
}

function killWc3() {
  spawnSync("taskkill", ["/F", "/IM", "Warcraft III.exe"], { encoding: "utf8", shell: false });
}

function latestBuiltMap() {
  const buildDir = path.join(REPO_ROOT, "_build");
  if (!fs.existsSync(buildDir)) return null;
  const maps = fs.readdirSync(buildDir)
    .filter((name) => /\.w3x$/i.test(name))
    .map((name) => ({ full: path.join(buildDir, name), mtime: fs.statSync(path.join(buildDir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return maps[0]?.full ?? null;
}

// Best-effort Space via WScript.Shell; Phase 3 replaces this with the ported
// Win32 agent (PostMessage-based).
function sendSpace() {
  const script =
    "$ws = New-Object -ComObject WScript.Shell; " +
    "if ($ws.AppActivate('Warcraft III')) { Start-Sleep -Milliseconds 300; $ws.SendKeys(' '); 'sent' } else { 'no-window' }";
  const result = spawnSync("powershell", ["-NoProfile", "-Command", script], { encoding: "utf8", shell: false });
  return String(result.stdout || "").trim();
}

function readOrNull(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const suite = argumentValue("suite", "canary-pass");
  const expected = suite === "canary-fail" ? "FAIL" : "PASS";
  const mapPath = path.resolve(argumentValue("map", latestBuiltMap() ?? ""));
  if (!mapPath || !fs.existsSync(mapPath)) {
    console.error("No built map found; run `grill build ExampleMap.w3x` or pass --map=<path>.");
    return 2;
  }
  const wc3Exe = argumentValue("wc3", findWc3Exe());
  if (!wc3Exe || !fs.existsSync(wc3Exe)) {
    console.error("Warcraft III executable not found; pass --wc3=<path>.");
    return 2;
  }
  const customMapData = argumentValue("custom-map-data", findCustomMapData());
  if (!customMapData) {
    console.error("CustomMapData directory could not be resolved.");
    return 2;
  }
  if (wc3IsRunning()) {
    console.error("Refusing to run while Warcraft III is already running.");
    return 2;
  }

  const runId = `canary-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const nonce = crypto.randomBytes(6).toString("hex");
  const buildId = crypto.createHash("sha1").update(fs.readFileSync(mapPath)).digest("hex").slice(0, 10);
  const identity = makeIdentity({ projectId: PROJECT_ID, buildId, runId, nonce, suiteId: suite });

  const channelDir = path.join(customMapData, "wc3-e2e", PROJECT_ID);
  const outputA = path.join(channelDir, "output-a.pld");
  const outputB = path.join(channelDir, "output-b.pld");
  for (const stale of [outputA, outputB]) {
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  }

  const armedBody =
    `armed;v=${identity.v};projectId=${PROJECT_ID};buildId=${buildId};runId=${runId};nonce=${nonce};suiteId=${suite}`;
  fs.mkdirSync(channelDir, { recursive: true });
  fs.writeFileSync(path.join(channelDir, "armed.pld"), encodeFileText(ABILITY_ID, encodeFrame(armedBody)), "utf8");

  const artifacts = createArtifactWriter({ dir: path.join(REPO_ROOT, "artifacts", "canary", runId) });
  artifacts.writeRun({ identity, map: mapPath, suite, expected });
  console.log(`Suite ${suite} armed (run ${runId}); launching Warcraft III...`);

  const launchArgs = ["-launch", "-windowmode", "windowed", "-nowfpause", "-loadfile", mapPath];
  spawn("cmd.exe", ["/d", "/s", "/c", "start", "", wc3Exe, ...launchArgs], {
    stdio: "ignore",
    detached: true,
    shell: false,
  }).unref();

  const reader = createChannelReader(ABILITY_ID, identity);
  const seen = { READY: null, RUNNING: null, terminal: null };
  let heartbeats = 0;
  let spaceAttempts = 0;
  let lastSpaceAt = 0;
  const startedAt = Date.now();
  const timeoutMs = Number(argumentValue("timeout-ms", "240000"));

  while (Date.now() - startedAt < timeoutMs) {
    const result = reader.poll([readOrNull(outputA), readOrNull(outputB)]);
    if (result.accepted) {
      const snap = result.accepted;
      artifacts.appendTimeline({ at: Date.now(), seq: snap.seq, state: snap.state, heartbeat: snap.heartbeat });
      if (snap.state === "READY" && !seen.READY) {
        seen.READY = snap;
        console.log(`READY observed (seq ${snap.seq}, canReadFiles=${snap.payload.canReadFiles})`);
      } else if (snap.state === "RUNNING") {
        if (!seen.RUNNING) {
          seen.RUNNING = snap;
          console.log(`RUNNING observed (seq ${snap.seq}) — game clock is advancing`);
        }
        heartbeats = Math.max(heartbeats, snap.heartbeat);
      } else if (snap.state === "PASS" || snap.state === "FAIL") {
        seen.terminal = snap;
        console.log(`${snap.state} observed (seq ${snap.seq}): ${JSON.stringify(snap.payload)}`);
        break;
      }
    }
    // Leave the loading screen: Space, once READY is up (or blind after 25s).
    const now = Date.now();
    const shouldNudge = !seen.RUNNING && (seen.READY || now - startedAt > 25_000);
    if (shouldNudge && now - lastSpaceAt > 3000 && spaceAttempts < 20) {
      spaceAttempts++;
      lastSpaceAt = now;
      const outcome = sendSpace();
      console.log(`  Space #${spaceAttempts}: ${outcome}`);
      if (spaceAttempts === 5) {
        console.log("  (If RUNNING never appears, click the game window and press Space manually.)");
      }
    }
    await sleep(400);
  }

  const verdict = seen.terminal?.state ?? null;
  const ok = verdict === expected && seen.READY !== null && seen.RUNNING !== null && heartbeats >= 1;
  const summary = {
    suite,
    expected,
    verdict,
    readyObserved: seen.READY !== null,
    runningObserved: seen.RUNNING !== null,
    heartbeats,
    payload: seen.terminal?.payload ?? null,
    ok,
  };
  artifacts.writeResult(summary);
  console.log(
    `READY=${summary.readyObserved} RUNNING=${summary.runningObserved} heartbeats=${heartbeats} ` +
      `verdict=${verdict ?? "none"} expected=${expected}`,
  );

  if (!hasFlag("keep-open")) {
    killWc3();
    console.log("Warcraft III terminated.");
  }
  console.log(ok ? `CANARY PASS (${suite})` : `CANARY FAIL (${suite})`);
  console.log(`Artifacts: ${artifacts.dir}`);
  return ok ? 0 : 1;
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
