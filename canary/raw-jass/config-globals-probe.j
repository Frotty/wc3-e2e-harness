// Engine probe: when does the globals block run, relative to config?
//
// This is raw JASS on purpose. It cannot be written in Wurst, because the compiler always
// moves globals-block initialisers into a generated initGlobals function that only main
// calls, which is the very behaviour under test.
//
// The answer is readable in the map-selection lobby, with no file IO and without starting
// the game: the probe builds the map name out of what config can observe.
//
//   probe s=LIT i=7 n=9   -> literal AND native-call initialisers ran before config
//   probe s=LIT i=7 n=0   -> literals ran, native-call initialisers did not
//   probe s= i=0 n=0      -> the globals block did not run before config at all
//
// The slot count in the lobby is a second, independent readout of the same integer: seven
// slots means the literal was in place when config ran, one slot means it was not.
//
// Usage: see README.md in this directory.

globals
    // A plain literal. Per the World Editor's own output this is the only kind of
    // initialiser a globals block is expected to support.
    string  probeString = "LIT"
    integer probeInt    = 7

    // A native call. The claim under test is that this does NOT run at load time, which is
    // why the editor generates its own InitGlobals and calls it from main.
    integer probeNativeInt = S2I("9")

    // Written by config so main can tell whether config ran first and what it saw.
    string  configSaw = "config-did-not-run"
endglobals

function describeWhatConfigSees takes nothing returns string
    return "probe s=" + probeString + " i=" + I2S(probeInt) + " n=" + I2S(probeNativeInt)
endfunction

// Writes one line into Documents\Warcraft III\CustomMapData\<file>, the same directory the
// harness already reads. This is what makes the probe readable by a script instead of by eye,
// which matters when the map is launched straight into a game and the lobby is never shown.
function writeProbeFile takes string file, string line returns nothing
    call PreloadGenClear()
    call PreloadGenStart()
    call Preload(line)
    call PreloadGenEnd(file)
endfunction

function config takes nothing returns nothing
    set configSaw = describeWhatConfigSees()

    // Primary readout: the lobby title spells the answer.
    call SetMapName(configSaw)
    call SetMapDescription(configSaw)


    // Secondary readout, independent of string handling: the slot count is the integer
    // itself, clamped to something legal. Seven slots means the literal was already there.
    if probeInt > 0 and probeInt <= 12 then
        call SetPlayers(probeInt)
    else
        call SetPlayers(1)
    endif

    call SetTeams(1)
    call SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)
    call DefineStartLocation(0, - 128.0, 64.0)
    call SetPlayerStartLocation(Player(0), 0)
    call SetPlayerColor(Player(0), ConvertPlayerColor(0))
    call SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
    call SetPlayerRaceSelectable(Player(0), true)
    call SetPlayerController(Player(0), MAP_CONTROL_USER)
    call SetPlayerTeam(Player(0), 0)
    call SetStartLocPrioCount(0, 0)
    call SetEnemyStartLocPrioCount(0, 0)
endfunction

function reportInGame takes nothing returns nothing
    // Same values once the game is running, so the lobby reading can be confirmed and the
    // "did config run in this same script instance" question answered.
    call DisplayTimedTextToPlayer(Player(0), 0, 0, 60, "config saw: " + configSaw)
    call DisplayTimedTextToPlayer(Player(0), 0, 0, 60, "main sees:  " + describeWhatConfigSees())
    // "config saw" reaching main also proves config and main shared one script instance.
    call writeProbeFile("probe-main.txt", "configSaw=[" + configSaw + "] mainSees=[" + describeWhatConfigSees() + "]")
endfunction

function main takes nothing returns nothing
    // First statement, so a later failure cannot stop the result being recorded.
    call writeProbeFile("probe-main.txt", "configSaw=[" + configSaw + "] mainSees=[" + describeWhatConfigSees() + "]")
    call SetCameraBounds(-3328.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), -3584.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM), 3328.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), 3072.0 - GetCameraMargin(CAMERA_MARGIN_TOP), -3328.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), 3072.0 - GetCameraMargin(CAMERA_MARGIN_TOP), 3328.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), -3584.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM))
    call SetDayNightModels("Environment\\DNC\\DNCLordaeron\\DNCLordaeronTerrain\\DNCLordaeronTerrain.mdl", "Environment\\DNC\\DNCLordaeron\\DNCLordaeronUnit\\DNCLordaeronUnit.mdl")
    call NewSoundEnvironment("Default")
    call SetAmbientDaySound("LordaeronSummerDay")
    call SetAmbientNightSound("LordaeronSummerNight")
    call SetMapMusic("Music", true, 0)
    call InitBlizzard()
    call reportInGame()
endfunction
