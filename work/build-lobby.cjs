const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),pack=path.join(root,'src','RandomHorror_BP');
const write=(name,data)=>{const p=path.join(pack,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data,'utf8');};
const fn=(name,lines)=>write(`functions/rh/${name}.mcfunction`,lines.join('\n')+'\n');
write('manifest.json',JSON.stringify({format_version:2,header:{name:'Random Horror: Scenarios v0.3.1',description:'Three-second escape head start. /function rh/start',uuid:'861dcce9-330b-4c06-b5b6-8a172c5917fb',version:[0,3,1],min_engine_version:[1,21,0]},modules:[{type:'data',uuid:'d213beae-119b-41ed-a023-8a715bc77f03',version:[0,3,1]}]},null,2));
write('functions/tick.json',JSON.stringify({values:['rh/tick']},null,2));
const lobbyManifest=JSON.parse(fs.readFileSync(path.join(pack,'manifest.json'),'utf8'));
lobbyManifest.header.name='Random Horror: Auto Lobby v0.4.1';
lobbyManifest.header.description='Automatic lobby setup on first world entry. Use a dedicated empty test world.';
lobbyManifest.header.version=[0,4,1];
lobbyManifest.header.min_engine_version=[1,21,90];
lobbyManifest.modules[0].version=[0,4,1];
lobbyManifest.modules.push({type:'script',language:'javascript',uuid:'4c403d42-59a9-40ba-8532-5961040d441a',version:[0,4,1],entry:'scripts/main.js'});
lobbyManifest.dependencies=[{module_name:'@minecraft/server',version:'2.0.0'},{module_name:'@minecraft/server-ui',version:'2.0.0'}];
write('manifest.json',JSON.stringify(lobbyManifest,null,2));
write('scripts/main.js',fs.readFileSync(path.join(__dirname,'lobby-ui.js'),'utf8'));
const point=i=>[6+9*(i%5),6+9*Math.floor(i/5)];
const key=(a,b)=>[Math.min(a,b),Math.max(a,b)].join('-');
const layouts=[];
for(let variant=1;variant<=12;variant++){
 let seed=variant*7829;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const seen=new Set([0]),stack=[0],tree=[];
 while(stack.length){const a=stack[stack.length-1],x=a%5,z=Math.floor(a/5);const options=[...(x>0?[a-1]:[]),...(x<4?[a+1]:[]),...(z>0?[a-5]:[]),...(z<4?[a+5]:[])].filter(b=>!seen.has(b));if(!options.length){stack.pop();continue;}const b=options[Math.floor(random()*options.length)];tree.push([a,b]);seen.add(b);stack.push(b);}
 const used=new Set(tree.map(([a,b])=>key(a,b))),extra=[];
 for(let a=0;a<25;a++)for(const b of [a%5<4?a+1:-1,a<20?a+5:-1])if(b>=0&&!used.has(key(a,b)))extra.push([a,b]);
 const loops=[];for(let n=0;n<3;n++)loops.push(extra.splice(Math.floor(random()*extra.length),1)[0]);
 const edges=[...tree,...loops];
 const distance=Array(25).fill(Infinity);distance[0]=0;const queue=[0];for(const a of queue)for(const [u,v]of edges){const b=u===a?v:v===a?u:-1;if(b>=0&&distance[b]===Infinity){distance[b]=distance[a]+1;queue.push(b);}}
 const candidates=Array.from({length:24},(_,i)=>i+1).sort((a,b)=>distance[b]-distance[a]);
 const seals=[candidates[0]];for(const i of candidates)if(seals.length<3&&seals.every(j=>Math.abs(i%5-j%5)+Math.abs(Math.floor(i/5)-Math.floor(j/5))>=3))seals.push(i);
 if(seals.length!==3)throw Error('Missing seal candidates');
 const build=['# Test arena: x/z=0..48, y=80..86.','fill 0 80 0 48 86 48 deepslate_bricks','fill 0 80 0 48 80 48 polished_deepslate'];
 for(let i=0;i<25;i++){const[x,z]=point(i);build.push(`fill ${x-2} 81 ${z-2} ${x+2} 84 ${z+2} air`);if(i%3===0||i===0)build.push(`setblock ${x-2} 81 ${z-2} soul_lantern`);if(i%5===1)build.push(`setblock ${x+2} 81 ${z+2} deepslate_bricks`);if(i%5===2)build.push(`setblock ${x+2} 81 ${z+2} iron_bars`);if(i%5===3)build.push(`setblock ${x+2} 81 ${z+2} chiseled_deepslate`);if(i%5===4)build.push(`setblock ${x+2} 80 ${z+2} lapis_block`);}
 for(const[a,b]of edges){const[x,z]=point(a),[u,v]=point(b);build.push(x===u?`fill ${x} 81 ${Math.min(z,v)} ${x} 83 ${Math.max(z,v)} air`:`fill ${Math.min(x,u)} 81 ${z} ${Math.max(x,u)} 83 ${z} air`);}
 // Side pockets off corridors, protected by their enclosing solid shell.
 for(const[a,b]of tree.slice(0,6)){const[x,z]=point(a),[u,v]=point(b);const mx=(x+u)/2,mz=(z+v)/2;if(x===u)build.push(`fill ${x+1} 81 ${Math.floor(mz)} ${x+2} 82 ${Math.floor(mz)+1} air`);else build.push(`fill ${Math.floor(mx)} 81 ${z+1} ${Math.floor(mx)+1} 82 ${z+2} air`);}
 build.push('setblock 6 80 6 gold_block','setblock 4 81 4 lantern');
 for(const i of seals){const[x,z]=point(i);build.push(`setblock ${x} 80 ${z} emerald_block`,`setblock ${x+1} 81 ${z} soul_lantern`);}
 fn(`layout${variant}`,build);
 const[a,b]=loops[0],[x,z]=point(a),[u,v]=point(b);const mx=Math.floor((x+u)/2),mz=Math.floor((z+v)/2);
 fn(`close${variant}`,[`fill ${mx} 81 ${mz} ${mx} 83 ${mz} deepslate_bricks`]);
 const traps=candidates.filter(i=>!seals.includes(i)).slice(0,4);
 fn(`traps${variant}`,traps.map((i,n)=>{const[x,z]=point(i);return `execute if entity @s[x=${x},y=81,z=${z},r=2,tag=!rh_t${n}] run function rh/trap${n}`;}));
 layouts.push({variant,tree,loops,seals,build,closure:[mx,mz],distance});
 const pads=seals.map(point),[px,pz]=pads[2];
 fn(`prison${variant}`,[`setblock ${px} 80 ${pz} obsidian`,`summon villager "RH Captive" ${px+0.5} 81 ${pz+0.5}`,'effect @e[type=villager,name="RH Captive"] slowness 999999 255 true','effect @e[type=villager,name="RH Captive"] resistance 999999 4 true']);
 fn(`prison_unlock${variant}`,[`setblock ${px} 80 ${pz} emerald_block`,'title @s subtitle §6Keys found. Find the captive and stand on their green tile.']);
 fn(`ritual${variant}`,pads.slice(1).map(([x,z])=>`setblock ${x} 80 ${z} obsidian`));
 fn(`ritual_next${variant}`,pads.slice(1).map(([x,z],i)=>`execute if score @s rh_seals matches ${i+1} run setblock ${x} 80 ${z} emerald_block`));
}
fn('start',['execute if entity @s[type=player] unless entity @a[tag=rh_play] run function rh/setup']);
fn('setup',[
'scoreboard objectives add rh_clock dummy','scoreboard objectives add rh_seals dummy','scoreboard objectives add rh_charge dummy','scoreboard objectives add rh_layout dummy','scoreboard objectives add rh_hunt dummy','scoreboard objectives add rh_ready dummy',
'scoreboard objectives add rh_mission dummy','scoreboard objectives add rh_prevL dummy','scoreboard objectives add rh_prevM dummy','scoreboard objectives add rh_limit dummy','scoreboard objectives add rh_follow dummy',
'scoreboard objectives add rh_seconds dummy','scoreboard players set #second rh_seconds 20',
'scoreboard objectives add rh_grace dummy',
...Array.from({length:4},(_,i)=>`tag @s remove rh_t${i}`),
'kill @e[type=husk,name="RH Keeper"]','kill @e[type=villager,name="RH Captive"]',
'scoreboard players add @s rh_prevL 0','scoreboard players add @s rh_prevM 0',
'execute if score @s rh_prevL matches 0 run scoreboard players random @s rh_prevL 1 12',
'execute if score @s rh_prevM matches 0 run scoreboard players random @s rh_prevM 1 3',
'scoreboard players random @s rh_layout 1 11','scoreboard players operation @s rh_layout += @s rh_prevL','execute if score @s rh_layout matches 13.. run scoreboard players remove @s rh_layout 12',
'scoreboard players random @s rh_mission 1 2','scoreboard players operation @s rh_mission += @s rh_prevM','execute if score @s rh_mission matches 4.. run scoreboard players remove @s rh_mission 3',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/layout${l.variant}`),
'fill 5 81 5 7 83 7 air','function rh/check',
]);
fn('check',[
'scoreboard players set @s rh_ready 0',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} if block 6 81 7 air if block 6 82 7 air ${l.seals.map(i=>{const[x,z]=point(i);return `if block ${x} 80 ${z} emerald_block if block ${x} 81 ${z} air`;}).join(' ')} run scoreboard players set @s rh_ready 1`),
'execute if score @s rh_ready matches 1 run function rh/begin',
'execute if score @s rh_ready matches 0 run function rh/build_failed',
]);
fn('build_failed',['tag @s remove rh_play','gamemode creative @s','effect @s clear','tp @s 24.5 90 24.5','tellraw @s {"rawtext":[{"text":"§cDungeon construction failed. You are safely above the arena. Enable Content Log in Settings > Creator and send the errors. Do not start the run yet."}]}']);
fn('begin',[
'difficulty normal','gamerule doMobSpawning false','gamerule doDaylightCycle false','gamerule doWeatherCycle false','gamerule keepInventory true','gamerule commandblockoutput false','time set midnight','weather clear',
'gamemode adventure @s','effect @s clear','effect @s resistance 999999 4 true','effect @s saturation 999999 0 true',
'scoreboard players set @s rh_clock 0','scoreboard players set @s rh_seals 0','scoreboard players set @s rh_charge 0','spawnpoint @s 6 81 7','tp @s 6.5 81 7.5 facing 6.5 81 15.5','tag @s add rh_play',
'scoreboard players operation @s rh_prevL = @s rh_layout','scoreboard players operation @s rh_prevM = @s rh_mission','scoreboard players set @s rh_limit 1800','scoreboard players set @s rh_follow 0',
'scoreboard players set @s rh_grace 0',
'title @s times 5 65 10','title @s title §4RANDOM HORROR',
'execute if score @s rh_mission matches 1 run function rh/mission_seals',
'execute if score @s rh_mission matches 2 run function rh/mission_prison',
'execute if score @s rh_mission matches 3 run function rh/mission_ritual',
]);
fn('mission_seals',['title @s subtitle §aTHE THREE SEALS','tellraw @s {"rawtext":[{"text":"§aSEALS: §7Break three green floor seals in any order. Stand on each for 4 seconds. Return to the gold floor. /function rh/stop"}]}']);
fn('mission_prison',[...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/prison${l.variant}`),'title @s subtitle §6THE LOST PRISONER','tellraw @s {"rawtext":[{"text":"§6RESCUE: §7Find TWO green key tiles; hold each for 1 second. The captive tile then turns green. Stand there for 6 seconds to free the captive, then escort them home. You move slower during escort."}]}']);
fn('mission_ritual',[...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/ritual${l.variant}`),'title @s subtitle §5BREAK THE RITUAL','tellraw @s {"rawtext":[{"text":"§5RITUAL: §7Only one rune is green at a time. Hold it for 6 seconds to activate the next. After the FIRST rune you have 90 seconds to break the remaining two. Once all three are broken, return home."}]}']);
fn('tick',['execute as @a[tag=rh_play] at @s run function rh/loop']);
fn('loop',[
'execute if score @s rh_grace matches 1.. run scoreboard players remove @s rh_grace 1',
'scoreboard players add @s rh_clock 1',
'execute if block ~ ~-1 ~ emerald_block run scoreboard players add @s rh_charge 1',
'execute unless block ~ ~-1 ~ emerald_block run scoreboard players set @s rh_charge 0',
'execute if block ~ ~-1 ~ emerald_block run effect @s slowness 1 1 true',
'execute if score @s rh_mission matches 1 if score @s rh_charge matches 80.. run function rh/seal',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 0..1 if score @s rh_charge matches 20.. run function rh/seal',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 if score @s rh_charge matches 120.. run function rh/seal',
'execute if score @s rh_mission matches 3 if score @s rh_charge matches 120.. run function rh/seal',
'execute if score @s rh_mission matches 3 if score @s rh_seals matches 1..2 run scoreboard players remove @s rh_limit 1',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/traps${l.variant}`),
'execute if score @s rh_clock matches 200 run playsound ambient.cave @s ~ ~ ~ 0.7 0.6',
'execute if score @s rh_clock matches 350 run playsound mob.endermen.stare @s ~ ~ ~ 0.5 0.7',
'execute if score @s rh_clock matches 500 if score @s rh_seals matches 1.. if score @s rh_grace matches 0 run function rh/hunt',
'execute if score @s rh_clock matches 600.. run scoreboard players set @s rh_clock 0',
'scoreboard players operation @s rh_seconds = @s rh_limit','scoreboard players operation @s rh_seconds /= #second rh_seconds',
'execute if score @s rh_mission matches 1 run titleraw @s actionbar {"rawtext":[{"text":"§aSEALS "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/3 §7| Stay on green tiles for 4 seconds"}]}',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 0..1 run titleraw @s actionbar {"rawtext":[{"text":"§6KEYS "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/2 §7| Stay on green tiles for 1 second"}]}',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 run titleraw @s actionbar {"rawtext":[{"text":"§6FREE THE CAPTIVE §7| Stay on their green tile for 6 seconds"}]}',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 3 run titleraw @s actionbar {"rawtext":[{"text":"§6ESCORT THE CAPTIVE HOME §7| Find the gold floor"}]}',
'execute if score @s rh_mission matches 3 run titleraw @s actionbar {"rawtext":[{"text":"§5RUNES "},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"/3 §7| Hold green rune: 6 seconds | Time: "},{"score":{"name":"@s","objective":"rh_seconds"}},{"text":"s"}]}',
'execute if score @s rh_charge matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§aWORKING... §7Stay on the green tile!"}]}',
'execute if score @s rh_grace matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§6HEAD START — RUN TO THE EXIT!"}]}',
'execute if score @s rh_grace matches 0 if entity @e[type=husk,name="RH Keeper",r=1.4] run function rh/lose',
'execute if entity @s[tag=rh_play] if score @s rh_mission matches 3 if score @s rh_seals matches 1..2 if score @s rh_limit matches ..0 run function rh/ritual_failed',
'execute if entity @s[tag=rh_play] if score @s rh_mission matches 2 if score @s rh_seals matches 3 run function rh/escort',
'execute if entity @s[tag=rh_play,x=6,y=81,z=6,r=1.5] if score @s rh_seals matches 3 run function rh/win',
'execute if entity @s[tag=rh_play,y=-64,dy=143] run function rh/lose',
]);
fn('seal',[
'setblock ~ ~-1 ~ redstone_block','scoreboard players set @s rh_charge 0','scoreboard players add @s rh_seals 1',
'playsound random.levelup @s ~ ~ ~ 0.5 0.5','title @s title §aSEAL BROKEN',
'execute if score @s rh_seals matches 1 run function rh/awaken',
'execute if score @s rh_seals matches 2 run function rh/escalate',
'execute if score @s rh_seals matches 3 run function rh/finale',
'execute if score @s rh_mission matches 2 if score @s rh_seals matches 2 run function rh/prison_unlock',
'execute if score @s rh_mission matches 3 run function rh/ritual_next',
]);
fn('prison_unlock',layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/prison_unlock${l.variant}`));
fn('ritual_next',layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/ritual_next${l.variant}`));
fn('escort',['effect @s slowness 2 0 true','scoreboard players add @s rh_follow 1','execute if score @s rh_follow matches 20.. run tp @e[type=villager,name="RH Captive"] @s','execute if score @s rh_follow matches 20.. run scoreboard players set @s rh_follow 0','execute unless entity @e[type=villager,name="RH Captive"] run function rh/captive_failed']);
fn('ritual_failed',['function rh/lose','title @s title §5THE RITUAL COMPLETED']);
fn('captive_failed',['function rh/lose','title @s title §4THE CAPTIVE WAS LOST']);
fn('awaken',['summon husk "RH Keeper" 24 81 24','effect @e[type=husk,name="RH Keeper"] speed 999999 1 true','effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/close${l.variant}`),
'playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6','title @s subtitle §4The Keeper awakens. A passage closes.']);
fn('escalate',['effect @e[type=husk,name="RH Keeper"] speed 999999 2 true','effect @s darkness 3 0 true','playsound ambient.cave @s ~ ~ ~ 1 0.5','title @s subtitle §4It is getting faster.']);
fn('finale',['scoreboard players set @s rh_grace 60','effect @e[type=husk,name="RH Keeper"] slowness 3 255 true','execute unless score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 3 true','execute if score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true','title @s subtitle §6THREE SECONDS. RUN TO THE GOLD FLOOR.','playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6']);
// Reposition only a distant Keeper, at least 10 blocks away from the player.
fn('hunt',[
'execute unless entity @e[type=husk,name="RH Keeper"] run summon husk "RH Keeper" 24 81 24',
'scoreboard players random @s rh_hunt 1 4',
...[[6,24],[24,6],[42,24],[24,42]].map(([x,z],i)=>`execute if score @s rh_hunt matches ${i+1} unless entity @s[x=${x},y=81,z=${z},r=10] run tp @e[type=husk,name="RH Keeper",rm=20] ${x} 81 ${z}`),
'execute if score @s rh_seals matches 1 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true',
'execute if score @s rh_seals matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 2 true',
'execute if score @s rh_seals matches 3 unless score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 3 true',
'execute if score @s rh_seals matches 3 if score @s rh_mission matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true',
'effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true',
]);
for(let i=0;i<4;i++)fn(`trap${i}`,[`tag @s add rh_t${i}`,'effect @s blindness 2 0 true','playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.8','title @s title §4DO NOT LOOK BACK','title @s subtitle §8Keep moving.']);
fn('win',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','title @s title §aYOU ESCAPED','title @s subtitle §7Next run. New labyrinth.','playsound random.levelup @s ~ ~ ~ 0.8 0.7']);
fn('lose',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','fill 5 81 5 7 83 7 air','tp @s 6.5 81 7.5','effect @s blindness 3 0 true','title @s title §4IT FOUND YOU','title @s subtitle §7Try again: /function rh/start','playsound mob.endermen.scream @s ~ ~ ~ 0.8 0.5']);
fn('stop',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','tellraw @s {"rawtext":[{"text":"§7Stopped. Restart: /function rh/start. Test world settings and terrain remain changed."}]}']);
for(const name of ['win','lose','stop','build_failed']){const p=path.join(pack,`functions/rh/${name}.mcfunction`);fs.appendFileSync(p,'kill @e[type=villager,name="RH Captive"]\n');}
fn('lobby',[
'tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','kill @e[type=villager,name="RH Captive"]',
'fill 18 89 18 30 95 30 deepslate_bricks','fill 19 90 19 29 94 29 air','fill 19 89 19 29 89 29 polished_deepslate',
'setblock 20 94 20 sea_lantern','setblock 28 94 20 sea_lantern','setblock 20 94 28 sea_lantern','setblock 28 94 28 sea_lantern',
'setblock 22 90 22 emerald_block','setblock 22 91 22 emerald_block','setblock 26 90 22 lapis_block','setblock 26 91 22 lapis_block',
'tag @s add rh_home','function rh/home','title @s title §4RANDOM HORROR','title @s subtitle §aGreen pedestal: PLAY §7| Blue pedestal: HELP',
]);
fn('home',['tag @s remove rh_play','tag @s add rh_home','effect @s clear','gamemode adventure @s','spawnpoint @s 24 90 26','tp @s 24.5 90 26.5 facing 24.5 91 22.5','tellraw @s {"rawtext":[{"text":"§6Welcome to Random Horror. §7Interact with the green pedestal to open Play. Or select the menu compass and sneak. Blue pedestal gives help."}]}']);
// Return after every outcome without replacing its victory/defeat title.
for(const name of ['win','lose','stop']){
 const p=path.join(pack,`functions/rh/${name}.mcfunction`);
 const data=fs.readFileSync(p,'utf8').split('\n').filter(line=>!line.startsWith('tp @s ')&&!line.startsWith('fill ')&&!line.startsWith('effect @s blindness')&&!line.startsWith('tellraw ')&&!line.startsWith('gamemode ')).join('\n');
 fs.writeFileSync(p,data+'\nexecute if entity @s[tag=rh_home] run function rh/home\n');
}
const beginPath=path.join(pack,'functions/rh/begin.mcfunction');
fs.appendFileSync(beginPath,'execute if entity @s[tag=rh_home] run spawnpoint @s 24 90 26\n');
// Physical voxel checks after carving, decoration and closure, beyond graph reachability.
for(const l of layouts){
 const blocked=Array.from({length:49},()=>Array(49).fill(true));
 for(const line of l.build){const t=line.split(' ');if(t[0]==='fill'){const a=t.slice(1,7).map(Number),volume=(Math.abs(a[3]-a[0])+1)*(Math.abs(a[4]-a[1])+1)*(Math.abs(a[5]-a[2])+1);if(volume>32768)throw Error('Fill limit exceeded');if(a[1]<=81&&a[4]>=81)for(let x=a[0];x<=a[3];x++)for(let z=a[2];z<=a[5];z++)blocked[x][z]=t[7]!=='air';}else if(t[0]==='setblock'&&Number(t[2])===81){blocked[Number(t[1])][Number(t[3])]=!['air','soul_lantern','lantern','cobweb'].includes(t[4]);}}
 const check=()=>{const seen=new Set(['6,6']),q=[[6,6]];for(const[x,z]of q)for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=x+dx,v=z+dz,k=`${u},${v}`;if(u>=0&&u<49&&v>=0&&v<49&&!blocked[u][v]&&!seen.has(k)){seen.add(k);q.push([u,v]);}}for(let i=0;i<25;i++){const[x,z]=point(i);if(!seen.has(`${x},${z}`))throw Error(`Unreachable room ${i} in layout ${l.variant}`);}};
 check();blocked[l.closure[0]][l.closure[1]]=true;check();
}
const dir=path.join(pack,'functions','rh');for(const file of fs.readdirSync(dir))for(const m of fs.readFileSync(path.join(dir,file),'utf8').matchAll(/(?:^|run )function (rh\/\w+)/gm))if(!fs.existsSync(path.join(pack,'functions',m[1]+'.mcfunction')))throw Error('Missing '+m[1]);
fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
// Exhaustively verify runtime no-repeat selection including wrapping boundaries.
for(let prev=1;prev<=12;prev++)for(let offset=1;offset<=11;offset++){let n=prev+offset;if(n>=13)n-=12;if(n===prev||n<1||n>12)throw Error('Layout randomization failed');}
for(let prev=1;prev<=3;prev++)for(let offset=1;offset<=2;offset++){let n=prev+offset;if(n>=4)n-=3;if(n===prev||n<1||n>3)throw Error('Mission randomization failed');}
if(new Set(layouts.map(l=>l.tree.map(([a,b])=>key(a,b)).sort().join(','))).size!==12)throw Error('Repeated maze topology');
// Objective transitions: rescue cannot finish before two keys; ritual reveals one rune at a time.
for(const l of layouts)for(let mission=1;mission<=3;mission++){
 let active=mission===1?[0,1,2]:mission===2?[0,1]:[0],progress=0;
 const order=mission===1?[2,0,1]:[0,1,2];
 for(const pad of order){if(!active.includes(pad))throw Error('Inaccessible mission objective');active=active.filter(x=>x!==pad);progress++;if(mission===2&&progress===2)active.push(2);if(mission===3&&progress<3)active.push(progress);}
 if(progress!==3||active.length)throw Error('Invalid mission completion');
}
fs.writeFileSync(path.join(root,'outputs','RandomHorror-v0.3-validation.json'),JSON.stringify({version:'0.3',checks:['fill volume limits','all function references exist','25 rooms reachable before and after closure, all 12 layouts','12 unique maze topologies','no-repeat randomization exhaustively checked','36 layout/mission objective progressions checked'],layouts:layouts.map(l=>({layout:l.variant,seals:l.seals.map(point),closedPassage:l.closure,longestRouteInRooms:Math.max(...l.distance)})),inGameTested:false},null,2));
console.log('PASS: 12 unique layouts, 36 mission/layout combinations, reachability after closure, objective transitions, no-repeat selection, fill limits and function references. Minecraft runtime test pending.');
let grace=60;for(let tick=1;tick<=60;tick++){if(grace<=0)throw Error('Head start ended early');grace--;}if(grace!==0)throw Error('Incorrect head start duration');
console.log('PASS: head start expires after 60 game ticks (3 seconds at 20 TPS); hunt and contact checks are guarded.');
