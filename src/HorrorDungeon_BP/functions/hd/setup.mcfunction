scoreboard objectives add hd_clock dummy
scoreboard objectives add hd_seals dummy
tag @s remove hd_s1
tag @s remove hd_s2
tag @s remove hd_s3
tag @s remove hd_trap1
tag @s remove hd_trap2
kill @e[type=husk,name="The Keeper"]
function hd/build
difficulty normal
gamerule doMobSpawning false
gamerule doDaylightCycle false
gamerule doWeatherCycle false
gamerule keepInventory true
gamerule commandblockoutput false
time set midnight
weather clear
gamemode adventure @s
effect @s clear
effect @s resistance 999999 4 true
effect @s saturation 999999 0 true
scoreboard players set @s hd_clock 0
scoreboard players set @s hd_seals 0
spawnpoint @s 8 81 12
tp @s 8 81 12 facing 8 81 24
tag @s add hd_play
title @s times 10 70 20
title @s title §4HORROR DUNGEON
title @s subtitle §7Find three green seals. Return to the gold floor.
tellraw @s {"rawtext":[{"text":"§7Three seals hold the exit shut. Walk onto green markers to collect them. The Keeper awakens after the first seal. Avoid contact. /function hd/stop exits the run."}]}
