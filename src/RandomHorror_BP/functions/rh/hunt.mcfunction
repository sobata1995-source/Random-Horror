execute unless entity @e[type=husk,name="RH Keeper"] run summon husk "RH Keeper" 24 81 24
scoreboard players random @s rh_hunt 1 4
execute if score @s rh_hunt matches 1 unless entity @s[x=6,y=81,z=24,r=10] run tp @e[type=husk,name="RH Keeper",rm=20] 6 81 24
execute if score @s rh_hunt matches 2 unless entity @s[x=24,y=81,z=6,r=10] run tp @e[type=husk,name="RH Keeper",rm=20] 24 81 6
execute if score @s rh_hunt matches 3 unless entity @s[x=42,y=81,z=24,r=10] run tp @e[type=husk,name="RH Keeper",rm=20] 42 81 24
execute if score @s rh_hunt matches 4 unless entity @s[x=24,y=81,z=42,r=10] run tp @e[type=husk,name="RH Keeper",rm=20] 24 81 42
execute if score @s rh_seals matches 1 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true
execute if score @s rh_seals matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 2 true
execute if score @s rh_seals matches 3 unless score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 3 true
execute if score @s rh_seals matches 3 if score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true
effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true
