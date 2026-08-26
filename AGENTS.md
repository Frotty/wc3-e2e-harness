# Central Warcraft III E2E harness

This repository is the shared, generic runner and map-side protocol. It must not contain consumer-
specific adapters, project names, fixture paths, generated test suites, or assumptions about a
particular map repository.

## Consumer contract

- Consumers provide a freshly built `.w3x` map, `projectId`, file-I/O ability rawcode, and suite id.
- Consumers call `node/run-suite.cjs` or import `runSuite`; they do not copy lifecycle, Win32, channel,
  save-file parsing, process ownership, or quit logic into their own repositories.
- The built map is the authority for what ran. `READY`/`LOADED`/`RUNNING` and terminal `PASS`/`FAIL`
  come from the alternating save-file channel. Console text, OCR, CPU usage, and screenshots are
  diagnostics only.
- `map-driven` is the only generic canary suite. It exists to let a supplied map-side fixture own
  its execution; it must not acquire a consumer name or consumer test logic.

## Concurrency and stale-map safety

- Never build or stage a consumer fixture into this shared checkout's `canary/` directory.
- Never launch a cached or guessed map. Build in a unique per-run directory and verify the output
  contains the expected fixture markers before invoking the runner.
- Every runner invocation gets a unique `runId`, nonce, channel directory, and artifact directory.
- Cleanup may terminate only Warcraft III processes created after the run's PID snapshot. Preserve
  processes that existed before the run.
- Consumer build staging should live in an OS temp directory and be removed in `finally`. Retain only
  bounded, recent diagnostic artifacts; prune old run directories without touching active runs.

## Fast lifecycle rules

- The default pre-map watchdog is 20 seconds after entering `LOADING`; configure it with
  `startupTimeoutMs` or `--startup-timeout-ms` for a demonstrably slower map.
- A map-side `RUNNING` signal is the boundary after which the runner must not use menu recovery keys.
  Heartbeat stalls fail fast after bounded recovery; they must never press F10/Escape against a live
  suite or the user's existing game window.
- `mapLoadOnly` requires `LOADED` or the immediately following `RUNNING` snapshot, then performs a
  bounded quit. A positive terminal result with no map-side evidence is invalid.

## Verification

From `node/` run `npm test`. Native Warcraft III checks require an interactive Windows desktop and
must use an isolated consumer build; do not build the shared `canary/` fixture as part of routine
consumer validation. Inspect `result.json` and `timeline.ndjson` when a native run fails.
