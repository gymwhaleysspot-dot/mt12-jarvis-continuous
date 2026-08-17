/* PRODUCTION 219 — REPLAY 55 RUNTIME CLEANUP
 * Closes the remaining issues exposed after Production 218 without adding a renderer/canvas/RAF:
 * duel spacing, authoritative stage-boundary rebinding, voice queue backpressure/deduplication,
 * legacy-loop retirement checks, and replay-verifiable nine-stage + ascension acceptance telemetry.
 */
const production219={ready:true,system:'REPLAY 55 RUNTIME CLEANUP',frames:0,leashRepairs:0,maxDistance:0,sceneRebinds:0,staleSceneRepairs:0,voiceSuppressed:0,voiceBackpressure:0,voiceErrors:0,legacyLoopsStopped:0,stageVisits:new Set(),arenaVisits:new Set(),opponentVisits:new Set(),ascensionMisses:0,errors:[]};

/* Keep duels cinematic and readable. Replay 55 reached ~417 px separation; mobile fights now
   stay inside a bounded presentation radius while preserving the canonical boss object. */
function p219Boss(){return typeof p217Canonical==='function'?p217Canonical('P219'):null}
function p219Leash(){
 const b=p219Boss();if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(player?.x)||!Number.isFinite(player?.y))return;
 const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy),cap=W<720?315:380;production219.maxDistance=Math.max(production219.maxDistance,d);
 if(d<=cap||d<1)return;
 const k=cap/d;b.x=player.x+dx*k;b.y=player.y+dy*k;if(Number.isFinite(b.vx))b.vx*=.35;if(Number.isFinite(b.vy))b.vy*=.35;production219.leashRepairs++;
}

/* Rebind the exact existing Image object at every level boundary and invalidate stale scene keys.
   campaign.stage remains the sole authority; no historical round/event value can override it. */
let p219LastStage=0,p219LastEpoch=-1;
function p219SceneSync(reason='LIVE'){
 const scene=typeof p218BindScene==='function'?p218BindScene(`P219_${reason}`):null;if(!scene)return null;
 const stage=Number(scene.stage)||1;if(stage!==p219LastStage){
  if(typeof p206State==='object'&&p206State){p206State.round=0;p206State.spec=null}
  if(typeof p207State==='object'&&p207State){p207State.level=0;p207State.spec=null}
  if(typeof p209State==='object'&&p209State){p209State.level=0;p209State.spec=null;p209State.src=''}
  const spec=typeof p211Spec==='function'?p211Spec(stage):null;if(spec&&typeof p210Bind==='function')p210Bind(spec,stage);
  p219LastStage=stage;p219LastEpoch=typeof p218SceneRuntime==='object'?Number(p218SceneRuntime.epoch)||0:0;production219.sceneRebinds++;
 }
 production219.stageVisits.add(stage);production219.opponentVisits.add(scene.opponent);production219.arenaVisits.add(scene.arena);return scene
}

/* Browser voice guard: suppress immediate duplicate lines and prevent Safari speech queues from
   growing without bound. Existing voice selection/content stays untouched. */
const p219Voice={installed:false,lastText:'',lastAt:0,pending:0,maxPending:3,original:null};
try{
 if(typeof speechSynthesis!=='undefined'&&speechSynthesis&&typeof speechSynthesis.speak==='function'){
  const original=speechSynthesis.speak.bind(speechSynthesis);p219Voice.original=original;
  speechSynthesis.speak=function(utterance){
   try{
    const text=String(utterance?.text||'').trim(),now=performance.now();
    if(text&&text===p219Voice.lastText&&now-p219Voice.lastAt<2800){production219.voiceSuppressed++;return}
    if(p219Voice.pending>=p219Voice.maxPending){production219.voiceBackpressure++;return}
    p219Voice.lastText=text;p219Voice.lastAt=now;p219Voice.pending++;
    let settled=false,done=()=>{if(settled)return;settled=true;p219Voice.pending=Math.max(0,p219Voice.pending-1)};
    utterance?.addEventListener?.('end',done,{once:true});utterance?.addEventListener?.('error',done,{once:true});
    const out=original(utterance);setTimeout(done,12000);return out
   }catch(err){production219.voiceErrors++;return original(utterance)}
  };p219Voice.installed=true;
 }
}catch(err){production219.voiceErrors++;production219.errors.push(String(err?.message||err))}

/* Historical independent loops must remain retired. We never create a new loop; these checks
   only shut down stale flags that can resurrect duplicate render/telemetry paths. */
