"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const { encodeFrame } = require("../protocol/frame.cjs");
const { encodeFileText } = require("../protocol/fileio.cjs");
const { makeIdentity } = require("../protocol/snapshot.cjs");
const { createChannelReader } = require("../protocol/channel.cjs");
const { createModifiedFileReader } = require("../protocol/modified-file.cjs");
const { createLifecycle } = require("../lifecycle/machine.cjs");
const { createRealClock } = require("../lifecycle/clock.cjs");
const { createArtifactWriter, pruneArtifactRoot } = require("../artifacts.cjs");
const { findWc3Exe, wc3RootFor, findCustomMapData } = require("./paths.cjs");
const { createWgc, sha1File } = require("./wgc.cjs");
const win32 = require("./win32.cjs");

/* The production run loop (plan: "Run Lifecycle"). Sequential phases over a
 * shared step(): process liveness, output-channel poll, lifecycle tick. File
 * state is the only test authority; keyboard input is only ever used to
 * advance screens (Space), unpause (mandatory F10 open/close), recover
 * (Escape + F10 cycle), and quit (F10, E, Q).
 */

const POLL_MS = 250;
const SPACE_RETRY_MS = 2500;
const F10_CYCLE_EVERY_MS = 8000;
const MENU_SETTLE_MS = 800;
const SCREEN_PROBE_MS = 1000;
const SCREEN_PROBE_TIMEOUT_MS = 5000;
const MAP_LOAD_SETTLE_MS = 1000;
const MAP_STARTUP_TIMEOUT_MS = 20_000;
const RUN_LOCK_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const QUIT_GRACE_MS = 3000;
const QUIT_CLEANUP_MS = 2000;
const FAILURE_SCREENSHOT_TIMEOUT_MS = 2000;

class RunFailure extends Error {}

