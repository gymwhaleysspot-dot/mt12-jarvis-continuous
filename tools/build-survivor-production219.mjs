import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production219-replay55-runtime-cleanup.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_217_READY','PRODUCTION_218_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_219_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_219_READY','REPLAY 55 RUNTIME CLEANUP','duelDistanceBounded:','levelBoundaryRebindsExistingArenaImage:true','voiceQueueBounded:','legacyIndependentLoopsRetired:','nineStageAcceptance:','ASCENSION_GATE_OBSERVER'])if(!s.includes(marker))throw Error('Production 219 missing '+marker);
if((s.match(/const production219=/g)||[]).length!==1)throw Error('Production 219 must be assembled exactly once');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production219replay55');fs.writeFileSync(htmlPath,h);
console.log({production:219,bytes:s.length,duel:'BOUNDED',scene:'LEVEL_BOUNDARY_REBIND',voice:'DEDUPED_BOUNDED_QUEUE',legacyLoops:'RETIRED',acceptance:'NINE_STAGES_PLUS_ASCENSION'});
