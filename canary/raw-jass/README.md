# Raw JASS engine probes

Probes that have to bypass the Wurst compiler, because the behaviour under test is something
the compiler itself rewrites. They are plain `war3map.j` files: you swap one into an existing
map and read the answer off the screen. No E2E protocol, no file IO, no harness run.

## config-globals-probe.j

**Question.** When does Warcraft III evaluate the globals block, relative to `config`, and does
it evaluate every kind of initialiser or only simple ones?

**Why it cannot be a Wurst canary.** The compiler never emits an initialised globals block. It
emits type defaults and moves every initialiser into a generated `initGlobals`, so a probe
compiled from Wurst measures the compiler, not the engine.

**Why it matters.** The compiler's transformation means `config` sees `0` where the input map's
`config` saw `8`. A fix on the `audit/jass-pipeline-fixes` branch makes `config` call
`initGlobals` first, which is only correct if the engine really does evaluate the globals block
before `config`. If it does not, the old behaviour happened to be right and the fix introduces
the deviation instead of removing it.

### Running it

1. Take a small valid map. The built canary works: `canary/_build/wc3-e2e-canary.w3x.w3x`.
   Copy it so the original is not disturbed.
2. Replace the map's `war3map.j` with `config-globals-probe.j`, keeping the name `war3map.j`.
   Any MPQ editor does this; `JMPQ3` is already in the sibling checkout.
3. Put the copy in your maps folder and open Warcraft III's map selection screen. Do not start
   the game yet.

### Reading the answer

The map name in the lobby spells it:

| Lobby shows | Meaning |
|---|---|
| `probe s=LIT i=7 n=9` | Both literal and native-call initialisers ran before `config`. |
| `probe s=LIT i=7 n=0` | Literals ran, native calls did not. This is the expected result. |
| `probe s= i=0 n=0` | The globals block did not run before `config` at all. |

The slot count is an independent readout of the same integer: **seven** slots means the literal
was in place when `config` ran, **one** slot means it was not.

Starting the game prints the same two lines again, which confirms the lobby reading and shows
whether `config` and `main` ran in the same script instance.

### What each outcome means for the branch

- **`s=LIT i=7 n=0`**, the expected one. The premise holds for literals, which are the only
  initialisers that work in a globals block anyway. The better fix is then to emit constant
  initialisers in the globals block exactly as the input had them, rather than calling
  `initGlobals` from `config`: it matches the input by construction, adds no global, no guard
  and no call, and runs nothing new in the lobby. Non-constant initialisers stay in
  `initGlobals` called from `main`, unchanged.
- **`s= i=0 n=0`**. The premise is false, the current compiler behaviour was already correct,
  and the `config` fix should be reverted outright.
- **`s=LIT i=7 n=9`**. Everything runs at load time. The `config` call is then defensible, but
  emitting the initialisers in the globals block is still simpler and closer to the input.

### Follow-up question the probe does not answer

Whether it matters in practice depends on whether real maps read globals inside `config` at
all. A World Editor `config` is usually literals only, and the globals inliner already folds a
single-write constant into its uses. Grepping the `config` bodies of a few real map scripts for
global reads answers that more cheaply than any in-game run.

## Status of the automated run (2026-09-21)

The built map is here as `config-globals-probe.w3x`, made from the canary map with
`InjectScript.java` (compiled against the fork's classes plus its runtime classpath; it needs
JDK 25, the same toolchain Gradle uses). Extracting `war3map.j` back out confirms the swap, and
the script parses clean against the real common.j and blizzard.j.

Launching it works: `Warcraft III.exe -editor -launch -windowmode windowed -nowfpause -loadfile
<map>` starts the game, and `node/canary/run-canary.cjs --map=<map>` gets past the map-load
confirmation. What did **not** work is the file readback: neither `probe-config.txt` nor
`probe-main.txt` appeared in `CustomMapData`, so the preload write is not landing. Likely
candidates are local-file writing not being enabled for this install, or the map exiting before
`main` ran; the runner reported `process-exit-without-terminal-snapshot`.

