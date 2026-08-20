import fs from 'node:fs';

let html=fs.readFileSync('survivor-runtime319.html','utf8')
  .replaceAll('content="319"','content="320"').replaceAll('Jarvis Survivor 319','Jarvis Survivor 320').replaceAll('RUNTIME 319','RUNTIME 320')
  .replace('const RUNTIME=319,MODEL_RENDERER_VERSION=9,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=13,CHOREOGRAPHY_VERSION=14,HERO_MAX_HP=780;',
    'const RUNTIME=320,MODEL_RENDERER_VERSION=10,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=14,CHOREOGRAPHY_VERSION=15,HERO_MAX_HP=780;')
  .replace("name:'JARVIS_CINEMATIC_GRAPHICS_KERNEL',version:8", "name:'JARVIS_ANIME_DEPTH_KERNEL',version:9")
  .replaceAll('CINEMATIC_CEL_ATLAS_3D_V5','ANIME_DEPTH_ATLAS_3D_V6')
  .replace("const GRAPHICS_PROFILE=Object.freeze({celRim:true,arenaDepth:true,shockwaves:true,speedLines:true,impactFrames:true,cinematicBars:true,colorGrade:true,reflectionFloor:true,mobileDpr:1.5,particleCap:360});let replay,fx,beams,slashes,rings,lastReplayFrame=0,moveSerial=0;",
    "const GRAPHICS_PROFILE=Object.freeze({celRim:true,arenaDepth:true,shockwaves:true,speedLines:true,impactFrames:true,cinematicBars:true,colorGrade:true,reflectionFloor:true,auraShells:3,mangaImpacts:true,beamCores:true,clashLens:true,depthFog:true,mobileDpr:1.5,particleCap:360});let replay,fx,beams,slashes,rings,impactGlyphs,lastReplayFrame=0,moveSerial=0;")
  .replace("function shockwave(x,z,color,power=1){rings.push({x,z,color,life:.42*power,max:.42*power,r:16,power});if(rings.length>24)rings.shift()}",
    "function shockwave(x,z,color,power=1){rings.push({x,z,color,life:.42*power,max:.42*power,r:16,power});if(rings.length>24)rings.shift()}\nfunction impactBurst(x,z,color,power=1){impactGlyphs.push({x,z,color,power,life:.18,max:.18,spin:rnd(-.25,.25)});if(impactGlyphs.length>18)impactGlyphs.shift()}")
  .replace("burst(f.x,f.z,FORMS[n][1],48);shockwave(f.x,f.z,FORMS[n][1],1.8);emit('FORM_CHANGE'",
    "burst(f.x,f.z,FORMS[n][1],58);shockwave(f.x,f.z,FORMS[n][1],2.05);impactBurst(f.x,f.z,FORMS[n][1],1.35);emit('FORM_CHANGE'")
  .replace("guarded:b.guard>0,heavy,launch,combo:a.combo}",
    "attacker:a.name,defender:b.name,guarded:b.guard>0,heavy,launch,combo:a.combo}")
  .replace("if(heavy)shockwave(b.x,b.z,a.accent,1.15);emit('HIT'",
    "if(heavy){shockwave(b.x,b.z,a.accent,1.3);impactBurst(b.x,b.z,a.accent,1)}emit('HIT'")
  .replace("function bind(i,carry=true){const l=LEVELS[i],gateForm=cl(Math.floor(i/4),0,10),battleForm=cl(1+Math.floor(i/4),0,10);",
    "function bind(i,carry=true){const l=LEVELS[i],gateForm=cl(Math.floor(i/4),0,10),battleForm=cl(1+Math.floor(i/4),0,10),recoveryBefore=st.hero.hp;")
  .replace("emit('LEVEL_BIND',{levelId:l.id,act:l.act,opponent:l.opponent,arena:l.arena});say('JARVIS'",
    "emit('LEVEL_BIND',{levelId:l.id,act:l.act,opponent:l.opponent,arena:l.arena});emit('ROUND_RECOVERY',{fighter:st.hero.name,hpBefore:+recoveryBefore.toFixed(1),hpAfter:+st.hero.hp.toFixed(1),amount:+(st.hero.hp-recoveryBefore).toFixed(1),policy:carry?'FIXED_280_CAP':'FULL_INITIALIZE'});say('JARVIS'")
  .replace("st.levelStart=st.time;st.phase='OPENING';", "st.levelStart=st.time;st.levelWall=performance.now();st.phase='OPENING';")
  .replace("st.time-st.levelStart>=1.5&&!st.finisher&&h.stun<=0",
    "(performance.now()-st.levelWall>=3000||h.hp/h.maxHp<.68)&&!st.finisher&&h.stun<=0")
  .replace("beams.push({from:a,to:b,life:ultimate?.85:.46,max:ultimate?.85:.46,impact:ultimate?.32:.18,resolved:false,damage:(a.hero?54:46)*(ultimate?1.8:1),move:ultimate?'ULTIMATE':'BEAM',color:a.accent,w:ultimate?18:9});emit(ultimate?'ULTIMATE':'SUPER'",
    "beams.push({from:a,to:b,life:ultimate?.85:.46,max:ultimate?.85:.46,impact:ultimate?.32:.18,resolved:false,damage:(a.hero?54:46)*(ultimate?1.8:1),move:ultimate?'ULTIMATE':'BEAM',color:a.accent,w:ultimate?18:9});if(ultimate&&b.ki>=70&&b.hp>0&&b.cd<=.15){b.ki-=70;b.ult=0;b.cd=1.2;setPose(a,'BEAM_CLASH',.72);setPose(b,'BEAM_CLASH',.72);beams.push({from:b,to:a,life:.85,max:.85,resolved:true,color:b.accent,w:18});st.hitstop=.08;st.shake=.11;shockwave((a.x+b.x)/2,(a.z+b.z)/2,'#ffffff',1.8);impactBurst((a.x+b.x)/2,(a.z+b.z)/2,'#ffffff',1.6);emit('BEAM_CLASH',{fighter:a.name,against:b.name,trigger:'ULTIMATE_INTERCEPT'})}emit(ultimate?'ULTIMATE':'SUPER'" )
  .replace("for(const q of rings){q.life-=dt;q.r+=dt*230*q.power}rings=rings.filter(q=>q.life>0);",
    "for(const q of rings){q.life-=dt;q.r+=dt*230*q.power}rings=rings.filter(q=>q.life>0);for(const q of impactGlyphs)q.life-=dt;impactGlyphs=impactGlyphs.filter(q=>q.life>0);")
  .replaceAll('fx=[];beams=[];slashes=[];rings=[];','fx=[];beams=[];slashes=[];rings=[];impactGlyphs=[];')
  .replace("function drawFighter(f){", `function drawFighterReflection(f,p,img,frame,w,h){if(!img.complete||!img.naturalWidth||f.y>.08)return;const col=frame%4,row=Math.floor(frame/4),fw=img.naturalWidth/4,fh=img.naturalHeight/4;X.save();X.translate(p.x,p.y+7);X.scale(f.facing,-.28);X.globalAlpha=.11*(1-f.y/.08);X.globalCompositeOperation='screen';X.drawImage(img,col*fw,row*fh,fw,fh,-w/2,-h,w,h);X.restore()}
function drawFighter(f){`)
  .replace("aura(f,p);X.save();X.translate(p.x,p.y);",
    "drawFighterReflection(f,p,img,frame,w,h);aura(f,p);X.save();X.translate(p.x,p.y);")
  .replace("function drawArenaDepth(){", `function drawDepthFog(){X.save();const c=LEVELS[st.level].color;X.globalCompositeOperation='screen';for(let i=0;i<5;i++){const y=H*(.42+i*.075),g=X.createLinearGradient(0,y,0,y+H*.1);g.addColorStop(0,'transparent');g.addColorStop(.5,c+(i%2?'0b':'12'));g.addColorStop(1,'transparent');X.fillStyle=g;X.fillRect(0,y,W,H*.12)}X.restore()}
function drawArenaDepth(){`)
  .replace("function drawFx(){", `function drawImpactGlyphs(){X.save();X.globalCompositeOperation='screen';for(const q of impactGlyphs){const p={x:q.x*W,y:H*(.74-q.z*.18)},t=q.life/q.max,r=(1-t)*54*q.power+12;X.translate(p.x,p.y-48);X.rotate(q.spin);X.globalAlpha=t*.85;X.strokeStyle='#fff';X.lineWidth=2+4*t;X.shadowBlur=22;X.shadowColor=q.color;for(let i=0;i<10;i++){const a=i*Math.PI*.2,X0=Math.cos(a)*r*.35,Y0=Math.sin(a)*r*.35;X.beginPath();X.moveTo(X0,Y0);X.lineTo(Math.cos(a)*r,Math.sin(a)*r);X.stroke()}X.setTransform(D,0,0,D,0,0)}X.restore()}
function drawFx(){`)
  .replace("for(const b of beams){const a=project(b.from),q=project(b.to),t=b.life/b.max;X.globalAlpha=.9;X.strokeStyle=b.color;X.lineWidth=b.w*(.7+Math.sin(t*30)*.2);X.shadowBlur=20;X.shadowColor=b.color;X.beginPath();X.moveTo(a.x,a.y-45);X.lineTo(q.x,q.y-45);X.stroke();X.lineWidth=2;X.strokeStyle='#fff';X.stroke()}",
    "for(const b of beams){const a=project(b.from),q=project(b.to),t=b.life/b.max,pulse=.82+Math.sin(t*34)*.12;X.globalAlpha=.28;X.strokeStyle=b.color;X.lineWidth=b.w*2.35*pulse;X.shadowBlur=28;X.shadowColor=b.color;X.beginPath();X.moveTo(a.x,a.y-45);X.lineTo(q.x,q.y-45);X.stroke();X.globalAlpha=.92;X.lineWidth=b.w*pulse;X.stroke();X.globalAlpha=1;X.lineWidth=Math.max(2,b.w*.19);X.strokeStyle='#fff';X.stroke();X.fillStyle='#fff';X.beginPath();X.arc(q.x,q.y-45,b.w*.55*pulse,0,Math.PI*2);X.fill()}")
  .replace("arena();drawArenaDepth();drawSpeedLines();", "arena();drawDepthFog();drawArenaDepth();drawSpeedLines();")
  .replace("drawFx();if(beams.length", "drawFx();drawImpactGlyphs();if(beams.length")
  .replace("assetStats,graphicsProfile:GRAPHICS_PROFILE,replaySchema:'jarvis-survivor-replay-v15'", "assetStats,graphicsProfile:GRAPHICS_PROFILE,replaySchema:'jarvis-survivor-replay-v16'")
  .replaceAll("schema:'jarvis-survivor-replay-v15'","schema:'jarvis-survivor-replay-v16'")
  .replaceAll('jarvis-survivor-replay-v15-','jarvis-survivor-replay-v16-')
  .replace("canvas{filter:saturate(1.08) contrast(1.035)}", "canvas{filter:saturate(1.13) contrast(1.055) brightness(1.015)}")
  .replace('JARVIS CINEMATIC ATLAS-3D KERNEL V5','JARVIS ANIME DEPTH ATLAS-3D KERNEL V6');

