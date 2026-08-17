import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production214-final-boss-compositor.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY','PRODUCTION_206_READY','PRODUCTION_207_READY','PRODUCTION_209_READY','PRODUCTION_210_READY','PRODUCTION_211_READY','PRODUCTION_212_READY','PRODUCTION_213_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_214_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_214_READY','FINAL BOSS COMPOSITOR + SYNCHRONOUS DUEL START','activeBossPaintedOnVector113:','sameExistingCanvas:true','render121CapturedReferenceCannotHideBoss:true','openingDuelDoesNotWaitForWaveTick:true','noSecondCanvasRenderer:true'])if(!s.includes(marker))throw Error('Production 214 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production214bosscompositor');fs.writeFileSync(htmlPath,h);
console.log({production:214,bytes:s.length,opponent:'VECTOR113_FINAL_BOSS_POSTPASS',opening:'SYNCHRONOUS_DUEL_START',renderer:'EXISTING_VECTOR113_ONLY'});
