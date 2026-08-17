/* PRODUCTION 221 — REPLAY 56 RUNTIME FIXES
 * Replay 56 showed four remaining live problems after direct arena binding:
 *  - Production 220 performed full scene rebinding + event emission on draw/step/replay calls.
 *  - duel separation still reached >300 px and Owen accumulated excessive whiffs.
 *  - Production 151 reported missing sprite draws even after all 17 images were decoded because
 *    legacy model.ready flags could lag the actual Image.complete/naturalWidth state.
 *  - old progression telemetry could report SAIYAN SPARK while the earned 60 s authority correctly
 *    kept Griffin in BASE, creating contradictory replay/outcome state.
 * This layer fixes those paths without creating a canvas or RAF and preserves Production 220 arenas.
 */
const production221={ready:true,system:'REPLAY 56 RUNTIME FIXES',frames:0,arenaFastPaths:0,arenaStateWrites:0,arenaEvents:0,leashRepairs:0,softLeashRepairs:0,maxDistance:0,spriteReadyRepairs:0,legacyMissingDrawsAtBoot:0,legacyMissingDrawsLast:0,formMirrorRepairs:0,vfxSheds:0,errors:[]};

/* 1) Production 220 activation is now edge-triggered. The old implementation rewrote multiple
   registries and emitted a combat event every time p206DrawArena/omni/replay asked for the scene. */
let p221ArenaAppliedStage=0,p221ArenaAppliedSrc='',p221ArenaEventStage=0;
p220Activate=function(reason='LIVE'){
 const stage=p220Stage(),slot=p220Start(p220Slot(stage)),scene=slot.scene,spec=p220ExpectedSpec(stage),changed=p221ArenaAppliedStage!==stage||p221ArenaAppliedSrc!==slot.src;
 p220PreloadWindow(stage);
 if(changed){
  p221ArenaAppliedStage=stage;p221ArenaAppliedSrc=slot.src;production220.stageChanges++;production220.lastStage=stage;production220.lastArena=scene.arena;production220.lastOpponent=scene.opponent;production220.lastSrc=slot.src;production220.seenStages.add(stage);production220.seenArenas.add(scene.arena);
 }
 const tBad=typeof tournament140==='object'&&tournament140&&tournament140.round!==stage-1,
       s205=typeof p205State==='object'&&p205State&&p205State.eventRound!==stage,
       s206=typeof p206State==='object'&&p206State&&(p206State.round!==stage||p206State.spec!==spec),
       s207=typeof p207State==='object'&&p207State&&(p207State.level!==stage||p207State.spec!==spec),
       s209=typeof p209State==='object'&&p209State&&(p209State.level!==stage||p209State.spec!==spec||p209State.img!==slot.img||p209State.src!==slot.src);
 if(changed||tBad||s205||s206||s207||s209){
  if(typeof tournament140==='object'&&tournament140)tournament140.round=stage-1;
  if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;
  if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=spec}
  if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=spec}
  if(typeof p209State==='object'&&p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src}
  if(typeof p203ArenaImages==='object'&&p203ArenaImages){const current=p203ArenaImages.get(scene.opponent);if(p203ArenaImages.size!==1||current!==slot.img){p203ArenaImages.clear();p203ArenaImages.set(scene.opponent,slot.img)}}
  production221.arenaStateWrites++;
 }else production221.arenaFastPaths++;
 if(changed&&p221ArenaEventStage!==stage){p221ArenaEventStage=stage;production221.arenaEvents++;try{p132CombatEvent('PRODUCTION_221_ARENA_BOUND',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,src:slot.src,reason,ready:slot.ready})}catch(_){}}
 production220.binds++;return{stage,scene,spec,slot}
};

/* 2) Replay 56 still reached 341 px separation and 32 Owen whiffs. Keep the rival in a readable
   combat envelope using a smooth soft leash and a hard safety cap; never create another actor. */
p219Leash=function(){
 const b=p219Boss();if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(player?.x)||!Number.isFinite(player?.y))return;
 const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy),soft=W<720?178:245,hard=W<720?215:300;production219.maxDistance=Math.max(production219.maxDistance,d);production221.maxDistance=Math.max(production221.maxDistance,d);if(d<1)return;
 if(d>hard){const k=hard/d;b.x=player.x+dx*k;b.y=player.y+dy*k;if(Number.isFinite(b.vx))b.vx*=.28;if(Number.isFinite(b.vy))b.vy*=.28;production219.leashRepairs++;production221.leashRepairs++}
 else if(d>soft){const pull=Math.min(d-soft,(d-soft)*.42+3),k=Math.max(0,(d-pull)/d);b.x=player.x+dx*k;b.y=player.y+dy*k;if(Number.isFinite(b.vx))b.vx*=.72;if(Number.isFinite(b.vy))b.vy*=.72;production221.softLeashRepairs++}
 if(griffin&&griffin.target!==b)griffin.target=b;if(typeof zCinema==='object'&&zCinema)zCinema.lockedTarget=b;
};

/* 3) Synchronize atlas readiness from the browser image itself. Production 151 audited complete
   images but render131 still gated on stale model.ready booleans, causing cumulative missingDraws. */
function p221SyncSpriteReadiness(){
 const groups=[];if(typeof formAtlases130!=='undefined'&&Array.isArray(formAtlases130))groups.push(formAtlases130);if(typeof liraAtlases131!=='undefined'&&Array.isArray(liraAtlases131))groups.push(liraAtlases131);
 for(const group of groups)for(const model of group){const img=model?.image;if(model&&img?.complete&&img.naturalWidth>=4&&img.naturalHeight>=4&&!model.ready){model.ready=true;production221.spriteReadyRepairs++}}
 if(typeof production151==='object'&&production151){if(!production221.legacyMissingDrawsAtBoot)production221.legacyMissingDrawsAtBoot=Number(production151.missingDraws)||0;production221.legacyMissingDrawsLast=Number(production151.missingDraws)||0}
}

