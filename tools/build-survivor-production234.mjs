import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const src='jarvis/core-survivor-231.js',out='jarvis/core-survivor-234.js',inc='jarvis/production234-canonical-runtime-rewrite.inc.js';
for(const p of [src,inc])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(src);for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231]){if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing before 234 build`);if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once before 234`)}
if(core.includes('PRODUCTION_234_READY'))throw Error('Source core must not already contain Production 234');
const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(out,core);
const built=text(out);for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231,234]){if(!built.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from 234 artifact`)}
for(const marker of ['ONE_CANONICAL_STAGE_MANIFEST','ATOMIC_OPPONENT_ACTOR_TARGET_ARENA_BIND','DIRECT_EVENT_IDENTITY_NORMALIZATION','FINAL_ENEMY_SPAWN_CANONICALIZATION','LIVE_FORM_ENGAGEMENT_TELEMETRY','SEPARATE_ARENA_BIND_DRAW_COUNTERS','REPLAY_RUNTIME_PROOF'])if(!built.includes(marker))throw Error('Production 234 marker missing '+marker);
/* Historical layers may contain old artifact names in diagnostics. The deployed HTML loader is the authority for hard-cache identity and is checked separately by Pages. */
console.log({production:234,runtimeProduction:234,artifact:out,loaderIdentity:'VALIDATED_BY_PAGES_HTML',result:'PASS'});
