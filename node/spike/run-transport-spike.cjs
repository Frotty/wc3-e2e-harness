"use strict";

/* Phase 0 transport spike runner (docs/SharedE2EHarnessPlan.md).
 *
 * Writes a stdlib-FileIO-readable launch file into CustomMapData BEFORE
 * Warcraft III starts, launches the spike map, and validates that the map
 * echoed the payload back through stdlib File.write into the same
 * subdirectory. Zero npm dependencies; throwaway together with the spike map
 * package at the end of Phase 0.
 *
 * Usage:
 *   node node/spike/run-transport-spike.cjs --map=<built ExampleMap.w3x> [--keep-open] [--timeout-ms=180000]
 *
 * Exit codes: 0 spike passed, 1 spike failed, 2 infrastructure problem.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn, spawnSync } = require("node:child_process");

const FILE_IO_ABIL_ID = "E2EF"; // must match wurst/FileIO_config.wurst
const CHUNK_SIZE = 200; // stdlib ChunkedString DEFAULT_CHUNK_SIZE

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
  const existing = candidates.find((dir) => fs.existsSync(dir));
  return existing || candidates[0] || null;
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

// --- stdlib FileIO format ---

// Writer: a preload script the game executes via Preloader(). Only constraint is
// that running it sets the carrier ability's tooltips; clean JASS is the most
// robust form for an external writer (the breakout trick in stdlib File.write
// exists only because maps are confined to the Preload() API).
function writeLaunchFile(filePath, content) {
  if (/["\\]/.test(content)) {
    throw new Error("Launch payload must not contain quotes or backslashes (stdlib FileIO validateInput).");
  }
  const chunks = [];
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }
  const lines = chunks.map(
    (chunk, level) => `\tcall BlzSetAbilityTooltip('${FILE_IO_ABIL_ID}', "${chunk}", ${level})`,
  );
  const script = `function PreloadFiles takes nothing returns nothing\n${lines.join("\n")}\nendfunction\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, script, "utf8");
  return chunks.length;
}

// Reader: parses the file stdlib File.write produced (PreloadGenEnd output with
// the breakout wrapper). Chunk content never contains quotes/backslashes.
function readStdlibFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const pattern = new RegExp(`BlzSetAbilityTooltip\\('${FILE_IO_ABIL_ID}',\\s*"([^"]*)",\\s*(\\d+)\\)`, "g");
  const byLevel = new Map();
  for (const match of text.matchAll(pattern)) {
    byLevel.set(Number(match[2]), match[1]);
  }
  if (byLevel.size === 0) return null;
  return Array.from(byLevel.keys())
    .sort((a, b) => a - b)
    .map((level) => byLevel.get(level))
    .join("");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const mapArg = argumentValue("map");
  if (!mapArg) {
    console.error("Usage: node run-transport-spike.cjs --map=<built map> [--keep-open]");
    return 2;
  }
  const mapPath = path.resolve(mapArg);
  if (!fs.existsSync(mapPath)) {
    console.error(`Map not found: ${mapPath}`);
    return 2;
  }
  const wc3Exe = argumentValue("wc3", findWc3Exe());
  if (!wc3Exe || !fs.existsSync(wc3Exe)) {
    console.error("Warcraft III executable not found; pass --wc3=<path>.");
    return 2;
  }
  const customMapData = argumentValue("custom-map-data", findCustomMapData());
  if (!customMapData) {
    console.error("CustomMapData directory could not be resolved; pass --custom-map-data=<path>.");
    return 2;
  }
  if (wc3IsRunning()) {
    console.error("Refusing to run while Warcraft III is already running.");
    return 2;
  }

  const spikeDir = path.join(customMapData, "wc3-e2e", "spike");
  const armedPath = path.join(spikeDir, "armed.pld");
  const resultPath = path.join(spikeDir, "spike-result.pld");
  const rootResultPath = path.join(customMapData, "spike-result-root.pld");
  const heartbeatPath = path.join(spikeDir, "heartbeat.pld");
  const fileTesterPath = path.join(customMapData, "FileTester.pld");

  for (const stale of [resultPath, rootResultPath, heartbeatPath]) {
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  }

  // Multi-chunk payload (3 chunks) so chunk joining is actually exercised.
  const nonce = crypto.randomBytes(6).toString("hex");
  const filler = "x".repeat(420);
  const payload = `v|1|run|spike-${Date.now()}|nonce|${nonce}|suite|spike-1|filler|${filler}`;
  const chunkCount = writeLaunchFile(armedPath, payload);
  console.log(`Launch file written: ${armedPath} (${payload.length} chars, ${chunkCount} chunks)`);

  const launchArgs = ["-launch", "-windowmode", "windowed", "-nowfpause", "-loadfile", mapPath];
  const wc3Proc = spawn("cmd.exe", ["/d", "/s", "/c", "start", "", wc3Exe, ...launchArgs], {
    stdio: "ignore",
    detached: true,
    shell: false,
  });
  wc3Proc.unref();
  console.log("Warcraft III launching...");

  const timeoutMs = Number(argumentValue("timeout-ms", "180000"));
  const deadline = Date.now() + timeoutMs;
  let resultContent = null;
  while (Date.now() < deadline) {
    resultContent = readStdlibFile(resultPath);
    if (resultContent) break;
    await sleep(1000);
  }

  const rootContent = readStdlibFile(rootResultPath);
  const fileTesterSeen = fs.existsSync(fileTesterPath);
  console.log(`FileTester.pld (stdlib self-test write): ${fileTesterSeen ? "present" : "absent"}`);
  console.log(`Root-level result: ${rootContent || "(none)"}`);

  let exitCode;
  if (!resultContent) {
    console.error(`FAIL: no spike result within ${timeoutMs}ms at ${resultPath}`);
    exitCode = 1;
  } else {
    console.log(`Subdirectory result: ${resultContent.slice(0, 120)}...`);
    const echoIndex = resultContent.indexOf("|echo|");
    const echoed = echoIndex >= 0 ? resultContent.slice(echoIndex + "|echo|".length) : "";
    const canRead = /\|canRead\|1\|/.test(resultContent);
    const echoMatches = echoed === payload;
    console.log(`canRead self-test: ${canRead ? "ok" : "FAILED"}`);
    console.log(`payload echo (${payload.length} chars, ${chunkCount} chunks): ${echoMatches ? "exact match" : "MISMATCH"}`);
    if (!echoMatches && echoed) {
      console.log(`  expected ...${payload.slice(-40)}`);
      console.log(`  got      ...${echoed.slice(-40)}`);
    }
    exitCode = canRead && echoMatches ? 0 : 1;
  }

  // Heartbeats only advance once the game is unpaused (game time frozen on the
  // loading screen), so sample briefly and report without judging.
  await sleep(10000);
  const heartbeat = readStdlibFile(heartbeatPath);
  console.log(
    heartbeat
      ? `Heartbeat observed: ${heartbeat}`
      : "Heartbeat: none (expected while the loading screen holds game time; press Space in the game to test)",
  );

  if (!hasFlag("keep-open")) {
    killWc3();
    console.log("Warcraft III terminated.");
  } else {
    console.log("--keep-open: Warcraft III left running (press Space in game to observe heartbeats).");
  }
  console.log(exitCode === 0 ? "SPIKE PASS" : "SPIKE FAIL");
  return exitCode;
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
