# Lua performance breakdown: WurstScript and the standard library

Measured on 2026-09-26 in the real Warcraft III 3.0.0 client, on the Lua target, with the
canary map of this repository. Every number below comes from a harness run in the game, not from a
Lua interpreter outside it.

## How it was measured

- **Build flags as a shipping map:** `+inline`, `+localOptimizations`, no `-stacktraces`
  (`canary/wurst_run.args`). With stack traces on, every call writes a trace string, which made
  call-heavy code three to four times slower and hid the differences that matter.
- **Suites:** `bench-collections`, `bench-unit-index`, `bench-stdlib-hot` and `bench-groups` time
  blocks of work; `leak-hashmap` counts what a collection leaves behind. Warcraft's Lua has no clock,
  so every block is bracketed by two Preload marker files and `node/canary/read-bench-markers.cjs`
  reads their modification times.
- **Comparisons alternate builds:** master, change, master, change, three runs each, and report the
  median. A result counts only when the untouched blocks agree between the two builds.
- **Blocks accumulate into locals** where they can. A closure cannot write a captured local, so
  closure blocks, and the blocks compared with them, write a global per element instead.
- **Suites that block for long run one block at a time**, so the map's heartbeat still reaches the
  runner.

**Noise to know about.** Blocks with byte-identical Lua moved by up to 15 % between builds. The
cost of a Lua global access depends on the global table's hash layout, which shifts whenever the
program's set of globals changes. Every block that touches globals per element carries that noise,
and differences below about 15 % in such blocks are not significant.

## Headline results

| what | master | with the changes | factor |
|---|---|---|---|
| `timer.setData` + `getData`, 2,000,000 pairs | 2076 ms | 200 ms | 10.4× |
| `HashSet<int>.has`, 2,000,000 | 682 ms | 247 ms | 2.8× |
| `HashMap<int, int>.get`, 2,000,000 | 1150 ms | 428 ms | 2.7× |
| `HashMap<int, int>.put`, 2,000,000 | 1600 ms | 643 ms | 2.5× |
| `ArrayList[i]`, 2,000,000 | 178 ms | 80 ms | 2.2× |
| `HashMap<unit, int>` read, 2,560,000 | 1975 ms | 951 ms | 2.1× |
| `IntMap.get`, 2,000,000 | 534 ms | 331 ms | 1.6× |
| `LinkedList<int>` for-in, 2,000,000 | 385 ms | 284 ms | 1.4× |
| `doAfter` scheduling, 20,000 | 83 ms | 64 ms | 1.3× |
| index entries a `HashMap<int, int>` of 100,000 keys leaves behind after `destroy` | 200,000 | 0 | leak fixed |
| index entries a `HashSet<int>` of 100,000 keys leaves behind after `destroy` | 98,642 | 0 | leak fixed |

"With the changes" is compiler master plus wurstscript/WurstScript#1314, #1315 and #1316, and
stdlib master plus wurstscript/WurstStdlib2#482, #483 and #484, all together. wurstscript/WurstStdlib2#481
and wurstscript/WurstScript#1313 were already merged, so both sides include them.

## Full tables: master against all changes combined

Medians of 3 alternating runs. Per-op times include the loop around each operation.

Rows below 1.0× are the layout noise described above, not slowdowns. The emitted Lua of
`read-unit-arraylist-get`, `append-int-linkedlist-add` and `group-for-from-copy` is byte-identical
between the two builds, apart from numbering. The two `foreach` blocks differ only in one call per
round that destroys the closure, 2,000 times against 2,000,000 element visits, and they write a
global per element.

### Collections, 2,000,000 operations per block (appends 400,000)

