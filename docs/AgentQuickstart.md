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

For a “does Warcraft III load this map?” probe, use `mapLoadOnly: true`. The runner waits for `READY`,
drives the same Space/F10 unpause path as a normal suite, then requires `LOADED` (or the immediately
following `RUNNING` snapshot when the alternating output channel skips the intermediate frame) before
waiting one wall-clock second and starting the normal bounded quit path. This avoids both false success
while the map is still loading and deadlocking before the game-time load timer can fire.

## Fast failure when the map never starts

If Warcraft III returns to its main menu, the map cannot emit a save-file signal. The harness therefore
uses the strongest non-visual signal available: after entering `LOADING`, it waits only 20 seconds by
default for `READY`, `LOADED`, or `RUNNING`. If none appears, it records `map-startup-timeout`, captures
the current window title and failure screenshot, and begins bounded cleanup. This avoids waiting for the
full suite timeout and does not send repeated F10/Escape input after a map-side `RUNNING` signal.

Override the startup watchdog for unusually slow maps:

```powershell
node run-suite.cjs --project-id=my-project --ability-id=AM04 --suite=support-empty `
  --map=_build/MyMap.w3x --startup-timeout-ms=45000
```

The window title is diagnostic only; CPU usage and window appearance are not treated as proof because
both can be idle during a legitimate load. A consumer may still provide `screenProbe` for a localized
or modal-specific classifier, but OCR is optional and never replaces the save-file verdict.

The output watcher checks every 250 ms for low terminal latency, but it only reads and parses an output
file after its filesystem metadata changes. This keeps fast suites responsive without repeatedly
processing the same savefile. A project namespace is locked for the duration of a run, so concurrent
different projects are safe while a duplicate run for the same `projectId` fails immediately instead
of overwriting its armed/output files.

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
