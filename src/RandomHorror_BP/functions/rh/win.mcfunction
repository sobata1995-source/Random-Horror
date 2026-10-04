tag @s remove rh_play
kill @e[type=husk,name="RH Keeper"]
effect @s clear
title @s title §aYOU ESCAPED
title @s subtitle §7Next run. New labyrinth.
playsound random.levelup @s ~ ~ ~ 0.8 0.7
kill @e[type=villager,name="RH Captive"]

execute if entity @s[tag=rh_home] run function rh/home
