import fs from 'node:fs';

const source = fs.readFileSync('survivor-runtime314.html', 'utf8');
let html = source
  .replaceAll('content="314"', 'content="315"')
  .replaceAll('Jarvis Survivor 314', 'Jarvis Survivor 315')
  .replaceAll('RUNTIME 314', 'RUNTIME 315')
  .replace('JARVIS SPRITE-DEPTH KERNEL V3', 'JARVIS ATLAS-3D KERNEL V4')
  .replace('const RUNTIME=314,MODEL_RENDERER_VERSION=4,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=9,CHOREOGRAPHY_VERSION=9,HERO_MAX_HP=620;',
    'const RUNTIME=315,MODEL_RENDERER_VERSION=5,LEVEL_COUNT=45,POSE_COUNT=42,BALANCE_VERSION=10,CHOREOGRAPHY_VERSION=10,HERO_MAX_HP=700;')
  .replace("const JARVIS_KERNEL=Object.freeze({name:'JARVIS_SPRITE_DEPTH_KERNEL',version:3,fixedStep:1/60,maxCatchUp:.1,renderer:'SPRITE_DEPTH_2_5D_V1'});",
    "const JARVIS_KERNEL=Object.freeze({name:'JARVIS_ATLAS_3D_KERNEL',version:4,fixedStep:1/60,maxCatchUp:.1,renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1'});")
  .replace("const SPRITE_DEPTH_PIPELINE=Object.freeze({layers:9,extrusion:6,directionalLight:true,perspectiveRig:true,volumetricAura:true,normalStyleShading:true});",
    "const SPRITE_DEPTH_PIPELINE=Object.freeze({layers:16,extrusion:12,directionalLight:true,perspectiveRig:true,volumetricAura:true,normalStyleShading:true,authoredAtlases:true,parallaxArenas:true,formAtlasSwap:true,poseFrameBinding:true});")
  .replace("let replay,fx,beams,slashes;", `let replay,fx,beams,slashes;
const ASSET_ROOT='jarvis/assets/survivor/';
const HERO_ATLASES=['griffin-atlas-v3.webp','griffin-saiyan-spark-atlas-v3.webp','griffin-ascended-atlas-v3.webp','griffin-hyper-atlas-v3.webp','griffin-speed-form-atlas-v1.webp','griffin-guardian-form-atlas-v1.webp','griffin-destroyer-form-atlas-v1.webp','griffin-celestial-overdrive-atlas-v1.webp','griffin-omega-instinct-atlas-v1.webp','griffin-instinct-form-atlas-v1.webp','griffin-instinct-atlas-v3.webp'];
const RIVAL_ATLASES={LIRA:'lira-empress-atlas-v3.webp',KAIROX:'rivals/kairox-awakened-atlas-v3.webp',SOLENNE:'rivals/solenne-awakened-atlas-v4.webp',MIREYA:'rivals/mireya-awakened-atlas-v3.webp',ZEPHYRA:'rivals/zephyra-awakened-atlas-v3.webp',ORUN:'rivals/orun-awakened-atlas-v3.webp',MORDREN:'rivals/mordren-awakened-atlas-v3.webp',SABLE:'rivals/sable-awakened-atlas-v3.webp',KRAKEN:'rivals/kraken-awakened-atlas-v3.webp'};
const ARENA_ASSETS={LIRA:'arenas/lira-nexus-v1.webp',KAIROX:'arenas/kairox-caldera-v1.webp',SOLENNE:'arenas/solenne-corona-v1.webp',MIREYA:'arenas/mireya-prism-v1.webp',ZEPHYRA:'arenas/zephyra-tempest-v1.webp',ORUN:'arenas/orun-ion-v1.webp',MORDREN:'arenas/mordren-singularity-v1.webp',SABLE:'arenas/sable-eclipse-v1.webp',KRAKEN:'arenas/kraken-abyss-v1.webp'};
const atlasCache=new Map(),assetStats={requested:0,loaded:0,failed:0};
function asset(path){if(atlasCache.has(path))return atlasCache.get(path);const img=new Image();img.decoding='async';img.src=ASSET_ROOT+path;assetStats.requested++;img.onload=()=>assetStats.loaded++;img.onerror=()=>assetStats.failed++;atlasCache.set(path,img);return img}
[HERO_ATLASES[0],HERO_ATLASES[1],RIVAL_ATLASES.LIRA,ARENA_ASSETS.LIRA].forEach(asset);
const POSE_FRAME={IDLE:0,STEP:1,SHORT_DASH:1,DRAGON_DASH:2,VANISH:2,ASCEND:2,DESCEND:13,GUARD:3,PARRY:3,PERCEPTION:3,REVENGE:8,JAB:8,CROSS:9,BODY:8,KICK:10,ROUNDHOUSE:11,UPPERCUT:9,SMASH:11,LAUNCHER:10,AIR_JAB:9,AIR_KICK:10,AIR_CHASE:2,METEOR:11,BEAM:12,KI_VOLLEY:12,BEAM_CLASH:12,SUPER:12,ULTIMATE:12,FINISHER:12,HIT_LIGHT:4,HIT_HEAVY:5,AIR_TUMBLE:13,WALL_SPLAT:6,GROUND_CRATER:14,KNOCKDOWN:14,RECOVER:15,TRANSFORM:12,CHARGE:12,SIDESTEP:1,COUNTER:9,VICTORY:0,TAUNT:0};
function fighterAtlas(f){return asset(f.hero?HERO_ATLASES[cl(f.form,0,HERO_ATLASES.length-1)]:RIVAL_ATLASES[f.name]||RIVAL_ATLASES.LIRA)}
function coverImage(img,ox=0){if(!img?.complete||!img.naturalWidth)return false;const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;X.drawImage(img,(W-dw)/2+ox,(H-dh)/2,dw,dh);return true}`)
  .replace("function bind(i,carry=true){const l=LEVELS[i];", "function bind(i,carry=true){const l=LEVELS[i];asset(RIVAL_ATLASES[l.opponent]);asset(ARENA_ASSETS[l.opponent]);asset(HERO_ATLASES[cl(Math.floor(i/4),0,HERO_ATLASES.length-1)]);")
  .replace(/function arena\(\)\{.*?\}\nfunction project/, `function arena(){const l=LEVELS[st.level],act=ACTS[l.act-1],img=asset(ARENA_ASSETS[l.opponent]);X.fillStyle=act[1];X.fillRect(0,0,W,H);const mid=(st.hero.x+st.boss.x)/2-.5,parallax=-mid*W*.055;if(coverImage(img,parallax)){X.fillStyle='rgba(2,5,13,.18)';X.fillRect(0,0,W,H);const sky=X.createLinearGradient(0,0,0,H);sky.addColorStop(0,'rgba(1,6,18,.08)');sky.addColorStop(.72,'rgba(2,3,10,.02)');sky.addColorStop(1,'rgba(0,0,0,.42)');X.fillStyle=sky;X.fillRect(0,0,W,H)}else{const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,act[1]);g.addColorStop(1,act[2]);X.fillStyle=g;X.fillRect(0,0,W,H)}const floor=H*.75;X.globalAlpha=.24;X.strokeStyle=l.color;X.lineWidth=1.2;for(let i=0;i<7;i++){X.beginPath();X.ellipse(W/2+parallax*.25,floor,W*(.14+i*.105),H*(.018+i*.012),0,0,Math.PI*2);X.stroke()}X.globalAlpha=1;if(st.destruction>.2){X.fillStyle='rgba(255,190,110,.08)';for(let i=0;i<18*st.destruction;i++){const x=(i*173+st.level*47)%W,y=floor+(i*41)%(H-floor);X.beginPath();X.arc(x,y,2+(i%5),0,Math.PI*2);X.fill()}}}
function project`)
  .replace(/function limb\(.*?\nfunction drawFighter\(f\)\{.*?\}\nfunction drawFx/, `function spriteFrame(f){let frame=POSE_FRAME[f.pose]??0;if(f.pose==='IDLE')frame=(Math.floor(st.time*3)+(f.hero?0:1))%2;return frame}
function drawFighter(f){const p=project(f),img=fighterAtlas(f),frame=spriteFrame(f),col=frame%4,row=Math.floor(frame/4),fw=img.naturalWidth/4||320,fh=img.naturalHeight/4||320,profile=PROFILES[f.name]||PROFILES.GRIFFIN,base=Math.min(H*.40,360)*p.s*profile.build,w=base*(fw/fh),h=base,dir=f.facing,hitp=/HIT|TUMBLE|KNOCKDOWN/.test(f.pose),air=f.y>0,depth=12*p.s;aura(f,p);X.save();X.translate(p.x,p.y);X.scale(dir,1);if(hitp)X.rotate(-dir*.13);const bob=f.pose==='IDLE'?Math.sin(st.time*4+(f.hero?0:1))*2:0;X.globalAlpha=.48;X.fillStyle='#02050a';X.filter='blur(8px)';X.beginPath();X.ellipse(0,5+Math.max(0,f.y*45),w*.31,Math.max(5,h*.045)*(air?.45:1),0,0,Math.PI*2);X.fill();X.filter='none';if(img.complete&&img.naturalWidth){for(let z=depth;z>=2;z-=2){X.globalAlpha=.055+z/depth*.035;X.filter='brightness(.22) saturate(1.4)';X.drawImage(img,col*fw,row*fh,fw,fh,-w/2-z*.48,-h+z*.36+bob,w,h)}X.globalAlpha=.95;X.filter='drop-shadow(0 9px 8px rgba(0,0,0,.55)) drop-shadow(0 0 7px '+f.accent+')';X.drawImage(img,col*fw,row*fh,fw,fh,-w/2,-h+bob,w,h);X.globalCompositeOperation='screen';X.globalAlpha=.13;X.filter='brightness(1.8) saturate(.2)';X.drawImage(img,col*fw,row*fh,fw,fh,-w/2-1.5,-h-1.5+bob,w,h)}else{X.filter='none';X.globalAlpha=1;X.fillStyle=f.accent;X.fillRect(-26,-110,52,110)}X.restore()}
function drawFx`)
  .replaceAll("renderer:'ANIME_VOLUMETRIC_2D_V1'", "renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1'")
  .replace("emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'ANIME_VOLUMETRIC_2D_V1'})", "emit('RUNTIME_BOOT',{runtime:RUNTIME,renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1',assets:{...assetStats}})")
  .replace("spritePipeline:SPRITE_DEPTH_PIPELINE,levelCount", "spritePipeline:SPRITE_DEPTH_PIPELINE,assetStats,atlasInventory:{hero:HERO_ATLASES.length,rivals:Object.keys(RIVAL_ATLASES).length,arenas:Object.keys(ARENA_ASSETS).length},levelCount");

for (const marker of ['RUNTIME=315','AUTHORED_ATLAS_EXTRUSION_3D_V1','griffin-ascended-atlas-v3.webp','arenas/lira-nexus-v1.webp','MODEL_RENDERER_VERSION=5']) {
  if (!html.includes(marker)) throw new Error(`Runtime 315 build missing ${marker}`);
}
fs.writeFileSync('survivor-runtime315.html', html);
function replaceFile(path, pairs) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of pairs) text = text.replaceAll(from, to);
  fs.writeFileSync(path, text);
}
replaceFile('jarvis/survivor-tab.js', [
  ['20260820runtime314depthv9', '20260820runtime315atlas3dv10'],
  ['survivor-runtime314.html', 'survivor-runtime315.html'],
  ['Runtime 314 Sprite-Depth Kernel', 'Runtime 315 Atlas-3D Kernel'],
  ['RUNTIME 314 // SPRITE-DEPTH KERNEL V9', 'RUNTIME 315 // AUTHORED ATLAS-3D V10'],
  ['runtime314 ultimate-kernel', 'runtime315 atlas-3d-kernel'],
  ['Booting Runtime 314 Sprite-Depth Kernel', 'Booting Runtime 315 Atlas-3D Kernel'],
  ['p.version||314', 'p.version||315']
]);
replaceFile('tools/survivor-runtime-smoke.mjs', [
  ['survivor-runtime314.html', 'survivor-runtime315.html'],
  ['SURVIVOR_EXPECTED_PRODUCTION||314', 'SURVIVOR_EXPECTED_PRODUCTION||315'],
  ['state.modelRenderer!==4', 'state.modelRenderer!==5'],
  ['state.choreography!==9', 'state.choreography!==10']
]);
for (const path of ['.github/workflows/pages.yml', '.github/workflows/survivor-pages-231.yml']) {
  replaceFile(path, [
    ['Runtime 314', 'Runtime 315'], ['runtime314', 'runtime315'], ['RUNTIME=314', 'RUNTIME=315'],
    ['content="314"', 'content="315"'], ['EXPECTED_PRODUCTION=314', 'EXPECTED_PRODUCTION=315'],
    ['modelRenderer:4', 'modelRenderer:5'], ['choreography:9', 'choreography:10'],
    ['SPRITE_DEPTH_KERNEL_V9', 'AUTHORED_ATLAS_3D_V10'], ['runtime:314', 'runtime:315'],
    ['runtime": 314', 'runtime": 315'], ['survivor-314-', 'survivor-315-']
  ]);
}
replaceFile('.github/workflows/survivor-live-runtime-verify.yml', [
  ['Runtime 308 articulated model / 45-level build', 'Runtime 315 authored atlas-3D / 45-level build'],
  ['content="308"', 'content="315"'], ['MODEL_RENDERER_VERSION=2', 'MODEL_RENDERER_VERSION=5'],
  ['ARTICULATED_CEL_MODEL_RUNTIME', 'AUTHORED_ATLAS_EXTRUSION_3D_V1'],
  ['jarvis-survivor-replay-v8', 'jarvis-survivor-replay-v11'],
  ['20260820runtime308models45', '20260820runtime315atlas3dv10'],
  ['ARTICULATED MODELS · 45 LEVELS', 'AUTHORED ATLAS-3D · 45 LEVELS'],
  ['Runtime 308 articulated models / 45 levels', 'Runtime 315 authored atlas-3D / 45 levels']
]);
console.log(`Built survivor-runtime315.html (${html.length} bytes)`);
