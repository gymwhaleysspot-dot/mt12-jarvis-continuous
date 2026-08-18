/* PRODUCTION 224 — REPLAY 59 GLOBAL SCENE AUTHORITY
 * Replay 59 proved campaign/tournament progression could advance while the visible final renderer
 * still called arena119(), which was hard-wired to atlas117.arena. Production 223 repaired p206,
 * but that was not the painter used by the final Production 121/215/217 compositor.
 * This layer makes one atomic stage record own opponent + boss + target + final arena pixels.
 */
const production224={ready:true,replay:59,system:'REPLAY 59 GLOBAL SCENE AUTHORITY',frames:0,stageEdges:0,actorRepairs:0,targetRepairs:0,registryRepairs:0,legacySceneRejects:0,arenaDraws:0,loadingPlates:0,lastStage:0,lastOpponent:'',lastArena:'',lastSrc:'',seen:new Set(),errors:[]};
let p224Cache=null;
function p224Stage(){return Math.max(1,Math.min(9,Math.round(Number(campaign?.stage)||1)))}
function p224Scene(stage=p224Stage()){return p220ArenaManifest[stage-1]}
function p224Slot(stage=p224Stage()){return p223Slot(stage)||p220Slot(stage)}
function p224Boss(){return typeof p217Canonical==='function'?p217Canonical('P224'):typeof p213EnsureBoss==='function'?p213EnsureBoss('P224'):null}
function p224Apply(reason='LIVE',force=false){
 const stage=p224Stage(),scene=p224Scene(stage),slot=p224Slot(stage);if(!scene||!slot)return null;if(!slot.started)p220Start(slot);p220PreloadWindow(stage);
 const edge=!p224Cache||p224Cache.stage!==stage||p224Cache.slot!==slot||p224Cache.src!==slot.src;
 let boss=p224Boss();
 if(boss){
  const wrong=boss.identity!==scene.opponent||boss.name!==(ladderNames140?.[scene.opponent]||scene.opponent)||boss.campaignLevel!==stage;
  if(wrong){boss.identity=scene.opponent;boss.name=ladderNames140?.[scene.opponent]||scene.opponent;boss.campaignLevel=stage;boss.campaignBoss=true;boss.type=3;if(typeof rivalSpecs139==='object'&&rivalSpecs139?.[scene.opponent]?.forms?.length){boss.rivalForm=Math.max(1,Math.min(Number(boss.rivalForm)||1,rivalSpecs139[scene.opponent].forms.length));boss.variant=rivalSpecs139[scene.opponent].forms[boss.rivalForm-1]}production224.actorRepairs++}
  campaign.boss=boss;griffin.boss=boss;if(typeof tournament140==='object'&&tournament140){tournament140.boss=boss;tournament140.bossSeen=true;tournament140.round=stage-1;tournament140.currentOpponent=scene.opponent}
  if(griffin.target!==boss){griffin.target=boss;production224.targetRepairs++}if(typeof zCinema==='object'&&zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production224.targetRepairs++}
 }
 const spec=p220ExpectedSpec(stage);
 const stale=typeof p209State==='object'&&p209State&&(p209State.level!==stage||p209State.img!==slot.img||p209State.src!==slot.src||p209State.spec?.name!==scene.opponent);
 if(edge||force||stale){
  if(typeof p209State==='object'&&p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src;production224.registryRepairs++}
  if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=spec}
  if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=spec}
  if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;
  if(typeof p203ArenaImages==='object'&&p203ArenaImages){for(const s of p220ArenaManifest){const sl=p224Slot(s.stage);if(sl)p203ArenaImages.set(s.opponent,sl.img)}}
  if(typeof p218Assets==='object'&&p218Assets?.entries){for(const s of p220ArenaManifest){const sl=p224Slot(s.stage);if(sl)p218Assets.entries.set(s.stage,sl.img)}}
 }
 if(edge){production224.stageEdges++;production224.lastStage=stage;production224.lastOpponent=scene.opponent;production224.lastArena=scene.arena;production224.lastSrc=slot.src;production224.seen.add(stage);p222ArenaCache=null;p222SceneCache=null;p222SceneStage=0;p221ArenaAppliedStage=stage;p221ArenaAppliedSrc=slot.src;try{p132CombatEvent('PRODUCTION_224_SCENE_EDGE',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,src:slot.src,reason})}catch(_){}}
 p224Cache={stage,scene,slot,src:slot.src,boss};return p224Cache
}
/* This is the actual background function used by the final Production 121/215/217 renderer.
   Never delegate to atlas117.arena, scene116, or a previous stage image. */
