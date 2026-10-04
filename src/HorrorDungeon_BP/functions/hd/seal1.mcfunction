tag @s add hd_s1
scoreboard players add @s hd_seals 1
setblock 40 81 8 air
setblock 40 80 8 redstone_block
playsound random.levelup @s ~ ~ ~ 0.5 0.5
title @s title §aSEAL FOUND
title @s subtitle §7Something heard you.
execute if score @s hd_seals matches 1 run function hd/awaken
