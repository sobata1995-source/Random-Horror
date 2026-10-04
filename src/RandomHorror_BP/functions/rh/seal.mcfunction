setblock ~ ~-1 ~ redstone_block
scoreboard players set @s rh_charge 0
scoreboard players add @s rh_seals 1
playsound random.levelup @s ~ ~ ~ 0.5 0.5
title @s title §aSEAL BROKEN
execute if score @s rh_seals matches 1 run function rh/awaken
execute if score @s rh_seals matches 2 run function rh/escalate
execute if score @s rh_seals matches 3 run function rh/finale
execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 run function rh/prison_unlock
execute if score @s rh_mission matches 3 run function rh/ritual_next
