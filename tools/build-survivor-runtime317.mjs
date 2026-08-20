import fs from 'node:fs';

let html = fs.readFileSync('survivor-runtime316.html', 'utf8')
  .replaceAll('content="316"', 'content="317"')
  .replaceAll('Jarvis Survivor 316', 'Jarvis Survivor 317')
  .replaceAll('RUNTIME 316', 'RUNTIME 317')
  .replace(
    'const RUNTIME=316,MODEL_RENDERER_VERSION=6,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=11,CHOREOGRAPHY_VERSION=11,HERO_MAX_HP=760;',
    'const RUNTIME=317,MODEL_RENDERER_VERSION=7,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=12,CHOREOGRAPHY_VERSION=12,HERO_MAX_HP=760;'
  )
  .replace(
    "const JARVIS_KERNEL=Object.freeze({name:'JARVIS_CINEMATIC_ATLAS_3D_KERNEL',version:5,fixedStep:1/60,maxCatchUp:.1,renderer:'CINEMATIC_ATLAS_EXTRUSION_3D_V2',replayHz:10});",
    "const JARVIS_KERNEL=Object.freeze({name:'JARVIS_VISIBLE_ATLAS_3D_KERNEL',version:6,fixedStep:1/60,maxCatchUp:.1,renderer:'RESILIENT_CINEMATIC_ATLAS_3D_V3',replayHz:10});"
  )
  .replaceAll('CINEMATIC_ATLAS_EXTRUSION_3D_V2', 'RESILIENT_CINEMATIC_ATLAS_3D_V3')
  .replace(
    "const atlasCache=new Map(),assetStats={requested:0,loaded:0,failed:0};\nfunction asset(path){if(atlasCache.has(path))return atlasCache.get(path);const img=new Image();img.decoding='async';img.src=ASSET_ROOT+path;assetStats.requested++;img.onload=()=>assetStats.loaded++;img.onerror=()=>assetStats.failed++;atlasCache.set(path,img);return img}\n[HERO_ATLASES[0],HERO_ATLASES[1],RIVAL_ATLASES.LIRA,ARENA_ASSETS.LIRA].forEach(asset);",
    `const atlasCache=new Map(),assetRecords=new Map(),assetStats={requested:0,loaded:0,failed:0,retried:0,byPath:{}};
function syncAssetStats(){assetStats.loaded=0;assetStats.failed=0;for(const r of assetRecords.values()){if(r.status==='loaded')assetStats.loaded++;if(r.status==='failed')assetStats.failed++;assetStats.byPath[r.path]={status:r.status,attempts:r.attempts}}}
function loadAssetRecord(r,retry=false){r.attempts++;r.status=retry?'retrying':'loading';if(retry)assetStats.retried++;syncAssetStats();const img=new Image();img.decoding='async';img.onload=()=>{r.img=img;r.status='loaded';syncAssetStats();emitAssetEvent('ASSET_LOADED',r)};img.onerror=()=>{if(r.attempts<3){setTimeout(()=>loadAssetRecord(r,true),120*r.attempts)}else{r.status='failed';syncAssetStats();emitAssetEvent('ASSET_FAILED',r)}};img.src=ASSET_ROOT+r.path+(retry?'?retry='+r.attempts:'');r.img=img;atlasCache.set(r.path,img);return img}
function emitAssetEvent(type,r){if(replay?.events)emit(type,{path:r.path,attempts:r.attempts,status:r.status})}
function asset(path){let r=assetRecords.get(path);if(r)return r.img;r={path,status:'queued',attempts:0,img:null};assetRecords.set(path,r);assetStats.requested++;return loadAssetRecord(r)}
function assetReady(path){return assetRecords.get(path)?.status==='loaded'}
async function awaitCriticalAssets(){const critical=[HERO_ATLASES[0],RIVAL_ATLASES.LIRA,ARENA_ASSETS.LIRA];critical.forEach(asset);const deadline=performance.now()+5000;while(performance.now()<deadline&&!critical.every(assetReady))await new Promise(r=>setTimeout(r,50));syncAssetStats();return critical.every(assetReady)}
[HERO_ATLASES[0],HERO_ATLASES[1],RIVAL_ATLASES.LIRA,ARENA_ASSETS.LIRA].forEach(asset);`
  )
  .replace(
    "function setPose(f,p,t=.18){if(f.pose!==p)emit('POSE',{fighter:f.name,pose:p,previous:f.pose});f.pose=p;f.poseT=t}",
    "function setPose(f,p,t=.18){if(f.pose!==p&&p!=='IDLE')emit('POSE',{fighter:f.name,pose:p,previous:f.pose});f.pose=p;f.poseT=t}"
  )
  .replace(
    "if(distance(a,b)>.17){a.vx+=a.facing*.08;a.combo=0;a.comboTime=0;emit('WHIFF'",
    "if(distance(a,b)>.215){a.vx+=a.facing*.1;a.combo=0;a.comboTime=0;emit('WHIFF'"
  )
  .replace(
    "if(d>.38&&a.vanishCd<=0&&Math.random()<dt*1.25)",
    "if(d>.31&&a.vanishCd<=0&&Math.random()<dt*1.8)"
  )
  .replace(
    "if(b.cd>.15&&r<.18){a.guard=.42;setPose(a,r<.07?'COUNTER':'PARRY',.3);return}",
    "if(b.cd>.15&&r<.2){a.guard=.42;const defense=r<.08?'COUNTER':'PARRY';setPose(a,defense,.3);emit(defense,{fighter:a.name,against:b.name,successful:true});return}"
  )
  .replace("if(d<.21){const moves=", "if(d<.225){const moves=")
  .replace(
    "function beam(a,b,ultimate=false){if(a.cd>0||a.ki<(ultimate?70:35))return;",
    "function beam(a,b,ultimate=false){if(a.cd>0||a.ki<(ultimate?70:35))return;const opposing=beams.find(q=>q.from===b&&q.to===a&&q.life>0);if(opposing){setPose(a,'BEAM_CLASH',.55);setPose(b,'BEAM_CLASH',.55);st.shake=Math.max(st.shake,.07);emit('BEAM_CLASH',{fighter:a.name,against:b.name});}"
  )
  .replace(
    "function drawFighter(f){const p=project(f),img=fighterAtlas(f),frame=spriteFrame(f)",
    "function fallbackFighter(f,p,w,h){X.save();X.globalAlpha=1;X.fillStyle='#07111f';X.strokeStyle=f.accent;X.lineWidth=5;X.shadowBlur=20;X.shadowColor=f.accent;X.beginPath();X.arc(0,-h*.78,w*.15,0,Math.PI*2);X.fill();X.stroke();X.beginPath();X.moveTo(0,-h*.63);X.lineTo(0,-h*.28);X.moveTo(0,-h*.54);X.lineTo(-w*.27,-h*.38);X.moveTo(0,-h*.54);X.lineTo(w*.27,-h*.38);X.moveTo(0,-h*.28);X.lineTo(-w*.22,0);X.moveTo(0,-h*.28);X.lineTo(w*.22,0);X.stroke();X.scale(f.facing,1);X.fillStyle=f.accent;X.font='900 14px system-ui';X.textAlign='center';X.fillText(f.name,0,-h-12);X.restore()}\nfunction drawFighter(f){const p=project(f),img=fighterAtlas(f),frame=spriteFrame(f)"
  )
  .replace(
    "}else{X.filter='none';X.globalAlpha=1;X.fillStyle=f.accent;X.fillRect(-26,-110,52,110)}X.restore()}",
    "}else{X.filter='none';fallbackFighter(f,p,Math.max(w,120),Math.max(h,220))}X.restore()}"
  )
  .replace(
    "function boot(){cancelAnimationFrame(raf);replay=",
    "async function boot(){cancelAnimationFrame(raf);U.start.hidden=true;U.status.textContent='LOADING FIGHTERS';const criticalReady=await awaitCriticalAssets();replay="
  )
  .replace(
    "emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'RESILIENT_CINEMATIC_ATLAS_3D_V3',kernel:JARVIS_KERNEL.name,assets:{...assetStats}});bind(0,false);snapshot('BOOT_COMPLETE');U.start.hidden=true;",
    "emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'RESILIENT_CINEMATIC_ATLAS_3D_V3',kernel:JARVIS_KERNEL.name,criticalReady,assets:structuredClone(assetStats)});bind(0,false);snapshot('BOOT_COMPLETE');"
  )
  .replaceAll("schema:'jarvis-survivor-replay-v12'", "schema:'jarvis-survivor-replay-v13'")
  .replaceAll('jarvis-survivor-replay-v12-', 'jarvis-survivor-replay-v13-')
  .replaceAll("replaySchema:'jarvis-survivor-replay-v12'", "replaySchema:'jarvis-survivor-replay-v13'")
  .replace(
    "assets:{...assetStats},hero:fighterState(st.hero)",
    "assets:structuredClone(assetStats),visibility:{heroAtlasReady:assetReady(HERO_ATLASES[st.hero.form]),bossAtlasReady:assetReady(RIVAL_ATLASES[st.boss.name]),fallbackActive:!assetReady(HERO_ATLASES[st.hero.form])||!assetReady(RIVAL_ATLASES[st.boss.name])},hero:fighterState(st.hero)"
  )
  .replace(
    "$('deploy').onclick=boot;",
    "function exportReplay(){if(st?.finisher){emit('EXPORT_DEFERRED',{reason:'FINISHER_ACTIVE'});return null}snapshot('EXPORT');return structuredClone({...replay,exportedAt:new Date().toISOString(),complete:!st?.running})}globalThis.exportSurvivorReplay=exportReplay;$('deploy').onclick=boot;"
  )
  .replace(
    "$('replay').onclick=()=>{const blob=new Blob([JSON.stringify(replay,null,2)]",
    "$('replay').onclick=()=>{const payload=exportReplay();if(!payload){$('replay').textContent='FINISHING…';setTimeout(()=>{$('replay').textContent='EXPORT REPLAY'},900);return}const blob=new Blob([JSON.stringify(payload,null,2)]"
  )
  .replace("getReplay:()=>structuredClone(replay),start:boot", "getReplay:()=>structuredClone(replay),exportReplay,start:boot");

