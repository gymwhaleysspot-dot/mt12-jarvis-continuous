import fs from 'node:fs';

let html=fs.readFileSync('survivor-runtime318.html','utf8')
  .replaceAll('content="318"','content="319"').replaceAll('Jarvis Survivor 318','Jarvis Survivor 319').replaceAll('RUNTIME 318','RUNTIME 319')
  .replace('const RUNTIME=318,MODEL_RENDERER_VERSION=8,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=13,CHOREOGRAPHY_VERSION=13,HERO_MAX_HP=780;',
    'const RUNTIME=319,MODEL_RENDERER_VERSION=9,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=13,CHOREOGRAPHY_VERSION=14,HERO_MAX_HP=780;')
  .replace("name:'JARVIS_TRANSFORMING_ATLAS_3D_KERNEL',version:7","name:'JARVIS_CINEMATIC_GRAPHICS_KERNEL',version:8")
  .replaceAll('TRANSFORMING_CINEMATIC_ATLAS_3D_V4','CINEMATIC_CEL_ATLAS_3D_V5')
  .replace('let replay,fx,beams,slashes,lastReplayFrame=0,moveSerial=0;',
    "const GRAPHICS_PROFILE=Object.freeze({celRim:true,arenaDepth:true,shockwaves:true,speedLines:true,impactFrames:true,cinematicBars:true,colorGrade:true,reflectionFloor:true,mobileDpr:1.5,particleCap:360});let replay,fx,beams,slashes,rings,lastReplayFrame=0,moveSerial=0;")
  .replace("function size(){D=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;C.width=W*D;C.height=H*D;X.setTransform(D,0,0,D,0,0)}",
    "function size(){D=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;C.width=W*D;C.height=H*D;X.setTransform(D,0,0,D,0,0);X.imageSmoothingEnabled=true;X.imageSmoothingQuality='high'}")
  .replace("function transform(f,n,reason){", "function shockwave(x,z,color,power=1){rings.push({x,z,color,life:.42*power,max:.42*power,r:16,power});if(rings.length>24)rings.shift()}\nfunction transform(f,n,reason){")
  .replace("burst(f.x,f.z,FORMS[n][1],48);emit('FORM_CHANGE'", "burst(f.x,f.z,FORMS[n][1],48);shockwave(f.x,f.z,FORMS[n][1],1.8);emit('FORM_CHANGE'")
  .replace("slashes.push({x:(a.x+b.x)/2,z:(a.z+b.z)/2,life:.12,color:a.accent,heavy});emit('HIT'",
    "slashes.push({x:(a.x+b.x)/2,z:(a.z+b.z)/2,life:.12,color:a.accent,heavy});if(heavy)shockwave(b.x,b.z,a.accent,1.15);emit('HIT'")
  .replace("burst(f.b.x,f.b.z,f.a.accent,72);emit('FINISHER_IMPACT'", "burst(f.b.x,f.b.z,f.a.accent,72);shockwave(f.b.x,f.b.z,f.a.accent,2.5);emit('FINISHER_IMPACT'")
  .replace("for(const q of slashes)q.life-=dt;slashes=slashes.filter(q=>q.life>0);",
    "for(const q of slashes)q.life-=dt;slashes=slashes.filter(q=>q.life>0);for(const q of rings){q.life-=dt;q.r+=dt*230*q.power}rings=rings.filter(q=>q.life>0);")
  .replaceAll('fx=[];beams=[];slashes=[];','fx=[];beams=[];slashes=[];rings=[];')
  .replace("function drawFx(){", `function drawArenaDepth(){const floor=H*.75,hue=LEVELS[st.level].color;X.save();X.globalCompositeOperation='screen';let g=X.createRadialGradient(W*.5,H*.54,0,W*.5,H*.54,W*.58);g.addColorStop(0,hue+'28');g.addColorStop(.4,hue+'0d');g.addColorStop(1,'transparent');X.fillStyle=g;X.fillRect(0,H*.28,W,H*.58);X.globalAlpha=.15;for(let i=0;i<14;i++){const x=(i*193+st.level*71+st.time*9*(i%2?1:-1))%(W+120)-60,y=H*(.38+(i*47%310)/1000);X.fillStyle=i%3?hue:'#dff8ff';X.beginPath();X.moveTo(x,y);X.lineTo(x+4+(i%5)*2,y-10-(i%4)*7);X.lineTo(x+8+(i%3)*3,y+2);X.closePath();X.fill()}X.globalCompositeOperation='source-over';g=X.createLinearGradient(0,floor-24,0,H);g.addColorStop(0,'rgba(255,255,255,.055)');g.addColorStop(.25,hue+'12');g.addColorStop(1,'rgba(0,0,0,.38)');X.fillStyle=g;X.fillRect(0,floor-24,W,H-floor+24);X.restore()}
function drawSpeedLines(){const active=[st.hero,st.boss].some(f=>/DRAGON_DASH|VANISH|BEAM|ULTIMATE|FINISHER|TRANSFORM/.test(f.pose));if(!active)return;X.save();X.globalCompositeOperation='screen';X.translate(W/2,H*.52);X.lineCap='round';for(let i=0;i<28;i++){const a=(i/28)*Math.PI*2+st.time*.45,len=50+(i*37)%150,r=150+(i*53)%Math.max(170,W*.46);X.globalAlpha=.025+(i%5)*.012;X.strokeStyle=i%3?'#dff7ff':FORMS[st.hero.form][1];X.lineWidth=1+(i%3);X.beginPath();X.moveTo(Math.cos(a)*r,Math.sin(a)*r*.72);X.lineTo(Math.cos(a)*(r+len),Math.sin(a)*(r+len)*.72);X.stroke()}X.restore()}
function drawCinematicGrade(){X.save();let g=X.createRadialGradient(W/2,H*.48,Math.min(W,H)*.16,W/2,H*.48,Math.max(W,H)*.72);g.addColorStop(0,'transparent');g.addColorStop(.72,'rgba(4,3,18,.08)');g.addColorStop(1,'rgba(0,0,8,.58)');X.fillStyle=g;X.fillRect(0,0,W,H);const cinema=[st.hero,st.boss].some(f=>/ULTIMATE|FINISHER|TRANSFORM|BEAM_CLASH/.test(f.pose));if(cinema){const bar=Math.max(10,H*.027);X.fillStyle='rgba(0,0,8,.82)';X.fillRect(0,0,W,bar);X.fillRect(0,H-bar,W,bar);X.globalCompositeOperation='screen';X.globalAlpha=.08;X.fillStyle=FORMS[st.hero.form][1];X.fillRect(0,bar,W,H-bar*2)}if(st.hitstop>0){X.globalCompositeOperation='screen';X.globalAlpha=cl(st.hitstop*5,0,.32);X.fillStyle='#fff';X.fillRect(0,0,W,H)}X.restore()}
function drawFx(){`)
  .replace("for(const q of slashes){const p=", "for(const q of rings){const p={x:q.x*W,y:H*(.74-q.z*.18)};X.globalAlpha=cl(q.life/q.max,0,1)*.72;X.strokeStyle=q.color;X.lineWidth=Math.max(2,7*q.life/q.max);X.shadowBlur=16;X.shadowColor=q.color;X.beginPath();X.ellipse(p.x,p.y-35,q.r,q.r*.34,0,0,Math.PI*2);X.stroke()}for(const q of slashes){const p=")
  .replace("function render(){X.save();const zoom=1.04+Math.max(0,.34-distance(st.hero,st.boss))*.16,sh=st.shake||0;",
    "function render(){X.save();const cinematic=[st.hero,st.boss].some(f=>/ULTIMATE|FINISHER|TRANSFORM|BEAM_CLASH/.test(f.pose)),zoom=1.04+Math.max(0,.34-distance(st.hero,st.boss))*.16+(cinematic?.045:0),sh=st.shake||0;")
  .replace("arena();const order=", "arena();drawArenaDepth();drawSpeedLines();const order=")
  .replace("X.globalAlpha=1}X.restore()}", "X.globalAlpha=1}X.restore();drawCinematicGrade()}")
  .replace("assetStats,replaySchema:'jarvis-survivor-replay-v14'", "assetStats,graphicsProfile:GRAPHICS_PROFILE,replaySchema:'jarvis-survivor-replay-v15'")
  .replaceAll("schema:'jarvis-survivor-replay-v14'","schema:'jarvis-survivor-replay-v15'")
  .replaceAll('jarvis-survivor-replay-v14-','jarvis-survivor-replay-v15-')
  .replace('</style>',`.hud,.top,.bottom{filter:drop-shadow(0 10px 18px rgba(0,0,12,.32))}.panel,.metric,.cinematic{backdrop-filter:blur(12px) saturate(1.25)}#act{box-shadow:0 0 24px rgba(100,235,255,.18),inset 0 0 18px rgba(120,100,255,.1)}#status{text-shadow:0 0 14px rgba(110,235,255,.75)}canvas{filter:saturate(1.08) contrast(1.035)}\n</style>`);

