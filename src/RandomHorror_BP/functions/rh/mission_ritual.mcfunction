execute if score @s rh_layout matches 1 run function rh/ritual1
execute if score @s rh_layout matches 2 run function rh/ritual2
execute if score @s rh_layout matches 3 run function rh/ritual3
execute if score @s rh_layout matches 4 run function rh/ritual4
execute if score @s rh_layout matches 5 run function rh/ritual5
execute if score @s rh_layout matches 6 run function rh/ritual6
execute if score @s rh_layout matches 7 run function rh/ritual7
execute if score @s rh_layout matches 8 run function rh/ritual8
execute if score @s rh_layout matches 9 run function rh/ritual9
execute if score @s rh_layout matches 10 run function rh/ritual10
execute if score @s rh_layout matches 11 run function rh/ritual11
execute if score @s rh_layout matches 12 run function rh/ritual12
title @s subtitle §5BREAK THE RITUAL
tellraw @s {"rawtext":[{"text":"§5RITUAL: §7Only one rune is green at a time. Hold it for 6 seconds to activate the next. After the FIRST rune you have 90 seconds to break the remaining two. Once all three are broken, return home."}]}
