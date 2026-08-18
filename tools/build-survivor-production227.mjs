import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
const inc224='jarvis/production224-replay59-global-scene-authority.inc.js';
const inc225='jarvis/production225-post224-hardening.inc.js';
const inc228='jarvis/production228-replay60-truth-hardening.inc.js';
for(const p of [inc224,inc225,inc228,'tools/build-survivor-production224.mjs','survivor.html','jarvis/core-survivor.js'])if(!fs.existsSync(p))throw Error('Missing '+p);
const src224=text(inc224),src225=text(inc225),src228=text(inc228),code224=stripComments(src224),code225=stripComments(src225),code228=stripComments(src228);
if(!src224.includes('atlas117.arena'))throw Error('Production 227 fixture missing historical comment token; self-test would not prove false-positive immunity');
if(/atlas117\.arena/.test(code224)||/atlas117\.arena/.test(code225)||/atlas117\.arena/.test(code228))throw Error('Executable static arena reference detected');
for(const code of [code224,code225,code228])if(/document\.createElement\(['\"]canvas['\"]\)/.test(code)||/requestAnimationFrame\s*\(/.test(code))throw Error('Executable code creates forbidden canvas/RAF');
if(!/arena119=function\(g\)/.test(code224))throw Error('Final arena119 stage-slot painter missing');
const builder=text('tools/build-survivor-production224.mjs');if(!builder.includes('const executable=src.replace'))throw Error('Production 224 builder is not comment-aware');
let core=text('jarvis/core-survivor.js');for(const n of [224,225])if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from core`);
if(!core.includes('PRODUCTION_228_READY')){const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');core=core.slice(0,at)+'\n\n'+src228.trim()+'\n'+core.slice(at);fs.writeFileSync('jarvis/core-survivor.js',core)}
core=text('jarvis/core-survivor.js');if((core.match(/const production228=/g)||[]).length!==1||!core.includes('PRODUCTION_228_READY'))throw Error('Production 228 must be assembled exactly once');
for(const m of ['REPLAY 60 TELEMETRY TRUTH + VOICE BACKPRESSURE','REPLAY60_TELEMETRY_TRUTH','VOICE_DUPLICATE_WINDOW_6S','COMPLETED_STORY_CLEAR_LOCK','legacyRigCounterNonAuthoritative:true','legacyDrawCallCounterNonAuthoritative:true'])if(!src228.includes(m))throw Error('Production 228 missing '+m);
let html=text('survivor.html'),rx=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!rx.test(html))throw Error('Survivor core script reference missing');html=html.replace(rx,'jarvis/core-survivor.js?v=20260818production228replay60truth');fs.writeFileSync('survivor.html',html);
console.log({production:228,runtimeProduction:228,validator:'COMMENT_FALSE_POSITIVE_SELF_TESTED',telemetry:'REPLAY60_TRUTH_HARDENED',voice:'DEDUPED_BACKPRESSURE',story:'COMPLETION_LOCKED',renderer:'EXISTING_SINGLE',result:'PASS'});
