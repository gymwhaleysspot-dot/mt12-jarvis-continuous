import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production209-canonical-arena-render-source.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY','PRODUCTION_206_READY','PRODUCTION_207_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_209_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_209_READY','CANONICAL VISIBLE ARENA RENDER SOURCE','finalRendererConsumesCanonicalActiveImage:true','production206DrawUsesProduction209Source:true'])if(!s.includes(marker))throw Error('Production 209 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production209arena');fs.writeFileSync(htmlPath,h);
console.log({production:209,bytes:s.length,scene:'CANONICAL_ACTIVE_IMAGE_TO_EXISTING_FINAL_RENDERER',renderer:'PRODUCTION_206_EXISTING'});
