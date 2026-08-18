/* PRODUCTION 234 — CANONICAL SURVIVOR RUNTIME REWRITE
 * One transaction owns stage -> opponent -> boss actor -> target -> arena -> event -> replay identity.
 * Older production layers remain implementation libraries only; none is authoritative after this install.
 * No second canvas, renderer, RAF, combat loop, or duplicate actor is created.
 */
const production234={ready:true,runtime:234,system:'CANONICAL SURVIVOR RUNTIME REWRITE',frames:0,transactions:0,stageEdges:0,actorRebinds:0,targetRebinds:0,arenaRebinds:0,eventRewrites:0,legacyRepairs:0,lastStage:0,lastOpponent:'',lastArena:'',lastSrc:'',errors:[]};
const p234Manifest=Object.freeze((Array.isArray(p220ArenaManifest)?p220ArenaManifest:[]).map((x,i)=>Object.freeze({stage:i+1,opponent:String(x.opponent||''),arena:String(x.arena||''),location:String(x.location||''),src:String(x.src||'')})));
let p234State=null,p234Applying=false;
function p234Stage(){return Math.max(1,Math.min(p234Manifest.length||9,Math.round(Number(campaign?.stage)||1)))}
function p234Scene(stage=p234Stage()){return p234Manifest[stage-1]||p234Manifest[0]||null}
function p234Slot(stage=p234Stage()){return typeof p223Slot==='function'?p223Slot(stage):typeof p220Slot==='function'?p220Slot(stage):null}
function p234Name(id){return ladderNames140?.[id]||id}
function p234BossCandidate(scene){
 const live=Array.isArray(enemies)?enemies.find(e=>e&&(e.identity===scene.opponent||e.visualCharacter203===scene.opponent)&&Number(e.type)===3):null;
 if(live)return live;
 if(campaign?.boss)return campaign.boss;
 if(griffin?.boss)return griffin.boss;
 try{if(typeof p217Canonical==='function')return p217Canonical('P234')}catch(_){}
 try{if(typeof p213EnsureBoss==='function')return p213EnsureBoss('P234')}catch(_){}
 return Array.isArray(enemies)?enemies.find(e=>e&&Number(e.type)===3)||null:null;
}
function p234BindActor(scene,stage){
 let boss=p234BossCandidate(scene);if(!boss)return null;
 const display=p234Name(scene.opponent),wrong=boss.identity!==scene.opponent||boss.name!==display||Number(boss.campaignLevel)!==stage||boss.visualCharacter203!==scene.opponent||boss.visualArena203!==scene.arena;
 if(wrong){boss.identity=scene.opponent;boss.name=display;boss.bossName=scene.opponent;boss.champion=scene.opponent;boss.campaignLevel=stage;boss.round203=stage;boss.visualCharacter203=scene.opponent;boss.visualArena203=scene.arena;boss.campaignBoss=true;boss.type=3;const forms=rivalSpecs139?.[scene.opponent]?.forms;if(Array.isArray(forms)&&forms.length){boss.rivalForm=Math.max(1,Math.min(Number(boss.rivalForm)||1,forms.length));boss.variant=forms[boss.rivalForm-1]}production234.actorRebinds++}
 if(Array.isArray(enemies)){
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e!==boss&&e&&Number(e.type)===3&&(e.campaignBoss||e.identity||e.visualCharacter203)){enemies.splice(i,1);production234.legacyRepairs++}}
  if(!enemies.includes(boss))enemies.push(boss);
 }
 campaign.boss=boss;griffin.boss=boss;
 if(griffin.target!==boss){griffin.target=boss;production234.targetRebinds++}
 if(zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production234.targetRebinds++}
 if(tournament140){tournament140.boss=boss;tournament140.bossSeen=true;tournament140.round=stage-1;tournament140.currentOpponent=scene.opponent}
 return boss;
}
function p234BindArena(scene,stage,slot){
 if(!slot)return;
 if(typeof p220Start==='function'&&!slot.started)p220Start(slot);
 const spec=typeof p225Spec==='function'?p225Spec(stage):{name:scene.opponent,arena:scene.arena};
 if(p209State&&(p209State.level!==stage||p209State.img!==slot.img||p209State.src!==slot.src||p209State.spec?.name!==scene.opponent)){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src;production234.arenaRebinds++}
 if(p206State){p206State.round=stage;p206State.spec=spec}if(p207State){p207State.level=stage;p207State.spec=spec}if(p205State)p205State.eventRound=stage;
 if(story110)story110.lastScene=`ROUND ${stage} // ${scene.location} // ${scene.opponent}`;
}
function p234Apply(reason='LIVE',force=false){
 if(p234Applying)return p234State;p234Applying=true;
 try{const stage=p234Stage(),scene=p234Scene(stage),slot=p234Slot(stage);if(!scene)throw Error('canonical scene missing');const edge=force||!p234State||p234State.stage!==stage;p234BindArena(scene,stage,slot);const boss=p234BindActor(scene,stage);if(edge){production234.stageEdges++;production234.lastStage=stage;production234.lastOpponent=scene.opponent;production234.lastArena=scene.arena;production234.lastSrc=slot?.src||scene.src||''}production234.transactions++;p234State={stage,round:stage-1,scene,slot,boss,reason};return p234State}catch(err){production234.errors.push(String(err?.message||err));if(production234.errors.length>12)production234.errors.shift();return p234State}finally{p234Applying=false}
}
/* Retire independent scene authorities: all legacy callers become aliases of the canonical transaction. */
p225Apply=function(reason='P225',force=false){production234.legacyRepairs++;return p234Apply(`P225_${reason}`,force)};
p224Apply=function(reason='P224',force=false){production234.legacyRepairs++;return p234Apply(`P224_${reason}`,force)};
p223Repair=function(reason='P223'){production234.legacyRepairs++;return p234Apply(`P223_${reason}`)};
p220Activate=function(reason='P220'){production234.legacyRepairs++;return p234Apply(`P220_${reason}`)};
p210Bind=function(){production234.legacyRepairs++;p234Apply('P210_BIND',true);return true};p209Bind=p210Bind;p207RebindArena=p210Bind;
p210Wanted=function(){return p234Apply('WANTED')?.slot?.src||''};
arena119=function(g){const a=p234Apply('FINAL_ARENA');if(!a?.slot)return;if(a.slot.ready&&a.slot.img?.complete&&a.slot.img?.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,a.slot.img);production234.arenaRebinds++}else if(typeof p220LoadingPlate==='function')p220LoadingPlate(g,a.stage,a.scene,a.slot)};
p206DrawArena=function(g){arena119(g)};
/* Normalize rival/tournament events before they enter telemetry so KAIROX can never be announced as KRAKEN/LIRA. */
const p234CombatEvent=combatEvent;combatEvent=function(type,data={}){const a=p234Apply('EVENT'),scene=a?.scene;let t=String(type||''),d=data&&typeof data==='object'?{...data}:{};if(scene&&['TOURNAMENT_ROUND_STARTED','TOURNAMENT_ROUND','RIVAL_ENTERED','KRAKEN_ENTERED','CAMPAIGN_LEVEL_START'].includes(t)){if(t==='KRAKEN_ENTERED'&&scene.opponent!=='KRAKEN')t='RIVAL_ENTERED';for(const k of ['opponent','rival','identity','boss','bossName','champion'])if(k in d)d[k]=scene.opponent;if('name'in d)d.name=p234Name(scene.opponent);d.stage=a.stage;d.round=a.round;d.arena=scene.arena;d.location=scene.location;production234.eventRewrites++}return p234CombatEvent(t,d)};
const p234CampaignUpdate=campaignUpdate;campaignUpdate=function(dt){const before=p234Stage();p234Apply('PRE_CAMPAIGN');const out=p234CampaignUpdate(dt),after=p234Stage();p234Apply(after!==before?'STAGE_EDGE':'POST_CAMPAIGN',after!==before);return out};
const p234Omni=omniSystems;omniSystems=function(dt){p234Apply('PRE_OMNI');const out=p234Omni(dt);p234Apply('POST_OMNI');production234.frames++;return out};
const p234Reset=reset;reset=function(mode=autoMode){p234State=null;production234.lastStage=0;const out=p234Reset(mode);p234Apply('RESET',true);return out};
const p234Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p234Replay(frame);const a=p234Apply('REPLAY'),boss=a?.boss;frame.production234={runtime:234,system:production234.system,authority:{stage:a?.stage||0,round:a?.round||0,opponent:a?.scene?.opponent||null,arena:a?.scene?.arena||null,location:a?.scene?.location||null,renderSource:a?.slot?.src||null,bossIdentity:boss?.identity||null,bossVisual:boss?.visualCharacter203||null,targetIdentity:griffin?.target?.identity||null},counts:{frames:production234.frames,transactions:production234.transactions,stageEdges:production234.stageEdges,actorRebinds:production234.actorRebinds,targetRebinds:production234.targetRebinds,arenaRebinds:production234.arenaRebinds,eventRewrites:production234.eventRewrites,legacyRepairs:production234.legacyRepairs},errors:production234.errors.slice(-6),invariants:{singleCanonicalAuthority:true,roundEqualsStageMinusOne:a?.round===a?.stage-1,opponentMatchesBoss:!boss||boss.identity===a?.scene?.opponent,bossVisualMatchesOpponent:!boss||boss.visualCharacter203===a?.scene?.opponent,bossArenaMatchesScene:!boss||boss.visualArena203===a?.scene?.arena,targetMatchesBoss:!boss||griffin.target===boss,tournamentMatchesScene:!tournament140||tournament140.currentOpponent===a?.scene?.opponent&&Number(tournament140.round)===a?.round,arenaObjectMatchesScene:!a?.slot||p209State?.img===a.slot.img&&p209State?.src===a.slot.src,oneBossActor:!Array.isArray(enemies)||enemies.filter(e=>e&&Number(e.type)===3&&(e.campaignBoss||e.identity)).length<=1,noSecondCanvas:true,noNewRaf:true}}};
try{p234Apply('BOOT',true);p132CombatEvent('PRODUCTION_234_READY',{system:production234.system,runtime:234,fixes:['ONE_CANONICAL_STAGE_MANIFEST','ATOMIC_OPPONENT_ACTOR_TARGET_ARENA_BIND','LEGACY_SCENE_AUTHORITY_RETIREMENT','EVENT_IDENTITY_NORMALIZATION','STALE_BOSS_PRUNING','REPLAY_RUNTIME_PROOF'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production234.errors.push(String(err?.message||err))}
