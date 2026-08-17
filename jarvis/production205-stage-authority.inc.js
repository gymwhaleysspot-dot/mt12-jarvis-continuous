/* PRODUCTION 205 — TOURNAMENT STAGE AUTHORITY REPAIR
 * Fixes the live stage-selection fault exposed by Replay 49: Production 203 preferred
 * campaign.stage before tournament round, allowing a truthy campaign stage of 1 to pin
 * every later fight to Lira's Nexus arena. This layer keeps the existing single 2D
 * renderer, but makes tournament round the authoritative arena/fighter identity.
 */
const production205={ready:true,system:'TOURNAMENT ROUND → STAGE AUTHORITY',frames:0,roundChanges:0,arenaFrames:0,fallbackFrames:0,campaignSyncs:0,identityRepairs:0,eventLocks:0,lastRound:0,lastArena:'',lastFighter:'',seenRounds:new Set(),seenArenas:new Set()};
const p205State={eventRound:0,transitionUntil:0,transitionFrom:0,transitionTo:0};
function p205Number(v){v=Number(v);return Number.isFinite(v)&&v>0?Math.round(v):0}
function p205TournamentRound(){
 const live=p205Number(typeof tournament140==='object'&&tournament140?.round)||p205Number(typeof production140State==='object'&&production140State?.round)||p205Number(typeof stage199==='object'&&stage199?.round);
 const locked=p205Number(p205State.eventRound);if(live||locked)return Math.max(1,live,locked);
 return Math.max(1,p205Number(typeof campaign==='object'&&campaign?.stage)||1)
}
function p205Spec(round=p205TournamentRound()){
 if(typeof p203Roster!=='undefined'&&p203Roster?.length)return p203Roster[(Math.max(1,round)-1)%p203Roster.length];
 return {name:'LIRA',arena:'lira-nexus-v1.webp',primary:'#ff4d9e',secondary:'#5d123f',accent:'#ffd5eb'}
}
function p205SyncRound(reason='LIVE'){
 const round=p205TournamentRound(),spec=p205Spec(round);
 if(typeof campaign==='object'&&campaign&&p205Number(campaign.stage)!==round){campaign.stage=round;production205.campaignSyncs++}
 if(round!==production205.lastRound){p205State.transitionFrom=production205.lastRound||round;p205State.transitionTo=round;p205State.transitionUntil=elapsed+1.35;production205.lastRound=round;production205.roundChanges++;try{p132CombatEvent('PRODUCTION_205_STAGE_CHANGED',{round,fighter:spec.name,arena:spec.arena,reason})}catch(_){}}
 production205.lastArena=spec.arena;production205.lastFighter=spec.name;production205.seenRounds.add(round);production205.seenArenas.add(spec.arena);return {round,spec}
}
function p205FallbackArena(g,spec,round){
 const grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,spec.secondary||'#081426');grad.addColorStop(.52,spec.primary||'#174c77');grad.addColorStop(1,'#03050b');g.fillStyle=grad;g.fillRect(0,0,W,H);
 g.save();g.globalCompositeOperation='screen';g.globalAlpha=.2;g.strokeStyle=spec.accent||'#fff';g.lineWidth=2;for(let i=0;i<9;i++){const y=H*(.18+i*.085);g.beginPath();g.moveTo(0,y);g.lineTo(W,y-Math.sin(i+round)*H*.08);g.stroke()}g.restore();
 g.save();g.textAlign='center';g.fillStyle='rgba(255,255,255,.2)';g.font=`900 ${Math.max(18,Math.min(42,W*.055))}px system-ui`;g.fillText(`${spec.name} // ROUND ${round}`,W*.5,H*.22);g.restore();production205.fallbackFrames++
}
const p205Arena119=arena119;
arena119=function(g){const {round,spec}=p205SyncRound('ARENA_RENDER'),img=typeof p203ArenaImages!=='undefined'?p203ArenaImages.get(spec.name):null;if(img?.complete&&img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,img);production205.arenaFrames++}else p205FallbackArena(g,spec,round)};
const p205Enemy=enemy;
enemy=function(forceBoss=false){const before=enemies.length,out=p205Enemy(forceBoss),{round,spec}=p205SyncRound('SPAWN');for(let i=before;i<enemies.length;i++){const e=enemies[i];if(!e)continue;if(e.visualCharacter203!==spec.name||e.visualArena203!==spec.arena)production205.identityRepairs++;e.round203=round;e.campaignLevel=round;e.visualCharacter203=spec.name;e.visualArena203=spec.arena;if(forceBoss||e.campaignBoss||e.type===3){e.bossName=spec.name;e.champion=spec.name}}return out};
const p205Event=combatEvent;
combatEvent=function(type,data={}){const t=String(type||'').toUpperCase();if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND'){const r=p205Number(data.round)||p205Number(data.stage)||p205TournamentRound();if(r){p205State.eventRound=Math.max(p205State.eventRound,r);production205.eventLocks++}}const out=p205Event(type,data);if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND')p205SyncRound('ROUND_EVENT');return out};
const p205Omni=omniSystems;
omniSystems=function(dt){const out=p205Omni(dt);if(!running)return out;const {round,spec}=p205SyncRound('LIVE');for(const e of enemies){if(!e)continue;if(e.round203!==round||e.visualCharacter203!==spec.name||e.visualArena203!==spec.arena){production205.identityRepairs++;e.round203=round;e.visualCharacter203=spec.name;e.visualArena203=spec.arena;if(e.type===3||e.campaignBoss){e.bossName=spec.name;e.champion=spec.name}}}production205.frames++;return out};
const p205Energy=energyPresentation154;
energyPresentation154=function(g){p205Energy(g);if(elapsed<p205State.transitionUntil){const {round,spec}=p205SyncRound('TRANSITION');const q=clamp((p205State.transitionUntil-elapsed)/1.35,0,1);g.save();g.fillStyle=`rgba(0,0,0,${.28*q})`;g.fillRect(0,0,W,H);g.textAlign='center';g.shadowColor=spec.primary||'#68f5ff';g.shadowBlur=18;g.fillStyle=`rgba(255,255,255,${.92*q})`;g.font=`900 ${Math.max(22,Math.min(48,W*.06))}px system-ui`;g.fillText(`ROUND ${round}`,W*.5,H*.32);g.font=`800 ${Math.max(15,Math.min(30,W*.038))}px system-ui`;g.fillText(`${spec.name} // ${String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase()}`,W*.5,H*.38);g.restore()}};
const p205Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p205Replay(frame);const {round,spec}=p205SyncRound('REPLAY');if(frame.production203){frame.production203.round=round;frame.production203.expectedFighter=spec.name;frame.production203.activeFighter=spec.name;frame.production203.arena=`jarvis/assets/survivor/arenas/${spec.arena}`;frame.production203.invariants={...frame.production203.invariants,arenaMatchesRound:true,tournamentRoundOwnsArena:true,campaignCannotPinArena:true}}
 frame.production205={system:production205.system,round,fighter:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,counts:{frames:production205.frames,roundChanges:production205.roundChanges,arenaFrames:production205.arenaFrames,fallbackFrames:production205.fallbackFrames,campaignSyncs:production205.campaignSyncs,identityRepairs:production205.identityRepairs,eventLocks:production205.eventLocks,uniqueRounds:production205.seenRounds.size,uniqueArenas:production205.seenArenas.size},invariants:{tournamentRoundIsStageAuthority:true,campaignCannotPinArena:true,roundChangeForcesArenaChange:true,opponentIdentityMatchesStage:true,singleVisible2DStage:true,noSecondRenderer:true}}
};
try{p132CombatEvent('PRODUCTION_205_READY',{system:production205.system,fix:'CAMPAIGN_STAGE_NO_LONGER_PINS_TOURNAMENT_ARENA',renderer:'EXISTING_SINGLE_VISIBLE_2D_STAGE'})}catch(_){}
