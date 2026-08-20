import fs from 'node:fs';

let html=fs.readFileSync('survivor-runtime317.html','utf8')
  .replaceAll('content="317"','content="318"').replaceAll('Jarvis Survivor 317','Jarvis Survivor 318').replaceAll('RUNTIME 317','RUNTIME 318')
  .replace('const RUNTIME=317,MODEL_RENDERER_VERSION=7,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=12,CHOREOGRAPHY_VERSION=12,HERO_MAX_HP=760;',
    'const RUNTIME=318,MODEL_RENDERER_VERSION=8,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=13,CHOREOGRAPHY_VERSION=13,HERO_MAX_HP=780;')
  .replace("name:'JARVIS_VISIBLE_ATLAS_3D_KERNEL',version:6","name:'JARVIS_TRANSFORMING_ATLAS_3D_KERNEL',version:7")
  .replaceAll('RESILIENT_CINEMATIC_ATLAS_3D_V3','TRANSFORMING_CINEMATIC_ATLAS_3D_V4')
  .replace('hp:680+a*98+r*20,damage:4.15+a*.34+r*.055','hp:780+a*108+r*24,damage:4.1+a*.32+r*.05')
  .replace("function fighter(hero,x,h,name='GRIFFIN',accent='#72ecff'){return{hero,name,accent,x,z:.6,y:0,vx:0,vy:0,maxHp:h,hp:h,ki:100,ult:0,pose:'IDLE',poseT:0,cd:0,stun:0,inv:0,guard:0,form:0,facing:hero?1:-1,combo:0,comboTime:0,superCd:0,vanishCd:0,ai:0,flash:0}}",
    "function fighter(hero,x,h,name='GRIFFIN',accent='#72ecff'){return{hero,name,accent,x,z:.6,y:0,vx:0,vy:0,maxHp:h,hp:h,ki:100,ult:0,pose:'IDLE',poseT:0,cd:0,stun:0,inv:0,guard:0,form:0,facing:hero?1:-1,combo:0,comboTime:0,superCd:0,vanishCd:0,ai:0,flash:0,koEmitted:false}}")
  .replace("function setPose(f,p,t=.18){if(f.pose!==p&&p!=='IDLE')emit('POSE',{fighter:f.name,pose:p,previous:f.pose});f.pose=p;f.poseT=t}",
    "const TELEMETRY_POSES=new Set(['DRAGON_DASH','VANISH','PARRY','COUNTER','BEAM_CLASH','SUPER','ULTIMATE','FINISHER','TRANSFORM','VICTORY']);function setPose(f,p,t=.18){if(f.pose!==p&&TELEMETRY_POSES.has(p))emit('POSE',{fighter:f.name,pose:p,previous:f.pose});f.pose=p;f.poseT=t}")
  .replace("f.form=n;f.inv=.8;f.flash=.4;setPose(f,'TRANSFORM',.8);",
    "f.form=n;f.inv=.9;f.flash=.55;f.cd=Math.max(f.cd,.9);f.stun=Math.max(f.stun,.55);setPose(f,'TRANSFORM',.9);")
  .replace("function bind(i,carry=true){const l=LEVELS[i];asset(RIVAL_ATLASES[l.opponent]);asset(ARENA_ASSETS[l.opponent]);asset(HERO_ATLASES[cl(Math.floor(i/4),0,HERO_ATLASES.length-1)]);",
    "function bind(i,carry=true){const l=LEVELS[i],gateForm=cl(Math.floor(i/4),0,10),battleForm=cl(1+Math.floor(i/4),0,10);asset(RIVAL_ATLASES[l.opponent]);asset(ARENA_ASSETS[l.opponent]);asset(HERO_ATLASES[gateForm]);asset(HERO_ATLASES[battleForm]);")
  .replace("transform(st.hero,cl(Math.floor(i/4),0,10),'LEVEL_GATE');","transform(st.hero,Math.max(st.hero.form,gateForm),'LEVEL_GATE');")
  .replace("if(distance(a,b)>.215)","if(distance(a,b)>.205)")
  .replace("if(d>.31&&a.vanishCd<=0&&Math.random()<dt*1.8)","if(d>.2&&a.vanishCd<=0&&Math.random()<dt*2.4)")
  .replace("function startFinisher(a,b){", "function maybeTransform(){const h=st.hero,target=cl(1+Math.floor(st.level/4),0,10);if(h.form<target&&st.time-st.levelStart>=1.5&&!st.finisher&&h.stun<=0){asset(HERO_ATLASES[target]);if(assetReady(HERO_ATLASES[target])){transform(h,target,'BATTLE_ASCENSION');say('GRIFFIN',`Ascension: ${FORMS[target][0]}.`);emit('TRANSFORMATION_COMPLETE',{fighter:h.name,form:target,name:FORMS[target][0]})}}}\nfunction startFinisher(a,b){")
  .replace("const h=st.hero,b=st.boss;ai(h,b,dt);", "const h=st.hero,b=st.boss;maybeTransform();if(!st.nextPreloaded&&b.hp/b.maxHp<.72)preloadNextAssets();ai(h,b,dt);")
  .replace("function startFinisher(a,b){", "function preloadNextAssets(){const next=LEVELS[st.level+1];if(!next)return;asset(RIVAL_ATLASES[next.opponent]);asset(ARENA_ASSETS[next.opponent]);asset(HERO_ATLASES[cl(1+Math.floor((st.level+1)/4),0,10)]);st.nextPreloaded=true;emit('NEXT_LEVEL_ASSETS_QUEUED',{level:st.level+2,opponent:next.opponent})}\nfunction startFinisher(a,b){")
  .replace("st.level=i;st.destruction=0;", "st.level=i;st.destruction=0;st.nextPreloaded=false;")
  .replace("function size(){D=Math.min(2,devicePixelRatio||1);", "function size(){D=Math.min(1.5,devicePixelRatio||1);")
  .replace("fx.push({x,y:z,vx:Math.cos(q)*s,vy:Math.sin(q)*s,life:rnd(.15,.55),max:.55,color,size:rnd(1,5)})}}", "fx.push({x,y:z,vx:Math.cos(q)*s,vy:Math.sin(q)*s,life:rnd(.15,.55),max:.55,color,size:rnd(1,5)})}if(fx.length>360)fx.splice(0,fx.length-360)}")
  .replace("emit('KO',{fighter:f.b.name,by:f.a.name,method:'FINISHER'});", "emit('KO',{fighter:f.b.name,by:f.a.name,method:'FINISHER'});f.b.koEmitted=true;")
  .replace("if(b.hp<=0){snapshot('LEVEL_CLEAR');emit('LEVEL_CLEAR'", "if(b.hp<=0){if(!b.koEmitted){emit('KO',{fighter:b.name,by:h.name,method:'COMBAT'});b.koEmitted=true}snapshot('LEVEL_CLEAR');emit('LEVEL_CLEAR'")
  .replaceAll("schema:'jarvis-survivor-replay-v13'","schema:'jarvis-survivor-replay-v14'")
  .replaceAll('jarvis-survivor-replay-v13-','jarvis-survivor-replay-v14-')
  .replaceAll("replaySchema:'jarvis-survivor-replay-v13'","replaySchema:'jarvis-survivor-replay-v14'");

