"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Per-machine path discovery (plan: "Environment Prerequisites"), ported from
// Castle Fight's config auto-detection.

function findWc3Exe() {
  const candidates = [
    "C:\\Program Files (x86)\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe",
    "C:\\Program Files\\Warcraft III\\_retail_\\x86_64\\Warcraft III.exe",
    "C:\\Program Files (x86)\\Warcraft III\\x86_64\\Warcraft III.exe",
    "C:\\Program Files\\Warcraft III\\x86_64\\Warcraft III.exe",
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function wc3RootFor(gameExe) {
  const exeDir = path.dirname(gameExe);
  if (path.basename(exeDir).toLowerCase() === "x86_64") {
    const retailDir = path.dirname(exeDir);
    return path.basename(retailDir).toLowerCase() === "_retail_" ? path.dirname(retailDir) : retailDir;
  }
  return exeDir;
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

module.exports = { findWc3Exe, wc3RootFor, findCustomMapData };
