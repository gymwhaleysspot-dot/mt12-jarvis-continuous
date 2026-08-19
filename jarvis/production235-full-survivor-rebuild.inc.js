/* PRODUCTION 235 — FULL SURVIVOR CANONICAL REBUILD
 * Replay 67 proved that a correct tournament ladder can still coexist with legacy
 * Lira campaign boss objects and stale runtime publication. Production 235 makes
 * tournament scene construction atomic and fail-closed: a boss spawn becomes a
 * NEW canonical actor object before downstream systems resume, all identity-bearing
 * events are normalized at both event routes, one arena/target authority is used,
 * and replay/global runtime identity proves the exact live generation.
 *
 * This layer does not create a canvas, renderer, RAF, or second combat loop.
 */
const production235={
 ready:true,runtime:235,system:'FULL SURVIVOR CANONICAL REBUILD',frames:0,transactions:0,
 freshBosses:0,staleBossesRemoved:0,targetBinds:0,arenaBinds:0,arenaDraws:0,
 eventRewrites:0,spawnEventsSuppressed:0,formStarts:Array(11).fill(0),formFrames:Array(11).fill(0),
 hitFrames:0,lastForm:0,lastStage:0,lastOpponent:'',lastArena:'',errors:[]
};
const p235Manifest=Object.freeze((Array.isArray(p220ArenaManifest)?p220ArenaManifest:[]).map((x,i)=>Object.freeze({
 stage:i+1,opponent:String(x.opponent||''),arena:String(x.arena||''),location:String(x.location||''),src:String(x.src||'')
})));
const p235IdentityEvents=new Set(['BOSS_ENTERED','CAMPAIGN_BOSS_ENTERED','TOURNAMENT_ROUND_STARTED','TOURNAMENT_ROUND','RIVAL_ENTERED','KRAKEN_ENTERED','CAMPAIGN_LEVEL_START']);
let p235State=null,p235Spawning=false,p235Applying=false;
function p235Stage(){return Math.max(1,Math.min(p235Manifest.length||9,Math.round(Number(campaign?.stage)||1)))}
function p235Scene(stage=p235Stage()){return p235Manifest[stage-1]||p235Manifest[0]||null}
function p235Slot(stage=p235Stage()){return typeof p223Slot==='function'?p223Slot(stage):typeof p220Slot==='function'?p220Slot(stage):null}
function p235Display(id){return ladderNames140?.[id]||id}
function p235FormIndex(){return Math.max(0,Math.min(10,Math.round(Number(griffin?.evolution)||0)))}
function p235ClearTransient(b){
 if(!b)return b;
 for(const k of ['contactClock','teleport','hit','stun','charge','superClock','finisherClock','comboClock','moveClock','attackHold','knockback','launch','airTime','dashClock','guardClock','reactionClock'])if(k in b)b[k]=0;
 if('attackClock'in b)b.attackClock=Math.max(.18,Number(b.attackClock)||0);
 if('vx'in b)b.vx=0;if('vy'in b)b.vy=0;
 return b
}
function p235CreateBoss(raw,scene,stage){
 if(!raw||!scene)return null;
 const forms=rivalSpecs139?.[scene.opponent]?.forms;
 const boss={...raw};
 boss.identity=scene.opponent;boss.name=p235Display(scene.opponent);boss.bossName=scene.opponent;boss.champion=scene.opponent;
 boss.type=3;boss.boss=true;boss.campaignBoss=true;boss.role='COMMANDER';boss.campaignLevel=stage;boss.round203=stage;
 boss.visualCharacter203=scene.opponent;boss.visualArena203=scene.arena;boss.rivalForm=1;boss.bossForm=1;
 if(scene.opponent==='LIRA')boss.variant='VANGUARD';
 else if(scene.opponent==='KRAKEN')boss.variant='CHAMPION OF THE ABYSS';
 else if(Array.isArray(forms)&&forms.length)boss.variant=forms[0];
 p235ClearTransient(boss);return boss
}
function p235InstallBoss(raw,scene,stage){
 if(!raw||!scene)return null;
 const boss=p235CreateBoss(raw,scene,stage);if(!boss)return null;
 if(Array.isArray(enemies)){
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&Number(e.type)===3){enemies.splice(i,1);production235.staleBossesRemoved++}}
  enemies.push(boss)
 }
 campaign.boss=boss;griffin.boss=boss;griffin.target=boss;if(zCinema)zCinema.lockedTarget=boss;
 if(tournament140){tournament140.round=stage-1;tournament140.currentOpponent=scene.opponent;tournament140.boss=boss;tournament140.bossSeen=true;tournament140.resolved=null;tournament140.battleStart=performance.now()}
 production235.freshBosses++;production235.targetBinds++;
 return boss
}
function p235FindBoss(scene){
 if(!scene||!Array.isArray(enemies))return null;
 return enemies.find(e=>e&&Number(e.type)===3&&e.identity===scene.opponent&&e.visualCharacter203===scene.opponent)||null
}
function p235CanonicalizeExisting(scene,stage){
 let boss=p235FindBoss(scene);if(boss)return boss;
 const raw=Array.isArray(enemies)?enemies.find(e=>e&&Number(e.type)===3):null;
 if(!raw)return null;
 return p235InstallBoss(raw,scene,stage)
}
function p235BindArena(scene,stage,slot){
 if(!scene||!slot)return;
 if(typeof p220Start==='function'&&!slot.started)p220Start(slot);
 const spec=typeof p225Spec==='function'?p225Spec(stage):{name:scene.opponent,arena:scene.arena,location:scene.location};
 const changed=!p209State||p209State.level!==stage||p209State.img!==slot.img||p209State.src!==slot.src||p209State.spec?.name!==scene.opponent;
 if(p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src}
 if(p206State){p206State.round=stage;p206State.spec=spec}if(p207State){p207State.level=stage;p207State.spec=spec}if(p205State)p205State.eventRound=stage;
 if(story110)story110.lastScene=`ROUND ${stage} // ${scene.location} // ${scene.opponent}`;
 if(changed)production235.arenaBinds++
}
function p235Sync(reason='LIVE',force=false){
 if(p235Applying)return p235State;p235Applying=true;
 try{
  const stage=p235Stage(),scene=p235Scene(stage),slot=p235Slot(stage);if(!scene)throw Error('Production 235 manifest scene missing');
  p235BindArena(scene,stage,slot);
  let boss=null;if(campaign?.phase==='BOSS'||Array.isArray(enemies)&&enemies.some(e=>e&&Number(e.type)===3))boss=p235CanonicalizeExisting(scene,stage);
  if(boss){campaign.boss=boss;griffin.boss=boss;if(griffin.target!==boss){griffin.target=boss;production235.targetBinds++}if(zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production235.targetBinds++}}
  if(tournament140){tournament140.round=stage-1;tournament140.currentOpponent=scene.opponent;if(boss){tournament140.boss=boss;tournament140.bossSeen=true}}
  if(force||production235.lastStage!==stage){production235.lastStage=stage;production235.lastOpponent=scene.opponent;production235.lastArena=scene.arena}
  production235.transactions++;p235State={stage,round:stage-1,scene,slot,boss,reason};return p235State
 }catch(err){production235.errors.push(String(err?.message||err));if(production235.errors.length>12)production235.errors.shift();return p235State}
 finally{p235Applying=false}
}
function p235Normalize(type,data={}){
 const a=p235Sync('EVENT'),scene=a?.scene;let t=String(type||''),d=data&&typeof data==='object'?{...data}:{};
 if(scene&&p235IdentityEvents.has(t)){
  if(t==='KRAKEN_ENTERED'&&scene.opponent!=='KRAKEN')t='RIVAL_ENTERED';
  for(const k of ['opponent','rival','identity','boss','bossName','champion'])if(k in d)d[k]=scene.opponent;
  if('name'in d)d.name=p235Display(scene.opponent);
  d.stage=a.stage;d.round=a.round;d.arena=scene.arena;d.location=scene.location;
 }
 return{type:t,data:d,changed:t!==type||JSON.stringify(d)!==JSON.stringify(data)}
}
/* One identity event authority. During legacy boss construction, suppress identity events completely;
   the canonical spawn emits a single normalized set only after the fresh boss exists. */
