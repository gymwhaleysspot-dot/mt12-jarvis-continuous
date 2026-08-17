import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production218-engine-kernel-stage-runtime.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_211_READY','PRODUCTION_212_READY','PRODUCTION_213_READY','PRODUCTION_214_READY','PRODUCTION_215_READY','PRODUCTION_216_READY','PRODUCTION_217_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_218_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_218_READY','SURVIVOR ENGINE KERNEL + STAGE RUNTIME','p218StageManifest','fixedStepSimulation:true','nineDistinctRoundLocations:','deterministicReplayHash:true','canonicalOpponentOnly:','CUSTOM HTML5 CANVAS FIXED-STEP KERNEL'])if(!s.includes(marker))throw Error('Production 218 missing '+marker);
if((s.match(/const production218=/g)||[]).length!==1)throw Error('Production 218 must be assembled exactly once');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production218enginekernel');fs.writeFileSync(htmlPath,h);
console.log({production:218,bytes:s.length,engine:'CUSTOM_FIXED_STEP_CANVAS',simulationHz:60,stages:9,renderer:'ONE_EXISTING_CANVAS_RAF',replay:'DETERMINISTIC_STATE_HASH'});
