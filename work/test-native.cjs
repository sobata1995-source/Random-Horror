const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/native-game.js','utf8').replace(/^import .*$/gm,'');
const data=fs.readFileSync(__dirname+'/../src/RandomHorrorNative_BP/scripts/layouts.js','utf8');
const layouts=JSON.parse(data.slice(data.indexOf('['),data.lastIndexOf(']')+1));
let players=[],actors=[],blocks=new Map();
const id=p=>`${p.x},${p.y},${p.z}`;
const actor=location=>({location:{...location},tags:new Set(),effects:new Map(),addTag(t){this.tags.add(t)},addEffect(t,n,o){this.effects.set(t,{n,o})},removeEffect(t){this.effects.delete(t)},teleport(p){this.location={...p}},remove(){actors=actors.filter(a=>a!==this)}});
const dim={getBlock(p){return{get typeId(){return blocks.get(id(p))||'minecraft:air'},setPermutation(v){blocks.set(id(p),v.typeId)}}},spawnEntity(type,p){const a=actor(p);actors.push(a);return a},getEntities:()=>actors};
const world={getDimension:()=>dim,getAllPlayers:()=>players,gameRules:{},beforeEvents:{playerInteractWithBlock:{subscribe(){}}},afterEvents:{playerSpawn:{subscribe(){}}}};
const system={currentTick:0,run:f=>f(),runTimeout:f=>f(),runInterval(){},runJob(g){while(!g.next().done){}}};
const permutation={resolve:typeId=>({typeId})};
class Item{setLore(){}}
class Form{}
const api=new Function('world','system','ItemStack','GameMode','BlockPermutation','ActionFormData','layouts',source+'\nreturn{choose,chooseMission,start,tick,collected,home,initialize,states,LEVELS,takePage,startScare,updateScares,scarePath};')(world,system,Item,{Adventure:'adventure',Creative:'creative'},permutation,Form,layouts);
const p=actor({x:24.5,y:98,z:24.5});p.id='test';p.removeTag=t=>p.tags.delete(t);p.hasTag=t=>p.tags.has(t);p.properties={};p.getDynamicProperty=k=>p.properties[k];p.setDynamicProperty=(k,v)=>p.properties[k]=v;p.messages=[];p.sendMessage=t=>p.messages.push(t);p.setGameMode=m=>p.mode=m;p.setSpawnPoint=q=>p.spawn=q;p.getComponent=()=>undefined;p.playSound=()=>{};p.onScreenDisplay={setTitle(){},setActionBar(){}};
p.music=[];p.stopMusic=()=>{};p.playMusic=t=>p.music.push(t);
p.getViewDirection=()=>({x:0,y:0,z:1});
(async()=>{
 players=[p];await api.initialize(p);assert(p.hasTag('rh_home'));assert.equal(p.location.y,90);assert.equal(p.mode,'adventure');
 for(let prev=0;prev<12;prev++)for(let n=0;n<20;n++)assert.notEqual(api.choose(12,prev),prev);
 const selector={properties:{},getDynamicProperty(k){return this.properties[k]},setDynamicProperty(k,v){this.properties[k]=v}};
 let previous;for(let cycle=0;cycle<100;cycle++){const seen=new Set();for(let n=0;n<4;n++){const mission=api.chooseMission(selector);assert.notEqual(mission,previous);seen.add(mission);selector.setDynamicProperty('rh:lastMission',mission);previous=mission;}assert.equal(seen.size,4);}console.log('PASS: 100 randomized cycles, all four missions exactly once per cycle, no consecutive repeats.');
 const originalRandom=Math.random;Math.random=()=>0;
 await api.start(p);let s=api.states.get(p.id);assert.equal(s.mission,0);
 p.location={x:6.5,y:81,z:6.5};
 assert(api.startScare(p,s,0));assert.equal(s.scare.kind,'chicken');const bird=s.scare.entity;
 for(let n=0;n<18;n++)api.updateScares(p,s);assert.equal(s.scare,null);assert(!actors.includes(bird));assert.equal(s.scareCooldown,500);
 Math.random=()=>0.99;assert(api.startScare(p,s,0));assert.equal(s.scare.kind,'shadow');const shadow=s.scare.entity;
 api.home(p);assert(!actors.includes(shadow));p.setDynamicProperty('rh:lastMission',undefined);p.setDynamicProperty('rh:missionBag','[]');Math.random=()=>0;await api.start(p);s=api.states.get(p.id);
 s.charge=1;s.age=300;s.scareCooldown=0;api.updateScares(p,s);assert.equal(s.scare,null);
 s.charge=0;s.grace=60;api.updateScares(p,s);assert.equal(s.scare,null);s.grace=0;
 Math.random=()=>0;
 api.collected(p,s,2);assert.equal(s.keeper,null);assert.equal(s.spawnDelay,120);p.location={x:6.5,y:81,z:7.9};for(let n=0;n<119;n++)api.tick(p,s);assert.equal(s.keeper,null);api.tick(p,s);assert(s.keeper);assert(Math.hypot(s.keeper.location.x-p.location.x,s.keeper.location.z-p.location.z)>=16);
 const expired=s.keeper;Object.defineProperty(expired,'location',{get(){throw Error('InvalidEntityError');}});api.tick(p,s);assert.equal(s.keeper,null);assert.equal(s.spawnDelay,19);for(let n=0;n<19;n++)api.tick(p,s);assert(s.keeper);assert.notEqual(s.keeper,expired);assert(api.states.has(p.id));
 api.collected(p,s,0);api.collected(p,s,1);assert.equal(s.progress,3);assert.equal(s.grace,60);assert.deepEqual(p.music.slice(-4),['rh.music.stage0','rh.music.stage1','rh.music.stage2','rh.music.stage3']);
 // Stand away from both the exit and objectives while testing the full head start.
 p.location={x:6.5,y:81,z:7.9};for(let n=0;n<59;n++)api.tick(p,s);assert.equal(s.grace,1);api.tick(p,s);assert.equal(s.grace,0);
 api.home(p);await api.start(p);s=api.states.get(p.id);assert.equal(s.mission,1);api.collected(p,s,0);api.collected(p,s,1);const q=layouts[s.index].seals[2];const x=6+9*(q%5),z=6+9*Math.floor(q/5);assert.equal(blocks.get(`${x},80,${z}`),'minecraft:emerald_block');api.collected(p,s,2);assert.equal(s.progress,3);const expiredCaptive=s.captive;Object.defineProperty(expiredCaptive,'location',{get(){throw Error('InvalidEntityError');}});p.location={x:15.5,y:81,z:15.5};api.tick(p,s);assert.equal(s.captive,null);const before=actors.filter(e=>e.nameTag==='The Captive').length;for(let n=0;n<400;n++)api.tick(p,s);assert.equal(actors.filter(e=>e.nameTag==='The Captive').length,before);assert(api.states.has(p.id));console.log('PASS: unavailable prisoner over 400 ticks creates zero replacements.');
 api.home(p);Math.random=()=>0;await api.start(p);s=api.states.get(p.id);assert.equal(s.mission,2);api.collected(p,s,0);const old=s.ritual;p.location={x:6.5,y:81,z:7.9};api.tick(p,s);assert.equal(s.ritual,old-1);s.ritual=1;api.tick(p,s);assert(!api.states.has(p.id));assert.equal(p.location.y,90);
 Math.random=()=>0;await api.start(p,3);s=api.states.get(p.id);assert.equal(s.mission,3);assert.equal(new Set(s.pageRooms).size,3);assert(!s.pageRooms.includes(0));
 const pages=[];p.getComponent=()=>({container:{addItem(item){pages.push(item);return undefined;}}});
 for(let pad=0;pad<3;pad++){const room=s.pageRooms[pad];p.location={x:6+9*(room%5)+0.5,y:81,z:6+9*Math.floor(room/5)+0.5};api.takePage(p,s,pad);api.takePage(p,s,pad);assert.equal(s.progress,pad+1);}
 assert.equal(pages.length,3);assert.equal(s.grace,60);assert(p.messages.some(m=>m.includes('GOLD BLOCK')));console.log('PASS: diary has three unique rooms, grants three inventory pages, rejects duplicates, completes with head start.');p.getComponent=()=>undefined;api.home(p);
 assert.deepEqual(api.LEVELS.map(l=>l.delay),[200,120,40]);assert.deepEqual(api.LEVELS.map(l=>l.speeds),[[0,0,1],[0,1,2],[1,2,3]]);
 Math.random=originalRandom;assert(!('runCommand' in p));console.log('PASS: auto lobby, missions, ritual timeout, no-repeat choice, 60-tick head start, delayed distant boss spawn, difficulty settings and music stages 0→1→2→3. Minecraft audio/runtime test pending.');
})().catch(e=>{console.error(e);process.exitCode=1});
