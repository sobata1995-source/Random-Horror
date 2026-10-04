import { world, system, ItemStack, GameMode, BlockPermutation } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { layouts } from './layouts.js';

const states=new Map(), busy=new Set(), held=new Set(), forms=new Set();
const HOME={x:24.5,y:90,z:26.5}, DIM='overworld';
const LEVELS=[{name:'Easy',delay:200,speeds:[0,0,1],hunt:1000,minDistance:18,ritual:2400},{name:'Normal',delay:120,speeds:[0,1,2],hunt:800,minDistance:16,ritual:1800},{name:'Nightmare',delay:40,speeds:[1,2,3],hunt:500,minDistance:12,ritual:1800}];
function music(p,stage){try{p.stopMusic();if(stage>=0)p.playMusic(`rh.music.stage${stage}`,{loop:true,fade:0.8,volume:[0.3,0.4,0.5,0.6][stage]});}catch(e){console.warn('Random Horror music: '+e);}}
const point=i=>({x:6+9*(i%5)+0.5,y:81,z:6+9*Math.floor(i/5)+0.5});
const dimension=()=>world.getDimension(DIM);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const choose=(count,previous)=>{const options=Array.from({length:count},(_,i)=>i).filter(i=>i!==previous);return options[Math.floor(Math.random()*options.length)];};
function effect(entity,id,ticks,amplifier=0){entity.addEffect(id,ticks,{amplifier,showParticles:false});}
function title(p,text,sub=''){p.onScreenDisplay.setTitle(text,{subtitle:sub,fadeInDuration:5,stayDuration:60,fadeOutDuration:10});}
function sound(p,id){try{p.playSound(id,{volume:0.7,pitch:0.7});}catch{}}
function set(x,y,z,type){const b=dimension().getBlock({x,y,z});if(!b)throw Error('Arena chunk is not loaded');b.setPermutation(BlockPermutation.resolve('minecraft:'+type));}
function typeAt(x,y,z){return dimension().getBlock({x,y,z})?.typeId;}
function removeActors(){for(const e of dimension().getEntities({tags:['rh_native_actor']}))e.remove();}
function reportError(p,e,context){const message='Random Horror '+context+': '+String(e);console.warn(message+' '+(e?.stack??''));try{p.setDynamicProperty('rh:lastError',message);p.sendMessage('?c'+message);if(e?.stack)p.sendMessage('?7'+String(e.stack).slice(0,1400));}catch{}}
function stopScare(s){if(!s?.scare)return;try{s.scare.entity.remove();}catch{}s.scare=null;}
function actorAvailable(entity){if(!entity)return false;try{return !!entity.location;}catch{return false;}}
function maintainActors(p,s){
 if(s.keeper&&!actorAvailable(s.keeper)){s.keeper=null;s.anchor=null;s.spawnDelay=20;}
 // An unavailable handle can mean an unloaded entity. Never spawn a replacement prisoner.
 if(s.captive&&!actorAvailable(s.captive))s.captive=null;
 if(s.mission===1&&s.age%20===0){
  const prisoners=dimension().getEntities({tags:['rh_native_actor']}).filter(e=>{try{return e.nameTag==='The Captive'&&actorAvailable(e);}catch{return false;}});
  if(!s.captive)s.captive=prisoners[0]??null;
  for(const e of prisoners)if(e!==s.captive)try{e.remove();}catch{}
 }
 if(s.scare&&!actorAvailable(s.scare.entity))stopScare(s);
}
function scarePath(p,room){
 const q=point(room),view=p.getViewDirection();
 const candidates=Math.abs(view.z)>=Math.abs(view.x)?[{a:{x:q.x-1.5,y:81,z:q.z+Math.sign(view.z||1)*1.5},b:{x:q.x+1.5,y:81,z:q.z+Math.sign(view.z||1)*1.5}}]:[{a:{x:q.x+Math.sign(view.x||1)*1.5,y:81,z:q.z-1.5},b:{x:q.x+Math.sign(view.x||1)*1.5,y:81,z:q.z+1.5}}];
 for(const path of candidates){let safe=true;for(let n=0;n<=12;n++){const f=n/12,x=Math.floor(path.a.x+(path.b.x-path.a.x)*f),z=Math.floor(path.a.z+(path.b.z-path.a.z)*f);if(typeAt(x,81,z)!=='minecraft:air'||typeAt(x,82,z)!=='minecraft:air'){safe=false;break;}}if(safe&&dist(path.a,p.location)>1.8&&dist(path.b,p.location)>1.8)return path;}
 return null;
}
function startScare(p,s,room){
 const path=scarePath(p,room);if(!path)return false;
 try{const chicken=Math.random()<0.5;const entity=dimension().spawnEntity(chicken?'minecraft:chicken':'rh:shadow',path.a);entity.addTag('rh_native_actor');entity.addTag('rh_scare');effect(entity,'resistance',100,4);s.scare={entity,path,kind:chicken?'chicken':'shadow',ticks:0,duration:chicken?18:24};s.scareCooldown=500;s.scareRooms.add(room);sound(p,chicken?'mob.chicken.hurt':'mob.endermen.stare');return true;}catch(e){console.warn('Random Horror scare: '+e);return false;}
}
function updateScares(p,s){
 if(s.scare){const sc=s.scare;sc.ticks++;if(sc.ticks>=sc.duration){stopScare(s);return;}const t=sc.ticks/sc.duration;
  try{const position={x:sc.path.a.x+(sc.path.b.x-sc.path.a.x)*t,y:81+(sc.kind==='chicken'?0.25+Math.sin(Math.PI*t)*0.9:0),z:sc.path.a.z+(sc.path.b.z-sc.path.a.z)*t};if(dist(position,p.location)<1.5){stopScare(s);return;}sc.entity.teleport(position,{dimension:dimension(),facingLocation:sc.path.b});}catch{stopScare(s);}return;
 }
 if(s.scareCooldown>0){s.scareCooldown--;return;}
 if(s.age<300||s.age%20!==0||s.charge>0||s.grace>0||s.progress===3||(s.keeper&&dist(s.keeper.location,p.location)<7))return;
 const room=Array.from({length:25},(_,i)=>i).find(i=>dist(point(i),p.location)<2.8&&!s.scareRooms.has(i));
 if(room!==undefined&&room!==0&&Math.random()<0.35)startScare(p,s,room);
}
function cleanEffects(p){for(const id of ['resistance','saturation','slowness','blindness','darkness'])p.removeEffect(id);}
function giveMenu(p){const c=p.getComponent('minecraft:inventory')?.container;if(!c)return;for(let i=0;i<c.size;i++)if(c.getItem(i)?.typeId==='minecraft:compass')return;if(c.emptySlotsCount){const item=new ItemStack('minecraft:compass');item.nameTag='§6Random Horror Menu';item.setLore(['Select and sneak to open the menu.']);c.addItem(item);}}
function home(p){stopScare(states.get(p.id));music(p,-1);states.delete(p.id);p.removeTag('rh_play');p.addTag('rh_home');cleanEffects(p);p.setGameMode(GameMode.Adventure);p.teleport(HOME,{dimension:dimension(),facingLocation:{x:24.5,y:91,z:22.5}});p.setSpawnPoint({...HOME,dimension:dimension()});giveMenu(p);}
function finish(p,won,message){removeActors();home(p);title(p,won?'§aYOU ESCAPED':'§4'+message,'§7Green pedestal: next nightmare');sound(p,won?'random.levelup':'mob.endermen.scream');}