for (const marker of ['RUNTIME=317','MODEL_RENDERER_VERSION=7','RESILIENT_CINEMATIC_ATLAS_3D_V3',"schema:'jarvis-survivor-replay-v13'",'awaitCriticalAssets','fallbackFighter','heroAtlasReady',"emit(defense",'BEAM_CLASH','exportReplay']) {
  if (!html.includes(marker)) throw new Error(`Runtime 317 build missing ${marker}`);
}
fs.writeFileSync('survivor-runtime317.html', html);

function replaceFile(path, pairs) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of pairs) text = text.replaceAll(from, to);
  fs.writeFileSync(path, text);
}
replaceFile('jarvis/survivor-tab.js', [
  ['20260820runtime316cinematic3dv11','20260820runtime317visible3dv12'],
  ['survivor-runtime316.html','survivor-runtime317.html'],
  ['p.version||316','p.version||317'],
  ['Runtime 316 Cinematic Atlas-3D Kernel','Runtime 317 Visible Atlas-3D Kernel'],
  ['RUNTIME 316 // CINEMATIC ATLAS-3D V11','RUNTIME 317 // VISIBLE ATLAS-3D V12'],
  ['runtime316 cinematic-atlas-3d-kernel','runtime317 visible-atlas-3d-kernel'],
  ['Booting Runtime 316 Cinematic Atlas-3D Kernel','Booting Runtime 317 Visible Atlas-3D Kernel'],
  ["p=w?.exportSurvivorReplay?.()||w?.JarvisSurvivor?.exportReplay?.();if(!p)throw Error('Replay unavailable')","p=w?.exportSurvivorReplay?.()||w?.JarvisSurvivor?.exportReplay?.();if(!p){b.textContent='FINISHING';setTimeout(()=>b.textContent='REPLAY',1000);return}"]
]);
replaceFile('tools/survivor-runtime-smoke.mjs', [
  ['survivor-runtime316.html','survivor-runtime317.html'],
  ['SURVIVOR_EXPECTED_PRODUCTION||316','SURVIVOR_EXPECTED_PRODUCTION||317'],
  ['state.modelRenderer!==6','state.modelRenderer!==7'],
  ['state.choreography!==11','state.choreography!==12'],
  ["state.replaySchema!=='jarvis-survivor-replay-v12'","state.replaySchema!=='jarvis-survivor-replay-v13'"],
  ["levelBind:eventTypes.includes('LEVEL_BIND'),finiteFrames:replay.frames.every","levelBind:eventTypes.includes('LEVEL_BIND'),visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),finiteFrames:replay.frames.every"],
  ['||!state.levelBind||!state.finiteFrames','||!state.levelBind||!state.visibleFighters||!state.finiteFrames']
]);
replaceFile('tools/survivor-runtime-smoke.mjs', [
  ["visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),","visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),"],
  ["visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),","visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),"],
  ['||!state.visibleFighters||!state.visibleFighters||!state.visibleFighters','||!state.visibleFighters']
]);
const runtimeContract = fs.readFileSync('tools/test-survivor-runtime316-contract.mjs','utf8')
  .replaceAll('runtime316','runtime317').replaceAll('Runtime 316','Runtime 317').replaceAll('RUNTIME=316','RUNTIME=317')
  .replaceAll('MODEL_RENDERER_VERSION=6','MODEL_RENDERER_VERSION=7').replaceAll('BALANCE_VERSION=11','BALANCE_VERSION=12')
  .replaceAll('CHOREOGRAPHY_VERSION=11','CHOREOGRAPHY_VERSION=12').replaceAll('CINEMATIC_ATLAS_EXTRUSION_3D_V2','RESILIENT_CINEMATIC_ATLAS_3D_V3')
  .replaceAll("jarvis-survivor-replay-v12","jarvis-survivor-replay-v13").replaceAll('runtime:316','runtime:317').replaceAll("replay:'v12'","replay:'v13'")
  .replace("'arenas/lira-nexus-v1.webp'", "'arenas/lira-nexus-v1.webp', 'awaitCriticalAssets', 'fallbackFighter', 'heroAtlasReady', 'ASSET_FAILED', \"emit(defense\"");
