--- if you pass argValue to boolExpression (e.g. nil check)
--- then passing the third argument is optional
---@param boolExpression passed as is to assert()
---@param errorMsg Print error message if assert fails
---@param argValue (optional) if boolExpression is not the value itself, it must be passed to provide a meaningful error message
function assertArg(boolExpression, errorMsg, ...)
	local argValue = "N/A"
	if select("#", ...) > 0 then
		-- this is the third argument, entirely optional
		-- implemented as vararg to differentiate between nil and not being passed
		argValue = ...
	else
		argValue = boolExpression
	end
	return assert(boolExpression, errorMsg .. "\nValue: '".. tostring(argValue) .."'")
end

--- Parses CLI arguments and returns two tables:
-- 1) valid wgc table to be passed to "wgc-write.lua"
-- 2) second table with CLI arguments for own use (e.g. gamePath)
function parseArguments(args)
	local argsCli = {
		gamePathRoot = nil, -- required
		gamePathExe = nil, -- required
		gameLoadfileNeedsFullPath = true, -- full path for Reforged; relative  to working dir for Classic
		gameArgs = "", -- optional
		mapPath = nil, -- required
		wgcPath = nil, -- optional
		print = false, -- parse and print .wgc to console
		noLaunch = false, -- generate the .wgc but do NOT launch the game (caller launches it)
	}
	
	local wgc = {
		wgc_version = 1,
		map_path_relative = nil, -- to be filled out by CLI
		gamespeed = 1,
		flags = {}, -- to be generated at the end of parsing
		player_count = 0,
	}
	
	do
		local humanCount = 0 -- ergonomics to discard bad configs
		
		-- values as interpreted by .wgc
		local playerRaceLUT = {
			human = 0x01,
			orc = 0x02,
			nightelf = 0x04,
			undead = 0x08,
			random = 0x20
		}
		-- preset flags
		local playerTypeLUT = {
			human = 0x01,
			observer = 0x03,
			ai = 0x0,
			customai = 0x04
		}
		
		local disableVictory = false
		local disableFow = false
		
		-- zero-based with holes
		local slots = {}
		wgc.player_array = slots
		
		-- parse arguments
		assert(#args > 0, "You must provide arguments to start")
		local i = 1
		while true do
			if i > #args then break end
			
			local arg = args[i]
			print(arg)
			if arg == "--print" then
				argsCli.print = true

			elseif arg == "--no-launch" then
				argsCli.noLaunch = true

			elseif arg == "--disable-victory" then
				disableVictory = true
			elseif arg == "--enable-victory" then
				disableVictory = false
			
			elseif arg == "--disable-fow" then
				disableFow = true
			elseif arg == "--enable-fow" then
				disableFow = false
			
			elseif arg == "--gamespeed" then
				i = i + 1
				local value = tonumber(args[i])
				assertArg(value, "You have not provided a valid gamespeed!")
				assertArg(value >= 0, "The gamespeed must be a positive number!", value)
				assertArg(value == math.floor(value), "The gamespeed must be an integer!", value)
				
				wgc.gamespeed = value
			
			elseif arg == "--gameroot" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided a path to game root (game's working directory)!")
				
				local lower = value:lower()
				-- Match only when the FINAL path segment is an arch dir (x86_64 / x86 / arm64),
				-- anchored to a separator + end-of-string. The original substring match wrongly
				-- rejected the default install path "Program Files (x86)" (it contains "x86").
				if lower:match("[/\\]x86_64[/\\]*$")
					or lower:match("[/\\]x86[/\\]*$")
					or lower:match("[/\\]arm64[/\\]*$") then
					io.stderr:write("ERROR: Reforged does not consider its own working directory to be inside e.g. .../x86_64/ !", "\n",
					"   Instead, use: .../Warcraft III/ or .../Warcraft III/_retail/", "\n")
					error("Invalid gameroot directory specified")
				end
				
				argsCli.gamePathRoot = value
				
			elseif arg == "--gameexe" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided a path to game exe (executable to be run)!")
				
				argsCli.gamePathExe = value
						
			elseif arg == "--classic" then
				gameLoadfileNeedsFullPath = false
				
			elseif arg == "--reforged" or arg == "--pre-reforged" then
				gameLoadfileNeedsFullPath = true
			
			elseif arg == "--gameargs" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided extra arguments to start the game with!")
				
				argsCli.gameArgs = value
				
			elseif arg == "--map" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided a path to map to run!")
				
				argsCli.mapPath = value
				
			elseif arg == "--wgc" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided a path to .wgc file!")
				
				argsCli.wgcPath = value
			
			elseif arg == "--slot" then
				i = i + 1
				local value = args[i]
				assertArg(value, "You have not provided a player slot configuration!")
				
				local slot, team, race, color, health, playerType, customAiPath =
					value
					:lower()
					:match("^slot(%d+),team(%d+),race(%w+),color(%d+),health(%d+),([A-Za-z0-9]+),?(.*)$")
				-- for AI: difficulty (0-2)
				-- for human/observer: map does not load if (BitAND 0x1==0)
				local aiDifficulty_or_player = 0
				-- always present, but ignored if not custom
				customAiPath = customAiPath or "" 
				
				-- Slot
				slot = assertArg(tonumber(slot), "Player slot not specified!", slot)
				assertArg(slot >= 0, "Slot cannot be negative!", slot)
				
				-- Team
				team = assertArg(tonumber(team), "Player team not specified!", team)
				assertArg(team >= 0, "Team cannot be negative!", team)
				
				-- Race
				assertArg(race, "Player race not specified!", race)
				race = assertArg(playerRaceLUT[race], "Unknown race!")
				
				-- Color
				color = assertArg(tonumber(color), "Player color not found!", color)
				assertArg(color >= 0, "Color cannot be negative!", color)
				assertArg(color == math.floor(color), "Color cannot be fractional number!", color)
				
				-- Health
				health = assertArg(tonumber(health), "Player race not specified!", health)
				assertArg(health, "Health not found!")
				assertArg(health == math.floor(health), "Health cannot be fractional number!", health)
				-- game ignores if handicap (health) value is outside of (50,100)
				
				-- Player type
				playerType = assertArg(playerType, "Player race not specified!")
				-- does it end with a number?
				if playerType:match("%d+$") then
					-- split
					aiDifficulty_or_player = playerType:match("%d+$")
					assertArg(aiDifficulty_or_player, "AI difficulty not found!")
					
					playerType = playerType:match("^%D+")
					assertArg(playerType, "Player type (with diff) not found!")
					
				end
				assertArg(playerTypeLUT[playerType], "Unknown player type!")
				
				if playerType == "customai" then
					assertArg(customAiPath, "Custom AI specified, but path to .ai file is empty!")
				elseif playerType == "observer" or playerType == "human" then
					-- bit 0x01 must be set or else the map won't load
					-- with this observer slot (launches main menu)
					
					aiDifficulty_or_player = aiDifficulty_or_player | 1
					humanCount = humanCount + 1
				end
				
				-- zero-indexed
				slots[wgc.player_count] = {
					number = slot,
					team = team,
					race = race,
					color = color,
					handicap = health,
					
					slot_flags = {
						raw = playerTypeLUT[playerType],
					},
					
					ai_difficulty = aiDifficulty_or_player,
					ai_script_path = customAiPath,
				}
				wgc.player_count = 1 + wgc.player_count
			end
			
			i = i+1
		end
		
		if humanCount == 0 then
			io.stderr:write("[ERROR] You have not specified any observer/human slots!", "\n")
			error("One human or observer slot must be specified!")
		elseif humanCount > 1 then
			io.stderr:write("[ERROR] You have specified more than 1 observer/human slots!", "\n")
			error("Only one human or observer slot must be specified!")
		end
	end
	
	wgc.flags.raw = (
		((disableVictory and 1 or 0) << 0x01)
		| ((disableFow and 1 or 0) << 0x02)
	)
	
	return wgc, argsCli
end

function showWgc(filePath)
	io.stderr:write("Parsing .wgc file\n")
	local fileWgc = assert(io.open(filePath, "rb"))
	local wgc = parseWgc(fileWgc)
	fileWgc:close()
	
	local please_serialize = true
	if please_serialize then
		table.serialize = require("serialize")
		print(table.serialize("wgc", wgc))
	end
	
	local please_roundtrip = true
	if please_roundtrip then
		local roundtripWgc = assert(io.open(filePath ..".roundtrip", "wb"))
		writeWgc(roundtripWgc, wgc)
		roundtripWgc:close()
	end
end

function generateWgcFile(wgcContents, toPath)
	local wgcFile = openFilePretty(toPath, "wb", "Error opening .wgc for writing!")
	writeWgc(wgcFile, wgcContents)
	
	wgcFile:close()
end

function shellEscape(str)
	return (str:gsub("'", "'\''"))
end

function playtestWgc(wgcContents, argsCli)
	assertArg(argsCli.gamePathRoot, "You have not provided a path to game root (game's working directory)!")
	assertArg(argsCli.gamePathRoot, "You have not provided a path to game exe (executable to be run)!")
	assertArg(argsCli.mapPath, "You have not provided a path to map to run!")
	
	local targetMapFolderName = "map-wgc-test"
	-- only map file name without path
	local targetMapFileName = argsCli.mapPath:match("[^/\\]+$")
	local targetMapPathRelative = targetMapFolderName .."/".. targetMapFileName
	
	local targetMapFolderPath =  argsCli.gamePathRoot .."/".. targetMapFolderName
	local targetMapPath = argsCli.gamePathRoot .."/".. targetMapPathRelative
	
	-- create dir
	-- TODO: security - characters not escaped!
	io.stderr:write("Creating directory:\n")
	os.execute('mkdir "'.. targetMapFolderPath ..'"')
	
	-- Make .wgc
	if not argsCli.wgcPath then
		-- os.tmpname returns a Cygwin path /tmp/ under Cygwin
		-- even if WC3 supports full paths for .wgc, use relative path
		-- so classic WC3 works correctly: lower chance for a Unicode char
		argsCli.wgcPathRelative = string.format("%s/%s.wgc",
			targetMapFolderName,
			targetMapFileName:sub(1, -5) .. "-playtest"
		)
		argsCli.wgcPath = argsCli.gamePathRoot .. "/" .. argsCli.wgcPathRelative
		argsCli.wgcPathEffective =
			gameLoadfileNeedsFullPath and argsCli.wgcPath or argsCli.wgcPathRelative
	else
		-- An explicit --wgc path was provided (the e2e runner does this), so the block above is
		-- skipped. Still set wgcPathEffective or the playtest launch-command build below crashes on
		-- a nil concat. The runner launches the .wgc itself (--no-launch), so the absolute path is fine.
		argsCli.wgcPathEffective = argsCli.wgcPathEffective or argsCli.wgcPath
	end
	io.stderr:write("Writing .wgc file: '".. argsCli.wgcPath .."'\n")
	wgcContents.map_path_relative = targetMapPathRelative
	generateWgcFile(wgcContents, argsCli.wgcPath)
	
	io.stderr:write("Copying map from -> to:\n")
	io.stderr:write(argsCli.mapPath .. "\n")
	io.stderr:write(targetMapPath .. "\n")
	copyFile(argsCli.mapPath, targetMapPath)
	
	-- TODO: security - not all characters escaped!
	local cd, launchCmd
	local env_os = os.getenv("os")
	if env_os and env_os == "Windows_NT" then
		cd = 'cd /d "' .. argsCli.gamePathRoot ..'" && '
		launchCmd = (
			cd 
			..' "'.. argsCli.gamePathExe  ..'" '
			.. ' -loadfile "'.. argsCli.wgcPathEffective ..'" '
			.. argsCli.gameArgs
		)
	else
		cd = 'cd \'' .. shellEscape(argsCli.gamePathRoot) ..'\' && '
		launchCmd = (
			cd 
			..' \''.. shellEscape(argsCli.gamePathExe)  ..'\' '
			.. ' -loadfile \''.. shellEscape(argsCli.wgcPathEffective) ..'\' '
			.. argsCli.gameArgs -- not escaped on purpose for now
		)
	end
	
	-- print arguments
	io.stderr:write(string.format("%s: '%s'\n", "testing map path", argsCli.mapPath))
	io.stderr:write(string.format("%s: '%s'\n", "temp map copy", targetMapPathRelative))
	io.stderr:write(string.format("%s: '%s'\n", "wgc path", argsCli.wgcPathEffective))
	--io.stderr:write(string.format("%s: '%s'\n", "game root folder", argsCli.gamePathRoot))
	io.stderr:write(string.format("%s: %sx\n", "game speed", wgcContents.gamespeed))
	io.stderr:write(string.format("%s: %s (decimal)\n", "game flags", tostring(wgcContents.flags.raw)))
	
	
	io.stderr:write(string.format("%s: '%s'\n", "launching", launchCmd))
	
	-- check paths ascii, do it here so it's visible
	if not isAscii7bit(targetMapPath) then
		io.stderr:write("[WARNING] Test map path contains non-ASCII characters, it may cause errors with pre-Reforged!\n")
	end
	if not isAscii7bit(argsCli.wgcPath) then
		io.stderr:write("[WARNING] Test .wgc path contains non-ASCII characters, it may cause errors with pre-Reforged!\n")
	end
	
	-- launch game (unless the caller only wants the .wgc generated and will launch it itself).
	-- Skipping this is what prevents a SECOND WC3 client: the e2e runner passes --no-launch and
	-- does its own -loadfile launch, so without this guard playtestWgc would spawn a duplicate.
	if not argsCli.noLaunch then
		os.execute(launchCmd)
	end
end

function openFilePretty(path, mode, errorMsg)
	local file, err = io.open(path, mode)
	if not file then
		error(errorMsg .." '".. path .."':\n".. err)
	end
	return file
end

function copyFile(fromPath, toPath)
	-- copy map file to path
	local fromMap = openFilePretty(fromPath, "rb", "Error opening source map!")
	local toMap = openFilePretty(toPath, "wb", "Error opening destination map!")

	-- copy loop
	repeat
		local fromBuf = fromMap:read(64 * 1024)
		if fromBuf then
			toMap:write(fromBuf)
		end
	until fromBuf == nil
	fromMap:close()
	toMap:close()
end

function isAscii7bit(str)
	return str:match("[\128-\255]") == nil and true or false
end

function main(args)
	-- CLI part
	local wgcContents, argsCli = parseArguments(args)
	
	if argsCli.print then
		if not argsCli.wgcPath then
			io.stderr:write("Error: path to .wgc was not specified!\n")
			os.exit(3)
		else
			showWgc(argsCli.wgcPath)
		end
		
	else
		playtestWgc(wgcContents, argsCli)
	end
	
	
end

return main