async function runSuite(options) {
  const {
    projectId,
    abilityId,
    suiteId,
    mapPath,
    suiteTimeoutMs,
    wgcSpeed = 0,
    // Off by default: a suite that yanks the game in front of whatever the developer is doing, once
    // per launch and again for every loading-screen keypress, is unusable to run in the background.
    // Input does not need it - keys are delivered with SendMessage to the window handle, and the
    // launch args already carry -nowfpause so the game keeps simulating while unfocused. Turn it on
    // to watch a run, or if a host proves to need the activation.
    focus = false,
    gameArgs: rawGameArgs = "-nowfpause -launch",
    slots = [],
    keepOpen = false,
    mapLoadOnly = false,
    screenProbe = null,
    pollMs = POLL_MS,
    screenProbeMs = SCREEN_PROBE_MS,
    screenProbeTimeoutMs = SCREEN_PROBE_TIMEOUT_MS,
    mapLoadSettleMs = MAP_LOAD_SETTLE_MS,
    startupTimeoutMs = MAP_STARTUP_TIMEOUT_MS,
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
  const nonce = crypto.randomBytes(6).toString("hex");
  const runId = `${suiteId}-${new Date().toISOString().replace(/[:.]/g, "-")}-${nonce}`;
  const buildId = sha1File(mapPath).slice(0, 10);
  const identity = makeIdentity({ projectId, buildId, runId, nonce, suiteId });
  const artifacts = createArtifactWriter({ dir: path.join(artifactRoot, runId) });
  const releaseAgent = win32.acquireAgent();

  const channelDir = path.join(customMapData, "wc3-e2e", projectId);
  const outputs = [path.join(channelDir, "output-a.pld"), path.join(channelDir, "output-b.pld")];
  const armedPath = path.join(channelDir, "armed.pld");
  const armedBody =
    `armed;v=${identity.v};projectId=${projectId};buildId=${buildId};runId=${runId};nonce=${nonce};suiteId=${suiteId}`;
  const armedText = encodeFileText(abilityId, encodeFrame(armedBody));
  const removeOwnedArmedFile = () => {
    try {
      if (fs.existsSync(armedPath) && fs.readFileSync(armedPath, "utf8") === armedText) fs.unlinkSync(armedPath);
    } catch {
      // Cleanup is best-effort; never hide the actual run result.
    }
  };

  const machine = createLifecycle({
    clock: createRealClock(),
    deadlines: { suite: suiteTimeoutMs, ...deadlines },
  });
  const reader = createChannelReader(abilityId, identity);
  const seen = { ready: false, loaded: false, running: false, heartbeat: -1, terminalPayload: null };
  const outputReaders = outputs.map(() => createModifiedFileReader());
  let nextScreenProbeAt = 0;
  let screenProbeCount = 0;
  let loadedAt = null;
  let loadingStartedAt = null;
  let pid;
  let existingWc3Pids = new Set();
  const ownedWc3Pids = new Set();
  let launchSnapshotTaken = false;
  let shutdown = "none";
  let releaseRunLock = () => {};
  let releaseLaunchLock = () => {};

  // One shared observation step for every phase.
  const step = async () => {
    if (pid !== undefined && !win32.isProcessRunning(pid)) {
      const replacement = [...ownedWc3Pids].find((candidate) => win32.isProcessRunning(candidate));
      if (replacement !== undefined) {
        pid = replacement;
        log(`  switched to replacement pid ${pid}`);
      } else {
        machine.noteProcessExit();
        if (machine.failure) throw new RunFailure(machine.failure.reason);
        return;
      }
    }
    const polled = reader.poll(outputs.map((file, index) => outputReaders[index].read(file)));
    if (polled.accepted) {
      removeOwnedArmedFile();
      const snap = polled.accepted;
      artifacts.appendTimeline({ at: Date.now(), seq: snap.seq, state: snap.state, heartbeat: snap.heartbeat });
      if (snap.state === "READY") {
        seen.ready = true;
        log(`  READY (seq ${snap.seq})`);
      } else if (snap.state === "LOADED") {
        seen.loaded = true;
        loadedAt ??= Date.now();
        log(`  LOADED (seq ${snap.seq})`);
      } else if (snap.state === "RUNNING") {
        if (!seen.running) log(`  RUNNING (seq ${snap.seq})`);
        seen.running = true;
        // E2E.startSuite() emits RUNNING immediately after LOADED. Treat it
        // as load evidence when the alternating channel overwrote LOADED
        // before the watcher could observe that intermediate snapshot.
        if (mapLoadOnly && loadedAt === null) loadedAt = Date.now();
        seen.heartbeat = Math.max(seen.heartbeat, snap.heartbeat);
        machine.noteHeartbeat(snap.heartbeat);
      } else {
        seen.terminalPayload = snap.payload;
        if (terminalSnapshotAllowed({
          mapLoadOnly,
          state: snap.state,
          loaded: seen.loaded,
          running: seen.running,
        })) {
          machine.noteTerminal(snap.state);
        } else {
          machine.noteFailure("pass-before-map-load");
        }
        log(`  ${snap.state} (seq ${snap.seq})`);
      }
    }

    if (screenProbe && (machine.state === "LOADING" || machine.state === "UNPAUSE") && Date.now() >= nextScreenProbeAt) {
      nextScreenProbeAt = Date.now() + screenProbeMs;
      const probeId = ++screenProbeCount;
      const screenshotPath = path.join(artifacts.dir, "screens", `screen-${probeId}.png`);
      const probeBudgetMs = Math.max(1, Math.min(
        screenProbeTimeoutMs,
        loadingStartedAt !== null && Number.isFinite(startupTimeoutMs)
          ? Math.max(1, startupTimeoutMs - (Date.now() - loadingStartedAt))
          : screenProbeTimeoutMs,
      ));
      try {
        const capturedPath = await withTimeout(win32.screenshot(pid, screenshotPath), probeBudgetMs, "screen-probe-timeout");
        const screen = await withTimeout(screenProbe({
          pid,
          phase: machine.state,
          screenshotPath: capturedPath,
          artifactDir: artifacts.dir,
        }), Math.max(1, Math.min(probeBudgetMs, loadingStartedAt !== null && Number.isFinite(startupTimeoutMs)
          ? Math.max(1, startupTimeoutMs - (Date.now() - loadingStartedAt))
          : probeBudgetMs)), "screen-probe-timeout");
        artifacts.appendTimeline({ at: Date.now(), event: "screen-probe", phase: machine.state, result: screen ?? "unknown" });
      } catch (error) {
        artifacts.appendTimeline({ at: Date.now(), event: "screen-probe-failed", phase: machine.state, error: error.message, diagnosticOnly: true });
      }
    }
    if (mapStartupTimedOut({
      startedAt: loadingStartedAt,
      now: Date.now(),
      timeoutMs: startupTimeoutMs,
      ready: seen.ready,
      loaded: seen.loaded,
      running: seen.running,
      verdict: machine.verdict,
    })) {
      machine.noteFailure("map-startup-timeout");
      // Do not make the watchdog wait on another Win32 request here. The
      // title is useful diagnostics, but it must never delay the failure.
      artifacts.appendTimeline({ at: Date.now(), event: "map-startup-timeout" });
    }
    const tick = machine.tick();
    if (tick.failed) throw new RunFailure(tick.failed);
    if (tick.recover) {
      // Once the map has published RUNNING, it has already crossed the
      // loading/unpause boundary. Menu-key recovery at this point can close a
      // user's game or hide a real suite failure. A suite stall is a terminal
      // diagnostic condition; only use the keyboard recovery ladder while the
      // runner is still trying to leave the loading screens.
      if (seen.running) throw new RunFailure("heartbeat-stall-after-suite-start");
      log(`  recovery ladder (attempt ${tick.attempt}: ${tick.recover})`);
      await recoveryLadder();
    }
    await win32.sleep(pollMs);
  };

  const f10Cycle = async () => {
    await win32.postKey(pid, "f10");
    await win32.sleep(MENU_SETTLE_MS);
    await win32.postKey(pid, "f10");
    await win32.sleep(MENU_SETTLE_MS);
  };

  const recoveryLadder = async () => {
    machine.suspendStallDetection(true);
    // The ladder runs when a run is already wedged, so activation earns its cost here even though it
    // is not the default: a stuck game is the one case where "the window is ignoring posted input"
    // is a live hypothesis worth ruling out.
    if (focus) await win32.foreground(pid);
    await win32.postKey(pid, "escape");
    await win32.sleep(MENU_SETTLE_MS);
    await f10Cycle();
    machine.suspendStallDetection(false);
  };

  try {
    releaseRunLock = acquireRunLock(path.join(channelDir, "run.lock"), {
      pid: process.pid,
      startedAt: Date.now(),
      runId,
    });
    fs.mkdirSync(channelDir, { recursive: true });
    for (const stale of outputs) {
      if (fs.existsSync(stale)) fs.unlinkSync(stale);
    }
    fs.writeFileSync(armedPath, armedText, "utf8");
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
    artifacts.writeRun({ identity, map: mapPath, loadFile, wgcSpeed, suiteTimeoutMs, startupTimeoutMs, runnerPid: process.pid });
    pruneArtifactRoot({ root: artifactRoot, currentDir: artifacts.dir });
    log(`Launching ${suiteId} (speed ${wgcSpeed > 0 ? `${wgcSpeed}x` : "1x"})...`);
    releaseLaunchLock = await acquireRunLockEventually(path.join(customMapData, "wc3-e2e", "launch.lock"), {
      pid: process.pid,
      startedAt: Date.now(),
      runId,
    }, 30_000);
    existingWc3Pids = win32.listWc3Pids();
    launchSnapshotTaken = true;
    spawn("cmd.exe", ["/d", "/s", "/c", "start", "", wc3Exe, ...launchArgs], {
      stdio: "ignore",
      detached: true,
      shell: false,
      cwd: wgcSpeed > 0 ? wc3Root : undefined,
    }).unref();
    pid = await win32.waitForNewWc3Pid(existingWc3Pids, 20_000, ownedWc3Pids);
    releaseLaunchLock();
    releaseLaunchLock = () => {};
    if (!pid) throw new RunFailure("wc3-process-did-not-appear");
    for (const candidate of win32.listWc3Pids()) {
      if (!existingWc3Pids.has(candidate)) ownedWc3Pids.add(candidate);
    }
    log(`  pid ${pid}`);

    // --- Window ------------------------------------------------------------
    // Waiting for the window and activating it used to be the same call; they are not the same
    // requirement. Wait for the window either way, and only steal focus when asked to.
    machine.enter("WINDOW");
    while ((await (focus ? win32.foreground(pid) : win32.hasWindow(pid))) !== true) {
      await step();
    }

    // --- Loading: arm the map and clear the loading screen ------------------
    // Map init runs behind the loading screen. Some maps do not publish READY
    // until a timer callback after init, so waiting for READY before sending
    // Space would deadlock forever on "PRESS ANY KEY TO CONTINUE".
    let lastSpaceAt = 0;
    let spaceCount = 0;
    const sendSpace = async (phase) => {
      const focused = focus ? await win32.foreground(pid) : null;
      const sent = await win32.postKey(pid, "space");
      artifacts.appendTimeline({ at: Date.now(), event: "input", phase, key: "space", focused, sent });
      log(`  ${phase}: Space (focus=${String(focused)} sent=${String(sent)})`);
      return sent;
    };

    if (!machine.verdict) {
      machine.enter("LOADING");
      loadingStartedAt = Date.now();
      while (!loadingComplete({
        ready: seen.ready,
        loaded: seen.loaded,
        running: seen.running,
        verdict: machine.verdict,
      })) {
        const now = Date.now();
        if (now - lastSpaceAt >= SPACE_RETRY_MS) {
          lastSpaceAt = now;
          spaceCount++;
          await sendSpace("LOADING");
        }
        await step();
      }
    }

    // --- Unpause: Space + mandatory F10 cycle until the game clock advances -
    if (!machine.verdict && !unpauseComplete({
      mapLoadOnly,
      loaded: seen.loaded,
      running: seen.running,
      heartbeat: seen.heartbeat,
      verdict: machine.verdict,
    })) {
      machine.enter("UNPAUSE");
      let lastF10At = 0;
      while (!unpauseComplete({
        mapLoadOnly,
        loaded: seen.loaded,
        running: seen.running,
        heartbeat: seen.heartbeat,
        verdict: machine.verdict,
      })) {
        // RUNNING is the map-side boundary. A heartbeat-0 snapshot can arrive
        // before the first timer tick, but it is still proof that the suite is
        // live; wait for the next save-file heartbeat without touching menus.
        if (seen.running) {
          await step();
          continue;
        }
        const now = Date.now();
        if (now - lastSpaceAt >= SPACE_RETRY_MS) {
          lastSpaceAt = now;
          spaceCount++;
          await sendSpace("UNPAUSE");
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

    if (mapLoadOnly && loadedAt !== null && !machine.verdict) {
      enterMapLoadConfirmation(machine);
      const settleUntil = loadedAt + mapLoadSettleMs;
      while (Date.now() < settleUntil && !machine.verdict) await step();
      if (!machine.verdict) {
        machine.noteTerminal("PASS");
        seen.terminalPayload = { mapLoaded: true };
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
    if (focus) await win32.foreground(pid);
    await win32.postKey(pid, "f4", true);
    const quitDeadline = Date.now() + QUIT_GRACE_MS;
    while (win32.isProcessRunning(pid) && Date.now() < quitDeadline) {
      await win32.sleep(500);
    }
    if (keepOpen && win32.isProcessRunning(pid)) {
      shutdown = "left-open";
    } else {
      shutdown = win32.isProcessRunning(pid) ? "forced" : "clean";
      await win32.killSpecificPids(ownedWc3Pids, QUIT_CLEANUP_MS);
    }
  } catch (error) {
    const reason = error instanceof RunFailure ? error.message : `unexpected: ${error.message}`;
    if (pid && win32.isProcessRunning(pid) && reason !== "map-startup-timeout") {
      await withTimeout(
        win32.screenshot(pid, path.join(artifacts.dir, "failure.png")),
        FAILURE_SCREENSHOT_TIMEOUT_MS,
        "failure-screenshot-timeout",
      ).catch(() => {});
    }
    releaseLaunchLock();
    // A failed run must not leave a live map writer behind after releasing
    // either lock, even when keepOpen was requested for successful runs.
    if (launchSnapshotTaken) await win32.killSpecificPids(ownedWc3Pids, QUIT_CLEANUP_MS);
    removeOwnedArmedFile();
    releaseRunLock();
    shutdown = "failed";
    const result = artifacts.writeResult({ ...summary(machine, seen, shutdown), failure: reason });
    artifacts.complete();
    releaseAgent();
    return { ...result, exitCode: reason.startsWith("unexpected") ? 2 : 1, artifactDir: artifacts.dir };
  }

  const result = artifacts.writeResult(summary(machine, seen, shutdown));
  artifacts.complete();
  removeOwnedArmedFile();
  releaseRunLock();
  releaseAgent();
  return { ...result, exitCode: result.verdict === "PASS" ? 0 : 1, artifactDir: artifacts.dir };
}

function summary(machine, seen, shutdown) {
  return {
    verdict: machine.verdict,
    failure: machine.failure?.reason ?? null,
    readyObserved: seen.ready,
    loadedObserved: seen.loaded,
    runningObserved: seen.running,
    heartbeats: seen.heartbeat,
    payload: seen.terminalPayload,
    shutdown,
  };
}

function loadingComplete({ ready, loaded, running, verdict }) {
  return Boolean(verdict) || ready || loaded || running;
}

function mapStartupTimedOut({ startedAt, now, timeoutMs, ready, loaded, running, verdict }) {
  return Number.isFinite(timeoutMs) && timeoutMs > 0 && startedAt !== null && now - startedAt >= timeoutMs
    && !ready && !loaded && !running && !verdict;
}

function terminalSnapshotAllowed({ mapLoadOnly, state, loaded, running }) {
  return !mapLoadOnly || state !== "PASS" || loaded || running;
}

function unpauseComplete({ mapLoadOnly, loaded, running, heartbeat = -1, verdict }) {
  // E2E.startSuite emits an initial RUNNING snapshot before the game clock is
  // necessarily advancing. Require one heartbeat for normal suites so a
  // map-side timer-backed suite cannot remain paused behind a false positive.
  return Boolean(verdict) || (mapLoadOnly && (loaded || running)) || (!mapLoadOnly && running && heartbeat > 0);
}

function enterMapLoadConfirmation(machine) {
  if (machine.state === "LOADING" || machine.state === "UNPAUSE") {
    machine.enter("READY");
    machine.noteReady();
  }
}

module.exports = {
  acquireRunLock,
  runSuite,
  RunFailure,
  loadingComplete,
  mapStartupTimedOut,
  terminalSnapshotAllowed,
  unpauseComplete,
  enterMapLoadConfirmation,
};

function withTimeout(promise, timeoutMs, message) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function acquireRunLock(lockPath, metadata) {
  const lockBody = JSON.stringify(metadata);
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    const tempPath = `${lockPath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    try {
      // Publish complete metadata atomically. A contender must never see
      // an empty lock and mistake an in-progress owner for a stale one.
      fs.writeFileSync(tempPath, lockBody, { encoding: "utf8", flag: "wx" });
      // Windows rename can replace an existing destination. A hard-link
      // creation is atomic and fails with EEXIST instead, so no contender can
      // steal an already-owned lock.
      fs.linkSync(tempPath, lockPath);
      try { fs.unlinkSync(tempPath); } catch {}
      return () => {
        try {
          if (fs.existsSync(lockPath) && fs.readFileSync(lockPath, "utf8") === lockBody) fs.unlinkSync(lockPath);
        } catch {
          // Cleanup is best-effort; the next runner can reap a dead lock.
        }
      };
    } catch (error) {
      try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
      if (error.code !== "EEXIST" && error.code !== "EPERM") throw error;
      let lockStat;
      try {
        lockStat = fs.statSync(lockPath);
      } catch {
        continue;
      }
      let lockContents;
      let owner;
      try {
        lockContents = fs.readFileSync(lockPath, "utf8");
        owner = JSON.parse(lockContents);
      } catch {
        lockContents = "";
        owner = null;
      }
      const lockAge = Date.now() - lockStat.mtimeMs;
      if (!owner && lockAge < RUN_LOCK_MAX_AGE_MS) {
        throw new RunFailure(`project-run-already-active: ${lockPath}`);
      }
      const ownerAlive = Number.isInteger(owner?.pid) && processAlive(owner.pid);
      const ownerAge = Number.isFinite(owner?.startedAt) ? Date.now() - owner.startedAt : Infinity;
      if (ownerAlive && ownerAge < RUN_LOCK_MAX_AGE_MS) {
        throw new RunFailure(`project-run-already-active: ${lockPath}`);
      }
      try {
        const expectedContents = owner ? JSON.stringify(owner) : lockContents;
        if (fs.existsSync(lockPath) && fs.readFileSync(lockPath, "utf8") === expectedContents) {
          fs.unlinkSync(lockPath);
        }
      } catch {
        // A concurrent owner may have replaced or removed the lock; retry once.
      }
    }
  }
  throw new RunFailure(`project-run-already-active: ${lockPath}`);
}

function processAlive(pid) {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function acquireRunLockEventually(lockPath, metadata, waitMs) {
  const deadline = Date.now() + waitMs;
  while (true) {
    try {
      return acquireRunLock(lockPath, metadata);
    } catch (error) {
      if (!(error instanceof RunFailure)
        || !error.message.startsWith("project-run-already-active:")
        || Date.now() >= deadline) throw error;
      await win32.sleep(Math.min(250, Math.max(1, deadline - Date.now())));
    }
  }
}
