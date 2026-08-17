import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production215-live-raf-render-authority.inc.js',inc216='jarvis/production216-single-raf-vfx-readability.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,inc216,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY','PRODUCTION_206_READY','PRODUCTION_207_READY','PRODUCTION_209_READY','PRODUCTION_210_READY','PRODUCTION_211_READY','PRODUCTION_212_READY','PRODUCTION_213_READY','PRODUCTION_214_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_215_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_215_READY','LIVE RAF RENDER AUTHORITY + BOSS DRAW PROOF','loop127ResolvesFinalRender127:','render133Render128Render127Vector113Unified:','activeBossHasVisibleDrawEvidence:','sameExistingVectorCanvas:true','noSecondCanvasRenderer:true'])if(!s.includes(marker))throw Error('Production 215 missing '+marker);
if(!s.includes('PRODUCTION_216_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc216,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_216_READY','SINGLE RAF + FIGHTER READABILITY','singleVisibleRaf:true','loop127Stopped:','oneBossDrawAuthority:true','vfxBoundedForMobile:true','noSecondCanvasRenderer:true'])if(!s.includes(marker))throw Error('Production 216 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production216singleraf');fs.writeFileSync(htmlPath,h);
console.log({production:216,bytes:s.length,renderer:'ONE_MAIN_RAF_FINAL_COMPOSITOR',boss:'ONE_DRAW_AUTHORITY',vfx:'MOBILE_BOUNDED',canvas:'EXISTING_VECTOR113_ONLY'});
