import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production217-canonical-opponent-only.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_213_READY','PRODUCTION_214_READY','PRODUCTION_215_READY','PRODUCTION_216_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_217_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_217_READY','CANONICAL TOURNAMENT ACTOR + READABLE VFX','activeTournamentHasOneEnemyObject:','noLegacyRivalActorSurvives:','targetIsCanonicalBoss:','renderAliasesUnified:','singleVisibleRaf:','vfxBoundedForMobile:true'])if(!s.includes(marker))throw Error('Production 217 missing '+marker);
if((s.match(/const production217=/g)||[]).length!==1)throw Error('Production 217 must be assembled exactly once');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production217canonical');fs.writeFileSync(htmlPath,h);
console.log({production:217,bytes:s.length,actors:'ONE_CANONICAL_TOURNAMENT_OPPONENT',target:'CANONICAL_BOSS_ONLY',renderer:'ONE_FINAL_COMPOSITOR',vfx:'TIGHT_MOBILE_BOUNDS'});