for(const marker of ['RUNTIME=319','MODEL_RENDERER_VERSION=9','CINEMATIC_CEL_ATLAS_3D_V5','GRAPHICS_PROFILE','drawArenaDepth','drawSpeedLines','drawCinematicGrade','shockwave','rings.push','imageSmoothingQuality',"schema:'jarvis-survivor-replay-v15'"])if(!html.includes(marker))throw Error(`Runtime 319 build missing ${marker}`);
fs.writeFileSync('survivor-runtime319.html',html);

function replaceFile(path,pairs){let text=fs.readFileSync(path,'utf8');for(const[from,to]of pairs)text=text.replaceAll(from,to);fs.writeFileSync(path,text)}
replaceFile('jarvis/survivor-tab.js',[
 ['20260820runtime318transform3dv13','20260820runtime319graphics3dv14'],['survivor-runtime318.html','survivor-runtime319.html'],['p.version||318','p.version||319'],
 ['Runtime 318 Transforming Atlas-3D Kernel','Runtime 319 Cinematic Graphics Kernel'],['RUNTIME 318 // TRANSFORMING ATLAS-3D V13','RUNTIME 319 // CINEMATIC GRAPHICS V14'],
 ['runtime318 transforming-atlas-3d-kernel','runtime319 cinematic-graphics-kernel'],['Booting Runtime 318 Transforming Atlas-3D Kernel','Booting Runtime 319 Cinematic Graphics Kernel']
]);
replaceFile('tools/survivor-runtime-smoke.mjs',[
 ['survivor-runtime318.html','survivor-runtime319.html'],['SURVIVOR_EXPECTED_PRODUCTION||318','SURVIVOR_EXPECTED_PRODUCTION||319'],['state.modelRenderer!==8','state.modelRenderer!==9'],
 ['state.choreography!==13','state.choreography!==14'],["state.replaySchema!=='jarvis-survivor-replay-v14'","state.replaySchema!=='jarvis-survivor-replay-v15'"]
]);
const runtimeContract=fs.readFileSync('tools/test-survivor-runtime318-contract.mjs','utf8')
 .replaceAll('runtime318','runtime319').replaceAll('Runtime 318','Runtime 319').replaceAll('RUNTIME=318','RUNTIME=319').replaceAll('MODEL_RENDERER_VERSION=8','MODEL_RENDERER_VERSION=9')
 .replaceAll('CHOREOGRAPHY_VERSION=13','CHOREOGRAPHY_VERSION=14').replaceAll('TRANSFORMING_CINEMATIC_ATLAS_3D_V4','CINEMATIC_CEL_ATLAS_3D_V5')
 .replaceAll('jarvis-survivor-replay-v14','jarvis-survivor-replay-v15').replaceAll('runtime:318','runtime:319').replaceAll("replay:'v14'","replay:'v15'")
 .replace("'koEmitted=true'","'koEmitted=true', 'GRAPHICS_PROFILE', 'drawArenaDepth', 'drawSpeedLines', 'drawCinematicGrade', 'shockwave', 'imageSmoothingQuality'");
