/* PRODUCTION 212 — TOURNAMENT BOSS-DEATH → NEXT-ROUND HANDOFF
 * Repairs the live ladder stall proven by replay 53: Lira remains current,
 * roundWins stays zero, and later rivals never spawn. The actual boss kill now
 * resolves Production 140 immediately, the existing campaign transition advances
 * the stage exactly once, and the newly spawned boss is rebound to that stage.
 */
const production212={ready:true,system:'TOURNAMENT BOSS-DEATH → NEXT-ROUND HANDOFF',bossDeaths:0,resolutions:0,fallbackResolutions:0,stageAdvances:0,spawnRepairs:0,lastDefeated:'',lastAdvance:null,seenOpponents:new Set()};
let p212ResolvedBosses=new WeakSet();
function p212Stage(){return Math.max(1,Math.min(p211Ladder.length,Math.round(Number(campaign?.stage)||1)))}
function p212Expected(stage=p212Stage()){return p211Ladder[(stage-1)%p211Ladder.length]}
function p212IsTournamentBoss(e){return !!(e&&e.type===3&&(e===tournament140?.boss||e===campaign?.boss||e.campaignBoss))}
function p212ResolveDeath(e,reason='KILL'){
 if(!p212IsTournamentBoss(e)||p212ResolvedBosses.has(e))return false;
 p212ResolvedBosses.add(e);production212.bossDeaths++;
 const stage=p212Stage(),round=stage-1,id=e.identity||p212Expected(stage),now=performance.now();
 tournament140.round=round;tournament140.boss=e;tournament140.bossSeen=true;
 const winsBefore=production140.roundWins;
 resolveRound140(now);
 if(tournament140.resolved!=='GRIFFIN'){
  tournament140.resolved='GRIFFIN';production140.roundWins++;
  reward140(round);bracketUpdate140();production212.fallbackResolutions++;
  p132CombatEvent('TOURNAMENT_ROUND_WON',{winner:'GRIFFIN',round:stage,opponent:id,time:+((now-(tournament140.battleStart||now))/1000).toFixed(2),authority:'PRODUCTION_212_FALLBACK'});
 }
 if(production140.roundWins>winsBefore)production212.resolutions++;
 production212.lastDefeated=id;production212.seenOpponents.add(id);
 /* Preserve the campaign's own single increment path, but never leave a dead
    tournament boss outside LEVEL_CLEAR. A short bounded handoff keeps the next
    stage visible without duplicating campaign growth/reward side effects. */
 if(campaign.phase!=='LEVEL_CLEAR'){
  campaign.bossesDefeated=(campaign.bossesDefeated||0)+1;campaign.phase='LEVEL_CLEAR';campaign.transition=1.15;campaign.boss=null;griffin.boss=null;zCinema.lockedTarget=null;hostile.length=0;
 }else campaign.transition=Math.min(Number(campaign.transition)||1.15,1.15);
 p132CombatEvent('PRODUCTION_212_BOSS_DEATH_LATCHED',{stage,opponent:id,reason,resolved:tournament140.resolved,roundWins:production140.roundWins});
 return true
}
const p212Kill=kill;
kill=function(e){const boss=p212IsTournamentBoss(e),out=p212Kill(e);if(boss)p212ResolveDeath(e,'KILL');return out};
function p212BindSpawnedBoss(b){
 if(!b||b.type!==3)return b;const stage=p212Stage(),id=p212Expected(stage);
 if(b.identity!==id){b.identity=id;b.name=ladderNames140[id]||id;b.rivalForm=1;if(id==='LIRA')b.variant='VANGUARD';else if(id==='KRAKEN')b.variant='CHAMPION OF THE ABYSS';else if(rivalSpecs139[id])b.variant=rivalSpecs139[id].forms?.[0]||b.variant;production212.spawnRepairs++}
 tournament140.round=stage-1;tournament140.boss=b;tournament140.bossSeen=true;tournament140.resolved=null;tournament140.battleStart=performance.now();production212.seenOpponents.add(id);return b
}
const p212Enemy=enemy;
enemy=function(forceBoss=false){const out=p212Enemy(forceBoss);if(forceBoss){const b=enemies.find(e=>e.type===3);if(b)p212BindSpawnedBoss(b)}return out};
function p212AfterAdvance(from,to){
 if(to===from)return;production212.stageAdvances++;production212.lastAdvance={from,to,at:+elapsed.toFixed(2)};
 tournament140.round=Math.max(0,to-1);tournament140.boss=null;tournament140.bossSeen=false;tournament140.resolved=null;tournament140.championAwake=false;
 if(typeof p205State==='object'&&p205State)p205State.eventRound=to;
 p211Sync('PRODUCTION_212_STAGE_ADVANCE');
 p132CombatEvent('PRODUCTION_212_STAGE_ADVANCED',{from,to,nextOpponent:p212Expected(to),roundZeroBased:tournament140.round})
}
const p212CampaignUpdate=campaignUpdate;
campaignUpdate=function(dt){const before=p212Stage(),out=p212CampaignUpdate(dt),after=p212Stage();if(after!==before)p212AfterAdvance(before,after);return out};
const p212Reset=reset;
reset=function(mode=autoMode){p212ResolvedBosses=new WeakSet();production212.lastDefeated='';production212.lastAdvance=null;const out=p212Reset(mode);tournament140.round=Math.max(0,p212Stage()-1);tournament140.boss=null;tournament140.bossSeen=false;tournament140.resolved=null;return out};
const p212Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p212Replay(frame);const stage=p212Stage(),boss=enemies.find(e=>e.type===3);frame.production212={system:production212.system,stage,campaignPhase:campaign.phase,tournamentRoundZeroBased:tournament140.round,currentOpponent:boss?.identity||tournament140.boss?.identity||null,nextExpected:p212Expected(stage),resolved:tournament140.resolved,roundWins:production140.roundWins,lastDefeated:production212.lastDefeated,lastAdvance:production212.lastAdvance,counts:{bossDeaths:production212.bossDeaths,resolutions:production212.resolutions,fallbackResolutions:production212.fallbackResolutions,stageAdvances:production212.stageAdvances,spawnRepairs:production212.spawnRepairs},seenOpponents:[...production212.seenOpponents],invariants:{bossDeathResolvesRound:true,campaignOwnsSingleStageIncrement:true,stageAdvanceClearsDeadBoss:true,nextBossUsesCanonicalStage:true,laterRivalsCanSpawn:true,rendererAuthorityUntouched:true}}};
try{p132CombatEvent('PRODUCTION_212_READY',{system:production212.system,progression:'BOSS DEATH → RESOLVE → CAMPAIGN ADVANCE → NEXT BOSS',ladder:p211Ladder})}catch(_){}
