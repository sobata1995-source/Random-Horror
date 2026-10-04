const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/lobby-ui.js','utf8').replace(/^import .*$/gm,'');
let reply={},players=[],callbacks={},messages=[],scheduled=[];
class Form{title(){return this}body(){return this}button(){return this}async show(){return reply}}
const world={getAllPlayers:()=>players,beforeEvents:{playerInteractWithBlock:{subscribe:f=>callbacks.interact=f}},afterEvents:{playerSpawn:{subscribe:f=>callbacks.spawn=f}}};
const system={run:f=>f(),runTimeout:f=>scheduled.push(f),runInterval:f=>callbacks.interval=f};
const flush=()=>{while(scheduled.length)scheduled.shift()();};
const item=class{};
function player(id,active=false){const tags=new Set(['rh_home',...(active?['rh_play']:[])]);return{id,hasTag:t=>tags.has(t),tags,commands:[],sendMessage:m=>messages.push(m),runCommand(cmd){this.commands.push(cmd);if(cmd.endsWith('/start'))tags.add('rh_play');if(cmd.endsWith('/stop'))tags.delete('rh_play');},getComponent:()=>undefined};}
const api=new Function('world','system','ItemStack','ActionFormData',source+'\nreturn {menu};')(world,system,item,Form);
(async()=>{
 let p=player('one');players=[p];reply={selection:0};await api.menu(p);assert.deepEqual(p.commands,['function rh/start']);
 p=player('one',true);players=[p];reply={selection:0};await api.menu(p);assert.deepEqual(p.commands,['function rh/stop']);
 p=player('one',true);players=[p];reply={selection:1};await api.menu(p);assert.equal(p.commands.length,0);
 p=player('one');players=[p];reply={canceled:true};await api.menu(p);assert.equal(p.commands.length,0);
 p=player('one');players=[p,player('two',true)];reply={selection:0};await api.menu(p);assert.equal(p.commands.length,0);assert(messages.some(m=>m.includes('one active player')));
 flush();
 p=player('one',true);players=[p];callbacks.spawn({player:p,initialSpawn:false});flush();assert.deepEqual(p.commands,['function rh/stop']);
 p=player('one');players=[p];callbacks.spawn({player:p,initialSpawn:true});flush();assert.deepEqual(p.commands,['function rh/home']);
 p=player('fresh');p.tags.clear();players=[p];callbacks.spawn({player:p,initialSpawn:true});flush();assert.deepEqual(p.commands,['function rh/stop','gamemode creative @s','tp @s 24.5 98 24.5','function rh/lobby']);
 const event={player:player('one'),block:{location:{x:26,y:91,z:22}},cancel:false};callbacks.interact(event);assert(event.cancel);assert(messages.some(m=>m.includes('green pedestal')));
 console.log('PASS: play, stop, continue, cancellation, occupied world, respawn, lobby rejoin, automatic first-entry setup and help interaction. Minecraft runtime test remains required.');
})().catch(e=>{console.error(e);process.exitCode=1});