| block | master ms | per op | combined ms | per op | speed-up |
|---|---|---|---|---|---|
| `read-int-array` | 27 | 14 ns | 25 | 12 ns | 1.08× |
| `read-int-array-global-sum` | 52 | 26 ns | 50 | 25 ns | 1.04× |
| `read-int-arraylist-get` | 83 | 42 ns | 86 | 43 ns | 0.97× |
| `read-int-arraylist-index` | 178 | 89 ns | 80 | 40 ns | 2.23× |
| `read-int-arraylist-size-bound` | 90 | 45 ns | 91 | 46 ns | 0.99× |
| `read-int-arraylist-foreach` | 111 | 56 ns | 134 | 67 ns | 0.83× |
| `read-int-linkedlist-forin` | 385 | 192 ns | 284 | 142 ns | 1.36× |
| `read-int-linkedlist-staticitr` | 400 | 200 ns | 283 | 142 ns | 1.41× |
| `read-int-linkedlist-foreach` | 137 | 68 ns | 158 | 79 ns | 0.87× |
| `read-unit-array` | 35 | 18 ns | 37 | 18 ns | 0.95× |
| `read-unit-arraylist-get` | 96 | 48 ns | 109 | 54 ns | 0.88× |
| `read-unit-linkedlist-forin` | 642 | 321 ns | 561 | 280 ns | 1.14× |
| `write-int-array` | 23 | 12 ns | 23 | 12 ns | 1.00× |
| `write-int-arraylist-set` | 75 | 38 ns | 78 | 39 ns | 0.96× |
| `write-int-linkedlist-updateall` | 117 | 58 ns | 125 | 62 ns | 0.94× |
| `append-int-array` | 8 | 20 ns | 8 | 20 ns | 1.00× |
| `append-int-arraylist-add` | 31 | 78 ns | 31 | 78 ns | 1.00× |
| `append-int-arraylist-unsafeadd` | 28 | 70 ns | 28 | 70 ns | 1.00× |
| `append-int-linkedlist-add` | 180 | 450 ns | 202 | 505 ns | 0.89× |
| `lookup-int-array` | 25 | 12 ns | 23 | 12 ns | 1.09× |
| `lookup-int-table` | 249 | 124 ns | 198 | 99 ns | 1.26× |
| `lookup-int-hashmap` | 1150 | 575 ns | 428 | 214 ns | 2.69× |
| `lookup-int-intmap` | 534 | 267 ns | 331 | 166 ns | 1.61× |
| `contains-int-hashset` | 682 | 341 ns | 247 | 124 ns | 2.76× |
| `update-int-table` | 232 | 116 ns | 178 | 89 ns | 1.30× |
| `update-int-hashmap` | 1600 | 800 ns | 643 | 322 ns | 2.49× |
| `update-int-intmap` | 557 | 278 ns | 607 | 304 ns | 0.92× |

### Per-unit index storage, 64 units, 2,560,000 reads and 1,280,000 writes

| block | master ms | per op | combined ms | per op | speed-up |
|---|---|---|---|---|---|
| `hashmap-read` | 1975 | 771 ns | 951 | 371 ns | 2.08× |
| `hashmap-write` | 1217 | 951 ns | 586 | 458 ns | 2.08× |
| `userdata-read` | 815 | 318 ns | 877 | 343 ns | 0.93× |
| `userdata-write` | 400 | 312 ns | 423 | 330 ns | 0.95× |
| `keyedmap-read` | 153 | 60 ns | 156 | 61 ns | 0.98× |
| `keyedmap-write` | 60 | 47 ns | 67 | 52 ns | 0.90× |

### Stdlib hot paths

Strings are 200,000 operations. Vectors and timer data are 2,000,000. Range queries, timers and
damage are 20,000; for those the per-op figure is one query, one timer or one damage.

| block | master ms | per op | combined ms | per op | speed-up |
|---|---|---|---|---|---|
| `string-concat-i2s` | 263 | 1.3 µs | 237 | 1.2 µs | 1.11× |
| `string-concat-tostring` | 265 | 1.3 µs | 222 | 1.1 µs | 1.19× |
| `string-concat-three` | 373 | 1.9 µs | 384 | 1.9 µs | 0.97× |
| `vector-polar-reals` | 1473 | 736 ns | 1502 | 751 ns | 0.98× |
| `vector-polar-vec2` | 1491 | 746 ns | 1454 | 727 ns | 1.03× |
| `enum-range-native` | 919 | 46 µs | 957 | 48 µs | 0.96× |
| `enum-range-forunitsinrange` | 2506 | 125 µs | 2412 | 121 µs | 1.04× |
| `enum-range-spatial-index` | 1605 | 80 µs | 1630 | 82 µs | 0.98× |
| `timer-schedule-native` | 55 | 2.8 µs | 54 | 2.7 µs | 1.02× |
| `timer-schedule-doafter` | 83 | 4.2 µs | 64 | 3.2 µs | 1.30× |
| `timer-data-setget` | 2076 | 1.0 µs | 200 | 100 ns | 10.38× |
| `damage-no-listener` | 475 | 24 µs | 451 | 23 µs | 1.05× |
| `damage-plus-raw-trigger` | 561 | 28 µs | 536 | 27 µs | 1.05× |
| `damage-one-listener` | 476 | 24 µs | 429 | 21 µs | 1.11× |

### Iterating a 16-unit group, 20,000 loops (per op = one loop over the group)

| block | master ms | per op | combined ms | per op | speed-up |
|---|---|---|---|---|---|
| `group-for-in` | 322 | 16 µs | 299 | 15 µs | 1.08× |
| `group-index-loop` | 152 | 7.6 µs | 148 | 7.4 µs | 1.03× |
| `group-foreach-in` | 405 | 20 µs | 317 | 16 µs | 1.28× |
| `group-for-from-copy` | 1691 | 85 µs | 1817 | 91 µs | 0.93× |

