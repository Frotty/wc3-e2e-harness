"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const { spawn } = require("node:child_process");

const { createArtifactWriter, pruneArtifactRoot } = require("../artifacts.cjs");
const { findWc3Exe, findWorldEditorExe } = require("./paths.cjs");
const win32 = require("./win32.cjs");

const EDITOR_POLL_MS = 500;
const EDITOR_SCREEN_PROBE_MS = 1000;
const EDITOR_TIMEOUT_MS = 30_000;

class WorldEditorRunFailure extends Error {}

/* Open a map the way Windows does when the user double-clicks a .w3x file,
 * or launch a discovered World Editor executable directly. Unlike the WC3
 * runner this path has no preload protocol: readiness is confirmed by the
 * editor window title containing the map stem, with an optional screenshot
 * classifier for installations that use a different title.
 */
async function runWorldEditorMap(options) {
  const {
    mapPath,
    editorExe: requestedEditorExe = null,
    wc3Exe = null,
    launchMode = "association",
    timeoutMs = EDITOR_TIMEOUT_MS,
    pollMs = EDITOR_POLL_MS,
    screenProbe = null,
    screenProbeMs = EDITOR_SCREEN_PROBE_MS,
    keepOpen = false,
    artifactRoot,
    log = console.log,
  } = options;

  if (!mapPath) throw new WorldEditorRunFailure("Map path is required");
  const resolvedMapPath = path.resolve(mapPath);
  if (!fs.existsSync(resolvedMapPath)) throw new WorldEditorRunFailure(`Map not found: ${resolvedMapPath}`);
  if (!artifactRoot) throw new WorldEditorRunFailure("artifactRoot is required");
  if (!['association', 'direct'].includes(launchMode)) {
    throw new WorldEditorRunFailure(`Unknown World Editor launch mode: ${launchMode}`);
  }

  const discoveredWc3Exe = wc3Exe || findWc3Exe();
  const requestedOrDiscoveredEditorExe = requestedEditorExe || findWorldEditorExe({ wc3Exe: discoveredWc3Exe });
  const editorExe = requestedOrDiscoveredEditorExe
    ? path.resolve(requestedOrDiscoveredEditorExe)
    : null;
  if (launchMode === "direct" && !editorExe) {
    throw new WorldEditorRunFailure("World Editor executable not found");
  }

  const mapName = path.basename(resolvedMapPath, path.extname(resolvedMapPath));
  const nonce = crypto.randomBytes(6).toString("hex");
  const runId = `world-editor-${mapName}-${new Date().toISOString().replace(/[:.]/g, "-")}-${nonce}`;
  const artifacts = createArtifactWriter({ dir: path.join(artifactRoot, runId) });
  const releaseAgent = win32.acquireAgent();
  const existingPids = win32.listWorldEditorPids();
  const initialTitles = new Map();
  for (const pid of existingPids) {
    const title = await win32.windowTitle(pid);
    if (title !== null) initialTitles.set(pid, title);
  }
  let launched = false;
  let launchError = null;
  let loadedPid = null;
  let loadedTitle = null;
  let nextProbeAt = 0;
  let probeCount = 0;
  let sawEditorProcess = false;
  let shutdown = "none";

  artifacts.writeRun({
    mode: "world-editor",
    map: resolvedMapPath,
    editorExe,
    launchMode,
    timeoutMs,
    runnerPid: process.pid,
    nonce,
  });
  pruneArtifactRoot({ root: artifactRoot, currentDir: artifacts.dir });

  const launch = () => {
    const child = launchMode === "association"
      ? spawn("explorer.exe", [resolvedMapPath], { stdio: "ignore", detached: true, shell: false })
      : spawn(editorExe, [resolvedMapPath], {
        stdio: "ignore",
        detached: true,
        shell: false,
        cwd: path.dirname(editorExe),
      });
    child.once("error", (error) => {
      launchError = error;
    });
    child.unref();
    launched = true;
  };

  const titleHasMap = (title) => mapTitleMatches(title, mapName);
  const hasPostLaunchEvidence = (pid, title) =>
    editorEvidenceIsFresh(pid, title, existingPids, initialTitles);
  const currentPids = () => {
    const pids = win32.listWorldEditorPids();
    if (pids.size > 0) sawEditorProcess = true;
    return pids;
  };

  const closeOwnedEditors = async () => {
    const owned = win32.pidsNotIn(currentPids(), existingPids);
    if (owned.length > 0 && loadedPid !== null && !existingPids.has(loadedPid)) {
      await win32.foreground(loadedPid);
      await win32.postKey(loadedPid, "f4", true);
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline && win32.isProcessRunning(loadedPid)) await win32.sleep(500);
    }
    await win32.killPidsExcept(win32.listWorldEditorPids, existingPids);
  };

  const finish = async (result) => {
    if (keepOpen) {
      shutdown = "left-open";
    } else if (loadedPid !== null && !existingPids.has(loadedPid)) {
      await closeOwnedEditors();
      shutdown = win32.isProcessRunning(loadedPid) ? "forced" : "clean";
    } else {
      shutdown = "preserved-existing";
    }
    const full = artifacts.writeResult({ ...result, shutdown });
    artifacts.complete();
    releaseAgent();
    return { ...full, exitCode: full.verdict === "PASS" ? 0 : 1, artifactDir: artifacts.dir };
  };

  try {
    launch();
    log(`Opening ${resolvedMapPath} in World Editor (${launchMode})...`);
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (launchError) throw new WorldEditorRunFailure(`world-editor-launch-failed: ${launchError.message}`);
      const pids = currentPids();
      for (const pid of pids) {
        const title = await win32.windowTitle(pid);
        if (titleHasMap(title) && hasPostLaunchEvidence(pid, title)) {
          loadedPid = pid;
          loadedTitle = title;
          break;
        }
      }
      if (loadedPid !== null) break;

      if (screenProbe && Date.now() >= nextProbeAt) {
        nextProbeAt = Date.now() + screenProbeMs;
        for (const candidatePid of orderEditorProbePids(pids, existingPids)) {
          const probeId = ++probeCount;
          const screenshotPath = path.join(artifacts.dir, "screens", `screen-${probeId}.png`);
          const capturedPath = await win32.screenshot(candidatePid, screenshotPath);
          const screen = await screenProbe({
            pid: candidatePid,
            phase: "WORLD_EDITOR_LOADING",
            screenshotPath: capturedPath,
            artifactDir: artifacts.dir,
          });
          artifacts.appendTimeline({
            at: Date.now(),
            event: "screen-probe",
            pid: candidatePid,
            result: screen ?? "unknown",
          });
          const candidateTitle = await win32.windowTitle(candidatePid);
          const fresh = hasPostLaunchEvidence(candidatePid, candidateTitle);
          if (screen === "loaded" && fresh) {
            loadedPid = candidatePid;
            loadedTitle = candidateTitle;
            break;
          }
          if (screen === "error" && fresh) throw new WorldEditorRunFailure("world-editor-map-load-error");
        }
        if (loadedPid !== null) break;
      }

      if (sawEditorProcess && pids.size === 0 && launchMode === "direct") {
        throw new WorldEditorRunFailure("world-editor-process-exited-before-map-load");
      }
      await win32.sleep(pollMs);
    }

    if (loadedPid === null) throw new WorldEditorRunFailure("world-editor-map-not-confirmed");
    log(`  World Editor loaded ${mapName} (pid ${loadedPid})`);
    return await finish({
      verdict: "PASS",
      failure: null,
      loaded: true,
      pid: loadedPid,
      windowTitle: loadedTitle,
      map: resolvedMapPath,
    });
  } catch (error) {
    const reason = error instanceof WorldEditorRunFailure ? error.message : `unexpected: ${error.message}`;
    const pids = currentPids();
    const screenshotPid = loadedPid ?? [...pids][0];
    if (screenshotPid) await win32.screenshot(screenshotPid, path.join(artifacts.dir, "failure.png"));
    if (!keepOpen && launched) await closeOwnedEditors();
    shutdown = keepOpen ? "left-open" : "cleaned-up";
    const result = artifacts.writeResult({
      verdict: null,
      failure: reason,
      loaded: false,
      pid: loadedPid,
      windowTitle: loadedTitle,
      map: resolvedMapPath,
      shutdown,
    });
    artifacts.complete();
    releaseAgent();
    return { ...result, exitCode: reason.startsWith("unexpected") ? 2 : 1, artifactDir: artifacts.dir };
  }
}

function mapTitleMatches(title, mapName) {
  return typeof title === "string" && typeof mapName === "string" && title.toLocaleLowerCase().includes(mapName.toLocaleLowerCase());
}

function editorEvidenceIsFresh(pid, title, existingPids, initialTitles) {
  if (pid === null || pid === undefined) return false;
  if (!existingPids.has(pid)) return true;
  return typeof title === "string" && initialTitles.has(pid) && initialTitles.get(pid) !== title;
}

function orderEditorProbePids(pids, existingPids) {
  return [...pids].sort((left, right) => Number(existingPids.has(left)) - Number(existingPids.has(right)));
}

module.exports = {
  runWorldEditorMap,
  WorldEditorRunFailure,
  mapTitleMatches,
  editorEvidenceIsFresh,
  orderEditorProbePids,
};
