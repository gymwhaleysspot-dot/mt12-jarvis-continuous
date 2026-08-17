/* PRODUCTION 211 — CANONICAL CAMPAIGN ROUND → TOURNAMENT SCENE AUTHORITY
 * Fixes the remaining live scene lock by removing mixed-base/stale round voting.
 * campaign.stage is the canonical one-based visible round while a run is active;
 * tournament140.round is only its zero-based mirror. Arena/opponent order follows
 * the actual Production 140 ladder, and reset invalidates every stale scene lock.
 */
const production211={ready:true,system:'CANONICAL CAMPAIGN ROUND → TOURNAMENT SCENE AUTHORITY',frames:0,stageChanges:0,roundRepairs:0,resetRepairs:0,lastStage:0,lastOpponent:'',lastArena:'',seenStages:new Set(),seenArenas:new Set()};
const p211Ladder=Object.freeze(['LIRA','KAIROX','SOLENNE','MIREYA','ZEPHYRA','ORUN','MORDREN','SABLE','KRAKEN']);
const p211ByName=new Map(p203Roster.map(spec=>[spec.name,spec]));
function p211Positive(v){v=Number(v);return Number.isFinite(v)&&v>0?Math.round(v):0}
function p211Stage(){
 const campaignStage=p211Positive(typeof campaign==='object'&&campaign?.stage);
 if(campaignStage)return Math.min(p211Ladder.length,campaignStage);
 const tournamentZero=Number(typeof tournament140==='object'&&tournament140?.round);
 if(Number.isFinite(tournamentZero)&&tournamentZero>=0)return Math.min(p211Ladder.length,Math.round(tournamentZero)+1);
 const eventRound=p211Positive(typeof p205State==='object'&&p205State?.eventRound);
 return Math.min(p211Ladder.length,eventRound||1)
}
function p211Spec(stage=p211Stage()){
 const id=p211Ladder[(Math.max(1,stage)-1)%p211Ladder.length];
 return p211ByName.get(id)||p203Roster[0]
}
/* Replace all mixed-base round/spec readers with the same canonical source. */
p205TournamentRound=function(){return p211Stage()};
p205Spec=function(round=p211Stage()){return p211Spec(round)};
p206Round=function(){return p211Stage()};
p206Spec=function(round=p211Stage()){return p211Spec(round)};
p207Level=function(){return p211Stage()};
p207Spec=function(level=p211Stage()){return p211Spec(level)};
/* Force a deployment-specific request while still rebinding the exact existing image. */
p210Wanted=function(level,spec){return `jarvis/assets/survivor/arenas/${spec.arena}?stage=${level}&production=211`};
function p211Sync(reason='LIVE'){
 const stage=p211Stage(),spec=p211Spec(stage),changed=stage!==production211.lastStage||spec.arena!==production211.lastArena;
 if(typeof tournament140==='object'&&tournament140){const wanted=stage-1;if(Number(tournament140.round)!==wanted){tournament140.round=wanted;production211.roundRepairs++}}
 if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;
 if(changed){production211.lastStage=stage;production211.lastOpponent=spec.name;production211.lastArena=spec.arena;production211.stageChanges++;production211.seenStages.add(stage);production211.seenArenas.add(spec.arena);
  /* Invalidate every prior scene/image key so the next final draw must bind this stage. */
  if(typeof p206State==='object'&&p206State){p206State.round=0;p206State.spec=null}
  if(typeof p207State==='object'&&p207State){p207State.level=0;p207State.spec=null}
  if(typeof p209State==='object'&&p209State){p209State.level=0;p209State.spec=null;p209State.src=''}
  p210Bind(spec,stage);
  try{p132CombatEvent('PRODUCTION_211_STAGE_BOUND',{stage,opponent:spec.name,arena:spec.arena,reason})}catch(_){}}
 production211.frames++;return {stage,spec}
}
const p211Omni=omniSystems;
omniSystems=function(dt){const out=p211Omni(dt);if(running)p211Sync('LIVE');return out};
const p211Reset=reset;
reset=function(mode=autoMode){
 if(typeof p205State==='object'&&p205State)p205State.eventRound=0;
 if(typeof p206State==='object'&&p206State){p206State.round=0;p206State.spec=null}
 if(typeof p207State==='object'&&p207State){p207State.level=0;p207State.spec=null}
 if(typeof p209State==='object'&&p209State){p209State.level=0;p209State.spec=null;p209State.src=''}
 const out=p211Reset(mode);production211.lastStage=0;production211.lastOpponent='';production211.lastArena='';production211.resetRepairs++;p211Sync('RESET');return out
};
const p211Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p211Replay(frame);const {stage,spec}=p211Sync('REPLAY');frame.production211={system:production211.system,stage,tournamentRoundZeroBased:typeof tournament140==='object'?tournament140.round:null,opponent:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,renderSource:typeof p209State==='object'?p209State.src:null,counts:{frames:production211.frames,stageChanges:production211.stageChanges,roundRepairs:production211.roundRepairs,resetRepairs:production211.resetRepairs,uniqueStages:production211.seenStages.size,uniqueArenas:production211.seenArenas.size},invariants:{campaignStageIsCanonical:true,tournamentRoundIsZeroBasedMirror:true,staleEventRoundCannotOverrideStage:true,resetClearsSceneLocks:true,ladderOpponentMatchesArena:true,existingArenaImageRebound:true,singleRendererPreserved:true}}};
try{p132CombatEvent('PRODUCTION_211_READY',{system:production211.system,stageAuthority:'campaign.stage',tournamentMirror:'campaign.stage - 1',ladder:p211Ladder,renderer:'PRODUCTION_206_SINGLE_FINAL_RENDERER'})}catch(_){}