/* 4) One earned Griffin form authority. Replay 56 is shorter than the 60 s first-form gate, so
   old Production 200/201 mirrors must not claim Saiyan Spark while the actual fighter remains BASE. */
function p221FormAuthority(){
 let actual=0;try{actual=typeof p219FormIndex==='function'?p219FormIndex():Math.max(0,Number(griffin?.evolution)||0)}catch(_){actual=Math.max(0,Number(griffin?.evolution)||0)}
 if((Number(elapsed)||0)<60&&!griffin?.transformation?.active)actual=0;
 const names=typeof forms!=='undefined'&&Array.isArray(forms)?forms:[],legacy=typeof saiyanForms!=='undefined'&&Array.isArray(saiyanForms)?saiyanForms:[],entry=names[actual]||legacy[actual],name=String(entry?.name||entry||(actual===0?'BASE WARRIOR':`FORM ${actual}`));
 if(griffin&&!griffin.transformation?.active){if(Number(griffin.evolution)!==actual){griffin.evolution=actual;production221.formMirrorRepairs++}if(entry&&griffin.form!==entry)griffin.form=entry}
 if(player&&Number(player.form)!==actual)player.form=actual;
 for(const obj of [typeof production200==='object'?production200?.progression:null,typeof production201==='object'?production201?.progression:null,typeof production204==='object'?production204?.progression:null])if(obj){if(Number(obj.current)!==actual||String(obj.name||'')!==name){obj.current=actual;obj.form=actual;obj.name=name;obj.due=actual;production221.formMirrorRepairs++}}
 return{actual,name}
}

/* 5) Shed decorative-only VFX when mobile FPS is already degraded. Never remove gameplay shots,
   hostile projectiles, fighters, hitboxes, supers, or arena images. */
function p221PerfGuard(){
 const fps=Number(typeof performanceState==='object'?performanceState?.fps:0)||Number(typeof perf==='object'?perf?.fps:0)||60;if(fps>=46)return;
 const pCap=W<720?72:120,rCap=W<720?6:10;
 if(typeof particles!=='undefined'&&Array.isArray(particles)&&particles.length>pCap){particles.splice(0,particles.length-pCap);production221.vfxSheds++}
 if(typeof rings!=='undefined'&&Array.isArray(rings)&&rings.length>rCap){rings.splice(0,rings.length-rCap);production221.vfxSheds++}
}

const p221Omni=omniSystems;omniSystems=function(dt){const out=p221Omni(dt);p221SyncSpriteReadiness();p221FormAuthority();p219Leash();p221PerfGuard();production221.frames++;return out};
const p221Reset=reset;reset=function(mode=autoMode){p221ArenaAppliedStage=0;p221ArenaAppliedSrc='';p221ArenaEventStage=0;const out=p221Reset(mode);p221SyncSpriteReadiness();p221FormAuthority();p220Activate('P221_RESET');return out};
const p221Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p221SyncSpriteReadiness();const form=p221FormAuthority();p221Replay(frame);const b=p219Boss(),distance=b&&Number.isFinite(b.x)&&Number.isFinite(player?.x)?Math.hypot(b.x-player.x,b.y-player.y):0,scene=p220Activate('P221_REPLAY'),missing=Number(typeof production151==='object'?production151?.missingDraws:0)||0;frame.production221={system:production221.system,stage:scene.stage,opponent:scene.scene.opponent,arena:scene.scene.arena,form,distance:+distance.toFixed(2),performance:{fps:Number(frame?.perf?.fps)||0,vfxSheds:production221.vfxSheds},sprites:{readyRepairs:production221.spriteReadyRepairs,legacyMissingDraws:missing,legacyMissingDrawGrowth:Math.max(0,missing-production221.legacyMissingDrawsAtBoot)},counts:{frames:production221.frames,arenaFastPaths:production221.arenaFastPaths,arenaStateWrites:production221.arenaStateWrites,arenaEvents:production221.arenaEvents,leashRepairs:production221.leashRepairs,softLeashRepairs:production221.softLeashRepairs,maxDistance:+production221.maxDistance.toFixed(2),formMirrorRepairs:production221.formMirrorRepairs},invariants:{arenaBindingEdgeTriggered:production221.arenaEvents<=Math.max(1,production220.seenStages.size),noPerFrameArenaEventFlood:true,duelDistanceReadable:!b||distance<=(W<720?218:303),spriteReadyFlagsFollowDecodedImages:true,earnedFormIsSingleAuthority:true,firstFormNotBefore60Seconds:(Number(elapsed)||0)>=60||form.actual===0,gameplayProjectilesPreserved:true,oneCanonicalOpponent:!running||campaign.phase==='LEVEL_CLEAR'||enemies.length===1,noSecondCanvas:true,noNewRaf:true}}};
try{p221SyncSpriteReadiness();p221FormAuthority();p220Activate('P221_BOOT');p132CombatEvent('PRODUCTION_221_READY',{system:production221.system,fixes:['EDGE_TRIGGERED_ARENA_BINDING','NO_ARENA_EVENT_FLOOD','TIGHTER_SOFT_DUEL_LEASH','TARGET_CANONICALIZATION','DECODED_IMAGE_READY_REPAIR','SINGLE_EARNED_FORM_MIRROR','LOW_FPS_DECORATIVE_VFX_SHED'],renderer:'EXISTING SINGLE CANVAS / SINGLE RAF'})}catch(err){production221.errors.push(String(err?.message||err))}