// Batch block placement across ticks, using native APIs rather than commands.
async function build(lines,p){
 let failed;
 await new Promise(resolve=>system.runJob((function*(){
  try{for(const line of lines){if(line.startsWith('#'))continue;const t=line.split(' ');if(t[0]==='fill'){const a=t.slice(1,7).map(Number);for(let x=a[0];x<=a[3];x++)for(let y=a[1];y<=a[4];y++)for(let z=a[2];z<=a[5];z++){set(x,y,z,t[7]);yield;}}else if(t[0]==='setblock'){set(Number(t[1]),Number(t[2]),Number(t[3]),t[4]);yield;}else throw Error('Unsupported build instruction');}}catch(e){failed=e;}finally{resolve();}
 })()));
 if(failed)throw failed;
}
const lobbyPlan=['fill 18 89 18 30 95 30 deepslate_bricks','fill 19 90 19 29 94 29 air','fill 19 89 19 29 89 29 polished_deepslate',...[[20,20],[28,20],[20,28],[28,28]].map(([x,z])=>`setblock ${x} 94 ${z} lit_pumpkin`),'setblock 22 90 22 emerald_block','setblock 22 91 22 emerald_block','setblock 26 90 22 lapis_block','setblock 26 91 22 lapis_block'];
async function initialize(p){
 if(busy.has(p.id))return;
 if(world.getAllPlayers().length>1){p.sendMessage('§7Random Horror currently supports singleplayer.');return;}
 busy.add(p.id);
 try{
  removeActors();states.delete(p.id);p.removeTag('rh_play');cleanEffects(p);p.setGameMode(GameMode.Creative);p.teleport({x:24.5,y:98,z:24.5},{dimension:dimension()});
  p.sendMessage('§6Preparing Random Horror...');await new Promise(r=>system.runTimeout(r,100));
  if(!world.getAllPlayers().some(q=>q.id===p.id))return;
  world.gameRules.doMobSpawning=false;world.gameRules.doDaylightCycle=false;world.gameRules.doWeatherCycle=false;world.gameRules.keepInventory=true;
  await build(lobbyPlan,p);home(p);title(p,'§4RANDOM HORROR','§aGreen: PLAY §7| Blue: HELP');
 }catch(e){console.warn('Random Horror initialization: '+e);p.sendMessage('§cLobby setup failed. Please send the Content Log.');}
 finally{busy.delete(p.id);}
}
function chooseMission(p){
 let bag;try{bag=JSON.parse(p.getDynamicProperty('rh:missionBag')??'[]');}catch{bag=[];}
 if(!Array.isArray(bag)||!bag.length||new Set(bag).size!==bag.length||bag.some(i=>!Number.isInteger(i)||i<0||i>3))bag=[0,1,2,3];
 const previous=p.getDynamicProperty('rh:lastMission');const available=bag.filter(i=>i!==previous);const candidates=available.length?available:bag;
 const mission=candidates[Math.floor(Math.random()*candidates.length)];bag.splice(bag.indexOf(mission),1);p.setDynamicProperty('rh:missionBag',JSON.stringify(bag));return mission;
}
async function start(p,requestedMission){
 if(busy.size||states.size)return;
 busy.add(p.id);
 try{
  const inventory=p.getComponent('minecraft:inventory')?.container;if(inventory)for(let i=0;i<inventory.size;i++){if(inventory.getItem(i)?.nameTag?.startsWith('Random Horror - Diary Page '))inventory.setItem(i,undefined);}
  removeActors();p.teleport(HOME,{dimension:dimension()});
  const index=choose(layouts.length,p.getDynamicProperty('rh:lastLayout')),mission=requestedMission===3?3:chooseMission(p);
  const layout=layouts[index];p.sendMessage('§6Preparing your nightmare...');await build(layout.build,p);
  // Validate floor and headroom before allowing the player into the maze.
  for(const id of layout.seals){const q=point(id);if(typeAt(Math.floor(q.x),80,Math.floor(q.z))!=='minecraft:emerald_block'||typeAt(Math.floor(q.x),81,Math.floor(q.z))!=='minecraft:air')throw Error('Objective placement failed');}
  if(typeAt(6,81,7)!=='minecraft:air'||typeAt(6,82,7)!=='minecraft:air')throw Error('Blocked spawn');
  const levelIndex=p.getDynamicProperty('rh:difficulty')??1,level=LEVELS[levelIndex]??LEVELS[1];
  const s={index,mission,layout,level,progress:0,charge:0,collected:new Set(),age:0,traps:new Set(),grace:0,ritual:level.ritual,keeper:null,captive:null,spawnDelay:-1,scare:null,scareCooldown:0,scareRooms:new Set()};
  const pads=layout.seals.map(point);
  if(mission===3){
   for(const q of pads)set(Math.floor(q.x),80,Math.floor(q.z),'deepslate_tiles');
   const rooms=Array.from({length:24},(_,i)=>i+1);s.pageRooms=[];
   for(let n=0;n<3;n++){const at=Math.floor(Math.random()*rooms.length);s.pageRooms.push(rooms.splice(at,1)[0]);}
   for(const room of s.pageRooms){const q=point(room);set(Math.floor(q.x),81,Math.floor(q.z),'enchanting_table');}
  }
  if(mission===1){const q=pads[2];set(Math.floor(q.x),80,Math.floor(q.z),'obsidian');s.captive=dimension().spawnEntity('minecraft:villager',q);s.captive.nameTag='The Captive';s.captive.addTag('rh_native_actor');effect(s.captive,'slowness',999999,255);effect(s.captive,'resistance',999999,4);}
  if(mission===2)for(const q of pads.slice(1))set(Math.floor(q.x),80,Math.floor(q.z),'obsidian');
  p.setDynamicProperty('rh:lastLayout',index);p.setDynamicProperty('rh:lastMission',mission);states.set(p.id,s);p.addTag('rh_play');p.addTag('rh_home');cleanEffects(p);p.setGameMode(GameMode.Adventure);effect(p,'resistance',999999,4);effect(p,'saturation',999999);p.teleport({x:6.5,y:81,z:7.5},{dimension:dimension()});
  const names=['THE THREE SEALS','THE LOST PRISONER','BREAK THE RITUAL','THE FORGOTTEN DIARY'];title(p,'§4RANDOM HORROR',names[mission]);
  music(p,0);p.sendMessage(`§7Difficulty: §6${level.name}`);
  p.sendMessage(['§aSEALS: §7Hold three green floor tiles for 4 seconds each, then return to gold.','§6RESCUE: §7Two green keys (1s), then free the captive (6s) and escort them to gold.',`§5RITUAL: §7Hold each green rune for 6 seconds. After the first you have ${level.ritual/20} seconds to break the remaining runes.`,`DIARY: Find 3 books on stands. Right-click each book to take a paper page into your inventory. Return to the gold block.`][mission]);
 }catch(e){console.warn('Random Horror start: '+e);removeActors();home(p);p.sendMessage('§cDungeon construction failed. Please send the Content Log.');}
 finally{busy.delete(p.id);}
}
function spawnKeeper(p,s){const options=Array.from({length:25},(_,i)=>point(i)).filter(q=>dist(q,p.location)>=s.level.minDistance).sort((a,b)=>dist(b,p.location)-dist(a,p.location));s.keeper=dimension().spawnEntity('minecraft:husk',options[0]??point(24));s.keeper.nameTag='The Keeper';s.keeper.addTag('rh_native_actor');effect(s.keeper,'resistance',999999,4);effect(s.keeper,'fire_resistance',999999);keeperSpeed(s);if(s.grace>0){s.anchor={...s.keeper.location};effect(s.keeper,'slowness',s.grace,255);}}
function keeperSpeed(s){if(s.keeper){s.keeper.removeEffect('speed');const amp=s.level.speeds[Math.max(0,s.progress-1)];effect(s.keeper,'speed',999999,s.mission===1&&s.progress===3?Math.max(0,amp-1):amp);}}
function takePage(p,s,pad){
 if(s.mission!==3||s.collected.has(pad))return;
 const q=point(s.pageRooms[pad]);if(dist(p.location,q)>4)return;
 const inventory=p.getComponent('minecraft:inventory')?.container;if(!inventory){p.sendMessage('Inventory unavailable.');return;}
 const page=new ItemStack('minecraft:paper');page.nameTag='Random Horror - Diary Page '+(pad+1);page.setLore(['A torn page from the forgotten diary.']);
 if(inventory.addItem(page)){p.sendMessage('Make room in your inventory to take the page.');return;}
 set(Math.floor(q.x),81,Math.floor(q.z),'air');collected(p,s,pad);
}
function collected(p,s,pad){
 if(s.collected.has(pad))return;const q=point(s.mission===3?s.pageRooms[pad]:s.layout.seals[pad]);if(s.mission!==3)set(Math.floor(q.x),80,Math.floor(q.z),'redstone_block');s.collected.add(pad);s.progress++;s.charge=0;title(p,'§aOBJECTIVE COMPLETE');sound(p,'random.levelup');
 music(p,s.progress);
 if(s.progress===1){s.spawnDelay=s.level.delay;const[x,z]=s.layout.closure;for(let y=81;y<=83;y++)set(x,y,z,'deepslate_bricks');p.sendMessage('§4Something is awakening. A passage closes.');}
 if(s.progress===2){keeperSpeed(s);effect(p,'darkness',60);}
 if(s.mission===1&&s.progress===2){const q=point(s.layout.seals[2]);set(Math.floor(q.x),80,Math.floor(q.z),'emerald_block');p.sendMessage('§6Find the captive. Their tile is now green.');}
 if(s.mission===2&&s.progress<3){const q=point(s.layout.seals[s.progress]);set(Math.floor(q.x),80,Math.floor(q.z),'emerald_block');}
 if(s.progress===3){keeperSpeed(s);s.grace=60;if(s.keeper){s.anchor={...s.keeper.location};effect(s.keeper,'slowness',60,255);}title(p,'§6RETURN TO THE GOLD BLOCK','§73 seconds head start!');p.sendMessage('§6All 3 objectives complete! Return to the GOLD BLOCK at the start to escape.');}
}
function tick(p,s){
 maintainActors(p,s);
 s.age++;if(s.grace>0){s.grace--;if(s.grace===0&&s.keeper){s.keeper.removeEffect('slowness');keeperSpeed(s);}}
 if(s.spawnDelay>0){s.spawnDelay--;if(s.spawnDelay===0)spawnKeeper(p,s);}
 if(s.keeper&&s.grace>0)s.keeper.teleport(s.anchor,{dimension:dimension()});
 const loc=p.location,x=Math.floor(loc.x),z=Math.floor(loc.z),y=Math.floor(loc.y)-1;
 const pad=s.layout.seals.findIndex(i=>{const q=point(i);return Math.floor(q.x)===x&&Math.floor(q.z)===z;});
 const active=s.mission!==3&&pad>=0&&!s.collected.has(pad)&&typeAt(x,y,z)==='minecraft:emerald_block';
 if(active){s.charge++;effect(p,'slowness',20,1);const required=s.mission===0?80:s.mission===1&&s.progress<2?20:120;if(s.charge>=required)collected(p,s,pad);}else s.charge=0;
 if(s.mission===2&&s.progress>0&&s.progress<3){s.ritual--;if(s.ritual<=0){finish(p,false,'THE RITUAL COMPLETED');return;}}
 if(s.mission===1&&s.progress===3){effect(p,'slowness',40);if(s.age%20===0&&s.captive)s.captive.teleport(p.location,{dimension:dimension()});}
 // Replace the fixed blindness traps with harmless, randomized physical scenes.
 updateScares(p,s);
 if(s.age%200===0)sound(p,'ambient.cave');
 if(s.keeper&&s.grace===0&&s.age%s.level.hunt===0&&dist(s.keeper.location,loc)>24){const candidates=[point(10),point(2),point(14),point(22)].filter(q=>dist(q,loc)>s.level.minDistance);if(candidates.length)s.keeper.teleport(candidates[Math.floor(Math.random()*candidates.length)],{dimension:dimension()});}
 if(s.keeper&&s.grace===0&&dist(s.keeper.location,p.location)<1.4){finish(p,false,'IT FOUND YOU');return;}
 if(p.location.y<80){finish(p,false,'YOU FELL INTO THE DARK');return;}
 if(s.progress===3&&dist(p.location,{x:6.5,y:81,z:6.5})<1.5){finish(p,true,'');return;}
 let hud=s.mission===3?`PAGES ${s.progress}/3 | Right-click the books`:s.mission===0?`§aSEALS ${s.progress}/3`:s.mission===1?(s.progress<2?`§6KEYS ${s.progress}/2`:s.progress===2?'§6FREE THE CAPTIVE':'§6ESCORT THE CAPTIVE HOME'):`§5RUNES ${s.progress}/3 | ${Math.ceil(s.ritual/20)}s`;
 if(s.charge)hud+=' §7| WORKING... stay on green';if(s.progress===3)hud='§6RETURN TO THE GOLD BLOCK';if(s.grace)hud=`§6RETURN TO THE GOLD BLOCK | ${Math.ceil(s.grace/20)}s HEAD START`;p.onScreenDisplay.setActionBar(hud);
}
async function menu(p){
 if(forms.has(p.id)||busy.has(p.id))return;forms.add(p.id);
 try{const active=states.has(p.id),level=LEVELS[p.getDynamicProperty('rh:difficulty')??1]??LEVELS[1];const f=new ActionFormData().title('Random Horror').body(active?'The dungeon keeps moving while this menu is open.':`Choose your next nightmare. Difficulty: ${level.name}`);if(active)f.button('End round — return to lobby').button('Continue playing');else f.button('Play — random scenario').button('Difficulty: '+level.name).button('How to play').button('Close');const r=await f.show(p);if(r.canceled)return;if(active&&r.selection===0&&states.has(p.id)){removeActors();home(p);}else if(!active&&r.selection===0)await start(p);else if(!active&&r.selection===1){const choice=await new ActionFormData().title('Difficulty').body('Music escalates on every level. Choose how relentless the Keeper is.').button('Easy — more time to explore').button('Normal — tense but fair').button('Nightmare — relentless pursuit').show(p);if(!choice.canceled&&choice.selection>=0&&choice.selection<3){p.setDynamicProperty('rh:difficulty',choice.selection);p.sendMessage('§6Difficulty: '+LEVELS[choice.selection].name);}}else if(!active&&r.selection===2)p.sendMessage('§7Green floor tiles are objectives. Gold is the exit. Select the compass and sneak to open the menu.');}catch(e){console.warn('Random Horror menu: '+e);}finally{forms.delete(p.id);}
}
world.beforeEvents.playerInteractWithBlock.subscribe(e=>{const b=e.block.location;const s=states.get(e.player.id);if(s?.mission===3){const pad=s.pageRooms.findIndex(i=>{const q=point(i);return b.x===Math.floor(q.x)&&b.y===81&&b.z===Math.floor(q.z);});if(pad>=0&&!s.collected.has(pad)){e.cancel=true;system.run(()=>{if(states.get(e.player.id)===s)takePage(e.player,s,pad);});return;}}if(e.player.hasTag('rh_home')&&!states.has(e.player.id)&&b.y===91&&b.z===22&&[22,26].includes(b.x)){e.cancel=true;system.run(()=>b.x===22?menu(e.player):e.player.sendMessage('§7Green pedestal: Play. Select compass and sneak for the menu.'));}});
world.afterEvents.playerSpawn.subscribe(e=>system.runTimeout(()=>{if(!e.initialSpawn&&states.has(e.player.id)){finish(e.player,false,'IT FOUND YOU');return;}initialize(e.player);},20));
system.runTimeout(()=>{for(const p of world.getAllPlayers())initialize(p);},40);
system.runInterval(()=>{
 const players=world.getAllPlayers(),ids=new Set(players.map(p=>p.id));
 for(const[id]of states)if(!ids.has(id)){states.delete(id);removeActors();}
 for(const p of players){if(busy.has(p.id))continue;const s=states.get(p.id);if(s){try{tick(p,s);}catch(e){console.warn('Random Horror round: '+e);finish(p,false,'ROUND INTERRUPTED');p.sendMessage('§cPlease send the Content Log.');}}if(!p.hasTag('rh_home'))continue;if(system.currentTick%20===0)giveMenu(p);const c=p.getComponent('minecraft:inventory')?.container;const pressed=p.isSneaking&&c?.getItem(p.selectedSlotIndex)?.typeId==='minecraft:compass';if(pressed&&!held.has(p.id)){held.add(p.id);menu(p);}if(!pressed)held.delete(p.id);}
 for(const id of held)if(!ids.has(id))held.delete(id);
},1);
