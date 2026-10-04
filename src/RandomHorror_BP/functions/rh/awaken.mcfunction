summon husk "RH Keeper" 24 81 24
effect @e[type=husk,name="RH Keeper"] speed 999999 1 true
effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true
execute if score @s rh_layout matches 1 run function rh/close1
execute if score @s rh_layout matches 2 run function rh/close2
execute if score @s rh_layout matches 3 run function rh/close3
execute if score @s rh_layout matches 4 run function rh/close4
execute if score @s rh_layout matches 5 run function rh/close5
execute if score @s rh_layout matches 6 run function rh/close6
execute if score @s rh_layout matches 7 run function rh/close7
execute if score @s rh_layout matches 8 run function rh/close8
execute if score @s rh_layout matches 9 run function rh/close9
execute if score @s rh_layout matches 10 run function rh/close10
execute if score @s rh_layout matches 11 run function rh/close11
execute if score @s rh_layout matches 12 run function rh/close12
playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6
title @s subtitle §4The Keeper awakens. A passage closes.
