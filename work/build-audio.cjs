const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','src','RandomHorrorAudio_RP');
const write=(name,data)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);};
write('manifest.json',JSON.stringify({format_version:2,header:{name:'Random Horror: Escalating Music v0.9.0',description:'Four original synthesized atmospheric tracks, from calm to demonic.',uuid:'7dfaa2b1-a04a-4cbb-9734-156d574fb25e',version:[0,9,0],min_engine_version:[1,21,90]},modules:[{type:'resources',uuid:'edc04fde-70dc-4193-b8e1-5a7fd0f29e1f',version:[0,9,0]}]},null,2));
const sr=22050,duration=24,count=sr*duration,defs={},tempos=[40,75,120,180];
for(let stage=0;stage<4;stage++){
 const pcm=new Float64Array(count);let seed=741+stage,filtered=0;const beat=60/tempos[stage];
 for(let i=0;i<count;i++){
  const t=i/sr,phase=t%beat,bar=Math.floor(t/(beat*4));
  const note=[55,58.27,51.91,55][bar%4];
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/4294967296*2-1;filtered=filtered*0.97+noise*0.03;
  const pad=(Math.sin(2*Math.PI*note*t)+0.5*Math.sin(2*Math.PI*(note*1.5+0.15)*t)+0.3*Math.sin(2*Math.PI*note*2*t))*0.08;
  let v=pad*(0.8+0.2*Math.sin(2*Math.PI*0.12*t));
  if(stage===0)v+=0.045*Math.sin(2*Math.PI*220*t)*Math.exp(-phase*1.3)+filtered*0.012;
  else{
   const kick=Math.sin(2*Math.PI*(42*t+7*(1-Math.exp(-phase*20))))*Math.exp(-phase*(stage===3?20:12));
   const tritone=Math.sin(2*Math.PI*note*Math.sqrt(2)*t)*(0.04+stage*0.022);
   const whisper=filtered*(0.13+0.07*stage)*(0.5+0.5*Math.sin(2*Math.PI*(1+stage)*t));
   const pulse=Math.sin(2*Math.PI*110*t)*Math.exp(-(t%(beat/2))*20)*0.035*stage;
   v+=kick*(0.13+stage*0.04)+tritone+whisper+pulse;
   if(stage===3)v=Math.tanh(v*2.6)*0.35+Math.sin(2*Math.PI*27.5*t)*0.055;
  }
  const envelope=Math.min(1,t/0.15,(duration-t)/0.15);pcm[i]=v*envelope;
 }
 let peak=0,sum=0;for(const v of pcm){peak=Math.max(peak,Math.abs(v));sum+=v*v;}
 const wav=Buffer.alloc(44+count*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
 const gain=Math.min(1,0.75/peak);for(let i=0;i<count;i++)wav.writeInt16LE(Math.round(pcm[i]*gain*32767),44+i*2);
 write(`sounds/random_horror/stage${stage}.wav`,wav);
 defs[`rh.music.stage${stage}`]={category:'music',sounds:[{name:`sounds/random_horror/stage${stage}`,stream:true,volume:1}]};
 console.log(`Stage ${stage}: ${tempos[stage]} BPM, 24s, peak ${(peak*gain).toFixed(3)}, RMS ${(Math.sqrt(sum/count)*gain).toFixed(3)}`);
}
write('sounds/sound_definitions.json',JSON.stringify({format_version:'1.14.0',sound_definitions:defs},null,2));
write('AUDIO-LICENSE.txt','Original procedural audio composed and synthesized for Random Horror. No external recordings or samples used. Source: work/build-audio.cjs.\n');