## What changed, and what each change gained on its own

| change | PR | measured on its own |
|---|---|---|
| ArrayList's out-of-bounds error moved out of line, so `get` and `set` inline | wurstscript/WurstStdlib2#481 (merged) | `get` 195 → 90 ms, `[]` 186 → 82 ms |
| The optimiser no longer crashes folding a real to infinity (`REAL_MAX / 2.`) | wurstscript/WurstScript#1313 (merged) | build fix |
| Method calls that inlining moves into a loop are lowered and inlined too, so a delegating `[]` reaches the array read | wurstscript/WurstScript#1314 | `ArrayList[]` 178 → 80 ms combined |
| Old-generics casts to and from `int` no longer box numbers into the typecasting index | wurstscript/WurstScript#1315 | leak 200,000 → 0 entries; together with #1316, `HashMap<int, int>` get 2.7× and put 2.5× faster |
| The number conversions of erased reads and the class id casts are printed inline | wurstscript/WurstScript#1316 | `LinkedList<int>` for-in 392 → 262 ms, `Table` access 238 → 192 ms |
| TimerUtils keeps Lua timer data in a KeyedMap keyed by the timer | wurstscript/WurstStdlib2#482 | `setData` + `getData` 1901 → 202 ms, `doAfter` 95 → 75 ms |
| DamageEvent writes back only the event fields a listener changed | wurstscript/WurstStdlib2#483 | up to 8 fewer natives per damage; 5 to 25 % faster, depending on the build |
| `for u in g` reuses its snapshot group | wurstscript/WurstStdlib2#484 | `forEachIn` 25 % faster; `for u in g` 8 to 27 %, depending on the build |

The benchmark suites themselves are Frotty/wc3-e2e-harness#13 (merged), #14, #15 and #16.

## Found, but not changed

Each of these is measured above. None of them was changed, because the fix would alter behaviour,
needs a design decision, or had no measurable effect.

- **`forUnitsInRange` costs three times a raw enumeration loop:** 125 µs per query against 46 µs.
  It runs the callback from the engine's filter, an engine-to-Lua call per unit. A group loop would
  be faster, but it would change the callback order and how nested enumeration behaves.
- **The spatial index query costs twice the engine's own enumeration here:** 80 µs against 46 µs,
  with about 40 units found per query. Each match calls `GetUnitAbilityLevel` for Locust and
  `IsUnitHidden` to mirror what the engine filters. It should win for small result sets on big
  maps, which this suite does not measure. Caching that state touches the Locust-transition
  behaviour, where a stdlib in-game check already fails on master.
- **The destructive `for u from g` costs about 85 µs per 16-unit loop**, five times the
  non-destructive loop: `FirstOfGroup` plus `GroupRemoveUnit` for every unit. A faster loop would
  change the visiting order or how removed units are handled.
- **Strings cost about 1.2 µs per concatenation with `I2S`.** Most of it is the engine natives
  `I2S` and `StringLength`. Lua's `tostring` and `#` would be cheaper, but they differ from the
  natives for values outside 32 bits.
- **Most of the 23 µs a damage instance costs is outside DamageEvent:** the engine's damage
  processing and two engine-to-Lua trigger dispatches. One more plain trigger on the damage event
  costs about 4 µs per hit; one DamageEvent listener costs nothing measurable.
- **`vec2` costs nothing over plain reals:** polar offset plus distance is 0.73 µs either way,
  almost all of it the `Cos`, `Sin` and `SquareRoot` natives.
- **ArrayList reads are three to four times a bare array read**, because the bounds check reads the
  list's size, start and store tables on every element. An unchecked read would close the gap and
  is an API decision.
- **`ArrayList.unsafeAdd` is no faster than `add`** (70 ns against 78 ns). `add` now inlines too, so
  its documentation, which promises about a quarter of the cost, is stale.
- **`HashMap<K, real>` cannot hold large reals on either backend.** `realToIndex` stores the value
  times 1000 as a 32-bit int, so the canary's `REAL_MAX / 2.` suite fails on master too. The stdlib's
  `REAL_MAX` literal is itself 2^128, just above the largest 32-bit float.
- **Folding `"literal" == null` had no measurable effect.** Where the check appears, in cold error
  paths, the concatenation helper is inlined; in hot code it is not, so there is nothing to fold.

## Reproducing a table

```bash
node node/canary/run-canary.cjs --suite=bench-collections
node node/canary/read-bench-markers.cjs
```

To compare two builds, alternate them: build, run the suite, read the markers, switch, repeat,
three times each. The canary builds against its stdlib dependency in `canary/_build/dependencies`,
and the compiler is the one `grill` uses, `~/.wurst/wurst-compiler/wurstscript.jar`.
