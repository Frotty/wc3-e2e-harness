# Warcraft 3 .wgc launcher

This utility allows you to generate a .wgc (Warcraft 3 Game Configuration) file according to your settings and launch the game for testing a map.

WorldEditor used this only to test AI scripts (in the AI editor) and had a limitation of only allowing melee maps. Annoyingly, this entire functionality seems broken in Reforged (as of 1.32.10).

## Features:

- it works *(Reforged doesn't)*
- launch any map *(WC3 requires melee maps only)*
- test map can be in any directory *(WC3 requires maps to be in a local path)*
- Classic and Reforged support
- set any gamespeed *(beyond 25x)*
- highly configurable, you can set:
	- player slot, team, race, color, handicap, AI difficulty and AI script path
	- custom WC3 path
	- custom game arguments (e.g. `-windowed`, you can't do this in WE)
	- enable/disable FoW and win/lose conditions
	- gamespeed

## Usage:

Note: Windows can use backslahes and forward slashes in paths:
`C:\folder\` is same as `C:/folder/`. I recommend to always use `C:/folder/` to avoid unexpected backslash interpretations and errors.

### `--classic` or `--reforged`/`--pre-reforged`

`--reforged` is the default now. It affects how .wgc file path is passed to `-loadfile`, because old (Classic) versions only support a relative path from `gameroot` here.

Use `--classic` for old versions like 1.27.

### `--gameroot <full path to wc3 root folder\>`

### `--gameexe <full path to game .exe>`

### `--map <path to test map>`

### `--gameargs <custom launch paramters>`

Reforged requires `-launch` to start the game.

### `--gamespeed <0-n>`

Default speed is `1` for 100% speed.

### `--disable-victory` / `--enable-victory`

Victory conditions enabled by default.

### `--disable-fow` / `--enable-fow`

Fog of War is enabled by defualt.

### `--slot <slot config>` (repeated x times for players)

This can be repeated any number of times to setup all testing slots. `--slot` has the following structure:

`--slot slotNUM,teamNUM,raceNAME,colorNUM,healthNUM,SLOT_TYPE[,CUSTOMAI_SCRIPT_PATH]`

`NUM` is a zero-based number.

- SlotNUM: `0-11` / `0-23` (Classic/Reforged), 0="red" player
- TeamNUM: `0-n`
- Race NAME:
	- `human`
	- `orc`
	- `nightelf`
	- `undead`
	- `random`
- ColorNUM: `0-11` / `0-23` (Classic/Reforged), 0=red
- HealthNUM: `50-100` (handicap, `50` means player's units have 50% hp)
- SLOT_TYPE:
	- `human` (you as a player)
	- `observer` (you as an observer)
	- `aiNUM` (default AI player with `NUM` difficulty)
	- `customaiNUM,scriptpath` (custom AI player with `NUM` difficulty and full OS path to script)
	
Note: This script does not strictly check configuration here. You can practically enter any values for testing WC3 or whatever. Totally invalid values will cause the map to not run.

### Development only:

- `--no-launch`

	Generate the `.wgc` (and copy the map) but do NOT launch Warcraft III. The caller launches
	the generated `.wgc` itself. The harness runner passes this so it controls a single launched
	process — without it, `playtestWgc` would `os.execute` a second
	WC3 client.

- `--print`

	Requires a `table.serialize(strTableName, tabl)` implementation.
	It is loaded via `table.serialize = require("serialize")`
	
- `--wgc <path to wgc>`

	Together with `--print` it'll be used to print .wgc contents to console STDOUT.
	Otherwise this will be used as path to generate a new .wgc file.

## Examples:

### OSX / Linux / *nix

For Shell (Bash) create a text file `start-map.sh` with the following contents:

**Reforged:**

```shell
lua ./wgc-launch.lua \
--gameroot 'D:/SteamLibrary/Warcraft III/_retail_/' \
--gameexe './x86_64/Warcraft III.exe' \
--map 'C:/Users/MYUSER/Documents/Warcraft III/Maps/Download/Season7/(2)ConcealedHill_S2.w3x' \
--slot slot0,team0,raceRandom,color0,health100,ai1 \
--slot slot1,team1,raceHuman,color1,health70,ai0 \
--slot slot2,team0,raceRandom,color2,health100,observer \
--gameargs "-windowed -launch" \
--gamespeed 16
```

To start it by double-clicking, you must give it execution permissions, for example with `chmod +x start-map.sh`.

**Classic:**

```shell
lua ./wgc-launch.lua \
--gameroot 'D:/Warcraft III v1.21a/' \
--gameexe './Frozen Throne.exe' \
--map 'D:/Warcraft III v1.21a/Maps/(4)HeartToHeart.w3m' \
--slot slot0,team0,raceRandom,color0,health100,ai1 \
--slot slot1,team1,raceHuman,color1,health70,ai0 \
--slot slot2,team0,raceRandom,color2,health100,observer \
--gameargs "-windowed -launch" \
--gamespeed 16 \
--classic
```

### Windows

You could use Cygwin for a terminal with Bash, but CMD.exe works too.

For CMD create a text file `start-map.bat` with the following contents:

```batch
lua.exe .\wgc-launch.lua ^
--gameroot "D:\\SteamLibrary/Warcraft III/_retail_/" ^
--gameexe ".\\x86_64\\Warcraft III.exe" ^
--map "C:\\Users\\MYUSER\\Documents\\Warcraft III\\Maps\\Download\\Season7\\(2)ConcealedHill_S2.w3x" ^
--slot slot0,team0,raceRandom,color0,health100,ai1 ^
--slot slot1,team1,raceHuman,color1,health70,ai0 ^
--slot slot2,team0,raceRandom,color2,health100,observer ^
--gameargs "-windowed -launch" ^
--gamespeed 64
```

Then you can play-test your map by double-clicking the .bat file.

### Example output:

```
Creating directory:
mkdir: cannot create directory ‘D:/War3-v127/map-wgc-test’: File exists
Writing .wgc file: 'D:\War3-v127/map-wgc-test/(2)HillsOfGlory-playtest.wgc'
Copying map from -> to:
D:/War3-v127/Maps/(2)HillsOfGlory.w3m
D:/War3-v127/map-wgc-test/(2)HillsOfGlory.w3m
testing map path: 'D:/War3-v127/Maps/(2)HillsOfGlory.w3m'
temp map copy: 'map-wgc-test/(2)HillsOfGlory.w3m'
wgc path: 'map-wgc-test/(2)HillsOfGlory-playtest.wgc'
game speed: 64x
game flags: 0 (decimal)
launching: 'cd "D:/War3-v127" &&  "D:/War3-v127/war3.exe"  -loadfile "map-wgc-test/(2)HillsOfGlory-playtest.wgc" -windowed'
```

## Installation:

- Lua 5.3 or higher must be installed. It is included for Windows users.

- This tool must be able to write to folder `<game root folder>/map-wgc-test/` and create new files in there.

	You can run as administrator or create this folder yourself with appropriate permissions. Alternatively you can symlink this folder to somewhere else. This is a WC3 limitation.

