import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production205-stage-authority.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_196_READY','PRODUCTION_197_READY','PRODUCTION_198_READY','PRODUCTION_199_READY','PRODUCTION_200_READY','PRODUCTION_201_READY','PRODUCTION_202_READY','PRODUCTION_203_READY','PRODUCTION_204_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_205_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
if(!s.includes('PRODUCTION_205_READY')||!s.includes('TOURNAMENT ROUND → STAGE AUTHORITY'))throw Error('Production 205 not assembled');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production205stageauthority');fs.writeFileSync(htmlPath,h);
console.log({production:205,bytes:s.length,authority:'TOURNAMENT_ROUND_STAGE',renderer:'EXISTING_SINGLE_2D'});
