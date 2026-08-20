import fs from 'node:fs';

const source = fs.readFileSync('survivor-runtime315.html', 'utf8');
let html = source
  .replaceAll('content="315"', 'content="316"')
  .replaceAll('Jarvis Survivor 315', 'Jarvis Survivor 316')
  .replaceAll('RUNTIME 315', 'RUNTIME 316')
  .replace('JARVIS ATLAS-3D KERNEL V4', 'JARVIS CINEMATIC ATLAS-3D KERNEL V5')
  .replace(
    'const RUNTIME=315,MODEL_RENDERER_VERSION=5,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=10,CHOREOGRAPHY_VERSION=10,HERO_MAX_HP=700;',
    'const RUNTIME=316,MODEL_RENDERER_VERSION=6,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=11,CHOREOGRAPHY_VERSION=11,HERO_MAX_HP=760;'
  )
  .replace(
    "const JARVIS_KERNEL=Object.freeze({name:'JARVIS_ATLAS_3D_KERNEL',version:4,fixedStep:1/60,maxCatchUp:.1,renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1'});",
    "const JARVIS_KERNEL=Object.freeze({name:'JARVIS_CINEMATIC_ATLAS_3D_KERNEL',version:5,fixedStep:1/60,maxCatchUp:.1,renderer:'CINEMATIC_ATLAS_EXTRUSION_3D_V2',replayHz:10});"
  )
  .replaceAll("renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1'", "renderer:'CINEMATIC_ATLAS_EXTRUSION_3D_V2'")
  .replaceAll("'AUTHORED_ATLAS_EXTRUSION_3D_V1'", "'CINEMATIC_ATLAS_EXTRUSION_3D_V2'")
  .replace("const LEVELS=[];for(let a=0;a<5;a++)for(let r=0;r<9;r++){const rv=RIVALS[(r+a*2)%9];LEVELS.push({id:a*9+r+1,act:a+1,opponent:rv[0],color:rv[1],arena:ARENAN[(r+a*2)%9]+' // '+ACTS[a][0],hp:680+a*105+r*22,damage:5+a*.42+r*.07,speed:1+a*.04+r*.008})}",
    "const LEVELS=[];for(let a=0;a<5;a++)for(let r=0;r<9;r++){const rv=RIVALS[(r+a*2)%9];LEVELS.push({id:a*9+r+1,act:a+1,opponent:rv[0],color:rv[1],arena:ARENAN[(r+a*2)%9]+' // '+ACTS[a][0],hp:680+a*98+r*20,damage:4.15+a*.34+r*.055,speed:1+a*.035+r*.007})}")
  .replace("let replay,fx,beams,slashes;", "let replay,fx,beams,slashes,lastReplayFrame=0,moveSerial=0;")
  .replace("form:0,facing:hero?1:-1,combo:0,superCd:0", "form:0,facing:hero?1:-1,combo:0,comboTime:0,superCd:0")
  .replace("st.hero.hp=carry?Math.min(HERO_MAX_HP,st.hero.hp+210):HERO_MAX_HP;", "st.hero.hp=carry?Math.min(HERO_MAX_HP,st.hero.hp+280):HERO_MAX_HP;st.hero.combo=0;st.hero.comboTime=0;")
  .replace(
    "function hit(a,b,power,heavy=false,launch=false){if(b.inv>0)return false;let amount=power*(b.guard>0?.24:1);b.hp=Math.max(0,b.hp-amount);",
    "function hit(a,b,power,heavy=false,launch=false,move=a.pose){if(b.inv>0)return false;const hpBefore=b.hp;let amount=power*(b.guard>0?.24:1);b.hp=Math.max(0,b.hp-amount);b.combo=0;b.comboTime=0;a.combo=a.comboTime>0?a.combo+1:1;a.comboTime=.82;"
  )
  .replace(
    "emit('HIT',{from:a.name,to:b.name,damage:+amount.toFixed(1),heavy,launch});return true}",
    "emit('HIT',{strikeId:++moveSerial,from:a.name,to:b.name,move,damage:+amount.toFixed(1),hpBefore:+hpBefore.toFixed(1),hpAfter:+b.hp.toFixed(1),guarded:b.guard>0,heavy,launch,combo:a.combo});if(a.combo>1)emit('COMBO',{fighter:a.name,count:a.combo,move});return true}"
  )
  .replace(
    "if(distance(a,b)>.17){a.vx+=a.facing*.08;emit('WHIFF',{fighter:a.name,pose});return}",
    "if(distance(a,b)>.17){a.vx+=a.facing*.08;a.combo=0;a.comboTime=0;emit('WHIFF',{fighter:a.name,pose,moveId:++moveSerial});return}"
  )
  .replace("hit(a,b,base*m*(1+a.form*.025),heavy,launch)", "hit(a,b,base*m*(1+a.form*.025),heavy,launch,pose)")
  .replace(
    "beams.push({from:a,to:b,life:ultimate?.85:.46,max:ultimate?.85:.46,color:a.accent,w:ultimate?18:9});emit(ultimate?'ULTIMATE':'SUPER',{fighter:a.name,target:b.name});if(distance(a,b)<.7)setTimeout(()=>st&&b.hp>0&&hit(a,b,(a.hero?54:46)*(ultimate?1.8:1),true,true),ultimate?320:180)",
    "beams.push({from:a,to:b,life:ultimate?.85:.46,max:ultimate?.85:.46,impact:ultimate?.32:.18,resolved:false,damage:(a.hero?54:46)*(ultimate?1.8:1),move:ultimate?'ULTIMATE':'BEAM',color:a.accent,w:ultimate?18:9});emit(ultimate?'ULTIMATE':'SUPER',{fighter:a.name,target:b.name})"
  )
  .replace("a.guard=Math.max(0,a.guard-dt);a.ki", "a.guard=Math.max(0,a.guard-dt);a.comboTime=Math.max(0,a.comboTime-dt);if(a.comboTime<=0)a.combo=0;a.ki")
  .replace("if(d>.4&&a.vanishCd<=0&&Math.random()<dt*.65)", "if(d>.38&&a.vanishCd<=0&&Math.random()<dt*1.25)")
  .replace("setPose(a,'VANISH',.18);", "setPose(a,d>.58?'DRAGON_DASH':'VANISH',.18);")
  .replace("if(b.cd>.15&&r<.16){a.guard=.38;setPose(a,'PARRY',.28);return}", "if(b.cd>.15&&r<.18){a.guard=.42;setPose(a,r<.07?'COUNTER':'PARRY',.3);return}if(d<.24&&r>.91){a.z=cl(a.z+rnd(-.12,.12),.3,.82);setPose(a,'SIDESTEP',.2);return}")
  .replace("if(b.hp/b.maxHp<.16&&a.ult>=60){a.ult=0;a.ki=100;setPose(a,'FINISHER',1.2);beam(a,b,true);emit('FINISHER',{fighter:a.name,target:b.name});return}", "if(b.hp/b.maxHp<.12&&a.ult>=70&&!st.finisher){startFinisher(a,b);return}")
  .replace("if(a.ki>45&&a.superCd<=0&&(r<.28||st.time-st.levelStart>10))", "if(a.ki>45&&a.superCd<=0&&(r<.18||st.time-st.levelStart>16))")
  .replace("strike(a,b,...m);a.combo++;if(a.combo%4===0){a.vx+=dir*.11;emit('COMBO',{fighter:a.name,count:a.combo})}", "strike(a,b,...m);if(a.combo>0&&a.combo%4===0)a.vx+=dir*.11")
  .replace("function physics(f,dt){", `function startFinisher(a,b){a.ult=0;a.ki=0;a.cd=1.1;a.inv=1.1;setPose(a,'FINISHER',1.1);setPose(b,'HIT_HEAVY',1.1);st.finisher={a,b,time:.55};beams.push({from:a,to:b,life:.62,max:.62,color:a.accent,w:26});emit('FINISHER_START',{fighter:a.name,target:b.name,move:'CINEMATIC_EXECUTION'})}
function resolveFinisher(dt){const f=st.finisher;if(!f)return;f.time-=dt;if(f.time>0)return;const hpBefore=f.b.hp,damage=hpBefore;f.b.hp=0;f.b.combo=0;f.b.comboTime=0;st.hitstop=.14;st.shake=.12;st.destruction=1;burst(f.b.x,f.b.z,f.a.accent,72);emit('FINISHER_IMPACT',{fighter:f.a.name,target:f.b.name,damage:+damage.toFixed(1),hpBefore:+hpBefore.toFixed(1),hpAfter:0});emit('KO',{fighter:f.b.name,by:f.a.name,method:'FINISHER'});emit('FINISHER_COMPLETE',{fighter:f.a.name,target:f.b.name,lethal:true});st.finisher=null}
function snapshot(reason='TICK'){if(!st?.hero||!st?.boss)return;const fighterState=f=>({name:f.name,asset:f.hero?HERO_ATLASES[f.form]:RIVAL_ATLASES[f.name],x:+f.x.toFixed(4),y:+f.y.toFixed(4),z:+f.z.toFixed(4),vx:+f.vx.toFixed(4),vy:+f.vy.toFixed(4),facing:f.facing,hp:+f.hp.toFixed(1),maxHp:f.maxHp,ki:+f.ki.toFixed(1),ult:+f.ult.toFixed(1),form:f.form,pose:f.pose,combo:f.combo,guard:+f.guard.toFixed(3),stun:+f.stun.toFixed(3)});replay.frames.push({t:+st.time.toFixed(3),level:st.level+1,reason,arena:ARENA_ASSETS[LEVELS[st.level].opponent],camera:{shake:+(st.shake||0).toFixed(4),distance:+distance(st.hero,st.boss).toFixed(4)},assets:{...assetStats},hero:fighterState(st.hero),boss:fighterState(st.boss)});if(replay.frames.length>7200)replay.frames.splice(0,300)}
function physics(f,dt){`)
  .replace("st.time+=dt;st.shake", "st.time+=dt;resolveFinisher(dt);st.shake")
  .replace("for(const q of beams)q.life-=dt;beams=beams.filter(q=>q.life>0);", "for(const q of beams){q.life-=dt;if(!q.resolved&&q.impact!=null){q.impact-=dt;if(q.impact<=0){q.resolved=true;const current=(q.from===st.hero&&q.to===st.boss)||(q.from===st.boss&&q.to===st.hero);if(current&&q.to.hp>0&&distance(q.from,q.to)<.7)hit(q.from,q.to,q.damage,true,true,q.move);else emit('PROJECTILE_EXPIRE',{fighter:q.from.name,target:q.to.name,reason:current?'OUT_OF_RANGE':'STALE_TARGET'})}}}beams=beams.filter(q=>q.life>0);")
  .replace("if(performance.now()>capUntil)", "if(st.time-lastReplayFrame>=.1){lastReplayFrame=st.time;snapshot()}if(performance.now()>capUntil)")
  .replace("if(b.hp<=0){emit('LEVEL_CLEAR'", "if(b.hp<=0){snapshot('LEVEL_CLEAR');emit('LEVEL_CLEAR'")
  .replace("else if(h.hp<=0){st.running=false;", "else if(h.hp<=0){snapshot('HERO_KO');emit('KO',{fighter:h.name,by:b.name,method:'COMBAT'});st.running=false;")
  .replace(
    "function boot(){cancelAnimationFrame(raf);replay={version:RUNTIME,schema:'jarvis-survivor-replay-v11',events:[],frames:[]};fx=[];beams=[];slashes=[];st={running:true,paused:false,time:0,level:0,hitstop:0,shake:0,destruction:0,hero:fighter(true,.28,HERO_MAX_HP),boss:null,phase:'BOOT'};bind(0,false);U.start.hidden=true;U.over.hidden=true;last=performance.now();raf=requestAnimationFrame(loop);emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'CINEMATIC_ATLAS_EXTRUSION_3D_V2'})}",
    "function boot(){cancelAnimationFrame(raf);replay={version:RUNTIME,schema:'jarvis-survivor-replay-v12',events:[],frames:[]};fx=[];beams=[];slashes=[];lastReplayFrame=0;moveSerial=0;st={running:true,paused:false,time:0,level:0,hitstop:0,shake:0,destruction:0,finisher:null,hero:fighter(true,.28,HERO_MAX_HP),boss:null,phase:'BOOT'};emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'CINEMATIC_ATLAS_EXTRUSION_3D_V2',kernel:JARVIS_KERNEL.name,assets:{...assetStats}});bind(0,false);snapshot('BOOT_COMPLETE');U.start.hidden=true;U.over.hidden=true;last=performance.now();raf=requestAnimationFrame(loop)}"
  )
  .replaceAll('jarvis-survivor-replay-v11-', 'jarvis-survivor-replay-v12-')
  .replace("assetStats,atlasInventory", "assetStats,replaySchema:'jarvis-survivor-replay-v12',frameTelemetryHz:10,comboSemantics:'CONFIRMED_CONSECUTIVE_HITS',finisherSemantics:'LETHAL_COMPLETION_ONLY',atlasInventory");

