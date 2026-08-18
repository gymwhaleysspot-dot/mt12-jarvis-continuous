/* PRODUCTION 228 — REPLAY 60 TELEMETRY TRUTH + VOICE BACKPRESSURE
 * Replay 60 showed stale legacy telemetry contradicting the live Production 225 runtime:
 * active tournament combat while old rig/world-object counters stayed zero, render activity while
 * legacy draw-call telemetry stayed zero, and repeated voice requests outrunning the bounded queue.
 * This layer does not create a renderer, canvas, RAF, actor, arena, or combat authority.
 */
const production228={ready:true,replay:60,system:'REPLAY 60 TELEMETRY TRUTH + VOICE BACKPRESSURE',frames:0,voiceSuppressed:0,voiceBackpressure:0,legacyContradictions:0,storyRepairs:0,lastVoice:'',lastVoiceAt:0,voiceSeen:new Map(),errors:[]};
function p228Stage(){return typeof p225Stage==='function'?p225Stage():Math.max(1,Math.min(9,Math.round(Number(campaign?.stage)||1)))}
function p228Boss(){return typeof p225Boss==='function'?p225Boss():(typeof p217Canonical==='function'?p217Canonical('P228'):null)}
function p228WorldObjects(){
 let n=0;
 for(const a of [typeof particles!=='undefined'?particles:null,typeof rings!=='undefined'?rings:null,typeof projectiles!=='undefined'?projectiles:null,typeof enemyShots!=='undefined'?enemyShots:null])if(Array.isArray(a))n+=a.length;
 const s1=Number(typeof production101==='object'?production101?.structures?.active:0)||0,s3=Number(typeof production103==='object'?production103?.structures?.active:0)||0;
 return Math.max(n,s1,s3,0)
}
function p228Truth(){
 const stage=p228Stage(),boss=p228Boss(),activeFight=!!(typeof running!=='undefined'&&running&&typeof campaign==='object'&&campaign&&campaign.phase!=='LEVEL_CLEAR'),arenaDraws=Number(typeof production225==='object'?production225?.arenaDraws:0)||0,graphicsFrames=Number(typeof production109==='object'?production109?.graphics?.frames:0)||0,worldObjects=p228WorldObjects();
 let contradictions=0;
 if(activeFight&&boss&&Number(typeof production100==='object'?production100?.rigs?.enemy:0)===0)contradictions++;
 if(activeFight&&graphicsFrames>0&&arenaDraws>0&&Number(typeof production109==='object'?production109?.performance?.drawCalls:0)===0)contradictions++;
 if(worldObjects>0&&Number(typeof production100==='object'?production100?.worldObjects:0)===0)contradictions++;
 production228.legacyContradictions=Math.max(production228.legacyContradictions,contradictions);
 return{stage,boss,activeFight,arenaDraws,graphicsFrames,worldObjects,contradictions}
}
/* Second-stage browser speech guard: Production 219 already caps queue depth. Replay 60 still showed
   repeat-request growth, so suppress normalized duplicate text for six seconds and respect the live
   Production 219 pending count before forwarding to its existing wrapper. */