for(const marker of ['RUNTIME=320','MODEL_RENDERER_VERSION=10','ANIME_DEPTH_ATLAS_3D_V6','attacker:a.name','ROUND_RECOVERY','drawDepthFog','drawFighterReflection','drawImpactGlyphs','ULTIMATE_INTERCEPT',"schema:'jarvis-survivor-replay-v16'"])if(!html.includes(marker))throw Error(`Runtime 320 build missing ${marker}`);
fs.writeFileSync('survivor-runtime320.html',html);

function replaceFile(path,pairs){let text=fs.readFileSync(path,'utf8');for(const[from,to]of pairs)text=text.replaceAll(from,to);fs.writeFileSync(path,text)}
replaceFile('jarvis/survivor-tab.js',[
 ['20260820runtime319graphics3dv14','20260820runtime320animedepth3dv15'],['survivor-runtime319.html','survivor-runtime320.html'],['p.version||319','p.version||320'],
 ['Runtime 319 Cinematic Graphics Kernel','Runtime 320 Anime Depth Graphics Kernel'],['RUNTIME 319 // CINEMATIC GRAPHICS V14','RUNTIME 320 // ANIME DEPTH GRAPHICS V15'],
 ['runtime319 cinematic-graphics-kernel','runtime320 anime-depth-graphics-kernel'],['Booting Runtime 319 Cinematic Graphics Kernel','Booting Runtime 320 Anime Depth Graphics Kernel']
]);
replaceFile('tools/survivor-runtime-smoke.mjs',[
 ['survivor-runtime319.html','survivor-runtime320.html'],['SURVIVOR_EXPECTED_PRODUCTION||319','SURVIVOR_EXPECTED_PRODUCTION||320'],['state.modelRenderer!==9','state.modelRenderer!==10'],
 ['state.choreography!==14','state.choreography!==15'],["state.replaySchema!=='jarvis-survivor-replay-v15'","state.replaySchema!=='jarvis-survivor-replay-v16'"]
]);
const runtimeContract=fs.readFileSync('tools/test-survivor-runtime319-contract.mjs','utf8')
 .replaceAll('runtime319','runtime320').replaceAll('Runtime 319','Runtime 320').replaceAll('RUNTIME=319','RUNTIME=320').replaceAll('MODEL_RENDERER_VERSION=9','MODEL_RENDERER_VERSION=10')
 .replaceAll('BALANCE_VERSION=13','BALANCE_VERSION=14').replaceAll('CHOREOGRAPHY_VERSION=14','CHOREOGRAPHY_VERSION=15').replaceAll('CINEMATIC_CEL_ATLAS_3D_V5','ANIME_DEPTH_ATLAS_3D_V6')
 .replaceAll('jarvis-survivor-replay-v15','jarvis-survivor-replay-v16').replaceAll('runtime:319','runtime:320').replaceAll("replay:'v15'","replay:'v16'")
 .replace("'imageSmoothingQuality'", "'imageSmoothingQuality', 'ROUND_RECOVERY', 'attacker:a.name', 'drawDepthFog', 'drawFighterReflection', 'drawImpactGlyphs', 'ULTIMATE_INTERCEPT'");
