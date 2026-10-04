tag @s remove rh_play
gamemode creative @s
effect @s clear
tp @s 24.5 90 24.5
tellraw @s {"rawtext":[{"text":"§cDungeon construction failed. You are safely above the arena. Enable Content Log in Settings > Creator and send the errors. Do not start the run yet."}]}
kill @e[type=villager,name="RH Captive"]