fs.writeFileSync('tools/test-survivor-runtime317-contract.mjs',runtimeContract);
const productionContract = fs.readFileSync('tools/test-survivor-production236-contract.mjs','utf8')
  .replaceAll('production236','production237').replaceAll('runtime316','runtime317').replaceAll('Runtime 316','Runtime 317')
  .replaceAll('RUNTIME=316','RUNTIME=317').replaceAll('content="316"','content="317"').replaceAll('MODEL_RENDERER_VERSION=6','MODEL_RENDERER_VERSION=7')
  .replaceAll('BALANCE_VERSION=11','BALANCE_VERSION=12').replaceAll('CHOREOGRAPHY_VERSION=11','CHOREOGRAPHY_VERSION=12')
  .replaceAll('jarvis-survivor-replay-v12','jarvis-survivor-replay-v13').replaceAll('JARVIS_CINEMATIC_ATLAS_3D_KERNEL','JARVIS_VISIBLE_ATLAS_3D_KERNEL')
  .replaceAll('CINEMATIC_ATLAS_EXTRUSION_3D_V2','RESILIENT_CINEMATIC_ATLAS_3D_V3').replaceAll('20260820runtime316cinematic3dv11','20260820runtime317visible3dv12')
  .replaceAll('20260820runtime317cinematic3dv11','20260820runtime317visible3dv12')
  .replaceAll('CINEMATIC ATLAS-3D V11','VISIBLE ATLAS-3D V12').replaceAll('activeRuntime:316','activeRuntime:317')
  .replaceAll('modelRenderer:6','modelRenderer:7').replaceAll('balanceVersion:11','balanceVersion:12').replaceAll('choreographyVersion:11','choreographyVersion:12').replaceAll("replay:'v12/10Hz'","replay:'v13/10Hz'");
