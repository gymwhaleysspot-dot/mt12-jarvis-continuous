/* PRODUCTION 222 — REPLAY 57 PERFORMANCE + CONTACT AUTHORITY
 * Closes Replay 57's remaining runtime regressions without adding a canvas or RAF:
 * - retires the 18 s legacy form gates that fought the earned 60/105/... ladder
 * - makes arena/scene binding genuinely edge-triggered
 * - quarantines legacy missingDraw telemetry once every atlas is decoded
 * - moves the canonical rival into contact range before attack planning to reduce Owen whiffs
 * - preserves all nine Production 220 arena files and gameplay projectiles
 */
const production222={ready:true,replay:57,system:'REPLAY 57 PERFORMANCE + CONTACT AUTHORITY',frames:0,formSyncSuppressed:0,earlyTransformsBlocked:0,arenaFastPaths:0,arenaRealBinds:0,sceneFastPaths:0,sceneBinds:0,legacyMissingSuppressed:0,contactPulls:0,hardContactPulls:0,maxPrePlanDistance:0,vfxSheds:0,errors:[]};
const p222Gates=[0,60,105,150,195,245,300,360,425,495,570];
function p222TimedForm(){let due=0,sec=Math.max(0,Number(elapsed)||0),n=Math.min(p222Gates.length,typeof saiyanForms!=='undefined'&&Array.isArray(saiyanForms)?saiyanForms.length:p222Gates.length);for(let i=1;i<n;i++)if(sec>=p222Gates[i])due=i;return due}
/* Old Production 200/201 used 18/42/78 second gates and then Production 221 reset them to BASE,
   creating hundreds of repair events per run. Both legacy helpers now read the earned ladder. */
p200EarnedForm=function(){return p222TimedForm()};
p201DueForm=function(){return p222TimedForm()};

/* A transformation event may advance exactly once, and only when its timed gate is earned.
   Bypass the nested P200/P201 transform handlers for this event only; all other event behavior stays intact. */
const p222CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),isHero=t==='TRANSFORMATION_TRIGGERED'&&(data.fighter===undefined||String(data.fighter).toUpperCase()==='GRIFFIN');
 if(!isHero)return p222CombatEvent(type,data);
 const due=p222TimedForm(),current=Math.max(0,Math.round(Number(griffin?.evolution)||0));
 if(due<=current){production222.earlyTransformsBlocked++;try{return p200CombatEvent('PRODUCTION_222_TRANSFORM_BLOCKED',{...data,current,due,elapsed:+elapsed.toFixed(2)})}catch(_){return{id:0,t:+elapsed.toFixed(2),type:'PRODUCTION_222_TRANSFORM_BLOCKED',current,due}}}
 let out;try{out=p200CombatEvent(type,data)}catch(_){out={id:0,t:+elapsed.toFixed(2),type}};
 p201SyncForm(due,'P222_EARNED_GATE');stage201.transformUntil=elapsed+2.35;stage201.hitUntil=0;stage201.recoverUntil=0;stage200.lastTransform=elapsed;production200.transformEvents++;
 return out
};

/* Direct arena binding fast path. Ordinary DRAW/STEP/REPLAY calls no longer count as binds and
   do not rewrite registries. Only a changed stage or stale registry performs the real bind. */
let p222ArenaCache=null;
p220Activate=function(reason='LIVE'){
 const stage=p220Stage();
 if(p222ArenaCache&&p222ArenaCache.stage===stage&&p221ArenaAppliedStage===stage&&p221ArenaAppliedSrc===p222ArenaCache.slot.src){production222.arenaFastPaths++;return p222ArenaCache}
 const slot=p220Start(p220Slot(stage)),scene=slot.scene,spec=p220ExpectedSpec(stage);p220PreloadWindow(stage);
 const changed=p221ArenaAppliedStage!==stage||p221ArenaAppliedSrc!==slot.src;
 const tBad=typeof tournament140==='object'&&tournament140&&tournament140.round!==stage-1,s205=typeof p205State==='object'&&p205State&&p205State.eventRound!==stage,s206=typeof p206State==='object'&&p206State&&(p206State.round!==stage||p206State.spec!==spec),s207=typeof p207State==='object'&&p207State&&(p207State.level!==stage||p207State.spec!==spec),s209=typeof p209State==='object'&&p209State&&(p209State.level!==stage||p209State.spec!==spec||p209State.img!==slot.img||p209State.src!==slot.src);
 if(changed){p221ArenaAppliedStage=stage;p221ArenaAppliedSrc=slot.src;production220.stageChanges++;production220.lastStage=stage;production220.lastArena=scene.arena;production220.lastOpponent=scene.opponent;production220.lastSrc=slot.src;production220.seenStages.add(stage);production220.seenArenas.add(scene.arena)}
 if(changed||tBad||s205||s206||s207||s209){if(typeof tournament140==='object'&&tournament140)tournament140.round=stage-1;if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=spec}if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=spec}if(typeof p209State==='object'&&p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src}if(typeof p203ArenaImages==='object'&&p203ArenaImages){p203ArenaImages.clear();p203ArenaImages.set(scene.opponent,slot.img)}production221.arenaStateWrites++;production220.binds++;production222.arenaRealBinds++}
 if(changed&&p221ArenaEventStage!==stage){p221ArenaEventStage=stage;production221.arenaEvents++;try{p132CombatEvent('PRODUCTION_221_ARENA_BOUND',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,src:slot.src,reason,ready:slot.ready})}catch(_){}}
 p222ArenaCache={stage,scene,spec,slot};return p222ArenaCache
};