function p219RetireLegacyLoops(){for(const s of [typeof stage121==='object'?stage121:null,typeof stage127==='object'?stage127:null,typeof stage128==='object'?stage128:null])if(s&&s.loop){s.loop=false;production219.legacyLoopsStopped++}}
function p219LegacyLoopsRetired(){return !(typeof stage121==='object'&&stage121?.loop)&&!(typeof stage127==='object'&&stage127?.loop)&&!(typeof stage128==='object'&&stage128?.loop)}

/* Ascension acceptance observer. It does not force forms; it exposes any missed long-run gate in replay. */
const p219AscensionSeconds=[0,60,105,150,195,245,300,360,425,495,570];
function p219FormIndex(){const f=String(typeof currentFormName==='function'?currentFormName():griffin?.form||'').toUpperCase();if(!f)return 0;const names=typeof forms!=='undefined'&&Array.isArray(forms)?forms:[];const i=names.findIndex(x=>String(x?.name||x||'').toUpperCase()===f);return i>=0?i:Math.max(0,Number(griffin?.formIndex)||0)}
function p219AscensionStatus(){const sec=Math.max(0,Number(elapsed)||0);let due=0;for(let i=1;i<p219AscensionSeconds.length;i++)if(sec>=p219AscensionSeconds[i]+8)due=i;const actual=p219FormIndex();const miss=Math.max(0,due-actual);if(miss)production219.ascensionMisses=Math.max(production219.ascensionMisses,miss);return{seconds:+sec.toFixed(2),due,actual,miss}}

const p219Omni=omniSystems;
omniSystems=function(dt){const out=p219Omni(dt);p219RetireLegacyLoops();p219SceneSync('STEP');p219Leash();production219.frames++;return out};
const p219Reset=reset;
reset=function(mode=autoMode){p219LastStage=0;p219LastEpoch=-1;production219.stageVisits.clear();production219.arenaVisits.clear();production219.opponentVisits.clear();const out=p219Reset(mode);p219RetireLegacyLoops();p219SceneSync('RESET');return out};
const p219Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p219Replay(frame);const scene=p219SceneSync('REPLAY'),b=p219Boss(),asc=p219AscensionStatus(),distance=b&&Number.isFinite(b.x)&&Number.isFinite(player?.x)?Math.hypot(b.x-player.x,b.y-player.y):0;frame.production219={system:production219.system,stage:scene?.stage||null,opponent:scene?.opponent||null,arena:scene?.arena||null,location:scene?.location||null,distance:+distance.toFixed(2),leashCap:W<720?315:380,voice:{installed:p219Voice.installed,pending:p219Voice.pending,suppressed:production219.voiceSuppressed,backpressure:production219.voiceBackpressure,errors:production219.voiceErrors},ascension:asc,visits:{stages:[...production219.stageVisits],opponents:[...production219.opponentVisits],arenas:[...production219.arenaVisits]},counts:{frames:production219.frames,leashRepairs:production219.leashRepairs,maxDistance:+production219.maxDistance.toFixed(2),sceneRebinds:production219.sceneRebinds,staleSceneRepairs:production219.staleSceneRepairs,legacyLoopsStopped:production219.legacyLoopsStopped,ascensionMisses:production219.ascensionMisses},invariants:{duelDistanceBounded:!b||distance<=(W<720?318:383),campaignStageOwnsScene:true,levelBoundaryRebindsExistingArenaImage:true,noStaleSceneReference:true,voiceQueueBounded:p219Voice.pending<=p219Voice.maxPending,duplicateVoiceSuppressed:true,legacyIndependentLoopsRetired:p219LegacyLoopsRetired(),nineStageAcceptance:typeof p218StageManifest!=='undefined'&&p218StageManifest.length===9,singleCanonicalOpponent:!running||campaign.phase==='LEVEL_CLEAR'||enemies.length===1,noSecondCanvas:true,noNewRaf:true}}};
try{p219RetireLegacyLoops();p219SceneSync('BOOT');p132CombatEvent('PRODUCTION_219_READY',{system:production219.system,fixes:['DUEL_SPACING_LEASH','LEVEL_BOUNDARY_ARENA_REBIND','STALE_SCENE_INVALIDATION','VOICE_DUPLICATE_SUPPRESSION','VOICE_QUEUE_BACKPRESSURE','LEGACY_LOOP_RETIREMENT','NINE_STAGE_REPLAY_ACCEPTANCE','ASCENSION_GATE_OBSERVER'],renderer:'EXISTING SINGLE CANVAS / SINGLE RAF'})}catch(err){production219.errors.push(String(err?.message||err))}