fs.writeFileSync('tools/test-survivor-runtime319-contract.mjs',runtimeContract);
const productionContract=fs.readFileSync('tools/test-survivor-production238-contract.mjs','utf8')
 .replaceAll('production238','production239').replaceAll('runtime318','runtime319').replaceAll('Runtime 318','Runtime 319').replaceAll('RUNTIME=318','RUNTIME=319').replaceAll('content="318"','content="319"')
 .replaceAll('MODEL_RENDERER_VERSION=8','MODEL_RENDERER_VERSION=9').replaceAll('CHOREOGRAPHY_VERSION=13','CHOREOGRAPHY_VERSION=14').replaceAll('jarvis-survivor-replay-v14','jarvis-survivor-replay-v15')
 .replaceAll('JARVIS_TRANSFORMING_ATLAS_3D_KERNEL','JARVIS_CINEMATIC_GRAPHICS_KERNEL').replaceAll('TRANSFORMING_CINEMATIC_ATLAS_3D_V4','CINEMATIC_CEL_ATLAS_3D_V5')
 .replaceAll('20260820runtime318transform3dv13','20260820runtime319graphics3dv14').replaceAll('TRANSFORMING ATLAS-3D V13','CINEMATIC GRAPHICS V14')
 .replaceAll('20260820runtime319transform3dv13','20260820runtime319graphics3dv14')
 .replaceAll('SURVIVOR_EXPECTED_PRODUCTION=318','SURVIVOR_EXPECTED_PRODUCTION=319').replaceAll('"runtime": 318','"runtime": 319').replaceAll('activeRuntime:318','activeRuntime:319')
 .replaceAll('modelRenderer:8','modelRenderer:9').replaceAll('choreographyVersion:13','choreographyVersion:14').replaceAll("replay:'v14/10Hz'","replay:'v15/10Hz'");
