import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const canonical=text('jarvis/production234-canonical-runtime-rewrite.inc.js');
const p220=text('jarvis/production220-direct-nine-arena-bindings.inc.js');
const pages=text('.github/workflows/pages.yml');
const verify=text('.github/workflows/survivor-pages-231.yml');
const expected=[['LIRA','lira-nexus-v1.webp'],['KAIROX','kairox-caldera-v1.webp'],['SOLENNE','solenne-corona-v1.webp'],['MIREYA','mireya-prism-v1.webp'],['ZEPHYRA','zephyra-tempest-v1.webp'],['ORUN','orun-ion-v1.webp'],['MORDREN','mordren-singularity-v1.webp'],['SABLE','sable-eclipse-v1.webp'],['KRAKEN','kraken-abyss-v1.webp']];
for(let i=0;i<expected.length;i++){const [id,arena]=expected[i];if(!p220.includes(`{stage:${i+1},opponent:'${id}',arena:'${arena}'`))throw Error(`stage ${i+1} manifest mismatch`)}
for(const marker of ['p234NormalizeEvent','p234Raw132Event','p234Enemy','p234SyncFormEngagement','production155.formEngagements','arenaBinds','arenaDraws','DIRECT_EVENT_IDENTITY_NORMALIZATION','FINAL_ENEMY_SPAWN_CANONICALIZATION','LIVE_FORM_ENGAGEMENT_TELEMETRY'])if(!canonical.includes(marker))throw Error('canonical hardening missing '+marker);
if(canonical.includes('production155.griffin.engagements'))throw Error('canonical layer must not use replay-only Production 155 griffin.engagements shape');
if(!pages.includes('uses: actions/deploy-pages@v4'))throw Error('main Pages workflow must remain sole deploy authority');
if(verify.includes('uses: actions/deploy-pages@v4')||verify.includes('pages: write')||verify.includes('id-token: write'))throw Error('Survivor verification workflow must not deploy Pages');
if(!pages.includes('node tools/test-survivor-production234-contract.mjs'))throw Error('main Pages workflow must run canonical contract test');
if(!verify.includes('node tools/test-survivor-production234-contract.mjs'))throw Error('verification workflow must run canonical contract test');
console.log({production:234,stages:9,eventAuthority:'NORMALIZED_AT_COMBAT_AND_DIRECT_132_PATHS',spawnAuthority:'FINAL_CANONICAL_ENEMY_WRAPPER',transformTelemetry:'LIVE_PRODUCTION155_ARRAY',pagesAuthority:'ONE_DEPLOY_WORKFLOW',result:'PASS'});
