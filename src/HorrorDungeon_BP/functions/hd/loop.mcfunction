scoreboard players add @s hd_clock 1
execute if entity @s[x=40,y=81,z=8,r=2,tag=!hd_s1] run function hd/seal1
execute if entity @s[x=8,y=81,z=40,r=2,tag=!hd_s2] run function hd/seal2
execute if entity @s[x=40,y=81,z=40,r=2,tag=!hd_s3] run function hd/seal3
execute if entity @s[x=24,y=81,z=8,r=2,tag=!hd_trap1] run function hd/trap1
execute if entity @s[x=24,y=81,z=40,r=2,tag=!hd_trap2] run function hd/trap2
execute if score @s hd_clock matches 200 run playsound ambient.cave @s ~ ~ ~ 0.6 0.7
execute if score @s hd_clock matches 400 run playsound mob.endermen.stare @s ~ ~ ~ 0.4 0.6
execute if score @s hd_clock matches 600.. run scoreboard players set @s hd_clock 0
effect @e[type=husk,name="The Keeper"] fire_resistance 5 0 true
titleraw @s actionbar {"rawtext":[{"text":"§7Seals: §a"},{"score":{"name":"@s","objective":"hd_seals"}},{"text":"§7/3 | Return to the gold marker"}]}
execute if entity @e[type=husk,name="The Keeper",r=1.6] run function hd/lose
execute if entity @s[tag=hd_play,x=8,y=81,z=8,r=2] if score @s hd_seals matches 3 run function hd/win
execute if entity @s[tag=hd_play,y=-64,dy=143] run function hd/lose
