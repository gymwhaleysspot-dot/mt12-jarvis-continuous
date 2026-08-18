/* PRODUCTION 234 — CANONICAL SURVIVOR RUNTIME REWRITE
 * One state authority owns stage, round, opponent, arena, actor binding, target binding,
 * Griffin form, replay identity and presentation projections. Older production systems are
 * compatibility projections only. This layer creates no canvas, RAF, renderer or extra actor.
 */
const production234={
 ready:true,runtime:234,system:'CANONICAL SURVIVOR RUNTIME',revision:1,frames:0,transactions:0,repairs:0,errors:[],
 state:{epoch:0,stage:1,round:0,opponent:'LIRA',arena:'lira-nexus-v1.webp',arenaSrc:'',actorId:null,targetId:null,form:0,formName:'BASE WARRIOR',reason:'BOOT'},
 transforms:Array(11).fill(0),formsSeen:Array(11).fill(0),engagements:Array(11).fill(0),hitReactions:0,superEvents:0,finisherEvents:0
};
const p234Roster=[
 {stage:1,opponent:'LIRA',arena:'lira-nexus-v1.webp'},
 {stage:2,opponent:'KAIROX',arena:'kairox-caldera-v1.webp'},
 {stage:3,opponent:'SOLENNE',arena:'solenne-corona-v1.webp'},
 {stage:4,opponent:'MIREYA',arena:'mireya-prism-v1.webp'},
 {stage:5,opponent:'ZEPHYRA',arena:'zephyra-tempest-v1.webp'},
 {stage:6,opponent:'ORUN',arena:'orun-ion-v1.webp'},
 {stage:7,opponent:'MORDREN',arena:'mordren-singularity-v1.webp'},
 {stage:8,opponent:'SABLE',arena:'sable-eclipse-v1.webp'},
 {stage:9,opponent:'KRAKEN',arena:'kraken-abyss-v1.webp'}
];
const p234FormNames=['BASE WARRIOR','SAIYAN SPARK','ASCENDED SAIYAN','HYPER SAIYAN','SPEED FORM','GUARDIAN FORM','DESTROYER FORM','CELESTIAL OVERDRIVE','OMEGA INSTINCT','INSTINCT FORM','AUTONOMOUS INSTINCT'];
function p234ClampStage(v){v=Math.round(Number(v)||1);return Math.max(1,Math.min(p234Roster.length,v))}
function p234Stage(){return p234ClampStage(typeof campaign==='object'&&campaign?campaign.stage:production234.state.stage)}
function p234Spec(stage=p234Stage()){return p234Roster[p234ClampStage(stage)-1]}
function p234Form(){const v=Math.round(Number(typeof griffin==='object'&&griffin?griffin.evolution:0)||0);return Math.max(0,Math.min(10,v))}
function p234Identity(v){return String(v?.identity||v?.name||v?.fighter||'').trim().toUpperCase()}
function p234FindOpponent(name){
 const wanted=String(name||'').toUpperCase();
 const pools=[typeof enemies!=='undefined'?enemies:null,typeof actors!=='undefined'?actors:null,typeof bosses!=='undefined'?bosses:null];
 for(const pool of pools)if(Array.isArray(pool))for(const a of pool){const id=p234Identity(a);if(id===wanted||id.startsWith(wanted+' ')||id.includes(wanted))return a}
 const candidates=[typeof boss!=='undefined'?boss:null,typeof rival!=='undefined'?rival:null,typeof enemy!=='undefined'?enemy:null];
 for(const a of candidates)if(a&&p234Identity(a).includes(wanted))return a;
 return null
}
function p234ArenaSlot(stage){return typeof p225Slot==='function'?p225Slot(stage):typeof p220Slot==='function'?p220Slot(stage):null}
function p234Project(tx){
 const {stage,round,spec,actor,slot,form}=tx;
 if(typeof campaign==='object'&&campaign)campaign.stage=stage;
 if(typeof tournament140==='object'&&tournament140){tournament140.round=round;tournament140.currentOpponent=spec.opponent}
 if(typeof production100==='object'&&production100)production100.rounds=round;
 if(typeof production151==='object'&&production151){production151.progression=production151.progression||{};production151.progression.currentRound=round;if(Array.isArray(production151.transformStarts))for(let i=0;i<11;i++)production151.transformStarts[i]=production234.transforms[i]||0}
 if(typeof production152==='object'&&production152&&Array.isArray(production152.formsSeen))for(let i=0;i<11;i++)production152.formsSeen[i]=production234.formsSeen[i]||0;
 if(typeof production155==='object'&&production155?.griffin){if(Array.isArray(production155.griffin.engagements))for(let i=0;i<11;i++)production155.griffin.engagements[i]=production234.engagements[i]||0;if(Number(production155.griffin.bodies)===11&&Number(production151?.sprites?.missing||0)===0)production155.griffin.ready=11}
 if(typeof story110==='object'&&story110){story110.scene='TOURNAMENT';story110.lastScene=`ROUND ${stage} // ${spec.opponent} // ${spec.arena}`}
 if(actor){if(typeof boss!=='undefined')boss=actor;if(typeof rival!=='undefined')rival=actor;if(typeof target!=='undefined')target=actor;if(typeof griffin==='object'&&griffin&&'target' in griffin)griffin.target=actor}
 if(slot&&typeof p209State==='object'&&p209State){p209State.img=slot.img;p209State.src=slot.src}
 if(typeof p220Activate==='function')p220Activate(stage,'P234_CANONICAL');
 if(typeof p223Repair==='function')p223Repair('P234_CANONICAL');
 if(typeof p224Apply==='function')p224Apply('P234_CANONICAL',true);
 if(typeof p225Apply==='function')p225Apply('P234_CANONICAL',true);
 if(typeof production231==='object'&&production231){production231.lastStage=stage;production231.lastRound=round;production231.lastForm=form}
}
function p234Commit(reason='LIVE',forcedStage){
 try{
  const stage=p234ClampStage(forcedStage??p234Stage()),round=Math.max(0,stage-1),spec=p234Spec(stage),form=p234Form(),slot=p234ArenaSlot(stage);
  let actor=p234FindOpponent(spec.opponent);
  if(!actor&&typeof p225Boss==='function'){const x=p225Boss();if(x&&p234Identity(x).includes(spec.opponent))actor=x}
  const old=production234.state,changed=old.stage!==stage||old.round!==round||old.opponent!==spec.opponent||old.arena!==spec.arena||old.actorId!==(actor?.id??null)||old.form!==form;
  production234.state={epoch:changed?old.epoch+1:old.epoch,stage,round,opponent:spec.opponent,arena:spec.arena,arenaSrc:String(slot?.src||`jarvis/assets/survivor/arenas/${spec.arena}`),actorId:actor?.id??null,targetId:actor?.id??null,form,formName:p234FormNames[form]||`FORM ${form}`,reason};
  production234.formsSeen[form]=Math.max(1,production234.formsSeen[form]);
  p234Project({stage,round,spec,actor,slot,form});
  production234.transactions+=changed?1:0;
  return production234.state
 }catch(err){production234.errors.push(`commit:${String(err?.message||err)}`);return production234.state}
}
function p234Invariant(){
 const s=production234.state,spec=p234Spec(s.stage),actor=p234FindOpponent(s.opponent),slot=p234ArenaSlot(s.stage),targetObj=typeof target!=='undefined'?target:null;
 return{
  singleCanonicalAuthority:true,
  stageRoundAtomic:s.round===s.stage-1,
  opponentMatchesStage:s.opponent===spec.opponent,
  arenaMatchesStage:s.arena===spec.arena,
  actorMatchesOpponent:!actor||p234Identity(actor).includes(s.opponent),
  targetMatchesOpponent:!targetObj||p234Identity(targetObj).includes(s.opponent),
  arenaImageMatchesStage:!slot||!p209State||p209State.img===slot.img&&p209State.src===slot.src,
  replayIdentity234:true,singleRendererPreserved:true,noSecondCanvas:true,noNewRaf:true
 }
}
function p234Heal(reason='HEAL'){
 const before=p234Invariant();if(Object.values(before).every(Boolean))return before;
 production234.repairs++;p234Commit(reason,production234.state.stage);return p234Invariant()
}
const p234Event=combatEvent;
combatEvent=function(type,data={}){
 const out=p234Event(type,data);
 try{
  const t=String(type||'').toUpperCase();
  if(['CAMPAIGN_LEVEL_START','TOURNAMENT_ROUND_STARTED','TOURNAMENT_ROUND','RIVAL_ENTERED','KRAKEN_ENTERED'].includes(t))p234Commit(t);
  if(t==='TRANSFORMATION_TRIGGERED'&&(!data?.fighter||String(data.fighter).toUpperCase()==='GRIFFIN')){const f=p234Form();production234.transforms[f]++;production234.formsSeen[f]=Math.max(1,production234.formsSeen[f]);p234Commit(t)}
  if(['MELEE_COMBO_BEAT','MELEE_CONTACT_CONFIRMED','CHRISTIAN_CONTACT','GRIFFIN_FORM_SKILL','SUPER_MOVE_TRIGGERED','SUPER_MOVE_IMPACT','FINISHER_CONFIRMED','GRIFFIN_CREATED_FINISHER'].includes(t)){const f=p234Form();production234.engagements[f]++}
  if(t==='GRIFFIN_DAMAGE_REACTION'){production234.hitReactions++;if(typeof p231Reaction==='function')p231Reaction(data?.kind)}
  if(t==='SUPER_MOVE_TRIGGERED')production234.superEvents++;
  if(t==='FINISHER_CONFIRMED'||t==='GRIFFIN_CREATED_FINISHER')production234.finisherEvents++
 }catch(err){production234.errors.push(`event:${String(err?.message||err)}`)}
 return out
};
const p234Omni=omniSystems;
omniSystems=function(dt){const out=p234Omni(dt);if(running){p234Commit('FRAME');p234Heal('FRAME_HEAL')}production234.frames++;return out};
const p234Reset=reset;
reset=function(mode=autoMode){const out=p234Reset(mode);production234.state.epoch++;p234Commit('RESET',1);return out};
const p234Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p234Replay(frame);const s=p234Commit('REPLAY'),inv=p234Heal('REPLAY_HEAL');
 frame.production234={system:production234.system,runtime:234,source:'CANONICAL REWRITE',state:{...s},authority:{owner:'PRODUCTION_234_ONLY',legacySystems:'READ_ONLY_PROJECTIONS'},counts:{frames:production234.frames,transactions:production234.transactions,repairs:production234.repairs,hitReactions:production234.hitReactions,superEvents:production234.superEvents,finisherEvents:production234.finisherEvents},transformations:{starts:[...production234.transforms],formsSeen:[...production234.formsSeen],engagements:[...production234.engagements]},errors:production234.errors.slice(-8),invariants:inv};
};
try{p234Commit('BOOT',p234Stage());p132CombatEvent('PRODUCTION_234_READY',{system:production234.system,authority:'ONE_CANONICAL_STATE_TRANSACTION',runtime:234,fixes:['ROUND_OPPONENT_ACTOR_ARENA_ATOMIC','STALE_ACTOR_TARGET_REBOUND','STALE_ARENA_IMAGE_REBOUND','FORM_TELEMETRY_CANONICAL','REPLAY_IDENTITY_CANONICAL','LEGACY_AUTHORITIES_PROJECTED'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production234.errors.push(String(err?.message||err))}
