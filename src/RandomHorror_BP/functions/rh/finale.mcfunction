scoreboard players set @s rh_grace 60
effect @e[type=husk,name="RH Keeper"] slowness 3 255 true
execute unless score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 3 true
execute if score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true
title @s subtitle §6THREE SECONDS. RUN TO THE GOLD FLOOR.
playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6
