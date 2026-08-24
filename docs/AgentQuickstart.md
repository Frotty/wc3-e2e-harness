# Using the harness from another agent or map repository

This is the short operational guide. The harness is a Windows/interactive-desktop tool: it can keep
Warcraft III out of the foreground most of the time, but the game process still needs a real desktop
window for `PrintWindow` and posted key events. A headless CI runner is not supported.

## Mental model

The consumer map contributes one early adapter:

```wurst
init
    E2E.register("support-empty") ->
        // Every suite, including a no-op suite, must finish explicitly.
        E2E.finish()

    E2E.bootstrap("my-project")
    if E2E.isActive()
        // Gate normal map setup here. Do not start ordinary timers, seeds,
        // dialogs, or fixtures when the harness is armed.
```

The Node side writes `ARMED` before launching the map. The map emits:

1. `READY` as soon as the launch file is authenticated during early init.
2. `LOADED` after a one-game-second settle window once game time can advance.
3. `RUNNING` when the selected suite starts.
4. `PASS` or `FAIL` immediately when the suite calls `E2E.finish()`.

`READY` proves the map initialized; `LOADED` is the useful notification for a settled map-load probe.
Do not wait for the suite timeout to decide that an empty suite is done—call `E2E.finish()`.

## Running a suite

Build the consumer map first, then call the runner with the same project id and rawcode configured by
the map's `FILE_IO_ABIL_ID` override:

```js
const path = require("node:path");
const { runSuite } = require("wc3-e2e-harness");

const result = await runSuite({
  projectId: "my-project",
  abilityId: "AM04",
  suiteId: "support-empty",
  mapPath: path.resolve("_build/MyMap.w3x"),
  suiteTimeoutMs: 120_000,
  wgcSpeed: 6,
  artifactRoot: path.resolve("artifacts/e2e"),
});
if (result.exitCode !== 0) process.exitCode = result.exitCode;
```

For a “does Warcraft III load this map?” probe, use `mapLoadOnly: true`. The runner treats a matching
`READY`/`LOADED` signal as success, waits one wall-clock second for initialization to settle, and starts
the normal bounded quit path. This avoids needing a fake long-running suite.

## Fast main-menu failure detection

WGC can return to the Warcraft III main menu when a map or slot configuration cannot start. No map-side
file signal exists in that case, so pass a screen classifier when you have OCR or an image classifier:

```js
const result = await runSuite({
  // ...normal options...
  mapLoadOnly: true,
  screenProbe: async ({ phase, screenshotPath }) => {
    // Replace this with the consumer's OCR/template classifier.
    // Return exactly "main-menu" to abort; return "loading" or "unknown"
    // for all other states.
    return await classifyWarcraftScreen({ phase, screenshotPath });
  },
});
```

The hook runs during `LOADING`/`UNPAUSE` at most once per second. A `main-menu` result fails with
`main-menu-before-map-load`, records the probe in `timeline.ndjson`, preserves a screenshot, and quits
without waiting for the loading deadline. If no classifier is available, the harness still fails safely
on its normal loading deadline; it cannot infer a rendered main menu from the preload channel alone.

The output watcher checks every 250 ms for low terminal latency, but it only reads and parses an output
file after its filesystem metadata changes. This keeps fast suites responsive without repeatedly
processing the same savefile.

## Opening a map in World Editor

The editor probe is separate from the Warcraft III map-side protocol. It can mimic a Windows double
click through the file association, or launch a discovered World Editor executable directly:

```js
const { runWorldEditorMap } = require("wc3-e2e-harness");

const result = await runWorldEditorMap({
  mapPath: path.resolve("_build/MyMap.w3x"),
  launchMode: "association", // Windows double-click workflow
  artifactRoot: path.resolve("artifacts/editor"),
});
```

Success requires a World Editor window title containing the map filename. If an installation uses a
different title, provide `screenProbe`, returning `loaded` when the map is visibly open or `error` when
the editor reports a load failure. Existing World Editor processes are preserved; only processes
created by the probe are closed. Use `keepOpen: true` when manually inspecting a successful load.

This verifies that the editor can open the map, not that every editor validation warning is absent. A
screen classifier is recommended for maps that trigger modal warnings or for localized/custom editor
window titles.

## Grill/Wurst pitfalls

- Run `grill` from the consumer repository root so its `wurst.build` and dependency paths resolve.
- The map must use the same `FILE_IO_ABIL_ID` rawcode as the Node `abilityId`.
- Build output is a `.w3x` map path; pass the freshly built map, not an old copy in another folder.
- Keep the E2E bootstrap in the earliest practical init hook and gate all normal startup while
  `E2E.isActive()` is true.
- Run `grill test` and `grill build ...` as separate checks before the Node canary.
- A sandboxed agent may be unable to start `grill`, resolve its Wurst dependency, or launch Warcraft III.
  That is an execution-permission failure, not evidence that the map or harness is broken. Retry the
  exact command with an approved/escalated desktop or network permission, then record whether the
  command actually ran. Do not replace the native canary with a headless result.
- Native canary runs need an interactive Windows session. Existing Warcraft III processes are preserved;
  only processes created by the run are cleaned up.

## What to inspect after a failure

Each run writes an artifact directory containing `run.json`, `result.json`, `timeline.ndjson`, and any
failure screenshot. Check these in order:

1. `result.json`: verdict, failure reason, `readyObserved`, `loadedObserved`, and `runningObserved`.
2. `timeline.ndjson`: accepted protocol states and screen-probe results.
3. screenshot(s): main menu, loading screen, modal, or focus problems.
4. consumer build output and the `FILE_IO_ABIL_ID`/manifest pairing.
