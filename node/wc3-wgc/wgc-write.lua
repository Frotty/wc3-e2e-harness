#!/usr/bin/env lua
-- keep this file horizontally line-aligned with wgc-write|read

require("wc3-packhelper-library@4355d8d/wc3-write")

function writeWgc(file, wgc)
	assert(file)
	assert(wgc)
	
	
	
	assert(wgc.wgc_version == 1,
		"Unsupported format version: ".. tostring(wgc.wgc_version))
	writeIntU(file, wgc.wgc_version)
	
	writeIntU(file, wgc.flags.raw)
	writeIntU(file, wgc.gamespeed)
	
	writeString(file, wgc.map_path_relative)
	
	writeIntU(file, wgc.player_count)
	
	
	for i = 0, wgc.player_count-1 do
		local plr = wgc.player_array[i]
		
		
		writeIntU(file, plr.number)
		writeIntU(file, plr.team)
		writeIntU(file, plr.race)
		writeIntU(file, plr.color)
		writeIntU(file, plr.handicap)
		
		
		writeIntU(file, plr.slot_flags.raw)
		
		writeIntU(file, plr.ai_difficulty)
		writeString(file, plr.ai_script_path)
	end
	
	
end
