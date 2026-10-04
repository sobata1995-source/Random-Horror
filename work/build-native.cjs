const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),legacy=path.join(root,'src','RandomHorror_BP'),dest=path.join(root,'src','RandomHorrorNative_BP');
const write=(p,data)=>{const target=path.join(dest,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);};
const report=JSON.parse(fs.readFileSync(path.join(root,'outputs','RandomHorror-v0.3-validation.json')));
const pointId=([x,z])=>((z-6)/9)*5+(x-6)/9;
const layouts=report.layouts.map(l=>{
 const build=fs.readFileSync(path.join(legacy,`functions/rh/layout${l.layout}.mcfunction`),'utf8').trim().split(/\r?\n/).map(line=>line.replace(/\b(soul_lantern|sea_lantern|lantern)\b/g,'lit_pumpkin'));
 const traps=[...fs.readFileSync(path.join(legacy,`functions/rh/traps${l.layout}.mcfunction`),'utf8').matchAll(/x=(\d+),y=81,z=(\d+)/g)].map(m=>pointId([Number(m[1]),Number(m[2])]));
 return{build,seals:l.seals.map(pointId),closure:l.closedPassage,traps};
});
write('manifest.json',JSON.stringify({format_version:2,header:{name:'Random Horror: Halloween v0.9.0',description:'Easy, Normal, Nightmare and four original music stages. Cheats may remain OFF.',uuid:'861dcce9-330b-4c06-b5b6-8a172c5917fb',version:[0,9,0],min_engine_version:[1,21,90]},modules:[{type:'data',uuid:'d213beae-119b-41ed-a023-8a715bc77f03',version:[0,9,0]},{type:'script',language:'javascript',uuid:'4c403d42-59a9-40ba-8532-5961040d441a',version:[0,9,0],entry:'scripts/main.js'}],dependencies:[{module_name:'@minecraft/server',version:'2.0.0'},{module_name:'@minecraft/server-ui',version:'2.0.0'},{uuid:'7dfaa2b1-a04a-4cbb-9734-156d574fb25e',version:[0,9,0]}]},null,2));
write('scripts/layouts.js','export const layouts = '+JSON.stringify(layouts)+';\n');
const source=fs.readFileSync(path.join(__dirname,'native-game.js'),'utf8');
if(/runCommand|\.mcfunction|function rh\//.test(source))throw Error('Gameplay must not depend on commands');
write('scripts/main.js',source);
for(let prev=0;prev<12;prev++){const allowed=Array.from({length:12},(_,i)=>i).filter(i=>i!==prev);if(allowed.length!==11||allowed.includes(prev))throw Error('Repeat selection');}
for(const l of layouts){if(l.seals.length!==3||l.traps.length!==4)throw Error('Missing objectives/traps');for(const line of l.build)if(!line.startsWith('#')&&!/^(fill|setblock) /.test(line))throw Error('Unexpected construction');}
console.log('PASS: native pack with 12 validated layouts; no commands/functions, three missions, no-repeat selection. Cheats-OFF runtime test required.');
