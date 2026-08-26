"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

/* Win32 layer, ported from Castle Fight's proven Deno modules
 * (win32-agent.ts / input-capture.ts): process liveness via tasklist (a
 * kill-signal probe needs terminate rights Battle.net-authenticated WC3
 * denies), pid discovery with the -launch re-exec quirk handled, and the
 * persistent PowerShell agent (win32-agent.ps1) serving foreground/key/
 * screenshot requests over stdin/stdout so the C# interop compiles once.
 */

const AGENT_PS1 = path.join(__dirname, "..", "..", "win32-agent.ps1");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const livenessCache = new Map();

function isProcessRunning(pid) {
  if (!pid) return false;
  const cached = livenessCache.get(pid);
  if (cached && Date.now() - cached.ts < 1000) return cached.alive;
  const result = spawnSync("tasklist", ["/FI", `PID eq ${pid}`, "/NH", "/FO", "CSV"], {
    shell: false,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 10_000,
  });
  const alive = result.status === 0 && typeof result.stdout === "string" && result.stdout.includes(`"${pid}"`);
  livenessCache.set(pid, { alive, ts: Date.now() });
  return alive;
}

function listWc3Pids() {
  return listPidsByImageNames(["Warcraft III.exe"]);
}

function parseTasklistPids(stdout, imageNames) {
  const wanted = new Set(imageNames.map((name) => name.toLowerCase()));
  const pids = new Set();
  for (const match of String(stdout || "").matchAll(/"([^"]+)","(\d+)"/g)) {
    if (wanted.has(match[1].toLowerCase())) pids.add(Number(match[2]));
  }
  return pids;
}

function listPidsByImageNames(imageNames) {
  const pids = new Set();
  for (const imageName of imageNames) {
    const result = spawnSync("tasklist", ["/FI", `IMAGENAME eq ${imageName}`, "/NH", "/FO", "CSV"], {
      shell: false,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10_000,
    });
    for (const pid of parseTasklistPids(result.stdout, [imageName])) pids.add(pid);
  }
  return pids;
}

function listWorldEditorPids() {
  return listPidsByImageNames(["World Editor.exe", "WorldEditor.exe"]);
}

async function waitForNewProcess(existingPids, listPids, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const candidates = pidsNotIn(listPids(), existingPids);
    if (candidates.length > 0) {
      await sleep(1000);
      const settled = pidsNotIn(listPids(), existingPids);
      if (settled.length > 0) return settled[settled.length - 1];
    }
    await sleep(500);
  }
  return undefined;
}

function killProcess(pid) {
  if (!pid || !isProcessRunning(pid)) return;
  spawnSync("taskkill", ["/F", "/PID", String(pid)], { shell: false, stdio: "ignore" });
}

// WC3's -launch flow can re-exec: the first pid may be a short-lived launcher.
// Require the candidate to survive a settle re-check; if it died, track the
// replacement.
async function waitForNewWc3Pid(existingPids, timeoutMs = 20_000, claimedPids = null) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    let candidate;
    for (const pid of listWc3Pids()) {
      if (!existingPids.has(pid)) candidate = pid;
    }
    if (candidate !== undefined) {
      await sleep(1500);
      const recheck = listWc3Pids();
      const newPids = pidsNotIn(recheck, existingPids);
      if (claimedPids) for (const pid of newPids) claimedPids.add(pid);
      if (recheck.has(candidate)) return candidate;
      for (const pid of recheck) {
        if (!existingPids.has(pid)) return pid;
      }
    }
    await sleep(500);
  }
  return undefined;
}

class Win32Agent {
  constructor() {
    this.proc = null;
    this.pending = new Map();
    this.nextId = 1;
    this.buf = "";
  }

