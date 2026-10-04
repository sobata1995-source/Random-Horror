execute if score @s rh_grace matches 1.. run scoreboard players remove @s rh_grace 1
scoreboard players add @s rh_clock 1
execute if block ~ ~-1 ~ emerald_block run scoreboard players add @s rh_charge 1
execute unless block ~ ~-1 ~ emerald_block run scoreboard players set @s rh_charge 0
execute if block ~ ~-1 ~ emerald_block run effect @s slowness 1 1 true
execute if score @s rh_mission matches 1 if score @s rh_charge matches 80.. run function rh/seal
execute if score @s rh_mission matches 2 if score @s rh_seals matches 0..1 if score @s rh_charge matches 20.. run function rh/seal
execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 if score @s rh_charge matches 120.. run function rh/seal
execute if score @s rh_mission matches 3 if score @s rh_charge matches 120.. run function rh/seal
execute if score @s rh_mission matches 3 if score @s rh_seals matches 1..2 run scoreboard players remove @s rh_limit 1
execute if score @s rh_layout matches 1 run function rh/traps1
execute if score @s rh_layout matches 2 run function rh/traps2
execute if score @s rh_layout matches 3 run function rh/traps3
execute if score @s rh_layout matches 4 run function rh/traps4
execute if score @s rh_layout matches 5 run function rh/traps5
execute if score @s rh_layout matches 6 run function rh/traps6
execute if score @s rh_layout matches 7 run function rh/traps7
execute if score @s rh_layout matches 8 run function rh/traps8
execute if score @s rh_layout matches 9 run function rh/traps9
execute if score @s rh_layout matches 10 run function rh/traps10
execute if score @s rh_layout matches 11 run function rh/traps11
execute if score @s rh_layout matches 12 run function rh/traps12
execute if score @s rh_clock matches 200 run playsound ambient.cave @s ~ ~ ~ 0.7 0.6
execute if score @s rh_clock matches 350 run playsound mob.endermen.stare @s ~ ~ ~ 0.5 0.7
execute if score @s rh_clock matches 500 if score @s rh_seals matches 1.. if score @s rh_grace matches 0 run function rh/hunt
execute if score @s rh_clock matches 600.. run scoreboard players set @s rh_clock 0
scoreboard players operation @s rh_seconds = @s rh_limit
scoreboard players operation @s rh_seconds /= #second rh_seconds
execute if score @s rh_mission matches 1 run titleraw @s actionbar {"rawtext":[{"text":"§aSEALS "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/3 §7| Stay on green tiles for 4 seconds"}]}
execute if score @s rh_mission matches 2 if score @s rh_seals matches 0..1 run titleraw @s actionbar {"rawtext":[{"text":"§6KEYS "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/2 §7| Stay on green tiles for 1 second"}]}
execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 run titleraw @s actionbar {"rawtext":[{"text":"§6FREE THE CAPTIVE §7| Stay on their green tile for 6 seconds"}]}
execute if score @s rh_mission matches 2 if score @s rh_seals matches 3 run titleraw @s actionbar {"rawtext":[{"text":"§6ESCORT THE CAPTIVE HOME §7| Find the gold floor"}]}
execute if score @s rh_mission matches 3 run titleraw @s actionbar {"rawtext":[{"text":"§5RUNES "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/3 §7| Hold green rune: 6 seconds | Time: "},{"score":{"name":"@s","objective":"rh_seconds"}},{"text":"s"}]}
execute if score @s rh_charge matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§aWORKING... §7Stay on the green tile!"}]}
execute if score @s rh_grace matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§6HEAD START — RUN TO THE EXIT!"}]}
execute if score @s rh_grace matches 0 if entity @e[type=husk,name="RH Keeper",r=1.4] run function rh/lose
execute if entity @s[tag=rh_play] if score @s rh_mission matches 3 if score @s rh_seals matches 1..2 if score @s rh_limit matches ..0 run function rh/ritual_failed
execute if entity @s[tag=rh_play] if score @s rh_mission matches 2 if score @s rh_seals matches 3 run function rh/escort
execute if entity @s[tag=rh_play,x=6,y=81,z=6,r=1.5] if score @s rh_seals matches 3 run function rh/win
execute if entity @s[tag=rh_play,y=-64,dy=143] run function rh/lose