for(const marker of ['RUNTIME=318','MODEL_RENDERER_VERSION=8','TRANSFORMING_CINEMATIC_ATLAS_3D_V4','maybeTransform','BATTLE_ASCENSION','TRANSFORMATION_COMPLETE','TELEMETRY_POSES','koEmitted=true','preloadNextAssets','NEXT_LEVEL_ASSETS_QUEUED','Math.min(1.5','fx.length>360',"schema:'jarvis-survivor-replay-v14'"])if(!html.includes(marker))throw Error(`Runtime 318 build missing ${marker}`);
fs.writeFileSync('survivor-runtime318.html',html);

function replaceFile(path,pairs){let text=fs.readFileSync(path,'utf8');for(const[from,to]of pairs)text=text.replaceAll(from,to);fs.writeFileSync(path,text)}
replaceFile('jarvis/survivor-tab.js',[
  ['20260820runtime317visible3dv12','20260820runtime318transform3dv13'],['survivor-runtime317.html','survivor-runtime318.html'],['p.version||317','p.version||318'],
  ['Runtime 317 Visible Atlas-3D Kernel','Runtime 318 Transforming Atlas-3D Kernel'],['RUNTIME 317 // VISIBLE ATLAS-3D V12','RUNTIME 318 // TRANSFORMING ATLAS-3D V13'],
  ['runtime317 visible-atlas-3d-kernel','runtime318 transforming-atlas-3d-kernel'],['Booting Runtime 317 Visible Atlas-3D Kernel','Booting Runtime 318 Transforming Atlas-3D Kernel']
]);
replaceFile('tools/survivor-runtime-smoke.mjs',[
  ['survivor-runtime317.html','survivor-runtime318.html'],['SURVIVOR_EXPECTED_PRODUCTION||317','SURVIVOR_EXPECTED_PRODUCTION||318'],
  ['state.modelRenderer!==7','state.modelRenderer!==8'],['state.choreography!==12','state.choreography!==13'],["state.replaySchema!=='jarvis-survivor-replay-v13'","state.replaySchema!=='jarvis-survivor-replay-v14'"],
  ['await page.waitForTimeout(3000);const state=','await page.waitForTimeout(8500);const state='],
  ["levelBind:eventTypes.includes('LEVEL_BIND'),visibleFighters:","levelBind:eventTypes.includes('LEVEL_BIND'),transformed:eventTypes.includes('TRANSFORMATION_COMPLETE')&&replay.frames.some(f=>f.hero?.form>=1),visibleFighters:"],
  ['||!state.levelBind||!state.visibleFighters','||!state.levelBind||!state.transformed||!state.visibleFighters']
]);
const runtimeContract=fs.readFileSync('tools/test-survivor-runtime317-contract.mjs','utf8')
  .replaceAll('runtime317','runtime318').replaceAll('Runtime 317','Runtime 318').replaceAll('RUNTIME=317','RUNTIME=318').replaceAll('MODEL_RENDERER_VERSION=7','MODEL_RENDERER_VERSION=8')
  .replaceAll('BALANCE_VERSION=12','BALANCE_VERSION=13').replaceAll('CHOREOGRAPHY_VERSION=12','CHOREOGRAPHY_VERSION=13').replaceAll('RESILIENT_CINEMATIC_ATLAS_3D_V3','TRANSFORMING_CINEMATIC_ATLAS_3D_V4')
  .replaceAll('jarvis-survivor-replay-v13','jarvis-survivor-replay-v14').replaceAll('runtime:317','runtime:318').replaceAll("replay:'v13'","replay:'v14'")
  .replace("'ASSET_FAILED', \"emit(defense\"","'ASSET_FAILED', \"emit(defense\", 'maybeTransform', 'BATTLE_ASCENSION', 'TRANSFORMATION_COMPLETE', 'TELEMETRY_POSES', 'koEmitted=true'");
