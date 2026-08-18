import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production228-replay60-runtime-hardening.inc.js',html='survivor.html',close='\n})();';
for(const p of [core,inc,html])if(!fs.existsSync(p))throw Error('Missing '+p);
let s=fs.readFileSync(core,'utf8');
for(const marker of ['PRODUCTION_225_READY'])if(!s.includes(marker))throw Error('Missing prerequisite '+marker);
if(!s.includes('PRODUCTION_228_READY')){const at=s.lastIndexOf(close);if(at<0)throw Error('core closing IIFE missing');s=s.slice(0,at)+'\n\n'+fs.readFileSync(inc,'utf8').trim()+'\n'+s.slice(at)}
for(const marker of ['PRODUCTION_228_READY','REPLAY 60 RUNTIME HARDENING','STALE_TARGET_PURGE','LIVE_STAGE_BOSS_REBIND','STAGE_EDGE_IMAGE_INVALIDATION','VOICE_QUEUE_DEDUP','EDGE_EVENT_DEDUP','STORY_MONOTONIC_REPLAY','HONEST_ZERO_TELEMETRY'])if(!s.includes(marker))throw Error('Production 228 missing '+marker);
if((s.match(/const production228=/g)||[]).length!==1)throw Error('Production 228 must be assembled exactly once');
const i=fs.readFileSync(inc,'utf8');if(/document\.createElement\(['\"]canvas['\"]\)/.test(i)||/requestAnimationFrame\s*\(/.test(i))throw Error('Production 228 must not create canvas/RAF');
for(const marker of ['p228StageBoss','p228ClearLocks','voiceDuplicatesSuppressed','eventDuplicatesSuppressed','storyNeverRegressesAfterCompletion','unknownDrawCallsNotFakeZero'])if(!i.includes(marker))throw Error('Production 228 invariant missing '+marker);
fs.writeFileSync(core,s);
let h=fs.readFileSync(html,'utf8'),rx=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;if(!rx.test(h))throw Error('core script missing');h=h.replace(rx,'jarvis/core-survivor.js?v=20260818production228replay60');fs.writeFileSync(html,h);
console.log({production:228,bytes:s.length,source:'REPLAY_60',target:'LIVE_STAGE_BOSS_ONLY',stageImages:'INVALIDATE_ON_EDGE',voiceQueue:3,telemetry:'HONEST_UNKNOWN',renderer:'EXISTING_SINGLE'});
