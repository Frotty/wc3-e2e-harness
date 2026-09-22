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

## array-bounds-probe.j — ANSWER (2026-09-21, run in game)

**Question.** Does an out-of-bounds array access abort the thread? The optimizer treats an array
read as side-effect free and drops a statement whose only work is one, which is wrong if the read
would have crashed.

| thread | result |
|---|---|
| control, `arr[0]=42` then read it | `control=42` |
| read `arr[8191]`, the last valid slot | `lastSlot=0` |
| read `arr[8192]`, one past the end | `read8192=0` |
| read `arr[-1]` | `readNeg=0` |
| read `arr[100000]` | `readFar=0` |
| write `arr[8192]=7` | completed |
| `if arr[100000]>0 then endif`, then write a file | survived |

**Out of bounds does not crash.** A read yields 0, a write completes, and execution continues. So
the finding is refuted: `TrapAnalysis` is right to model only division and modulo by zero, and
dropping a bare array read preserves behaviour. No compiler change was made.

Worth knowing: the Wurst interpreter is *stricter* than the engine here and rejects both a negative
index and one past the end. That is deliberate - it is a useful diagnostic for Wurst authors, and
the interpreter is not on the w3p output path - but it means engine array-bounds behaviour cannot
be asserted by running a program through it. The Lua backend does agree with the engine, which
`LuaJassInputAuditTests.luaOutOfBoundsArrayReadYieldsZero` pins.

### What it cost to get a reading

Three runs. The first two produced no file at all and the map hung on the loading screen. The cause
was not the out-of-range indices, which pjass and the game both accept: it was a
`probeWriteFile` call added at the very **top** of `main`, before the map's own init had run. Moving
it back to where the working probe had it fixed everything.

The way to find that quickly is a control run: inject the previous, known-good probe into a fresh
copy of the same map under the new name and run it. It passed and wrote its files, which ruled out
the game, the injector, the map and the naming in one step and left only the script.

## byte-literal-probe.j — ANSWER (2026-09-22, run in game)

**Question.** Can a string literal in `war3map.j` hold arbitrary bytes, including ones that are not
valid UTF-8? This decides whether a cipher can work over the whole byte range without changing how
the script is written.

Each case is a literal built from raw bytes, written back out through `Preload` so the bytes can be
compared directly against what was injected.

| literal | injected | came back | `StringLength` |
|---|---|---|---|
| ASCII control | `ascii-ok` | identical | - |
| valid UTF-8 `Привет` | `d09fd180d0b8d0b2d0b5d182` | identical | 12 |
| lone high bytes | `8081feff` | identical | 4 |
| scrambled UTF-8, each byte +1 | `d1a0d281d1b9d1b3d1b6d283` | identical | 12 |
| mixed `A C3 B A9 C` | `41c342a943` | identical | 5 |
| equality and SubString on lone high bytes | - | `EQUAL`, `sub=81fe` | 4 |

**Arbitrary bytes survive.** A literal holding bytes that are not valid UTF-8 loads, compares equal,
slices byte-exactly and comes back unchanged. `StringLength` counts bytes, not characters: 12 for
six Cyrillic letters, 5 for `A C3 B A9 C`. pjass accepts such literals too.

### What it was for, and why nothing was built on it

It was the gating question for widening the string cipher past printable ASCII, which currently
leaves every run of non-ASCII text in clear. The bytes were never the obstacle. The obstacle is the
decryptor in `w3p-backend/src/main/resources/MainHook_Crypto.wurst`, which maps a character to its
value through a `StringHash` table built from the stdlib's `c2s`, and `c2s` stops at 127. Worse,
`MultibyteDiagnostics` in the stdlib measures that `StringHash` **collapses every slice starting
with a UTF-8 lead byte to one marker hash**, so a hash-based table can never tell lead bytes apart.
Widening the cipher therefore means rewriting the decryptor, not just extending a table, and the two
halves have to ship together. Assessed and deliberately not done.

## semantics-probe.j — ANSWER (2026-09-22, run in game)

Three questions the audit had left as unverified premises, plus one that fell out of the third.

| question | result |
|---|---|
| `i == null` where `i` is an `integer` holding 0 | **TRUE** - null is 0 for an integer |
| `SquareRoot(-1.)` | `lt=F ge=T notlt=T self=T` - not NaN; it compares as an ordinary number |
| `"ABC" == "abc"` | **case sensitive** |
| `StringHash("ABC") == StringHash("abc")` | **case INsensitive** |

**`integer == null` is the same as `== 0`,** so the compiler emitting `i == 0` is faithful.

**`SquareRoot(-1.)` is not NaN.** `r >= 0.` and `r == r` are both true. The concern about
`not (a < b)` being rewritten to `a >= b` rests on NaN existing; the obvious way to make one does
not, and division by zero aborts the thread rather than producing one. Not proof that no real can
ever be NaN, but the premise has nothing behind it so far - and here the two forms agreed.

**String `==` is case sensitive, `StringHash` is not.** Lua's `==` is case sensitive too, so that
side matches. The hash is upper-cased before hashing (and `/` reads as `\`), which is why w3p's own
`w3p_charr` builds its table from uppercase characters only and then corrects by +32. The compiler
already models this: `Wc3StringHash.hash` upper-cases ASCII and maps the slash, and the Lua test
shim is kept in step with it.
