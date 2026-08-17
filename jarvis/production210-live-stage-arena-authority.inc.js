/* PRODUCTION 210 — LIVE STAGE + EXISTING ARENA IMAGE AUTHORITY
 * Fixes the live failure where tournament round can remain 1 while campaign.stage advances,
 * pinning every visible fight to Lira/Nexus. The effective round is the maximum live stage
 * authority, and the exact existing arenaImage object is rebound and consumed by the one
 * Production 206 final arena renderer. Stale arena registry references are cleared.
 */
const production210={ready:true,system:'LIVE STAGE + EXISTING ARENA IMAGE AUTHORITY',frames:0,stageRepairs:0,imageRebinds:0,draws:0,fallbacks:0,lastRound:0,lastFighter:'',lastArena:'',lastSrc:'',seenRounds:new Set(),seenArenas:new Set()};
const p210LegacyRound=p205TournamentRound;
function p210Positive(v){v=Number(v);return Number.isFinite(v)&&v>0?Math.round(v):0}
p205TournamentRound=function(){
 const candidates=[
  p210Positive(p210LegacyRound()),
  p210Positive(typeof tournament140==='object'&&tournament140?.round),
  p210Positive(typeof production140State==='object'&&production140State?.round),
  p210Positive(typeof stage199==='object'&&stage199?.round),
  p210Positive(typeof campaign==='object'&&campaign?.stage),
  p210Positive(p205State?.eventRound)
 ];
 return Math.max(1,...candidates)
};
const p210ArenaImage=(typeof arenaImage!=='undefined'&&arenaImage)||(typeof p209State==='object'&&p209State?.img)||new Image();
function p210Wanted(level,spec){return `jarvis/assets/survivor/arenas/${spec.arena}?level=${level}&production=210`}
function p210Bind(spec,level=p207Level()){
 if(!spec)return false;const wanted=p210Wanted(level,spec),changed=p209State.level!==level||p209State.spec?.arena!==spec.arena||p209State.img!==p210ArenaImage||p209State.src!==wanted;
 if(!changed)return false;
 const priorRound=p209State.level,token=++p209State.token;p209State.level=level;p209State.spec=spec;p209State.img=p210ArenaImage;p209State.src=wanted;
 production210.frames++;production210.lastRound=level;production210.lastFighter=spec.name;production210.lastArena=spec.arena;production210.lastSrc=wanted;production210.seenRounds.add(level);production210.seenArenas.add(spec.arena);if(priorRound&&priorRound!==level)production210.stageRepairs++;
 p210ArenaImage.decoding='async';p210ArenaImage.onload=()=>{if(token===p209State.token)production209.decoded++};p210ArenaImage.onerror=()=>{if(token===p209State.token)production209.loadErrors++};
 if(String(p210ArenaImage.src||'')!==wanted){p210ArenaImage.src=wanted;production210.imageRebinds++;production207.imageRebinds++}
 if(typeof p203ArenaImages!=='undefined'){p203ArenaImages.clear();p203ArenaImages.set(spec.name,p210ArenaImage)}
 production209.binds++;production209.lastLevel=level;production209.lastFighter=spec.name;production209.lastArena=spec.arena;production209.lastSrc=wanted;production209.seenArenas.add(spec.arena);
 try{p132CombatEvent('PRODUCTION_210_ARENA_BOUND',{level,fighter:spec.name,arena:spec.arena,src:wanted,existingImage:true})}catch(_){}
 return true
}
p209Bind=p210Bind;
p207RebindArena=function(spec){return p210Bind(spec,p207Level())};
p206DrawArena=function(g){
 const {round,spec}=p206SceneSync('PRODUCTION_210_FINAL_ARENA_DRAW');p210Bind(spec,round);const img=p210ArenaImage;
 if(img?.complete&&img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,img);production206.sceneDraws++;production209.draws++;production210.draws++}
 else{p205FallbackArena(g,spec,round);production206.staleSceneRepairs++;production209.fallbacks++;production210.fallbacks++}
 if(elapsed<p206State.transitionUntil){const q=clamp((p206State.transitionUntil-elapsed)/1.1,0,1);g.save();g.fillStyle=`rgba(0,0,0,${.42*q})`;g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle=`rgba(255,255,255,${.96*q})`;g.shadowColor=spec.primary;g.shadowBlur=24;g.font=`900 ${Math.max(24,Math.min(54,W*.065))}px system-ui`;g.fillText(`ROUND ${round}`,W*.5,H*.26);g.font=`800 ${Math.max(15,Math.min(30,W*.037))}px system-ui`;g.fillText(`${spec.name} // ${String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase()}`,W*.5,H*.32);g.restore()}
};
const p210Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p210Replay(frame);const level=p207Level(),spec=p207Spec(level);p210Bind(spec,level);frame.production210={system:production210.system,level,fighter:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,renderSource:p209State.src,existingImageObject:p209State.img===p210ArenaImage,registryCurrentOnly:typeof p203ArenaImages==='undefined'||(p203ArenaImages.size===1&&p203ArenaImages.get(spec.name)===p210ArenaImage),counts:{stageRepairs:production210.stageRepairs,imageRebinds:production210.imageRebinds,draws:production210.draws,fallbacks:production210.fallbacks,uniqueRounds:production210.seenRounds.size,uniqueArenas:production210.seenArenas.size},invariants:{campaignStageParticipatesInAuthority:true,stuckTournamentRoundCannotPinArena:true,existingArenaImageRebound:true,finalRendererConsumesExistingArenaImage:true,staleArenaRegistryReferencesCleared:true,singleRendererPreserved:true}}};
try{p132CombatEvent('PRODUCTION_210_READY',{system:production210.system,fix:'ADVANCING_CAMPAIGN_STAGE_CANNOT_BE_PINNED_BY_STALE_ROUND_ONE',image:'EXISTING_ARENA_IMAGE_OBJECT',renderer:'PRODUCTION_206_EXISTING_FINAL_RENDERER'})}catch(_){}
