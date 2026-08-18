import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const src='jarvis/core-survivor-230.js',out='jarvis/core-survivor-231.js',inc='jarvis/production231-replay63-authority-sync.inc.js';
for(const p of [src,inc,'jarvis/production228-replay60-truth-hardening.inc.js','jarvis/production229-replay61-live-runtime-fix.inc.js','jarvis/production230-hard-cache-runtime.inc.js'])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(src);for(const n of [196,199,204,220,221,222,223,224,225,228,229,230]){if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing before 231 build`);if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once before 231`)}
if(core.includes('PRODUCTION_231_READY'))throw Error('Source core must not already contain Production 231');
const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(out,core);
const built=text(out);for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231]){if(!built.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from 231 artifact`);if((built.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once in 231 artifact`)}
for(const marker of ['TRANSFORMATION_TELEMETRY_BRIDGE','AUTHORED_HIT_REACTION_BRIDGE','SINGLE_STAGE_ROUND_OPPONENT_ARENA_AUTHORITY','DISTINCT_VOICE_DELIVERY_ACCOUNTING','VFX_EVENT_FRAME_SEPARATION','ACTIVE_RENDERER_PERFORMANCE_TRUTH'])if(!built.includes(marker))throw Error('Production 231 marker missing '+marker);
console.log({production:231,runtimeProduction:231,replay:63,artifact:out,result:'PASS'});
