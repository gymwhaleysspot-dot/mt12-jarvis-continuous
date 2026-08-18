import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const src='jarvis/core-survivor.js',out='jarvis/core-survivor-230.js',inc='jarvis/production230-hard-cache-runtime.inc.js';
for(const p of [src,inc,'jarvis/production228-replay60-truth-hardening.inc.js','jarvis/production229-replay61-live-runtime-fix.inc.js'])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(src);for(const n of [196,199,204,220,221,222,223,224,225,228,229]){if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing before 230 hard-cache build`);if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once before 230`)}
if(core.includes('PRODUCTION_230_READY'))throw Error('Source core must not already contain Production 230');
const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(out,core);
const built=text(out);for(const n of [196,199,204,220,221,222,223,224,225,228,229,230]){if(!built.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing from 230 artifact`);if((built.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once in 230 artifact`)}
if(!built.includes("artifact:'jarvis/core-survivor-230.js'"))throw Error('Production 230 artifact sentinel missing');
console.log({production:230,runtimeProduction:230,replay:62,artifact:out,result:'PASS'});