fs.writeFileSync('tools/test-survivor-production239-contract.mjs',productionContract);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml','.github/workflows/survivor-live-runtime-verify.yml'])replaceFile(path,[
 ['Runtime 318','Runtime 319'],['runtime318','runtime319'],['RUNTIME=318','RUNTIME=319'],['content="318"','content="319"'],['EXPECTED_PRODUCTION=318','EXPECTED_PRODUCTION=319'],
 ['modelRenderer:8','modelRenderer:9'],['choreography:13','choreography:14'],['MODEL_RENDERER_VERSION=8','MODEL_RENDERER_VERSION=9'],
 ['TRANSFORMING_CINEMATIC_ATLAS_3D_V4','CINEMATIC_CEL_ATLAS_3D_V5'],['jarvis-survivor-replay-v14','jarvis-survivor-replay-v15'],
 ['20260820runtime318transform3dv13','20260820runtime319graphics3dv14'],['RUNTIME 318 // TRANSFORMING ATLAS-3D V13','RUNTIME 319 // CINEMATIC GRAPHICS V14'],
 ['20260820runtime319transform3dv13','20260820runtime319graphics3dv14'],
 ['runtime:318','runtime:319'],['runtime": 318','runtime": 319'],['TRANSFORMING_ATLAS_3D_V13','CINEMATIC_GRAPHICS_3D_V14']
]);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml'])replaceFile(path,[
 ['test-survivor-runtime318-contract.mjs','test-survivor-runtime319-contract.mjs'],['test-survivor-production238-contract.mjs','test-survivor-production239-contract.mjs']
]);
console.log(`Built survivor-runtime319.html (${html.length} bytes)`);