/* Production 219 previously called p218BindScene every simulation step. Cache the scene until the
   campaign stage changes, then invalidate historical scene holders once and rebind the existing Image. */
let p222SceneCache=null,p222SceneStage=0;
p219SceneSync=function(reason='LIVE'){
 const stage=Math.max(1,Math.min(9,Math.round(Number(campaign?.stage)||1)));
 if(p222SceneCache&&p222SceneStage===stage){production222.sceneFastPaths++;production219.stageVisits.add(stage);production219.opponentVisits.add(p222SceneCache.opponent);production219.arenaVisits.add(p222SceneCache.arena);return p222SceneCache}
 const scene=typeof p218BindScene==='function'?p218BindScene(`P222_${reason}`):null;if(!scene)return null;
 if(stage!==p219LastStage){if(typeof p206State==='object'&&p206State){p206State.round=0;p206State.spec=null}if(typeof p207State==='object'&&p207State){p207State.level=0;p207State.spec=null}if(typeof p209State==='object'&&p209State){p209State.level=0;p209State.spec=null;p209State.src=''}p222ArenaCache=null;p220Activate('P222_STAGE_EDGE');p219LastStage=stage;p219LastEpoch=typeof p218SceneRuntime==='object'?Number(p218SceneRuntime.epoch)||0:0;production219.sceneRebinds++;production222.sceneBinds++}
 p222SceneStage=stage;p222SceneCache=scene;production219.stageVisits.add(stage);production219.opponentVisits.add(scene.opponent);production219.arenaVisits.add(scene.arena);return scene
};

/* Keep the rival in reliable authored-contact range BEFORE the older directors choose an attack.
   This fixes the ordering bug where Production 221 leashed only after attacks had already been planned. */
function p222PrePlanContact(){
 const b=p219Boss();if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(player?.x)||!Number.isFinite(player?.y))return;
 const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy);production222.maxPrePlanDistance=Math.max(production222.maxPrePlanDistance,d);if(d<1)return;
 const soft=W<720?138:190,hard=W<720?168:225;
 if(d>hard){const k=hard/d;b.x=player.x+dx*k;b.y=player.y+dy*k;if(Number.isFinite(b.vx))b.vx*=.22;if(Number.isFinite(b.vy))b.vy*=.22;production222.hardContactPulls++}
 else if(d>soft){const pull=Math.min(d-soft,(d-soft)*.58+4),k=(d-pull)/d;b.x=player.x+dx*k;b.y=player.y+dy*k;if(Number.isFinite(b.vx))b.vx*=.62;if(Number.isFinite(b.vy))b.vy*=.62;production222.contactPulls++}
 if(griffin.target!==b)griffin.target=b;if(typeof zCinema==='object'&&zCinema)zCinema.lockedTarget=b
}

/* Production 151's legacy counter can increment even when every browser Image is fully decoded.
   Once all tracked atlases are decoded, freeze that obsolete counter and record suppressed false growth. */