  ensure() {
    if (this.proc) return;
    if (!fs.existsSync(AGENT_PS1)) throw new Error(`win32 agent script missing: ${AGENT_PS1}`);
    const proc = spawn("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      AGENT_PS1,
    ], { stdio: ["pipe", "pipe", "ignore"], shell: false });
    this.proc = proc;
    proc.on("error", () => this.handleDeath(proc));
    proc.on("exit", () => this.handleDeath(proc));
    proc.stdout.on("data", (chunk) => {
      this.buf += chunk;
      let index;
      while ((index = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, index).trim();
        this.buf = this.buf.slice(index + 1);
        if (!line) continue;
        const sep = line.indexOf("|");
        const entry = this.pending.get(line.slice(0, sep));
        if (entry) {
          this.pending.delete(line.slice(0, sep));
          clearTimeout(entry.timer);
          entry.resolve(line.slice(sep + 1));
        }
      }
    });
  }

  handleDeath(proc) {
    if (proc && proc !== this.proc) return;
    const pending = this.pending;
    this.pending = new Map();
    this.proc = null;
    this.buf = "";
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(new Error("win32 agent exited"));
    }
  }

  request(parts, timeoutMs = 10_000) {
    this.ensure();
    const id = String(this.nextId++);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        try {
          this.proc?.kill();
        } catch {}
        reject(new Error(`win32 agent timeout (${parts[0]})`));
      }, timeoutMs);
      this.pending.set(id, {
        timer,
        reject,
        resolve: (line) => {
          if (line.startsWith("ok|")) resolve(line.slice(3));
          else reject(new Error(`win32 agent: ${line.slice(line.indexOf("|") + 1)}`));
        },
      });
      this.proc.stdin.write(`${id}|${parts.join("|")}\n`);
    });
  }

  shutdown() {
    if (this.proc) {
      const proc = this.proc;
      try {
        proc.kill();
      } catch {}
      this.handleDeath(proc);
    }
  }
}

const agent = new Win32Agent();
let agentUsers = 0;

function acquireAgent() {
  agentUsers++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    agentUsers = Math.max(0, agentUsers - 1);
    if (agentUsers === 0) agent.shutdown();
  };
}

// Soft-failure wrappers: a missing window or dead agent returns false/null so
// the run loop can absorb it and retry or fail on its own deadline.
async function postKey(pid, key, alt = false) {
  if (!isProcessRunning(pid)) return false;
  try {
    await agent.request(["key", pid, key, alt ? "1" : "0"]);
    return true;
  } catch {
    return false;
  }
}

// Kill every Warcraft III process and wait until none remain (the -launch
// flow can leave a second pid behind; one leftover blocks the next run).
async function killAllWc3(timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const pids = listWc3Pids();
    if (pids.size === 0) return true;
    for (const pid of pids) {
      spawnSync("taskkill", ["/F", "/PID", String(pid)], { shell: false, stdio: "ignore" });
    }
    await sleep(500);
  }
  return listWc3Pids().size === 0;
}

// Kill only Warcraft III processes that were not present when the harness
// launched its run. This preserves a user's existing game session while also
// cleaning up the launcher/re-exec processes created by -launch.
async function killWc3PidsExcept(preservePids, timeoutMs = 10_000) {
  return killPidsExcept(listWc3Pids, preservePids, timeoutMs);
}

async function killPidsExcept(listPids, preservePids, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ownedPids = pidsNotIn(listPids(), preservePids);
    if (ownedPids.length === 0) return true;
    for (const pid of ownedPids) killProcess(pid);
    await sleep(500);
  }
  return [...listPids()].every((pid) => preservePids.has(pid));
}

async function killSpecificPids(pids, timeoutMs = 10_000) {
  const ownedPids = [...new Set(pids)].filter(Boolean);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const alive = ownedPids.filter((pid) => isProcessRunning(pid));
    if (alive.length === 0) return true;
    for (const pid of alive) killProcess(pid);
    await sleep(500);
  }
  return ownedPids.every((pid) => !isProcessRunning(pid));
}

function pidsNotIn(pids, preservePids) {
  return [...pids].filter((pid) => !preservePids.has(pid));
}

async function foreground(pid) {
  try {
    return (await agent.request(["fg", pid])) === "1";
  } catch {
    return null;
  }
}

async function screenshot(pid, outPath) {
  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await agent.request(["shot", pid, Buffer.from(outPath, "utf8").toString("base64")], 15_000);
    return fs.existsSync(outPath) ? outPath : null;
  } catch {
    return null;
  }
}

async function windowTitle(pid) {
  try {
    const encoded = await agent.request(["title", pid]);
    return Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

module.exports = {
  sleep,
  isProcessRunning,
  listWc3Pids,
  listWorldEditorPids,
  listPidsByImageNames,
  parseTasklistPids,
  killProcess,
  waitForNewWc3Pid,
  waitForNewProcess,
  agent,
  acquireAgent,
  postKey,
  foreground,
  screenshot,
  killAllWc3,
  killWc3PidsExcept,
  killSpecificPids,
  killPidsExcept,
  pidsNotIn,
  windowTitle,
};
