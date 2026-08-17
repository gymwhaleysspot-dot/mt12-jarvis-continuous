import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production206-scene-fight-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_203_READY','PRODUCTION_204_READY','PRODUCTION_205_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_206_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_206_READY','VISIBLE SCENE + HIGH-IMPACT FIGHT AUTHORITY','tournamentRoundOwnsVisibleScene:true','eventDrivenFightEnhancements:true'])if(!s.includes(marker))throw Error('Production 206 missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production206scenefight');fs.writeFileSync(htmlPath,h);
console.log({production:206,bytes:s.length,scene:'ROUND_TO_VISIBLE_ARENA',combat:'EVENT_DRIVEN_HIGH_IMPACT',renderer:'SINGLE_FINAL_ARENA'});