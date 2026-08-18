import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const src='jarvis/core-survivor-231.js',inc='jarvis/production234-canonical-survivor-runtime.inc.js',out='jarvis/core-survivor-234.js';
for(const p of [src,inc])if(!fs.existsSync(p))throw Error('Missing '+p);
let core=text(src);
for(const n of [196,199,204,220,221,222,223,224,225,228,229,230,231]){if(!core.includes(`PRODUCTION_${n}_READY`))throw Error(`Production ${n} missing before 234 rewrite`);if((core.match(new RegExp(`const production${n}=`, 'g'))||[]).length!==1)throw Error(`Production ${n} must exist exactly once before 234`)}
if(core.includes('PRODUCTION_234_READY'))throw Error('Source core already contains Production 234');
const close='\n})();',at=core.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');
core=core.slice(0,at)+'\n\n'+text(inc).trim()+'\n'+core.slice(at);fs.writeFileSync(out,core);
const built=text(out);
for(const marker of ['PRODUCTION_234_READY','CANONICAL SURVIVOR RUNTIME','ONE_CANONICAL_STATE_TRANSACTION','ROUND_OPPONENT_ACTOR_ARENA_ATOMIC','LEGACY_AUTHORITIES_PROJECTED','replayIdentity234:true'])if(!built.includes(marker))throw Error('Production 234 marker missing '+marker);
if((built.match(/const production234=/g)||[]).length!==1)throw Error('Production 234 must be assembled exactly once');
const executable=text(inc).replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(executable)||/requestAnimationFrame\s*\(/.test(executable))throw Error('Production 234 may not create canvas/RAF');
for(const [stage,opponent,arena] of [[1,'LIRA','lira-nexus-v1.webp'],[2,'KAIROX','kairox-caldera-v1.webp'],[3,'SOLENNE','solenne-corona-v1.webp'],[4,'MIREYA','mireya-prism-v1.webp'],[5,'ZEPHYRA','zephyra-tempest-v1.webp'],[6,'ORUN','orun-ion-v1.webp'],[7,'MORDREN','mordren-singularity-v1.webp'],[8,'SABLE','sable-eclipse-v1.webp'],[9,'KRAKEN','kraken-abyss-v1.webp']])if(!text(inc).includes(`stage:${stage},opponent:'${opponent}',arena:'${arena}'`))throw Error(`Canonical stage ${stage} binding missing`);
console.log({production:234,runtimeProduction:234,artifact:out,authority:'ONE_CANONICAL_STATE_TRANSACTION',renderer:'EXISTING_SINGLE',result:'PASS'});
