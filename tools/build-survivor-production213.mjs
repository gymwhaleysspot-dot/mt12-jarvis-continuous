import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production213-visible-opponent-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY','PRODUCTION_206_READY','PRODUCTION_207_READY','PRODUCTION_209_READY','PRODUCTION_210_READY','PRODUCTION_211_READY','PRODUCTION_212_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_213_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_213_READY','VISIBLE TOURNAMENT OPPONENT + IDENTITY-CORRECT FINAL RENDERER','hudOpponentHasRenderableBoss:true','bossForcedIntoVisibleStage:true','rivalUsesIdentityAtlas:true','production121IsSingleFinalRenderer:true','noSecondCanvasRenderer:true'])if(!s.includes(marker))throw Error('Production 213 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production213visibleopponent');fs.writeFileSync(htmlPath,h);
console.log({production:213,bytes:s.length,opponent:'HUD_TO_RENDERABLE_BOSS',art:'IDENTITY_CORRECT_RIVAL_ATLAS',renderer:'PRODUCTION_121_EXISTING_SINGLE'});
