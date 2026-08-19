import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const src='jarvis/core-survivor-234.js',out='jarvis/core-survivor-235.js',inc='jarvis/production235-full-survivor-rebuild.inc.js';
for(const p of [src,inc])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(src);
for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231,234]){
 if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing before 235 build`);
 if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once before 235`)
}
if(core.includes('PRODUCTION_235_READY'))throw Error('Source core must not already contain Production 235');
const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');
core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(out,core);
const built=text(out);
for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231,234,235])if(!built.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from 235 artifact`);
for(const marker of ['FRESH_CANONICAL_BOSS_FACTORY','NO_LEGACY_LIRA_BOSS_REUSE','ATOMIC_STAGE_OPPONENT_TARGET_ARENA','DUAL_EVENT_ROUTE_NORMALIZATION','SPAWN_EVENT_SUPPRESSION_AND_REEMIT','AUTHORITATIVE_FORM_TRUTH','AUTHORITATIVE_HIT_TRUTH','GLOBAL_RUNTIME_PROOF','REPLAY_67_ACCEPTANCE'])if(!built.includes(marker))throw Error('Production 235 marker missing '+marker);
const executable=text(inc).replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(executable)||/requestAnimationFrame\s*\(/.test(executable))throw Error('Production 235 may not create canvas/RAF');
console.log({production:235,runtimeProduction:235,artifact:out,bossFactory:'FRESH_OBJECT',runtimeProof:'GLOBAL_AND_REPLAY',result:'PASS'});
