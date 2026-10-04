tag @s remove rh_play
kill @e[type=husk,name="RH Keeper"]
effect @s clear
kill @e[type=villager,name="RH Captive"]

execute if entity @s[tag=rh_home] run function rh/home
