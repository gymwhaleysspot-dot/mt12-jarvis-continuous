import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production220-direct-nine-arena-bindings.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_218_READY','PRODUCTION_219_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_220_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_220_READY','DIRECT NINE-ARENA ROUND BINDINGS','p220ArenaManifest','p220ArenaSlots','noPreviousArenaFallback:true','legacyFallbackRendererNotUsed:true','stageChangeCannotRetainPreviousImage:true'])if(!s.includes(marker))throw Error('Production 220 missing '+marker);
if((s.match(/const production220=/g)||[]).length!==1)throw Error('Production 220 must be assembled exactly once');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production220directarenas');fs.writeFileSync(htmlPath,h);
console.log({production:220,bytes:s.length,arenas:9,binding:'DIRECT_STAGE_SPECIFIC_IMAGE_SLOTS',fallback:'NONE_PREVIOUS_SCENE',renderer:'EXISTING_SINGLE'});
