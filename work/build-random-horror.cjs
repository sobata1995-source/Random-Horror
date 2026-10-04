const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),pack=path.join(root,'src','RandomHorror_BP');
const write=(name,data)=>{const p=path.join(pack,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data,'utf8');};
const fn=(name,lines)=>write(`functions/rh/${name}.mcfunction`,lines.join('\n')+'\n');
write('manifest.json',JSON.stringify({format_version:2,header:{name:'Random Horror: Twisted Dungeon v0.2.1',description:'Spawn safety fix. Singleplayer prototype. /function rh/start',uuid:'861dcce9-330b-4c06-b5b6-8a172c5917fb',version:[0,2,1],min_engine_version:[1,21,0]},modules:[{type:'data',uuid:'d213beae-119b-41ed-a023-8a715bc77f03',version:[0,2,1]}]},null,2));
write('functions/tick.json',JSON.stringify({values:['rh/tick']},null,2));
const point=i=>[6+9*(i%5),6+9*Math.floor(i/5)];
const key=(a,b)=>[Math.min(a,b),Math.max(a,b)].join('-');
const layouts=[];
for(let variant=1;variant<=3;variant++){
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
}
fn('start',['execute if entity @s[type=player] unless entity @a[tag=rh_play] run function rh/setup']);
fn('setup',[
'scoreboard objectives add rh_clock dummy','scoreboard objectives add rh_seals dummy','scoreboard objectives add rh_charge dummy','scoreboard objectives add rh_layout dummy','scoreboard objectives add rh_hunt dummy','scoreboard objectives add rh_ready dummy',
...Array.from({length:4},(_,i)=>`tag @s remove rh_t${i}`),
'kill @e[type=husk,name="RH Keeper"]','scoreboard players random @s rh_layout 1 3',
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
'title @s times 5 45 10','title @s title §4RANDOM HORROR','title @s subtitle §7Three seals. One way home.',
'tellraw @s {"rawtext":[{"text":"§7Stand ON a green floor seal for 4 seconds to release it. Leaving resets the charge. Return to the gold floor after all three. The layout changes between runs. /function rh/stop"}]}',
]);
fn('tick',['execute as @a[tag=rh_play] at @s run function rh/loop']);
fn('loop',[
'scoreboard players add @s rh_clock 1',
'execute if block ~ ~-1 ~ emerald_block run scoreboard players add @s rh_charge 1',
'execute unless block ~ ~-1 ~ emerald_block run scoreboard players set @s rh_charge 0',
'execute if block ~ ~-1 ~ emerald_block run effect @s slowness 1 1 true',
'execute if score @s rh_charge matches 80.. run function rh/seal',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/traps${l.variant}`),
'execute if score @s rh_clock matches 200 run playsound ambient.cave @s ~ ~ ~ 0.7 0.6',
'execute if score @s rh_clock matches 350 run playsound mob.endermen.stare @s ~ ~ ~ 0.5 0.7',
'execute if score @s rh_clock matches 500 if score @s rh_seals matches 1.. run function rh/hunt',
'execute if score @s rh_clock matches 600.. run scoreboard players set @s rh_clock 0',
'execute if score @s rh_seals matches 0 if score @s rh_clock matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§7Seals: §a0/3 §8| §7Stand on green floor for 4 seconds"}]}',
'execute if score @s rh_seals matches 1.. run titleraw @s actionbar {"rawtext":[{"text":"§7Seals: §a"},{"score":{"name":"@s","objective":"rh_seals"}},{"text":"§7/3 §8| §cThe Keeper is hunting"}]}',
'execute if score @s rh_charge matches 1..79 run titleraw @s actionbar {"rawtext":[{"text":"§aBreaking seal: "},{"score":{"name":"@s","objective":"rh_charge"}},{"text":"/80 §7— stay on the green block!"}]}',
'execute if entity @e[type=husk,name="RH Keeper",r=1.4] run function rh/lose',
'execute if entity @s[tag=rh_play,x=6,y=81,z=6,r=1.5] if score @s rh_seals matches 3 run function rh/win',
'execute if entity @s[tag=rh_play,y=-64,dy=143] run function rh/lose',
]);
fn('seal',[
'setblock ~ ~-1 ~ redstone_block','scoreboard players set @s rh_charge 0','scoreboard players add @s rh_seals 1',
'playsound random.levelup @s ~ ~ ~ 0.5 0.5','title @s title §aSEAL BROKEN',
'execute if score @s rh_seals matches 1 run function rh/awaken',
'execute if score @s rh_seals matches 2 run function rh/escalate',
'execute if score @s rh_seals matches 3 run function rh/finale',
]);
fn('awaken',['summon husk "RH Keeper" 24 81 24','effect @e[type=husk,name="RH Keeper"] speed 999999 1 true','effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true',
...layouts.map(l=>`execute if score @s rh_layout matches ${l.variant} run function rh/close${l.variant}`),
'playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6','title @s subtitle §4The Keeper awakens. A passage closes.']);
fn('escalate',['effect @e[type=husk,name="RH Keeper"] speed 999999 2 true','effect @s darkness 3 0 true','playsound ambient.cave @s ~ ~ ~ 1 0.5','title @s subtitle §4It is getting faster.']);
fn('finale',['effect @e[type=husk,name="RH Keeper"] speed 999999 3 true','title @s subtitle §6RETURN TO THE GOLD FLOOR','playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.6']);
// Reposition only a distant Keeper, at least 10 blocks away from the player.
fn('hunt',[
'execute unless entity @e[type=husk,name="RH Keeper"] run summon husk "RH Keeper" 24 81 24',
'scoreboard players random @s rh_hunt 1 4',
...[[6,24],[24,6],[42,24],[24,42]].map(([x,z],i)=>`execute if score @s rh_hunt matches ${i+1} unless entity @s[x=${x},y=81,z=${z},r=10] run tp @e[type=husk,name="RH Keeper",rm=20] ${x} 81 ${z}`),
'execute if score @s rh_seals matches 1 run effect @e[type=husk,name="RH Keeper"] speed 999999 1 true',
'execute if score @s rh_seals matches 2 run effect @e[type=husk,name="RH Keeper"] speed 999999 2 true',
'execute if score @s rh_seals matches 3 run effect @e[type=husk,name="RH Keeper"] speed 999999 3 true',
'effect @e[type=husk,name="RH Keeper"] resistance 999999 4 true',
]);
for(let i=0;i<4;i++)fn(`trap${i}`,[`tag @s add rh_t${i}`,'effect @s blindness 2 0 true','playsound mob.endermen.scream @s ~ ~ ~ 0.7 0.8','title @s title §4DO NOT LOOK BACK','title @s subtitle §8Keep moving.']);
fn('win',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','title @s title §aYOU ESCAPED','title @s subtitle §7Next run. New labyrinth.','playsound random.levelup @s ~ ~ ~ 0.8 0.7']);
fn('lose',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','fill 5 81 5 7 83 7 air','tp @s 6.5 81 7.5','effect @s blindness 3 0 true','title @s title §4IT FOUND YOU','title @s subtitle §7Try again: /function rh/start','playsound mob.endermen.scream @s ~ ~ ~ 0.8 0.5']);
fn('stop',['tag @s remove rh_play','kill @e[type=husk,name="RH Keeper"]','effect @s clear','gamemode creative @s','tellraw @s {"rawtext":[{"text":"§7Stopped. Restart: /function rh/start. Test world settings and terrain remain changed."}]}']);
// Physical voxel checks after carving, decoration and closure, beyond graph reachability.
for(const l of layouts){
 const blocked=Array.from({length:49},()=>Array(49).fill(true));
 for(const line of l.build){const t=line.split(' ');if(t[0]==='fill'){const a=t.slice(1,7).map(Number),volume=(Math.abs(a[3]-a[0])+1)*(Math.abs(a[4]-a[1])+1)*(Math.abs(a[5]-a[2])+1);if(volume>32768)throw Error('Fill limit exceeded');if(a[1]<=81&&a[4]>=81)for(let x=a[0];x<=a[3];x++)for(let z=a[2];z<=a[5];z++)blocked[x][z]=t[7]!=='air';}else if(t[0]==='setblock'&&Number(t[2])===81){blocked[Number(t[1])][Number(t[3])]=!['air','soul_lantern','lantern','cobweb'].includes(t[4]);}}
 const check=()=>{const seen=new Set(['6,6']),q=[[6,6]];for(const[x,z]of q)for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=x+dx,v=z+dz,k=`${u},${v}`;if(u>=0&&u<49&&v>=0&&v<49&&!blocked[u][v]&&!seen.has(k)){seen.add(k);q.push([u,v]);}}for(let i=0;i<25;i++){const[x,z]=point(i);if(!seen.has(`${x},${z}`))throw Error(`Unreachable room ${i} in layout ${l.variant}`);}};
 check();blocked[l.closure[0]][l.closure[1]]=true;check();
}
const dir=path.join(pack,'functions','rh');for(const file of fs.readdirSync(dir))for(const m of fs.readFileSync(path.join(dir,file),'utf8').matchAll(/(?:^|run )function (rh\/\w+)/gm))if(!fs.existsSync(path.join(pack,'functions',m[1]+'.mcfunction')))throw Error('Missing '+m[1]);
fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.writeFileSync(path.join(root,'outputs','RandomHorror-v0.2-validation.json'),JSON.stringify({version:'0.2',checks:['fill volume limits','all function references exist','25 rooms reachable on physical grid before and after closure, all 3 layouts'],layouts:layouts.map(l=>({layout:l.variant,seals:l.seals.map(point),closedPassage:l.closure,longestRouteInRooms:Math.max(...l.distance)})),inGameTested:false},null,2));
console.log('PASS: 3 layouts, 25 rooms each; all rooms reachable before/after closure; fill sizes and references valid. Minecraft runtime test pending.');
