# Map-build byte preservation

An end-to-end check that a map script's bytes survive a real build, rather than only surviving the
compiler's own read and write. It uses the product path: the `-build` CLI over a real `.w3x`.

## Why it exists

Byte preservation was verified once at the compiler's read/write boundary and reported as done. It
did not work on the map-build path at all, because that path decodes through its own stack. Seven
separate places had to be corrected before this check passed, and the last one was only reachable
from a real build - it threw `MalformedInputException` and failed the whole thing, after the compile
had already reported success.

The lesson is narrow and worth keeping: a unit test over one entry point proves nothing about the
other entry points into the same feature.

## Running it

1. Build the compiler jar: `./gradlew shadowJar` in `de.peeeq.wurstscript`.
2. Make a script with bytes that are valid in an older single-byte codepage and invalid as UTF-8 -
   `DC E4 F6` is `Üäö` in Windows-1252 - plus a UTF-8 literal and a plain ASCII control.
3. Inject it into a copy of a real map as `war3map.j` (`canary/raw-jass/InjectScript.java`).
4. Build: `java -jar wurstscript.jar -build -workspaceroot <project> -noPJass <map.w3x>`,
   where `<project>` holds a `wurst.build` naming the project.
5. Extract `war3map.j` back out of the built map and compare the literal's bytes to what went in.

Two traps when writing the script: do not declare a native `blizzard.j` already has, or the build
fails as ambiguous; and the literal has to be genuinely used, or the build optimises the global away
and there is nothing left to compare.

## Result (2026-09-23)

| literal | in | out |
|---|---|---|
| Windows-1252 `Üäö` | `dce4f6` | `dce4f6`, unchanged |
| UTF-8 `Привет` | `d09f...d182` | unchanged |
| ASCII `control` | - | present |

No re-encoding to UTF-8, no `U+FFFD`, no `?` substitution. Before the fix the same build died with
`java.nio.charset.MalformedInputException: Input length = 1`, after reporting
`compilation finished (errors: 0, warnings: 0)` - the compile succeeded and the map build did not.
