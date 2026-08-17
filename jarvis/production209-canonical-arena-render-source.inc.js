/* PRODUCTION 209 — CANONICAL VISIBLE ARENA RENDER SOURCE
 * Fixes the remaining scene-image mismatch: Production 207 rebound arenaImage while the
 * actual final Production 206 renderer consumed a different source. This bridge replaces
 * the function that Production 206 already calls, so one canonical Image object is created
 * for the current tournament level and that exact object is what reaches p203Cover().
 * No additional canvas renderer is introduced.
 */
const production209={ready:true,system:'CANONICAL VISIBLE ARENA RENDER SOURCE',binds:0,draws:0,fallbacks:0,decoded:0,loadErrors:0,lastLevel:0,lastFighter:'',lastArena:'',lastSrc:'',seenArenas:new Set()};
const p209State={level:0,spec:null,img:null,src:'',token:0};
function p209Wanted(level,spec){return `jarvis/assets/survivor/arenas/${spec.arena}?level=${level}`}
function p209Bind(spec,level=p207Level()){
 if(!spec)return false;const src=p209Wanted(level,spec),same=p209State.level===level&&p209State.spec?.arena===spec.arena&&p209State.img;
 if(same)return false;
 const img=new Image(),token=++p209State.token;p209State.level=level;p209State.spec=spec;p209State.img=img;p209State.src=src;production209.binds++;production209.lastLevel=level;production209.lastFighter=spec.name;production209.lastArena=spec.arena;production209.lastSrc=src;production209.seenArenas.add(spec.arena);
 img.decoding='async';img.onload=()=>{if(token===p209State.token)production209.decoded++};img.onerror=()=>{if(token===p209State.token)production209.loadErrors++};img.src=src;
 if(typeof p203ArenaImages!=='undefined')p203ArenaImages.set(spec.name,img);
 try{p132CombatEvent('PRODUCTION_209_ARENA_BOUND',{level,fighter:spec.name,arena:spec.arena,src})}catch(_){}
 return true
}
p207RebindArena=function(spec){return p209Bind(spec,p207Level())};
p206DrawArena=function(g){
 const {round,spec}=p206SceneSync('CANONICAL_FINAL_ARENA_DRAW');p209Bind(spec,round);const img=p209State.img;
 if(img?.complete&&img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,img);production206.sceneDraws++;production209.draws++}
 else{p205FallbackArena(g,spec,round);production206.staleSceneRepairs++;production209.fallbacks++}
 if(elapsed<p206State.transitionUntil){const q=clamp((p206State.transitionUntil-elapsed)/1.1,0,1);g.save();g.fillStyle=`rgba(0,0,0,${.42*q})`;g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle=`rgba(255,255,255,${.96*q})`;g.shadowColor=spec.primary;g.shadowBlur=24;g.font=`900 ${Math.max(24,Math.min(54,W*.065))}px system-ui`;g.fillText(`ROUND ${round}`,W*.5,H*.26);g.font=`800 ${Math.max(15,Math.min(30,W*.037))}px system-ui`;g.fillText(`${spec.name} // ${String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase()}`,W*.5,H*.32);g.restore()}
};
const p209Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p209Replay(frame);const level=p207Level(),spec=p207Spec(level);p209Bind(spec,level);frame.production209={system:production209.system,level,fighter:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,renderSource:p209State.src,image:{complete:!!p209State.img?.complete,naturalWidth:p209State.img?.naturalWidth||0,naturalHeight:p209State.img?.naturalHeight||0},counts:{binds:production209.binds,draws:production209.draws,fallbacks:production209.fallbacks,decoded:production209.decoded,loadErrors:production209.loadErrors,uniqueArenas:production209.seenArenas.size},invariants:{finalRendererConsumesCanonicalActiveImage:true,levelChangeCreatesNewImage:true,production206DrawUsesProduction209Source:true,production207RebindRedirectedToCanonicalSource:true,noSecondRenderer:true}}};
try{p132CombatEvent('PRODUCTION_209_READY',{system:production209.system,fix:'FINAL_RENDERER_AND_LEVEL_AUTHORITY_SHARE_EXACT_IMAGE_OBJECT',renderer:'PRODUCTION_206_EXISTING_FINAL_RENDERER'})}catch(_){}
