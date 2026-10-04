# Start singleplayer from chat. All world changes are intended for a disposable test world.
execute unless entity @s[type=player] run tellraw @a {"rawtext":[{"text":"Run /function hd/start as a player in chat."}]}
execute if entity @s[type=player] unless entity @a[tag=hd_play] run function hd/setup
