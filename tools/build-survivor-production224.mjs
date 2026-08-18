import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production224-replay59-global-scene-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_222_READY','PRODUCTION_223_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_224_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_224_READY','REPLAY 59 GLOBAL SCENE AUTHORITY','FINAL_ARENA119_USES_STAGE_SLOT','ATOMIC_STAGE_OPPONENT_ARENA','legacyAtlas117ArenaRetired:true','singleSceneAuthority:true'])if(!s.includes(marker))throw Error('Production 224 missing '+marker);
if((s.match(/const production224=/g)||[]).length!==1)throw Error('Production 224 must be assembled exactly once');
const src=fs.readFileSync(inc,'utf8');
const executable=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(executable)||/requestAnimationFrame\s*\(/.test(executable))throw Error('Production 224 must not create canvas/RAF');
if(!/arena119=function\(g\)/.test(executable))throw Error('Production 224 must own the final arena119 painter');
if(/atlas117\.arena/.test(executable))throw Error('Production 224 executable code may not use the static atlas117 arena');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260818production226validatorfix');fs.writeFileSync(htmlPath,h);
console.log({production:224,bytes:s.length,sceneAuthority:'GLOBAL_ATOMIC_STAGE_OPPONENT_ARENA',finalArenaPainter:'ARENA119_STAGE_SLOT',staticArena:'RETIRED',validator:'EXECUTABLE_CODE_ONLY',renderer:'EXISTING_SINGLE'});