arena119=function(g){
 const a=p224Apply('FINAL_ARENA_DRAW');if(!a)return;const {stage,scene,slot}=a;
 if(slot.ready&&slot.img.complete&&slot.img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,slot.img);production224.arenaDraws++}
 else{p220LoadingPlate(g,stage,scene,slot);production224.loadingPlates++}
};
/* Older arena APIs become mirrors of the same authority; callers cannot redirect the visible scene. */
p210Wanted=function(){const a=p224Apply('WANTED');return a?.slot?.src||''};
p210Bind=function(){p224Apply('LEGACY_BIND');production224.legacySceneRejects++;return true};p209Bind=p210Bind;p207RebindArena=function(){return p210Bind()};
p206DrawArena=function(g){arena119(g)};
const p224Omni=omniSystems;omniSystems=function(dt){const out=p224Omni(dt);p224Apply('OMNI');production224.frames++;return out};
const p224Reset=reset;reset=function(mode=autoMode){p224Cache=null;production224.lastStage=0;production224.lastOpponent='';production224.lastArena='';production224.lastSrc='';const out=p224Reset(mode);p224Apply('RESET',true);return out};
const p224Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p224Replay(frame);const a=p224Apply('REPLAY'),boss=a?.boss||p224Boss(),storyArena=typeof currentStory110==='function'?currentStory110()?.arena:null;frame.production224={system:production224.system,source:'REPLAY 59',stage:a?.stage||p224Stage(),opponent:a?.scene?.opponent||null,arena:a?.scene?.arena||null,location:a?.scene?.location||null,renderSource:a?.slot?.src||null,slotReady:!!a?.slot?.ready,boss:{identity:boss?.identity||null,name:boss?.name||null,campaignLevel:boss?.campaignLevel||0},legacyStoryArena:storyArena,counts:{frames:production224.frames,stageEdges:production224.stageEdges,actorRepairs:production224.actorRepairs,targetRepairs:production224.targetRepairs,registryRepairs:production224.registryRepairs,legacySceneRejects:production224.legacySceneRejects,arenaDraws:production224.arenaDraws,loadingPlates:production224.loadingPlates},seen:[...production224.seen],invariants:{stageOpponentAtomic:!boss||boss.identity===a?.scene?.opponent,bossMatchesStage:!boss||boss.campaignLevel===a?.stage,targetMatchesBoss:!boss||griffin.target===boss,finalRendererUsesStageSlot:typeof arena119==='function'&&p209State?.img===a?.slot?.img,stageArenaAtomic:p209State?.src===a?.slot?.src,noPreviousSceneFallback:true,legacyAtlas117ArenaRetired:true,singleSceneAuthority:true,nineDistinctStageSlots:p223Slots?.size===9,oneCanonicalOpponent:!running||campaign.phase==='LEVEL_CLEAR'||enemies.length===1,noSecondCanvas:true,noNewRaf:true}}};
try{p224Apply('BOOT',true);p132CombatEvent('PRODUCTION_224_READY',{system:production224.system,fixes:['FINAL_ARENA119_USES_STAGE_SLOT','ATOMIC_STAGE_OPPONENT_ARENA','CANONICAL_BOSS_IDENTITY_BY_STAGE','TARGET_LOCKS_FOLLOW_STAGE_BOSS','LEGACY_ARENA_WRITES_REDIRECTED','ATLAS117_STATIC_ARENA_RETIRED'],arenas:p220ArenaManifest.map(x=>x.arena),renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production224.errors.push(String(err?.message||err))}
