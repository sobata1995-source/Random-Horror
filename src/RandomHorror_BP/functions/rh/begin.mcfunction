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
scoreboard players set @s rh_clock 0
scoreboard players set @s rh_seals 0
scoreboard players set @s rh_charge 0
spawnpoint @s 6 81 7
tp @s 6.5 81 7.5 facing 6.5 81 15.5
tag @s add rh_play
scoreboard players operation @s rh_prevL = @s rh_layout
scoreboard players operation @s rh_prevM = @s rh_mission
scoreboard players set @s rh_limit 1800
scoreboard players set @s rh_follow 0
scoreboard players set @s rh_grace 0
title @s times 5 65 10
title @s title §4RANDOM HORROR
execute if score @s rh_mission matches 1 run function rh/mission_seals
execute if score @s rh_mission matches 2 run function rh/mission_prison
execute if score @s rh_mission matches 3 run function rh/mission_ritual
execute if entity @s[tag=rh_home] run spawnpoint @s 24 90 26
