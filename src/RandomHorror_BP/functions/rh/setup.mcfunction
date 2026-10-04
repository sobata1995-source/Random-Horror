scoreboard objectives add rh_clock dummy
scoreboard objectives add rh_seals dummy
scoreboard objectives add rh_charge dummy
scoreboard objectives add rh_layout dummy
scoreboard objectives add rh_hunt dummy
scoreboard objectives add rh_ready dummy
scoreboard objectives add rh_mission dummy
scoreboard objectives add rh_prevL dummy
scoreboard objectives add rh_prevM dummy
scoreboard objectives add rh_limit dummy
scoreboard objectives add rh_follow dummy
scoreboard objectives add rh_seconds dummy
scoreboard players set #second rh_seconds 20
scoreboard objectives add rh_grace dummy
tag @s remove rh_t0
tag @s remove rh_t1
tag @s remove rh_t2
tag @s remove rh_t3
kill @e[type=husk,name="RH Keeper"]
kill @e[type=villager,name="RH Captive"]
scoreboard players add @s rh_prevL 0
scoreboard players add @s rh_prevM 0
execute if score @s rh_prevL matches 0 run scoreboard players random @s rh_prevL 1 12
execute if score @s rh_prevM matches 0 run scoreboard players random @s rh_prevM 1 3
scoreboard players random @s rh_layout 1 11
scoreboard players operation @s rh_layout += @s rh_prevL
execute if score @s rh_layout matches 13.. run scoreboard players remove @s rh_layout 12
scoreboard players random @s rh_mission 1 2
scoreboard players operation @s rh_mission += @s rh_prevM
execute if score @s rh_mission matches 4.. run scoreboard players remove @s rh_mission 3
execute if score @s rh_layout matches 1 run function rh/layout1
execute if score @s rh_layout matches 2 run function rh/layout2
execute if score @s rh_layout matches 3 run function rh/layout3
execute if score @s rh_layout matches 4 run function rh/layout4
execute if score @s rh_layout matches 5 run function rh/layout5
execute if score @s rh_layout matches 6 run function rh/layout6
execute if score @s rh_layout matches 7 run function rh/layout7
execute if score @s rh_layout matches 8 run function rh/layout8
execute if score @s rh_layout matches 9 run function rh/layout9
execute if score @s rh_layout matches 10 run function rh/layout10
execute if score @s rh_layout matches 11 run function rh/layout11
execute if score @s rh_layout matches 12 run function rh/layout12
fill 5 81 5 7 83 7 air
function rh/check
