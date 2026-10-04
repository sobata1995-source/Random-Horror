effect @s slowness 2 0 true
scoreboard players add @s rh_follow 1
execute if score @s rh_follow matches 20.. run tp @e[type=villager,name="RH Captive"] @s
execute if score @s rh_follow matches 20.. run scoreboard players set @s rh_follow 0
execute unless entity @e[type=villager,name="RH Captive"] run function rh/captive_failed
