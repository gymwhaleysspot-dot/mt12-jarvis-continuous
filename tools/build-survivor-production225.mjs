import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production225-post224-hardening.inc.js',html='survivor.html',close='\n})();';
for(const p of [core,inc,html])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8');
for(const marker of ['PRODUCTION_223_READY','PRODUCTION_224_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_225_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_225_READY','POST-224 GLOBAL SCENE + OPPONENT HARDENING','ONE_STAGE_TRANSACTION','P203_ROSTER_ORDER_MISMATCH_NEUTRALIZED','OPPONENT_ART_BY_STAGE_IDENTITY','LEGACY_SCENE_AUTHORITIES_REDIRECTED','FINAL_ARENA119_STAGE_SLOT'])if(!s.includes(marker))throw Error('Production 225 missing '+marker);
if((s.match(/const production225=/g)||[]).length!==1)throw Error('Production 225 must be assembled exactly once');
const i=fs.readFileSync(inc,'utf8');if(/document\.createElement\(['\"]canvas['\"]\)/.test(i)||/requestAnimationFrame\s*\(/.test(i))throw Error('Production 225 must not create canvas/RAF');
fs.writeFileSync(core,s);
let h=fs.readFileSync(html,'utf8'),rx=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!rx.test(h))throw Error('core script missing');h=h.replace(rx,'jarvis/core-survivor.js?v=20260818production225post224');fs.writeFileSync(html,h);
console.log({production:225,bytes:s.length,scene:'ONE_STAGE_TRANSACTION',opponent:'STAGE_IDENTITY',arena:'FINAL_ARENA119_STAGE_SLOT',legacy:'REDIRECTED',renderer:'EXISTING_SINGLE'});
