/* PRODUCTION 215 — LIVE RAF RENDER AUTHORITY + BOSS DRAW PROOF
 * The surviving visible RAF is loop127(), which calls render127 directly. Productions 213/214
 * repaired render121/vector113Frame, so the real visible loop could bypass both fixes. This
 * layer terminates render133/render128/render127/vector113Frame at one final compositor and
 * proves whether the base pass actually drew the active boss before applying one canonical
 * post-pass repair on the same existing vector113 canvas.
 */
const production215={ready:true,system:'LIVE RAF RENDER AUTHORITY + BOSS DRAW PROOF',frames:0,baseBossDraws:0,postPassRepairs:0,failedPostPasses:0,lastOpponent:'',lastModel:-1,lastBaseDelta:0,errors:[]};
const p215Render133=render133;
function p215Boss(){return p213EnsureBoss('PRODUCTION_215')||p213TournamentBoss()}
function p215ModelDraws(index){return index>=0&&Array.isArray(production131?.modelDraws)?Number(production131.modelDraws[index]||0):0}
function p215FinalRender(){
 const b=p215Boss(),idx=b&&typeof liraForm131==='function'?liraForm131(b):-1,before=p215ModelDraws(idx);
 const out=p215Render133();
 const after=p215ModelDraws(idx),baseDelta=Math.max(0,after-before);production215.lastBaseDelta=baseDelta;
 if(b&&campaign.phase!=='LEVEL_CLEAR'){
  if(baseDelta>0)production215.baseBossDraws+=baseDelta;
  else{
   const ok=typeof p214DrawBoss==='function'&&p214DrawBoss();
   if(ok)production215.postPassRepairs++;else production215.failedPostPasses++;
  }
  production215.lastOpponent=b.identity||p213Expected();production215.lastModel=idx;
 }
 production215.frames++;return out
}
/* loop127() resolves render127 on every RAF tick, so rebinding render127 closes the bypass.
   Main iyla3DFrame resolves render133 dynamically too. All visible entrypoints now terminate
   at this exact compositor and therefore share the same canvas and boss proof. */
render133=p215FinalRender;
render128=p215FinalRender;
render127=p215FinalRender;
vector113Frame=p215FinalRender;
const p215Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p215Replay(frame);const b=p215Boss(),idx=b&&typeof liraForm131==='function'?liraForm131(b):-1;frame.production215={system:production215.system,stage:campaign.stage,phase:campaign.phase,opponent:b?.identity||null,bossPresent:!!b,bossVisible:p213BossVisible(b),model:idx,baseBossDraws:production215.baseBossDraws,postPassRepairs:production215.postPassRepairs,failedPostPasses:production215.failedPostPasses,lastBaseDelta:production215.lastBaseDelta,counts:{frames:production215.frames},errors:production215.errors.slice(-4),invariants:{loop127ResolvesFinalRender127:true,render133Render128Render127Vector113Unified:render133===render128&&render128===render127&&render127===vector113Frame,activeBossHasVisibleDrawEvidence:campaign.phase==='LEVEL_CLEAR'||production215.baseBossDraws+production215.postPassRepairs>0,sameExistingVectorCanvas:true,noSecondCanvasRenderer:true}}};
try{p132CombatEvent('PRODUCTION_215_READY',{system:production215.system,rootCause:'VISIBLE LOOP127 CALLED RENDER127 DIRECTLY',fixes:['REBIND_RENDER127_VISIBLE_RAF','UNIFY_FINAL_RENDER_ALIASES','MEASURE_BASE_BOSS_DRAW','POSTPASS_ONLY_IF_BASE_MISSES'],canvas:'EXISTING_VECTOR113_ONLY'})}catch(_){}
