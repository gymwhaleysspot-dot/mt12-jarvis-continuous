import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production210-live-stage-arena-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY','PRODUCTION_206_READY','PRODUCTION_207_READY','PRODUCTION_209_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_210_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_210_READY','LIVE STAGE + EXISTING ARENA IMAGE AUTHORITY','campaignStageParticipatesInAuthority:true','stuckTournamentRoundCannotPinArena:true','existingArenaImageRebound:true','finalRendererConsumesExistingArenaImage:true','staleArenaRegistryReferencesCleared:true'])if(!s.includes(marker))throw Error('Production 210 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production210livearena');fs.writeFileSync(htmlPath,h);
console.log({production:210,bytes:s.length,scene:'MAX_LIVE_STAGE_TO_EXISTING_ARENA_IMAGE',renderer:'PRODUCTION_206_EXISTING'});
