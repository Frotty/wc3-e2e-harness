#!/usr/bin/env lua

-- For usage see Readme.md

--[[
Before you roll your eyes about code quality, consider that this is a one-shot
utility I'll unlikely to ever update. I do not care to spend more time than
necessary here. For all I care I could've never made it into a tool and
instead use a tiny script 5% of this size for my own use...

*Enjoy the scrapts, peasant!* No, I don't actually mean that. I do love you,
and you know because I released this and spent so much time on input
validation and documentation of both the file format and this program

PS: I love you <3
]]
if _VERSION == "Lua 5.1" or _VERSION == "Lua 5.2" then
	io.stderr:write("Error: You must use at least Lua 5.3+ with support for string.pack and bitwise operators!\n")
	io.stderr:write("Bye-bye!\n")
	os.exit(1)
	-- The problem with Lua 5.1 and 5.2 is that it parses the file first
	-- to check its syntax... and it doesn't know about bitwise operators!
end

require("wgc-read")
require("wgc-write")

args = args or {...}

main = require("wgc-code")
main(args)