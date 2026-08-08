"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const { encodeFrame } = require("../protocol/frame.cjs");
const { encodeFileText } = require("../protocol/fileio.cjs");
const { makeIdentity } = require("../protocol/snapshot.cjs");
const { createChannelReader } = require("../protocol/channel.cjs");
const { createLifecycle } = require("../lifecycle/machine.cjs");
const { createRealClock } = require("../lifecycle/clock.cjs");
const { createArtifactWriter } = require("../artifacts.cjs");
const { findWc3Exe, wc3RootFor, findCustomMapData } = require("./paths.cjs");
const { createWgc, sha1File } = require("./wgc.cjs");
const win32 = require("./win32.cjs");

/* The production run loop (plan: "Run Lifecycle"). Sequential phases over a
 * shared step(): process liveness, output-channel poll, lifecycle tick. File
 * state is the only test authority; keyboard input is only ever used to
 * advance screens (Space), unpause (mandatory F10 open/close), recover
 * (Escape + F10 cycle), and quit (F10, E, Q).
 */

const POLL_MS = 300;
const SPACE_RETRY_MS = 2500;
const F10_CYCLE_EVERY_MS = 8000;
const MENU_SETTLE_MS = 800;

class RunFailure extends Error {}

async function runSuite(options) {
  const {
    projectId,
    abilityId,
    suiteId,
    mapPath,
    suiteTimeoutMs,
    wgcSpeed = 0,
    gameArgs: rawGameArgs = "-nowfpause -launch",
    slots = [],
    keepOpen = false,
    artifactRoot,
    deadlines = {},
    log = console.log,
  } = options;

  // --- Prepare -------------------------------------------------------------
  // WC3 always runs windowed: fullscreen steals the desktop during automated
  // runs and changes focus/capture behavior.
  const gameArgs = rawGameArgs.includes("-windowmode")
    ? rawGameArgs
    : `${rawGameArgs} -windowmode windowed`;

  const wc3Exe = options.wc3Exe ?? findWc3Exe();
  if (!wc3Exe) throw new RunFailure("Warcraft III executable not found");
  const wc3Root = wc3RootFor(wc3Exe);
  const customMapData = options.customMapData ?? findCustomMapData();
  if (!customMapData) throw new RunFailure("CustomMapData directory could not be resolved");
  if (!fs.existsSync(mapPath)) throw new RunFailure(`Map not found: ${mapPath}`);
  const runId = `${suiteId}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const nonce = crypto.randomBytes(6).toString("hex");
  const buildId = sha1File(mapPath).slice(0, 10);
  const identity = makeIdentity({ projectId, buildId, runId, nonce, suiteId });
  const artifacts = createArtifactWriter({ dir: path.join(artifactRoot, runId) });

  const channelDir = path.join(customMapData, "wc3-e2e", projectId);
  const outputs = [path.join(channelDir, "output-a.pld"), path.join(channelDir, "output-b.pld")];
  for (const stale of outputs) {
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  }
  const armedBody =
    `armed;v=${identity.v};projectId=${projectId};buildId=${buildId};runId=${runId};nonce=${nonce};suiteId=${suiteId}`;
  fs.mkdirSync(channelDir, { recursive: true });
  fs.writeFileSync(path.join(channelDir, "armed.pld"), encodeFileText(abilityId, encodeFrame(armedBody)), "utf8");

  const machine = createLifecycle({
    clock: createRealClock(),
    deadlines: { suite: suiteTimeoutMs, ...deadlines },
  });
  const reader = createChannelReader(abilityId, identity);
  const seen = { ready: false, running: false, heartbeat: -1, terminalPayload: null };
  let pid;
  let existingWc3Pids = new Set();
  let launchSnapshotTaken = false;
  let shutdown = "none";

  const readOrNull = (file) => {
    try {
      return fs.readFileSync(file, "utf8");
    } catch {
      return null;
    }
  };

  // One shared observation step for every phase.
  const step = async () => {
    if (pid !== undefined && !win32.isProcessRunning(pid)) {
      machine.noteProcessExit();
      if (machine.failure) throw new RunFailure(machine.failure.reason);
      return;
    }
    const polled = reader.poll([readOrNull(outputs[0]), readOrNull(outputs[1])]);
    if (polled.accepted) {
      const snap = polled.accepted;
      artifacts.appendTimeline({ at: Date.now(), seq: snap.seq, state: snap.state, heartbeat: snap.heartbeat });
      if (snap.state === "READY") {
        seen.ready = true;
        log(`  READY (seq ${snap.seq})`);
      } else if (snap.state === "RUNNING") {
        if (!seen.running) log(`  RUNNING (seq ${snap.seq})`);
        seen.running = true;
        seen.heartbeat = Math.max(seen.heartbeat, snap.heartbeat);
        machine.noteHeartbeat(snap.heartbeat);
      } else {
        seen.terminalPayload = snap.payload;
        machine.noteTerminal(snap.state);
        log(`  ${snap.state} (seq ${snap.seq})`);
      }
    }
    const tick = machine.tick();
    if (tick.failed) throw new RunFailure(tick.failed);
    if (tick.recover) {
      log(`  recovery ladder (attempt ${tick.attempt}: ${tick.recover})`);
      await recoveryLadder();
    }
    await win32.sleep(POLL_MS);
  };

  const f10Cycle = async () => {
    await win32.postKey(pid, "f10");
    await win32.sleep(MENU_SETTLE_MS);
    await win32.postKey(pid, "f10");
    await win32.sleep(MENU_SETTLE_MS);
  };

  const recoveryLadder = async () => {
    machine.suspendStallDetection(true);
    await win32.foreground(pid);
    await win32.postKey(pid, "escape");
    await win32.sleep(MENU_SETTLE_MS);
    await f10Cycle();
    machine.suspendStallDetection(false);
  };

  try {
    // --- Launch ------------------------------------------------------------
    machine.enter("LAUNCH");
    let loadFile = mapPath;
    let launchArgs;
    if (wgcSpeed > 0) {
      const wgc = createWgc({
        mapPath,
        wc3Root,
        wc3Exe,
        speed: wgcSpeed,
        gameArgs,
        slots,
        stagingDir: artifacts.dir,
      });
      loadFile = wgc.wgcPath;
      launchArgs = ["-loadfile", loadFile, ...gameArgs.split(/\s+/).filter(Boolean)];
    } else {
      launchArgs = ["-launch", "-windowmode", "windowed", "-nowfpause", "-loadfile", loadFile];
    }
    artifacts.writeRun({ identity, map: mapPath, loadFile, wgcSpeed, suiteTimeoutMs });
    log(`Launching ${suiteId} (speed ${wgcSpeed > 0 ? `${wgcSpeed}x` : "1x"})...`);
    existingWc3Pids = win32.listWc3Pids();
    launchSnapshotTaken = true;
    spawn("cmd.exe", ["/d", "/s", "/c", "start", "", wc3Exe, ...launchArgs], {
      stdio: "ignore",
      detached: true,
      shell: false,
      cwd: wgcSpeed > 0 ? wc3Root : undefined,
    }).unref();
    pid = await win32.waitForNewWc3Pid(existingWc3Pids);
    if (!pid) throw new RunFailure("wc3-process-did-not-appear");
    log(`  pid ${pid}`);

    // --- Window ------------------------------------------------------------
    machine.enter("WINDOW");
    while ((await win32.foreground(pid)) !== true) {
      await step();
    }

    // --- Loading: READY proves the map armed behind the loading screen ------
    // (seen.running also exits: READY can be missed when A/B were overwritten)
    if (!machine.verdict) {
      machine.enter("LOADING");
      while (!seen.ready && !seen.running && !machine.verdict) {
        await step();
      }
    }

    // --- Unpause: Space + mandatory F10 cycle until the game clock advances -
    if (!machine.verdict && !seen.running) {
      machine.enter("UNPAUSE");
      let lastSpaceAt = 0;
      let lastF10At = 0;
      let spaceCount = 0;
      while (!seen.running && !machine.verdict) {
        const now = Date.now();
        if (now - lastSpaceAt >= SPACE_RETRY_MS) {
          lastSpaceAt = now;
          spaceCount++;
          await win32.foreground(pid);
          await win32.postKey(pid, "space");
        }
        // Mandatory, not a timeout fallback: first cycle right after the first
        // Space, repeated while the clock still is not advancing.
        if (spaceCount > 0 && now - lastF10At >= F10_CYCLE_EVERY_MS) {
          lastF10At = now;
          await win32.sleep(1000);
          await f10Cycle();
        }
        await step();
      }
    }

    if (!machine.verdict) {
      machine.enter("READY");
      machine.noteReady(); // -> RUNNING; heartbeat stall detection is now armed
    }

    // --- Running -------------------------------------------------------------
    while (!machine.verdict) {
      await step();
    }

    // --- Result is durable BEFORE any quit/termination ----------------------
    artifacts.writeResult(summary(machine, seen, shutdown));

    // --- Quit: Alt+F4 (no replay to preserve), bounded, then force ----------
    machine.enter("QUIT");
    log("  quitting (Alt+F4)");
    await win32.foreground(pid);
    await win32.postKey(pid, "f4", true);
    const quitDeadline = Date.now() + 15_000;
    while (win32.isProcessRunning(pid) && Date.now() < quitDeadline) {
      await win32.sleep(500);
    }
    if (keepOpen && win32.isProcessRunning(pid)) {
      shutdown = "left-open";
    } else {
      shutdown = win32.isProcessRunning(pid) ? "forced" : "clean";
      await win32.killWc3PidsExcept(existingWc3Pids);
    }
  } catch (error) {
    const reason = error instanceof RunFailure ? error.message : `unexpected: ${error.message}`;
    if (pid && win32.isProcessRunning(pid)) {
      await win32.screenshot(pid, path.join(artifacts.dir, "failure.png"));
    }
    if (!keepOpen && launchSnapshotTaken) await win32.killWc3PidsExcept(existingWc3Pids);
    shutdown = "failed";
    const result = artifacts.writeResult({ ...summary(machine, seen, shutdown), failure: reason });
    win32.agent.shutdown();
    return { ...result, exitCode: reason.startsWith("unexpected") ? 2 : 1, artifactDir: artifacts.dir };
  }

  const result = artifacts.writeResult(summary(machine, seen, shutdown));
  win32.agent.shutdown();
  return { ...result, exitCode: result.verdict === "PASS" ? 0 : 1, artifactDir: artifacts.dir };
}

function summary(machine, seen, shutdown) {
  return {
    verdict: machine.verdict,
    failure: machine.failure?.reason ?? null,
    readyObserved: seen.ready,
    runningObserved: seen.running,
    heartbeats: seen.heartbeat,
    payload: seen.terminalPayload,
    shutdown,
  };
}

module.exports = { runSuite, RunFailure };
