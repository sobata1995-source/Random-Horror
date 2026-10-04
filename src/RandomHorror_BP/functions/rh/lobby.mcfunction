tag @s remove rh_play
kill @e[type=husk,name="RH Keeper"]
kill @e[type=villager,name="RH Captive"]
fill 18 89 18 30 95 30 deepslate_bricks
fill 19 90 19 29 94 29 air
fill 19 89 19 29 89 29 polished_deepslate
setblock 20 94 20 sea_lantern
setblock 28 94 20 sea_lantern
setblock 20 94 28 sea_lantern
setblock 28 94 28 sea_lantern
setblock 22 90 22 emerald_block
setblock 22 91 22 emerald_block
setblock 26 90 22 lapis_block
setblock 26 91 22 lapis_block
tag @s add rh_home
function rh/home
title @s title §4RANDOM HORROR
title @s subtitle §aGreen pedestal: PLAY §7| Blue pedestal: HELP
