tag @s remove rh_play
kill @e[type=husk,name="RH Keeper"]
effect @s clear
title @s title §4IT FOUND YOU
title @s subtitle §7Try again: /function rh/start
playsound mob.endermen.scream @s ~ ~ ~ 0.8 0.5
kill @e[type=villager,name="RH Captive"]

execute if entity @s[tag=rh_home] run function rh/home
