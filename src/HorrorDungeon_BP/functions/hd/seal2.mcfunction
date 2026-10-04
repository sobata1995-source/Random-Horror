tag @s add hd_s2
scoreboard players add @s hd_seals 1
setblock 8 81 40 air
setblock 8 80 40 redstone_block
playsound random.levelup @s ~ ~ ~ 0.5 0.5
title @s title §aSEAL FOUND
title @s subtitle §7Something heard you.
execute if score @s hd_seals matches 1 run function hd/awaken
