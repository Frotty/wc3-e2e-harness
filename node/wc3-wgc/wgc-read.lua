#!/usr/bin/env lua
-- keep this file horizontally line-aligned with wgc-write|read

require("wc3-packhelper-library@4355d8d/wc3-read")

function parseWgc(file)
	assert(file)
	
	local wgc = {}
	
	wgc.wgc_version = readIntU(file)
	assert(wgc.wgc_version == 1,
		"Unsupported format version: ".. tostring(wgc.wgc_version))
	
	wgc.flags = {}
	wgc.flags.raw = readIntU(file)
	wgc.gamespeed = readIntU(file)
	
	wgc.map_path_relative = readString(file)
	
	wgc.player_count = readIntU(file)
	
	wgc.player_array = {}
	for i = 0, wgc.player_count-1 do
		local plr = {}
		wgc.player_array[i] = plr
		
		plr.number = readIntU(file)
		plr.team = readIntU(file)
		plr.race = readIntU(file)
		plr.color = readIntU(file)
		plr.handicap = readIntU(file)
		
		plr.slot_flags = {}
		plr.slot_flags.raw = readIntU(file)
		
		plr.ai_difficulty = readIntU(file)
		plr.ai_script_path = readString(file)
	end
	
	return wgc
end