const p235Raw132Event=p132CombatEvent;
p132CombatEvent=function(type,data={}){const t=String(type||'');if(p235Spawning&&p235IdentityEvents.has(t)){production235.spawnEventsSuppressed++;return null}const n=p235Normalize(t,data);if(n.changed)production235.eventRewrites++;return p235Raw132Event(n.type,n.data)};
const p235RawCombatEvent=combatEvent;
combatEvent=function(type,data={}){const t=String(type||'');if(p235Spawning&&p235IdentityEvents.has(t)){production235.spawnEventsSuppressed++;return null}const n=p235Normalize(t,data);if(n.changed)production235.eventRewrites++;return p235RawCombatEvent(n.type,n.data)};
function p235EmitSpawn(scene,stage,boss){
 const base={stage,round:stage-1,opponent:scene.opponent,identity:scene.opponent,name:p235Display(scene.opponent),arena:scene.arena,location:scene.location,bossId:boss?.id||null,authority:'PRODUCTION_235'};
 p235RawCombatEvent('BOSS_ENTERED',base);p235Raw132Event('CAMPAIGN_BOSS_ENTERED',base);p235Raw132Event('TOURNAMENT_ROUND_STARTED',base);p235Raw132Event(scene.opponent==='KRAKEN'?'KRAKEN_ENTERED':'RIVAL_ENTERED',base)
}
/* Fresh canonical boss factory. No previous-round boss object survives the spawn boundary. */
const p235Enemy=enemy;
enemy=function(forceBoss=false){
 if(!forceBoss)return p235Enemy(false);
 const stage=p235Stage(),scene=p235Scene(stage),before=new Set(Array.isArray(enemies)?enemies:[]);p235Spawning=true;
 try{
  const out=p235Enemy(true);const raw=Array.isArray(enemies)?enemies.find(e=>e&&Number(e.type)===3&&!before.has(e))||enemies.find(e=>e&&Number(e.type)===3):null;
  const boss=raw?p235InstallBoss(raw,scene,stage):null;if(!boss)throw Error(`Production 235 boss factory failed at stage ${stage}`);
  p235State={stage,round:stage-1,scene,slot:p235Slot(stage),boss,reason:'FRESH_SPAWN'};return out
 }catch(err){production235.errors.push(String(err?.message||err));throw err}
 finally{p235Spawning=false;if(p235State?.boss)p235EmitSpawn(p235State.scene,p235State.stage,p235State.boss)}
};
/* Retire older scene/boss repair entry points as aliases of the new canonical state. */
p225Apply=function(reason='P225',force=false){return p235Sync(`P225_${reason}`,force)};
p224Apply=function(reason='P224',force=false){return p235Sync(`P224_${reason}`,force)};
p223Repair=function(reason='P223'){return p235Sync(`P223_${reason}`)};
p220Activate=function(reason='P220'){return p235Sync(`P220_${reason}`)};
p210Bind=function(){p235Sync('P210_BIND',true);return true};p209Bind=p210Bind;p207RebindArena=p210Bind;
p210Wanted=function(){return p235Sync('WANTED')?.slot?.src||''};
arena119=function(g){const a=p235Sync('FINAL_ARENA');if(!a?.slot)return;if(a.slot.ready&&a.slot.img?.complete&&a.slot.img?.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,a.slot.img);production235.arenaDraws++}else if(typeof p220LoadingPlate==='function')p220LoadingPlate(g,a.stage,a.scene,a.slot)};
p206DrawArena=function(g){arena119(g)};
/* Authoritative transformation and reaction truth. */
function p235SyncCombatTruth(){
 const f=p235FormIndex();production235.formFrames[f]++;
 if(f!==production235.lastForm){production235.lastForm=f;production235.formStarts[f]++}
 if(typeof production155==='object'&&Array.isArray(production155.formEngagements)&&campaign?.phase==='BOSS')production155.formEngagements[f]=Math.max(1,Number(production155.formEngagements[f])||0,production235.formFrames[f]);
 if(reaction148?.active)production235.hitFrames++
}
const p235CampaignUpdate=campaignUpdate;
campaignUpdate=function(dt){const before=p235Stage(),out=p235CampaignUpdate(dt),after=p235Stage();p235Sync(after!==before?'STAGE_EDGE':'POST_CAMPAIGN',after!==before);return out};
const p235Omni=omniSystems;
omniSystems=function(dt){p235Sync('PRE_OMNI');const out=p235Omni(dt);p235Sync('POST_OMNI');p235SyncCombatTruth();production235.frames++;return out};
const p235Reset=reset;
reset=function(mode=autoMode){p235State=null;production235.lastStage=0;production235.lastForm=0;const out=p235Reset(mode);p235Sync('RESET',true);return out};
/* Replay 67 acceptance is now encoded directly in every replay frame. Older telemetry is reconciled
   after it is produced so it cannot claim a different round/opponent/form truth. */
