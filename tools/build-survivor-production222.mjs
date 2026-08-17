import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production222-replay57-performance-contact-fixes.inc.js',inc223='jarvis/production223-replay58-stage-pixel-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,inc223,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_220_READY','PRODUCTION_221_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_222_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_222_READY','REPLAY 57 PERFORMANCE + CONTACT AUTHORITY','UNIFIED_60S_ASCENSION_GATES','TRUE_EDGE_TRIGGERED_ARENA_BINDING','SCENE_CACHE_BY_CAMPAIGN_STAGE','DECODED_SPRITE_FALSE_MISSING_QUARANTINE','PRE_PLAN_CONTACT_ENVELOPE'])if(!s.includes(marker))throw Error('Production 222 missing '+marker);
if((s.match(/const production222=/g)||[]).length!==1)throw Error('Production 222 must be assembled exactly once');
if(!s.includes('PRODUCTION_223_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing before Production 223');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc223,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_223_READY','REPLAY 58 STAGE PIXEL AUTHORITY','CAMPAIGN_STAGE_FINAL_PIXEL_AUTHORITY','allNineRegistriesBound','noStaleImageReference'])if(!s.includes(marker))throw Error('Production 223 missing '+marker);
if((s.match(/const production223=/g)||[]).length!==1)throw Error('Production 223 must be assembled exactly once');
for(const i of [fs.readFileSync(inc,'utf8'),fs.readFileSync(inc223,'utf8')])if(/document\.createElement\(['\"]canvas['\"]\)/.test(i)||/requestAnimationFrame\s*\(/.test(i))throw Error('Production 222/223 must not create canvas/RAF');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production223replay58');fs.writeFileSync(htmlPath,h);
console.log({production:223,bytes:s.length,formGates:'60_105_150_195_245_300_360_425_495_570',arenaBinding:'FINAL_PIXEL_BY_CAMPAIGN_STAGE',arenaRegistry:'ALL_NINE_BOUND',cache:'STAGE_SPECIFIC_223',contact:'PRE_PLAN_168_MOBILE',sprites:'DECODED_FALSE_MISSING_QUARANTINE',renderer:'EXISTING_SINGLE'});