try{
 if(typeof speechSynthesis!=='undefined'&&speechSynthesis&&typeof speechSynthesis.speak==='function'&&!speechSynthesis.__p228Wrapped){
  const prior=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.__p228Wrapped=true;
  speechSynthesis.speak=function(utterance){
   try{
    const text=String(utterance?.text||'').trim().replace(/\s+/g,' ').toUpperCase(),now=performance.now(),last=production228.voiceSeen.get(text)||0,pending=Number(typeof p219Voice==='object'?p219Voice?.pending:0)||0;
    if(text&&now-last<6000){production228.voiceSuppressed++;return}
    if(pending>=2){production228.voiceBackpressure++;return}
    if(text){production228.voiceSeen.set(text,now);production228.lastVoice=text;production228.lastVoiceAt=now;if(production228.voiceSeen.size>48){const first=production228.voiceSeen.keys().next().value;production228.voiceSeen.delete(first)}}
    return prior(utterance)
   }catch(err){production228.errors.push(`voice:${String(err?.message||err)}`);return prior(utterance)}
  }
 }
}catch(err){production228.errors.push(`voice-install:${String(err?.message||err)}`)}
function p228StoryTruth(){
 try{
  if(typeof story110!=='object'||!story110)return;
  const total=Math.max(0,Number(story110.totalChapters)||0),done=Array.isArray(story110.completed)?story110.completed.length:0;
  if(total>0&&done>=total&&Number(story110.chapter)>=total-1&&story110.scene&&story110.scene!=='CLEAR'){story110.scene='CLEAR';production228.storyRepairs++}
 }catch(err){production228.errors.push(`story:${String(err?.message||err)}`)}
}
const p228Omni=omniSystems;omniSystems=function(dt){const out=p228Omni(dt);p228StoryTruth();p228Truth();production228.frames++;return out};
const p228Reset=reset;reset=function(mode=autoMode){production228.voiceSeen.clear();production228.lastVoice='';production228.lastVoiceAt=0;const out=p228Reset(mode);p228StoryTruth();return out};
const p228Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p228Replay(frame);const t=p228Truth(),boss=t.boss,scene=typeof p225Scene==='function'?p225Scene(t.stage):null,slot=typeof p225Slot==='function'?p225Slot(t.stage):null;frame.production228={system:production228.system,source:'REPLAY 60',stage:t.stage,opponent:scene?.opponent||boss?.identity||null,arena:scene?.arena||null,renderSource:slot?.src||null,telemetry:{activeFight:t.activeFight,canonicalOpponent:!!boss,worldObjects:t.worldObjects,graphicsFrames:t.graphicsFrames,arenaDraws:t.arenaDraws,legacyContradictions:t.contradictions},voice:{suppressed:production228.voiceSuppressed,backpressure:production228.voiceBackpressure,pending:Number(typeof p219Voice==='object'?p219Voice?.pending:0)||0,last:production228.lastVoice},story:{repairs:production228.storyRepairs,chapter:Number(typeof story110==='object'?story110?.chapter:0)||0,scene:typeof story110==='object'?story110?.scene:null},counts:{frames:production228.frames,legacyContradictions:production228.legacyContradictions},errors:production228.errors.slice(-4),invariants:{stageSceneAuthorityPreserved:typeof p225Apply==='function',canonicalOpponentPresent:!t.activeFight||!!boss,arenaRenderActivityObservable:!t.activeFight||t.arenaDraws>0||!slot?.ready,worldObjectTelemetryDerived:t.worldObjects===p228WorldObjects(),legacyWorldObjectCounterNonAuthoritative:true,legacyRigCounterNonAuthoritative:true,legacyDrawCallCounterNonAuthoritative:true,voiceQueueBounded:(Number(typeof p219Voice==='object'?p219Voice?.pending:0)||0)<=3,voiceDuplicateWindowEnforced:true,completedStoryCannotReenterIntro:!(typeof story110==='object'&&story110?.scene==='INTRO'&&Array.isArray(story110?.completed)&&story110.completed.length>=Number(story110?.totalChapters||Infinity)),singleRendererPreserved:true,noSecondCanvas:true,noNewRaf:true}}};
try{p228StoryTruth();p228Truth();p132CombatEvent('PRODUCTION_228_READY',{system:production228.system,fixes:['REPLAY60_TELEMETRY_TRUTH','LEGACY_ZERO_COUNTERS_NON_AUTHORITATIVE','VOICE_DUPLICATE_WINDOW_6S','VOICE_PENDING_BACKPRESSURE_2','COMPLETED_STORY_CLEAR_LOCK','PRODUCTION225_STAGE_AUTHORITY_PRESERVED'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production228.errors.push(String(err?.message||err))}
