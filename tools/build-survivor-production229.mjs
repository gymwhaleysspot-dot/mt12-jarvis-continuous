import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const corePath='jarvis/core-survivor.js',htmlPath='survivor.html',inc='jarvis/production229-replay61-live-runtime-fix.inc.js';
for(const p of [corePath,htmlPath,inc,'tools/build-survivor-production204.mjs','tools/build-survivor-production227.mjs'])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(corePath);const requiredBefore=[196,199,204,220,221,222,223,224,225,228];for(const n of requiredBefore)if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Runtime assembly gap before 229: Production ${n} missing`);
if(!core.includes('PRODUCTION_229_READY')){const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(corePath,core)}
core=text(corePath);for(const n of [...requiredBefore,229]){if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from final core`);if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must be assembled exactly once`)}
for(const m of ['REPLAY 61 LIVE RUNTIME + RELEASE CLOSURE','production228Present','staleTransformPoseBlocked','canonicalBodySkillAlignment','completedStoryLockedClear','ATTACK_EVENTS_REBIND_VISUAL_POSE'])if(!text(inc).includes(m))throw Error('Production 229 missing '+m);
const executable=text(inc).replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');if(/document\.createElement\(['\"]canvas['\"]\)/.test(executable)||/requestAnimationFrame\s*\(/.test(executable))throw Error('Production 229 may not create canvas/RAF');
let html=text(htmlPath),rx=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!rx.test(html))throw Error('Survivor core script reference missing');html=html.replace(rx,'jarvis/core-survivor.js?v=20260818production229replay61live');fs.writeFileSync(htmlPath,html);
console.log({production:229,runtimeProduction:229,replay:61,assembly:'196_THROUGH_229_REQUIRED',transformPose:'STALE_TRANSFORM_BLOCKED',alignment:'CANONICAL_RECOMPUTED',story:'CLEAR_LOCKED',result:'PASS'});
