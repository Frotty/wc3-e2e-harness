# Warcraft III E2E harness

This repository has two lockstep halves:

- `wurst/` is the map-side runtime. It reads the pre-launch `ARMED` file,
  emits `READY`/`LOADED`/`RUNNING`/`PASS`/`FAIL`, and owns suite results.
- `node/` launches Warcraft III through WGC, polls the preload output channel,
  controls the window, collects artifacts, and quits promptly after a verdict.

For consumer setup, read [docs/AgentQuickstart.md](docs/AgentQuickstart.md).
The same package also exposes a World Editor map-open probe for the Windows double-click workflow.

The Node runner accepts an already-built map and explicit `projectId`, file-I/O ability id, and suite
id, so consumers do not copy lifecycle or save-file parsing code. Use `--map-load-only` when loading is
the assertion. For a map-side suite, the map emits its own terminal result through `E2E`; the canary's
generic `map-driven` suite is available when the map's test chunk owns the run. Lua chunks can use the
generic bridge globals `E2E_luaAssertTrue`, `E2E_luaRecordEvent`, `E2E_luaRecordMetric`, `E2E_luaPulse`,
and `E2E_luaFinish`. A map that produces no `READY`/`LOADED`/`RUNNING` signal fails after the generic
20-second startup watchdog; use `--startup-timeout-ms` only for a demonstrably slower map.

## Fast checks

```powershell
cd node
npm test
```

The native canary requires an interactive Windows desktop, Warcraft III, and a
map built with `grill`; it cannot run in a headless CI worker.

Build the canary in an isolated consumer/temp directory and pass that exact
fresh map to the runner:

```powershell
node node/canary/run-canary.cjs --map=<freshly-built-map.w3x> --wgc-speed=12
```

The canary runner deliberately does not search `_build` for a “latest” map.