fs.writeFileSync('tools/test-survivor-runtime318-contract.mjs',runtimeContract);
const productionContract=fs.readFileSync('tools/test-survivor-production237-contract.mjs','utf8')
  .replaceAll('production237','production238').replaceAll('runtime317','runtime318').replaceAll('Runtime 317','Runtime 318').replaceAll('RUNTIME=317','RUNTIME=318').replaceAll('content="317"','content="318"')
  .replaceAll('MODEL_RENDERER_VERSION=7','MODEL_RENDERER_VERSION=8').replaceAll('BALANCE_VERSION=12','BALANCE_VERSION=13').replaceAll('CHOREOGRAPHY_VERSION=12','CHOREOGRAPHY_VERSION=13')
  .replaceAll('jarvis-survivor-replay-v13','jarvis-survivor-replay-v14').replaceAll('JARVIS_VISIBLE_ATLAS_3D_KERNEL','JARVIS_TRANSFORMING_ATLAS_3D_KERNEL')
  .replaceAll('RESILIENT_CINEMATIC_ATLAS_3D_V3','TRANSFORMING_CINEMATIC_ATLAS_3D_V4').replaceAll('20260820runtime317visible3dv12','20260820runtime318transform3dv13')
  .replaceAll('20260820runtime318visible3dv12','20260820runtime318transform3dv13')
  .replaceAll('VISIBLE ATLAS-3D V12','TRANSFORMING ATLAS-3D V13').replaceAll('SURVIVOR_EXPECTED_PRODUCTION=317','SURVIVOR_EXPECTED_PRODUCTION=318')
  .replaceAll('"runtime": 317','"runtime": 318').replaceAll('activeRuntime:317','activeRuntime:318').replaceAll('modelRenderer:7','modelRenderer:8')
  .replaceAll('balanceVersion:12','balanceVersion:13').replaceAll('choreographyVersion:12','choreographyVersion:13').replaceAll("replay:'v13/10Hz'","replay:'v14/10Hz'");
fs.writeFileSync('tools/test-survivor-production238-contract.mjs',productionContract);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml','.github/workflows/survivor-live-runtime-verify.yml'])replaceFile(path,[
  ['Runtime 317','Runtime 318'],['runtime317','runtime318'],['RUNTIME=317','RUNTIME=318'],['content="317"','content="318"'],['EXPECTED_PRODUCTION=317','EXPECTED_PRODUCTION=318'],
  ['modelRenderer:7','modelRenderer:8'],['choreography:12','choreography:13'],['MODEL_RENDERER_VERSION=7','MODEL_RENDERER_VERSION=8'],
  ['RESILIENT_CINEMATIC_ATLAS_3D_V3','TRANSFORMING_CINEMATIC_ATLAS_3D_V4'],['jarvis-survivor-replay-v13','jarvis-survivor-replay-v14'],
  ['20260820runtime317visible3dv12','20260820runtime318transform3dv13'],['RUNTIME 317 // VISIBLE ATLAS-3D V12','RUNTIME 318 // TRANSFORMING ATLAS-3D V13'],
  ['20260820runtime318visible3dv12','20260820runtime318transform3dv13'],
  ['runtime:317','runtime:318'],['runtime": 317','runtime": 318'],['VISIBLE_ATLAS_3D_V12','TRANSFORMING_ATLAS_3D_V13']
]);
for(const path of ['.github/workflows/pages.yml','.github/workflows/survivor-pages-231.yml'])replaceFile(path,[
  ['test-survivor-runtime317-contract.mjs','test-survivor-runtime318-contract.mjs'],['test-survivor-production237-contract.mjs','test-survivor-production238-contract.mjs']
]);
console.log(`Built survivor-runtime318.html (${html.length} bytes)`);
