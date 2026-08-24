# Warcraft III E2E harness

This repository has two lockstep halves:

- `wurst/` is the map-side runtime. It reads the pre-launch `ARMED` file,
  emits `READY`/`LOADED`/`RUNNING`/`PASS`/`FAIL`, and owns suite results.
- `node/` launches Warcraft III through WGC, polls the preload output channel,
  controls the window, collects artifacts, and quits promptly after a verdict.

For consumer setup, read [docs/AgentQuickstart.md](docs/AgentQuickstart.md).
The longer design and protocol reference is [docs/SharedE2EHarnessPlan.md](docs/SharedE2EHarnessPlan.md).
The same package also exposes a World Editor map-open probe for the Windows double-click workflow.

## Fast checks

```powershell
cd node
npm test
```

The native canary requires an interactive Windows desktop, Warcraft III, and a
map built with `grill`; it cannot run in a headless CI worker.