for (const marker of [
  'RUNTIME=316', 'MODEL_RENDERER_VERSION=6', 'CHOREOGRAPHY_VERSION=11',
  'CINEMATIC_ATLAS_EXTRUSION_3D_V2', "schema:'jarvis-survivor-replay-v12'",
  "function snapshot(reason='TICK')", 'FINISHER_COMPLETE', "comboSemantics:'CONFIRMED_CONSECUTIVE_HITS'"
]) if (!html.includes(marker)) throw new Error(`Runtime 316 build missing ${marker}`);

fs.writeFileSync('survivor-runtime316.html', html);

function replaceFile(path, pairs) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of pairs) text = text.replaceAll(from, to);
  fs.writeFileSync(path, text);
}

replaceFile('jarvis/survivor-tab.js', [
  ['20260820runtime315atlas3dv10', '20260820runtime316cinematic3dv11'],
  ['survivor-runtime315.html', 'survivor-runtime316.html'],
  ['Runtime 315 Atlas-3D Kernel', 'Runtime 316 Cinematic Atlas-3D Kernel'],
  ['RUNTIME 315 // AUTHORED ATLAS-3D V10', 'RUNTIME 316 // CINEMATIC ATLAS-3D V11'],
  ['runtime315 atlas-3d-kernel', 'runtime316 cinematic-atlas-3d-kernel'],
  ['Booting Runtime 315 Atlas-3D Kernel', 'Booting Runtime 316 Cinematic Atlas-3D Kernel'],
  ['p.version||315', 'p.version||316']
]);
replaceFile('tools/survivor-runtime-smoke.mjs', [
  ['survivor-runtime315.html', 'survivor-runtime316.html'],
  ['SURVIVOR_EXPECTED_PRODUCTION||315', 'SURVIVOR_EXPECTED_PRODUCTION||316'],
  ['state.modelRenderer!==5', 'state.modelRenderer!==6'],
  ['state.choreography!==10', 'state.choreography!==11']
]);
for (const path of ['.github/workflows/pages.yml', '.github/workflows/survivor-pages-231.yml']) replaceFile(path, [
  ['survivor-runtime315.html', 'survivor-runtime316.html'], ['test-survivor-runtime315-contract.mjs', 'test-survivor-runtime316-contract.mjs'],
  ['test-survivor-production235-contract.mjs', 'test-survivor-production236-contract.mjs'],
  ['Runtime 315', 'Runtime 316'], ['runtime315', 'runtime316'], ['RUNTIME=315', 'RUNTIME=316'], ['content="315"', 'content="316"'],
  ['EXPECTED_PRODUCTION=315', 'EXPECTED_PRODUCTION=316'], ['modelRenderer:5', 'modelRenderer:6'], ['choreography:10', 'choreography:11'],
  ['AUTHORED_ATLAS_3D_V10', 'CINEMATIC_ATLAS_3D_V11'], ['runtime:315', 'runtime:316'], ['runtime": 315', 'runtime": 316'], ['survivor-315-', 'survivor-316-']
]);
replaceFile('.github/workflows/survivor-live-runtime-verify.yml', [
  ['Runtime 315 authored atlas-3D / 45-level build', 'Runtime 316 cinematic atlas-3D / 45-level build'],
  ['survivor-runtime315.html', 'survivor-runtime316.html'],
  ['content="315"', 'content="316"'], ['MODEL_RENDERER_VERSION=5', 'MODEL_RENDERER_VERSION=6'],
  ['AUTHORED_ATLAS_EXTRUSION_3D_V1', 'CINEMATIC_ATLAS_EXTRUSION_3D_V2'],
  ['jarvis-survivor-replay-v11', 'jarvis-survivor-replay-v12'],
  ['20260820runtime315atlas3dv10', '20260820runtime316cinematic3dv11'],
  ['AUTHORED ATLAS-3D · 45 LEVELS', 'CINEMATIC ATLAS-3D · 45 LEVELS'],
  ['Runtime 315 authored atlas-3D / 45 levels', 'Runtime 316 cinematic atlas-3D / 45 levels']
]);
console.log(`Built survivor-runtime316.html (${html.length} bytes)`);
