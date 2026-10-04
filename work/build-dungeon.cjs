const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pack = path.join(root, 'src', 'HorrorDungeon_BP');
function write(name, data) { const p=path.join(pack,name); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,data,'utf8'); }
function fn(name, lines) { write(`functions/hd/${name}.mcfunction`, lines.join('\n')+'\n'); }
write('manifest.json', JSON.stringify({format_version:2,header:{name:'Horror Dungeon: Three Seals',description:'Single-player horror dungeon prototype v0.1. Run /function hd/start in a NEW test world.',uuid:'2c123632-6139-4260-a706-5ca85fc71ba9',version:[0,1,0],min_engine_version:[1,21,0]},modules:[{type:'data',uuid:'d8075cab-74a9-46a0-805a-958fb92efdd6',version:[0,1,0]}]},null,2));
write('functions/tick.json',JSON.stringify({values:['hd/tick']},null,2));
const centers=[8,24,40];
const edges=[[0,1],[1,2],[0,3],[3,4],[4,5],[3,6],[6,7],[7,8],[5,8],[1,4]];
const point=i=>[centers[i%3],centers[Math.floor(i/3)]];
const build=['# Overwrites only x=0..48, y=80..86, z=0..48. NEW TEST WORLD ONLY.', 'fill 0 80 0 48 86 48 deepslate_bricks','fill 0 80 0 48 80 48 polished_deepslate'];
for(let i=0;i<9;i++) { const [x,z]=point(i); build.push(`fill ${x-5} 81 ${z-5} ${x+5} 84 ${z+5} air`); build.push(`setblock ${x-4} 81 ${z-4} soul_lantern`); build.push(`setblock ${x+4} 81 ${z+4} cracked_deepslate_bricks`); }
for(const [a,b] of edges) {const [x,z]=point(a),[u,v]=point(b); build.push(x===u?`fill ${x-1} 81 ${Math.min(z,v)} ${x+1} 83 ${Math.max(z,v)} air`:`fill ${Math.min(x,u)} 81 ${z-1} ${Math.max(x,u)} 83 ${z+1} air`);}
build.push('setblock 8 80 8 gold_block');
const seals=[[40,8],[8,40],[40,40]];
for(const [x,z] of seals) build.push(`setblock ${x} 80 ${z} emerald_block`,`setblock ${x} 81 ${z} soul_lantern`);
fn('build',build);
fn('start',[
'# Start singleplayer from chat. All world changes are intended for a disposable test world.',
'execute unless entity @s[type=player] run tellraw @a {"rawtext":[{"text":"Run /function hd/start as a player in chat."}]}',
'execute if entity @s[type=player] unless entity @a[tag=hd_play] run function hd/setup',
]);
fn('setup',[
'scoreboard objectives add hd_clock dummy','scoreboard objectives add hd_seals dummy',
'tag @s remove hd_s1','tag @s remove hd_s2','tag @s remove hd_s3','tag @s remove hd_trap1','tag @s remove hd_trap2',
'kill @e[type=husk,name="The Keeper"]',
'function hd/build','difficulty normal','gamerule doMobSpawning false','gamerule doDaylightCycle false','gamerule doWeatherCycle false','gamerule keepInventory true','gamerule commandblockoutput false','time set midnight','weather clear',
'gamemode adventure @s','effect @s clear','effect @s resistance 999999 4 true','effect @s saturation 999999 0 true',
'scoreboard players set @s hd_clock 0','scoreboard players set @s hd_seals 0','spawnpoint @s 8 81 12','tp @s 8 81 12 facing 8 81 24','tag @s add hd_play',
'title @s times 10 70 20','title @s title §4HORROR DUNGEON','title @s subtitle §7Find three green seals. Return to the gold floor.',
'tellraw @s {"rawtext":[{"text":"§7Three seals hold the exit shut. Walk onto green markers to collect them. The Keeper awakens after the first seal. Avoid contact. /function hd/stop exits the run."}]}',
]);
fn('tick',['execute as @a[tag=hd_play] at @s run function hd/loop']);
fn('loop',[
'scoreboard players add @s hd_clock 1',
'execute if entity @s[x=40,y=81,z=8,r=2,tag=!hd_s1] run function hd/seal1',
'execute if entity @s[x=8,y=81,z=40,r=2,tag=!hd_s2] run function hd/seal2',
'execute if entity @s[x=40,y=81,z=40,r=2,tag=!hd_s3] run function hd/seal3',
'execute if entity @s[x=24,y=81,z=8,r=2,tag=!hd_trap1] run function hd/trap1',
'execute if entity @s[x=24,y=81,z=40,r=2,tag=!hd_trap2] run function hd/trap2',
'execute if score @s hd_clock matches 200 run playsound ambient.cave @s ~ ~ ~ 0.6 0.7',
'execute if score @s hd_clock matches 400 run playsound mob.endermen.stare @s ~ ~ ~ 0.4 0.6',
'execute if score @s hd_clock matches 600.. run scoreboard players set @s hd_clock 0',
'effect @e[type=husk,name="The Keeper"] fire_resistance 5 0 true',
'titleraw @s actionbar {"rawtext":[{"text":"§7Seals: §a"},{"score":{"name":"@s","objective":"hd_seals"}},{"text":"§7/3 | Return to the gold marker"}]}',
'execute if entity @e[type=husk,name="The Keeper",r=1.6] run function hd/lose',
'execute if entity @s[tag=hd_play,x=8,y=81,z=8,r=2] if score @s hd_seals matches 3 run function hd/win',
'execute if entity @s[tag=hd_play,y=-64,dy=143] run function hd/lose',
]);
for(let i=0;i<3;i++) {const [x,z]=seals[i]; fn(`seal${i+1}`,[`tag @s add hd_s${i+1}`,'scoreboard players add @s hd_seals 1',`setblock ${x} 81 ${z} air`,`setblock ${x} 80 ${z} redstone_block`,'playsound random.levelup @s ~ ~ ~ 0.5 0.5','title @s title §aSEAL FOUND','title @s subtitle §7Something heard you.', 'execute if score @s hd_seals matches 1 run function hd/awaken']); }
fn('awaken',['summon husk "The Keeper" 24 81 24','effect @e[type=husk,name="The Keeper"] speed 999999 0 true','effect @e[type=husk,name="The Keeper"] resistance 999999 4 true','playsound mob.endermen.scream @s ~ ~ ~ 0.6 0.6','tellraw @s {"rawtext":[{"text":"§4The Keeper is awake. Do not let it touch you."}]}']);
for(let i=1;i<=2;i++) fn(`trap${i}`,[`tag @s add hd_trap${i}`,'effect @s blindness 2 0 true','playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.8','title @s title §4BEHIND YOU','title @s subtitle §8Keep moving.']);
fn('win',['tag @s remove hd_play','kill @e[type=husk,name="The Keeper"]','effect @s clear','gamemode creative @s','title @s title §aYOU ESCAPED','title @s subtitle §7The dungeon remembers.','playsound random.levelup @s ~ ~ ~ 0.8 0.7','tellraw @s {"rawtext":[{"text":"§aRun complete. Replay: /function hd/start"}]}']);
fn('lose',['tag @s remove hd_play','kill @e[type=husk,name="The Keeper"]','effect @s clear','effect @s blindness 3 0 true','gamemode creative @s','tp @s 8 81 12','title @s title §4IT FOUND YOU','title @s subtitle §7Restart: /function hd/start','playsound mob.endermen.scream @s ~ ~ ~ 0.8 0.5']);
fn('stop',['tag @s remove hd_play','kill @e[type=husk,name="The Keeper"]','effect @s clear','gamemode creative @s','tellraw @s {"rawtext":[{"text":"§7Stopped. This test world keeps its dungeon and setup rules. Replay: /function hd/start"}]}']);
// Verify every room is reachable and no build fill exceeds the Bedrock limit.
const reached=new Set([0]); for(let k=0;k<9;k++) for(const [a,b] of edges) {if(reached.has(a)) reached.add(b);if(reached.has(b)) reached.add(a);}
if(reached.size!==9) throw Error('Disconnected dungeon');
for(const line of build) if(line.startsWith('fill ')) {const a=line.split(' ').slice(1,7).map(Number);const volume=(Math.abs(a[3]-a[0])+1)*(Math.abs(a[4]-a[1])+1)*(Math.abs(a[5]-a[2])+1); if(volume>32768) throw Error('Fill too large');}
const files=fs.readdirSync(path.join(pack,'functions','hd'));
for(const f of files) for(const match of fs.readFileSync(path.join(pack,'functions','hd',f),'utf8').matchAll(/(?:^|run )function (hd\/\w+)/gm)) if(!fs.existsSync(path.join(pack,'functions',match[1]+'.mcfunction'))) throw Error('Missing function '+match[1]);
console.log(`Generated and statically verified ${files.length} functions, 9 connected rooms. In-game testing remains required.`);