fs.writeFileSync('tools/test-survivor-runtime320-contract.mjs',runtimeContract);
let productionContract=fs.readFileSync('tools/test-survivor-production239-contract.mjs','utf8')
 .replaceAll('production239','production240').replaceAll('runtime319','runtime320').replaceAll('Runtime 319','Runtime 320').replaceAll('RUNTIME=319','RUNTIME=320').replaceAll('content="319"','content="320"')
 .replaceAll('MODEL_RENDERER_VERSION=9','MODEL_RENDERER_VERSION=10').replaceAll('BALANCE_VERSION=13','BALANCE_VERSION=14').replaceAll('CHOREOGRAPHY_VERSION=14','CHOREOGRAPHY_VERSION=15').replaceAll('jarvis-survivor-replay-v15','jarvis-survivor-replay-v16')
 .replaceAll('JARVIS_CINEMATIC_GRAPHICS_KERNEL','JARVIS_ANIME_DEPTH_KERNEL').replaceAll('CINEMATIC_CEL_ATLAS_3D_V5','ANIME_DEPTH_ATLAS_3D_V6')
 .replaceAll('20260820runtime319graphics3dv14','20260820runtime320animedepth3dv15').replaceAll('CINEMATIC GRAPHICS V14','ANIME DEPTH GRAPHICS V15')
 .replaceAll('20260820runtime320graphics3dv14','20260820runtime320animedepth3dv15')
 .replaceAll('SURVIVOR_EXPECTED_PRODUCTION=319','SURVIVOR_EXPECTED_PRODUCTION=320').replaceAll('"runtime": 319','"runtime": 320').replaceAll('activeRuntime:319','activeRuntime:320')
 .replaceAll('modelRenderer:9','modelRenderer:10').replaceAll('choreographyVersion:14','choreographyVersion:15').replaceAll("replay:'v15/10Hz'","replay:'v16/10Hz'");