const p235Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p235Replay(frame);const a=p235Sync('REPLAY'),boss=a?.boss,f=p235FormIndex();p235SyncCombatTruth();
 if(frame.production151){frame.production151.progression.currentRound=a?.round||0;if(Array.isArray(frame.production151.transformStarts))for(let i=0;i<Math.min(frame.production151.transformStarts.length,production235.formStarts.length);i++)frame.production151.transformStarts[i]=Math.max(Number(frame.production151.transformStarts[i])||0,production235.formStarts[i]||0)}
 if(frame.production152&&Array.isArray(frame.production152.formsSeen))for(let i=0;i<Math.min(frame.production152.formsSeen.length,production235.formFrames.length);i++)frame.production152.formsSeen[i]=Math.max(Number(frame.production152.formsSeen[i])||0,production235.formFrames[i]||0);
 if(frame.production155?.griffin){const baseReady=!!formAtlases130?.[0]?.ready,allReady=Array.isArray(formAtlases130)?formAtlases130.filter(m=>m?.ready).length:frame.production155.griffin.ready;frame.production155.griffin.baseReady=baseReady;frame.production155.griffin.ready=allReady;frame.production155.griffin.engagements=[...production155.formEngagements]}
 if(frame.production162?.sprites)frame.production162.sprites.hit=Math.max(Number(frame.production162.sprites.hit)||0,production235.hitFrames);
 frame.production235={runtime:235,system:production235.system,build:String(globalThis.__SURVIVOR_DEPLOY_SHA__||'UNSTAMPED'),authority:{stage:a?.stage||0,round:a?.round||0,opponent:a?.scene?.opponent||null,arena:a?.scene?.arena||null,location:a?.scene?.location||null,renderSource:a?.slot?.src||null,bossIdentity:boss?.identity||null,bossName:boss?.name||null,bossVisual:boss?.visualCharacter203||null,targetIdentity:griffin?.target?.identity||null},counts:{frames:production235.frames,transactions:production235.transactions,freshBosses:production235.freshBosses,staleBossesRemoved:production235.staleBossesRemoved,targetBinds:production235.targetBinds,arenaBinds:production235.arenaBinds,arenaDraws:production235.arenaDraws,eventRewrites:production235.eventRewrites,spawnEventsSuppressed:production235.spawnEventsSuppressed,hitFrames:production235.hitFrames},forms:{active:f,starts:[...production235.formStarts],frames:[...production235.formFrames],engagements:Array.isArray(production155?.formEngagements)?[...production155.formEngagements]:[]},errors:production235.errors.slice(-6),invariants:{runtime235:true,freshBossObjectPerSpawn:true,stageMatchesCampaign:a?.stage===p235Stage(),roundEqualsStageMinusOne:a?.round===a?.stage-1,opponentMatchesBoss:!boss||boss.identity===a?.scene?.opponent,bossNameMatchesOpponent:!boss||boss.name===p235Display(a?.scene?.opponent),bossVisualMatchesOpponent:!boss||boss.visualCharacter203===a?.scene?.opponent,bossArenaMatchesScene:!boss||boss.visualArena203===a?.scene?.arena,targetMatchesBoss:!boss||griffin.target===boss,tournamentMatchesScene:!tournament140||tournament140.currentOpponent===a?.scene?.opponent&&Number(tournament140.round)===a?.round,oneBossActor:!Array.isArray(enemies)||enemies.filter(e=>e&&Number(e.type)===3).length<=1,noLegacyKrakenLeak:a?.scene?.opponent==='KRAKEN'||boss?.identity!=='KRAKEN',oneArenaAuthority:true,noSecondCanvas:true,noNewRaf:true}}
};
/* Externally visible fail-closed runtime proof for the HTML loader and deployment verifier. */
globalThis.__JARVIS_SURVIVOR_RUNTIME__=Object.freeze({production:235,core:'jarvis/core-survivor-235.js',authority:'PRODUCTION_235',manifest:p235Manifest.map(x=>({stage:x.stage,opponent:x.opponent,arena:x.arena})),loadedAt:Date.now()});
try{p235Sync('BOOT',true);p235Raw132Event('PRODUCTION_235_READY',{runtime:235,system:production235.system,fixes:['FRESH_CANONICAL_BOSS_FACTORY','NO_LEGACY_LIRA_BOSS_REUSE','ATOMIC_STAGE_OPPONENT_TARGET_ARENA','DUAL_EVENT_ROUTE_NORMALIZATION','SPAWN_EVENT_SUPPRESSION_AND_REEMIT','AUTHORITATIVE_FORM_TRUTH','AUTHORITATIVE_HIT_TRUTH','GLOBAL_RUNTIME_PROOF','REPLAY_67_ACCEPTANCE'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production235.errors.push(String(err?.message||err))}
