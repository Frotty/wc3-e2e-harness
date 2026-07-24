# Phase 0: Transport Spike Results

Verified: 2026-07-24, Windows 11, retail Warcraft III (grill `wc3Patch: v2.0` core JASS target),
wurstStdlib2 current master, single run via `node/spike/run-transport-spike.cjs` against the spike
map built from this repository (`wurst/TransportSpike.wurst`).

## Findings

1. **Node-written launch file reads back at map init — PASS.**
   Node wrote `CustomMapData/wc3-e2e/spike/armed.pld` (488 chars, 3 × 200-char chunks) before
   launch; the map read it during its `init` block via stdlib `readAsString()` and echoed it back
   byte-exact. The echo, including the multi-chunk join, matched the original payload exactly.

2. **Subdirectories below `CustomMapData` work in both directions — PASS.**
   The `wc3-e2e/spike/` directory was created by Node; the map both read (`armed.pld`) and wrote
   (`spike-result.pld`) inside it. Root-level map writes also work (`spike-result-root.pld`,
   `FileTester.pld` from stdlib's self-test).

3. **`CAN_READ_FILES` self-test — true.** Stdlib's init round-trip (`FileTester.pld`) succeeded,
   confirming preload reads are enabled on a plain retail install with no registry work.

4. **Writer format: minimal clean JASS suffices.**
   The launch file was NOT a byte-mimic of `PreloadGenEnd` output — just a `PreloadFiles` function
   containing `call BlzSetAbilityTooltip('E2EF', "<chunk>", <level>)` lines. Stdlib `readPreload`
   consumed it without special handling. Byte-level compatibility with stdlib output is only a
   requirement for the Node *reader* (which parses map-written files, breakout wrapper included).

5. **Everything works behind the loading screen.**
   All reads and writes above completed while Warcraft III still sat on the loading screen — map
   init runs before any key press. The runner needs no input at all to reach `READY`.

## Deferred

- **Heartbeat frequency and file sizes at 8x/10x game speed.** Game time is frozen until the game
  is unpaused, so this needs the WGC/input machinery (Phase 3) or a manual run
  (`--keep-open`, press Space, watch `heartbeat.pld`). The spike map already contains the
  2-game-second heartbeat writer for this.

## Cleanup contract

`wurst/TransportSpike.wurst` and `node/spike/` were deleted in Phase 2, superseded by the canary
(`wurst/CanaryAdapter.wurst` + `node/canary/run-canary.cjs`, which also covers the deferred
heartbeat observation). Still outstanding: `wurst/FileIO_config.wurst` and `CanaryAdapter` live in
the root `wurst/` folder that dependents compile — both must move out (per the planned layout)
before any consumer adds this repository as a dependency, or the `FileIO_config` package clashes
with consumer overrides and canary suites leak into consumer maps.
