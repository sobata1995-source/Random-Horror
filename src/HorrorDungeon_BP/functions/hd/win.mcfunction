tag @s remove hd_play
kill @e[type=husk,name="The Keeper"]
effect @s clear
gamemode creative @s
title @s title §aYOU ESCAPED
title @s subtitle §7The dungeon remembers.
playsound random.levelup @s ~ ~ ~ 0.8 0.7
tellraw @s {"rawtext":[{"text":"§aRun complete. Replay: /function hd/start"}]}
