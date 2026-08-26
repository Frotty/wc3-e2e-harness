"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

// WGC generation: the bundled Lua one-shot writes a .wgc game-configuration file that Warcraft III
// consumes via -loadfile, selecting map, slots, and game speed without menu
// navigation. The map is copied under a content-hash-suffixed name so a stale
// build can never masquerade as the current one.

const WGC_DIR = path.join(__dirname, "..", "..", "wc3-wgc");
const WGC_LUA = path.join(WGC_DIR, "lua.exe");
const DEFAULT_SLOT = "slot0,team0,raceRandom,color0,health100,human";

function sha1File(filePath) {
  return crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
}

// Returns { wgcPath, inputMap, mapSha1 }.
function createWgc({ mapPath, wc3Root, wc3Exe, speed, gameArgs, slots, stagingDir }) {
  if (!fs.existsSync(WGC_LUA)) throw new Error(`Bundled Lua for WGC not found: ${WGC_LUA}`);
  if (!fs.existsSync(wc3Root)) throw new Error(`WC3 root not found: ${wc3Root}`);

  const mapSha1 = sha1File(mapPath);
  const hash = mapSha1.slice(0, 10);
  const stem = path.basename(mapPath).replace(/\.[^.]+$/, "");
  const ext = path.extname(mapPath) || ".w3x";
  const inputMap = path.join(stagingDir, `${stem}-${hash}${ext}`);
  fs.mkdirSync(stagingDir, { recursive: true });
  fs.copyFileSync(mapPath, inputMap);

  const wgcDir = path.join(wc3Root, "map-wgc-test");
  const wgcPath = path.join(wgcDir, `${stem}-${hash}-e2e.wgc`);
  const luaArgs = [
    "wgc-launch.lua",
    "--no-launch",
    "--gameroot",
    wc3Root,
    "--gameexe",
    wc3Exe,
    "--map",
    inputMap,
    "--wgc",
    wgcPath,
    "--gameargs",
    gameArgs,
    "--gamespeed",
    String(speed),
  ];
  for (const slot of slots?.length ? slots : [DEFAULT_SLOT]) {
    luaArgs.push("--slot", slot);
  }
  const result = spawnSync(WGC_LUA, luaArgs, {
    cwd: WGC_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (!fs.existsSync(wgcPath)) {
    throw new Error(`WGC generation failed (${result.status}): ${result.stderr || result.stdout || "no output"}`);
  }
  return { wgcPath, inputMap, mapSha1 };
}

module.exports = { createWgc, sha1File };