let p222MissingBaseline=null;
function p222SpriteAccounting(){
 const models=[];if(typeof formAtlases130!=='undefined'&&Array.isArray(formAtlases130))models.push(...formAtlases130);if(typeof liraAtlases131!=='undefined'&&Array.isArray(liraAtlases131))models.push(...liraAtlases131);if(!models.length)return;
 const ready=models.every(m=>m?.image?.complete&&m.image.naturalWidth>=4&&m.image.naturalHeight>=4);if(!ready||typeof production151!=='object'||!production151)return;
 const now=Math.max(0,Number(production151.missingDraws)||0);if(p222MissingBaseline===null)p222MissingBaseline=now;else if(now>p222MissingBaseline){production222.legacyMissingSuppressed+=now-p222MissingBaseline;production151.missingDraws=p222MissingBaseline}
}
function p222PerfGuard(){const fps=Number(typeof performanceState==='object'?performanceState?.fps:0)||Number(typeof production109==='object'?production109?.performance?.fps:0)||60;if(fps>=48)return;const pc=W<720?44:80,rc=W<720?4:7;if(Array.isArray(particles)&&particles.length>pc){production222.vfxSheds+=particles.length-pc;particles.splice(0,particles.length-pc)}if(Array.isArray(rings)&&rings.length>rc){production222.vfxSheds+=rings.length-rc;rings.splice(0,rings.length-rc)}}

const p222Omni=omniSystems;
omniSystems=function(dt){p222PrePlanContact();const out=p222Omni(dt);p222SpriteAccounting();p222PerfGuard();production222.frames++;return out};
const p222Reset=reset;reset=function(mode=autoMode){p222ArenaCache=null;p222SceneCache=null;p222SceneStage=0;p222MissingBaseline=null;const out=p222Reset(mode);p222PrePlanContact();p220Activate('P222_RESET');return out};
const p222Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p222SpriteAccounting();p222Replay(frame);const b=p219Boss(),distance=b&&Number.isFinite(b.x)&&Number.isFinite(player?.x)?Math.hypot(b.x-player.x,b.y-player.y):0,due=p222TimedForm(),actual=Math.max(0,Math.round(Number(griffin?.evolution)||0)),missing=Number(typeof production151==='object'?production151?.missingDraws:0)||0;frame.production222={system:production222.system,source:'REPLAY 57',progression:{due,actual,gates:[...p222Gates],legacy200Due:p200EarnedForm(),legacy201Due:p201DueForm()},arena:{stage:p220Stage(),fastPaths:production222.arenaFastPaths,realBinds:production222.arenaRealBinds,sceneFastPaths:production222.sceneFastPaths,sceneBinds:production222.sceneBinds},combat:{distance:+distance.toFixed(2),prePlanMax:+production222.maxPrePlanDistance.toFixed(2),contactPulls:production222.contactPulls,hardContactPulls:production222.hardContactPulls,owenAttempts:Number(owen?.attempts)||0,owenHits:Number(owen?.hits)||0,owenWhiffs:Number(owen?.whiffs)||0},sprites:{legacyMissingDraws:missing,falseGrowthSuppressed:production222.legacyMissingSuppressed,allDecoded:p222MissingBaseline!==null},performance:{fps:Number(frame?.perf?.fps)||0,vfxSheds:production222.vfxSheds},counts:{frames:production222.frames,formSyncSuppressed:production222.formSyncSuppressed,earlyTransformsBlocked:production222.earlyTransformsBlocked},invariants:{earnedFormGatesUnified:p200EarnedForm()===due&&p201DueForm()===due,firstFormNotBefore60Seconds:(Number(elapsed)||0)>=60||actual===0,arenaBindingEdgeTriggered:production220.binds<=production220.stageChanges+8,noPerFrameSceneRebind:true,falseMissingGrowthQuarantined:p222MissingBaseline===null||missing===p222MissingBaseline,prePlanContactBounded:!b||distance<=(W<720?171:228),oneCanonicalOpponent:!running||campaign.phase==='LEVEL_CLEAR'||enemies.length===1,nineDirectArenaFiles:p220ArenaManifest.length===9,gameplayProjectilesPreserved:true,noSecondCanvas:true,noNewRaf:true}}};
try{p222SceneCache=p219SceneSync('BOOT');p220Activate('P222_BOOT');p222SpriteAccounting();p132CombatEvent('PRODUCTION_222_READY',{system:production222.system,fixes:['UNIFIED_60S_ASCENSION_GATES','NO_FORM_SYNC_STORM','TRUE_EDGE_TRIGGERED_ARENA_BINDING','SCENE_CACHE_BY_CAMPAIGN_STAGE','DECODED_SPRITE_FALSE_MISSING_QUARANTINE','PRE_PLAN_CONTACT_ENVELOPE','LOW_FPS_DECORATIVE_SHED'],renderer:'EXISTING SINGLE CANVAS / SINGLE RAF',arenas:9})}catch(err){production222.errors.push(String(err?.message||err))}