productionContract=productionContract.replace('balanceVersion:13','balanceVersion:14');
fs.writeFileSync('tools/test-survivor-production240-contract.mjs',productionContract);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml','.github/workflows/survivor-live-runtime-verify.yml'])replaceFile(path,[
 ['Runtime 319','Runtime 320'],['runtime319','runtime320'],['RUNTIME=319','RUNTIME=320'],['content="319"','content="320"'],['EXPECTED_PRODUCTION=319','EXPECTED_PRODUCTION=320'],
 ['modelRenderer:9','modelRenderer:10'],['choreography:14','choreography:15'],['MODEL_RENDERER_VERSION=9','MODEL_RENDERER_VERSION=10'],
 ['CINEMATIC_CEL_ATLAS_3D_V5','ANIME_DEPTH_ATLAS_3D_V6'],['jarvis-survivor-replay-v15','jarvis-survivor-replay-v16'],
 ['20260820runtime319graphics3dv14','20260820runtime320animedepth3dv15'],['RUNTIME 319 // CINEMATIC GRAPHICS V14','RUNTIME 320 // ANIME DEPTH GRAPHICS V15'],
 ['20260820runtime320graphics3dv14','20260820runtime320animedepth3dv15'],
 ['runtime:319','runtime:320'],['runtime": 319','runtime": 320'],['CINEMATIC_GRAPHICS_3D_V14','ANIME_DEPTH_GRAPHICS_3D_V15']
]);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml'])replaceFile(path,[
 ['test-survivor-runtime319-contract.mjs','test-survivor-runtime320-contract.mjs'],['test-survivor-production239-contract.mjs','test-survivor-production240-contract.mjs']
]);
console.log(`Built survivor-runtime320.html (${html.length} bytes)`);
