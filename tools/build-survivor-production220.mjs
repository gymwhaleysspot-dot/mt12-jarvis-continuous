import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production220-direct-nine-arena-bindings.inc.js',inc221='jarvis/production221-replay56-runtime-fixes.inc.js',inc222='jarvis/production222-replay57-performance-contact-fixes.inc.js',htmlPath='survivor.html';
for(const p of [core,inc,inc221,inc222,htmlPath])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8'),close='\n})();';
for(const marker of ['PRODUCTION_218_READY','PRODUCTION_219_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_220_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_220_READY','DIRECT NINE-ARENA ROUND BINDINGS','p220ArenaManifest','p220ArenaSlots','noPreviousArenaFallback:true','legacyFallbackRendererNotUsed:true','stageChangeCannotRetainPreviousImage:true'])if(!s.includes(marker))throw Error('Production 220 missing '+marker);
if((s.match(/const production220=/g)||[]).length!==1)throw Error('Production 220 must be assembled exactly once');
if(!s.includes('PRODUCTION_221_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing before Production 221');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc221,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_221_READY','REPLAY 56 RUNTIME FIXES','arenaBindingEdgeTriggered','noPerFrameArenaEventFlood','duelDistanceReadable','spriteReadyFlagsFollowDecodedImages','earnedFormIsSingleAuthority'])if(!s.includes(marker))throw Error('Production 221 missing '+marker);
if((s.match(/const production221=/g)||[]).length!==1)throw Error('Production 221 must be assembled exactly once');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(fs.readFileSync(inc221,'utf8'))||/requestAnimationFrame\s*\(/.test(fs.readFileSync(inc221,'utf8')))throw Error('Production 221 must not create canvas/RAF');
if(!s.includes('PRODUCTION_222_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing before Production 222');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc222,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_222_READY','REPLAY 57 PERFORMANCE + CONTACT AUTHORITY','UNIFIED_60S_ASCENSION_GATES','TRUE_EDGE_TRIGGERED_ARENA_BINDING','SCENE_CACHE_BY_CAMPAIGN_STAGE','DECODED_SPRITE_FALSE_MISSING_QUARANTINE','PRE_PLAN_CONTACT_ENVELOPE'])if(!s.includes(marker))throw Error('Production 222 missing '+marker);
if((s.match(/const production222=/g)||[]).length!==1)throw Error('Production 222 must be assembled exactly once');
if(/document\.createElement\(['\"]canvas['\"]\)/.test(fs.readFileSync(inc222,'utf8'))||/requestAnimationFrame\s*\(/.test(fs.readFileSync(inc222,'utf8')))throw Error('Production 222 must not create canvas/RAF');
fs.writeFileSync(core,s);
let h=fs.readFileSync(htmlPath,'utf8'),re=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!re.test(h))throw Error('core script missing');h=h.replace(re,'jarvis/core-survivor.js?v=20260817production222replay57');fs.writeFileSync(htmlPath,h);
console.log({production:222,bytes:s.length,arenas:9,arenaBinding:'TRUE_STAGE_EDGE',sceneBinding:'CACHED_BY_CAMPAIGN_STAGE',duelCap:'168_PREPLAN_MOBILE',spriteReadiness:'DECODED_FALSE_MISSING_QUARANTINE',formAuthority:'60S_EARNED_SINGLE',vfx:'ADAPTIVE_DECORATIVE_SHED',renderer:'EXISTING_SINGLE'});
