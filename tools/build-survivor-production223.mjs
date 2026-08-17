import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production223-replay58-stage-pixel-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_220_READY','PRODUCTION_221_READY','PRODUCTION_222_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_223_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_223_READY','REPLAY 58 STAGE PIXEL AUTHORITY','CAMPAIGN_STAGE_FINAL_PIXEL_AUTHORITY','allNineRegistriesBound','noStaleImageReference'])if(!s.includes(marker))throw Error('Production 223 missing '+marker);
if((s.match(/const production223=/g)||[]).length!==1)throw Error('Production 223 must be assembled exactly once');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(fs.readFileSync(inc,'utf8'))||/requestAnimationFrame\s*\(/.test(fs.readFileSync(inc,'utf8')))throw Error('Production 223 must not create canvas/RAF');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production223replay58');fs.writeFileSync(htmlPath,h);
console.log({production:223,stage:'CAMPAIGN_STAGE_FINAL_PIXEL_AUTHORITY',arenas:9,registry:'ALL_NINE_BOUND',cache:'STAGE_SPECIFIC_223',renderer:'EXISTING_SINGLE'});