const production317Contract = productionContract.replaceAll('SURVIVOR_EXPECTED_PRODUCTION=316','SURVIVOR_EXPECTED_PRODUCTION=317').replaceAll('"runtime": 316','"runtime": 317');
fs.writeFileSync('tools/test-survivor-production237-contract.mjs',production317Contract);
for (const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml','.github/workflows/survivor-live-runtime-verify.yml']) replaceFile(path, [
  ['Runtime 316','Runtime 317'],['runtime316','runtime317'],['RUNTIME=316','RUNTIME=317'],['content="316"','content="317"'],
  ['EXPECTED_PRODUCTION=316','EXPECTED_PRODUCTION=317'],['modelRenderer:6','modelRenderer:7'],['choreography:11','choreography:12'],
  ['MODEL_RENDERER_VERSION=6','MODEL_RENDERER_VERSION=7'],['CINEMATIC_ATLAS_EXTRUSION_3D_V2','RESILIENT_CINEMATIC_ATLAS_3D_V3'],
  ['jarvis-survivor-replay-v12','jarvis-survivor-replay-v13'],['20260820runtime316cinematic3dv11','20260820runtime317visible3dv12'],
  ['20260820runtime317cinematic3dv11','20260820runtime317visible3dv12'],
  ['RUNTIME 316 // CINEMATIC ATLAS-3D V11','RUNTIME 317 // VISIBLE ATLAS-3D V12'],['runtime:316','runtime:317'],['runtime": 316','runtime": 317'],
  ['CINEMATIC_ATLAS_3D_V11','VISIBLE_ATLAS_3D_V12']
]);
for (const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml']) replaceFile(path, [
  ['test-survivor-runtime316-contract.mjs','test-survivor-runtime317-contract.mjs'],
  ['test-survivor-production236-contract.mjs','test-survivor-production237-contract.mjs']
]);
console.log(`Built survivor-runtime317.html (${html.length} bytes)`);