**The lobby readout needs none of that.** Copy `config-globals-probe.w3x` into the maps folder,
open the map-selection screen and read the map name, per "Reading the answer" above. That is the
original design and takes about thirty seconds. Fixing the file readback is only worth it if the
probe needs to run unattended.

## ANSWER (2026-09-21, run in game)

```
CONFIG=[INT_SEVEN_REAL_SET_BOOL_TRUE]
```

**The engine evaluates globals-block literal initialisers before `config` runs**, for integer,
real and boolean alike. So a script whose `config` reads such a global sees the declared value,
not the type default. That is what the compiler has to reproduce, and it is what
`ConstantGlobalInitializers` now does: a pure literal primitive is emitted on the global itself
rather than assigned in the function `main` calls.

### How it was actually run

Replacing the whole `war3map.j` with a minimal script did **not** work: the map never finished
loading. The injector is not at fault, proven by extracting the map's own `war3map.j` and
re-injecting it, which still passes. What works is **grafting the probe onto the map's real
script**: add the probe globals to its `globals` block, a `probeWriteFile` helper right after
`endglobals` so it is declared before use, a few lines at the top of `config` that record what it
sees, and one write at the end of `main`. The map then loads normally, the harness protocol still
runs, and the file lands in `CustomMapData`.

### Two things worth knowing for future probes

- **`I2S` returns an empty string during `config`.** The first attempt recorded
  `"configSawInt=" + I2S(x)` and got `configSawInt=` back, which says nothing about `x`. Compare
  values directly and record a marker word instead of converting numbers to strings in `config`.
- The harness reports `heartbeats=-1` and an overall FAIL for a grafted map, because the map does
  not answer its protocol. Read `verdict=` and the probe file, not the exit status.

## uninitialised-local-probe.j — ANSWER (2026-09-21, run in game)

| thread | result |
|---|---|
| control, reads an **initialised** local | `control=42` |
| reads an uninitialised `integer` | no file |
| same, then increments it | no file |
| reads an uninitialised `real` | no file |
| reads an uninitialised `boolean` | no file |
| reads an uninitialised `string` | no file |

**Reading an uninitialised local crashes the thread**, for every primitive type and for strings.
It does not yield 0, 0.0, false or null. `main` itself completed and dispatched all six threads
(`STAGE_ALL_DISPATCHED`), and the control thread wrote its file, so the mechanism works; only the
threads that read an uninitialised local failed to reach their write.

pjass agrees: it rejects such a read outright with "Variable x is uninitialized", which is why the
probe assigns the local inside an `if` on a global that is always false. That satisfies the
linter's flow check while leaving the read genuinely uninitialised at runtime.

### Why this matters

It refutes the premise behind audit findings J1 and L1, which assumed the engine gives an
uninitialised local its type default on every call. A compiler change that synthesises `= 0` would
convert a guaranteed crash into a silently defined value, which is a behaviour change in its own
right. J1's change was reverted before this probe ran and should stay reverted.

L1 was the same claim on the Lua backend, and it shows how far one unverified premise travels: the
probe closed J1, but L1's fix stayed in the branch for another day because nobody swept the diff
for everything resting on the same assumption. It is reverted now, so an unassigned local is left
`nil` on the Lua target, which keeps the failure. When a probe refutes a premise, grep the whole
change set for it.

It also reframes the inliner concern rather than dismissing it: after inlining, a callee local
becomes a caller local that a previous iteration may have written, so the read no longer crashes
and yields a stale value instead. That is still a deviation, but it only affects a map that was
already crashing, so it is a low-severity known difference rather than something to fix by
inventing defaults.

### Technique, again

Each probe runs in its own thread via `ExecuteFunc`, so one crash cannot hide the others, and each
writes its own file. Without that, the first crash ends `main` and every later reading is lost.
