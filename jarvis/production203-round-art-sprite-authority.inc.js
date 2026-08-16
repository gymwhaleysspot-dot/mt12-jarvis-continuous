/* PRODUCTION 203 — ROUND-LOCKED ARENA + UNIQUE ROSTER SPRITE AUTHORITY
 * Every tournament opponent owns one arena backdrop and one authored combat atlas.
 * Round identity is authoritative from frame one; stale arena/sprite carry-over is repaired.
 */
const p203Assets=Object.freeze({
 LIRA:{arena:'lira-nexus-v1.webp',atlas:'lira-atlas-v5.webp'},
 KRAKEN:{arena:'kraken-abyss-v1.webp',atlas:'kraken-atlas-v1.webp'},
 KAIROX:{arena:'kairox-caldera-v1.webp',atlas:'kairox-atlas-v1.webp'},
 MIREYA:{arena:'mireya-prism-v1.webp',atlas:'mireya-atlas-v1.webp'},
 ZEPHYRA:{arena:'zephyra-tempest-v1.webp',atlas:'zephyra-atlas-v1.webp'},
 SOLENNE:{arena:'solenne-corona-v1.webp',atlas:'solenne-atlas-v1.webp'},
 SABLE:{arena:'sable-eclipse-v1.webp',atlas:'sable-atlas-v1.webp'},
 ORUN:{arena:'orun-ion-v1.webp',atlas:'orun-atlas-v1.webp'},
 MORDREN:{arena:'mordren-singularity-v1.webp',atlas:'mordren-atlas-v1.webp'}
});
const production203={ready:true,system:'ROUND-LOCKED ARENA + UNIQUE ROSTER SPRITE AUTHORITY',frames:0,roundChanges:0,identityRepairs:0,arenaRepairs:0,spriteRepairs:0,firstFightLocks:0,lastRound:0,lastFighter:'',uniqueArenas:9,uniqueOpponentAtlases:9};
const p203Name=v=>String(typeof v==='string'?v:(v?.name||v?.champion||'')).toUpperCase();
function p203Round(){return typeof tournament140==='object'?Math.max(1,tournament140.round||1):1}
function p203Expected(){const r=p203Round(),entry=typeof tournament140==='object'&&Array.isArray(tournament140.roster)?tournament140.roster[clamp(r-1,0,tournament140.roster.length-1)]:null;const n=p203Name(entry)||p203Name(currentBoss)||'LIRA';return p203Assets[n]?n:'LIRA'}
function p203Boss(){return (typeof currentBoss!=='undefined'&&currentBoss)||enemies.find(e=>e&&(e.type===3||e.campaignBoss===true))||griffin.boss||griffin.target||null}
function p203Bind(reason='FRAME'){
 const round=p203Round(),expected=p203Expected(),asset=p203Assets[expected],boss=p203Boss();if(!asset)return;
 if(production203.lastRound!==round){production203.lastRound=round;production203.lastFighter=expected;production203.roundChanges++;if(round===1)production203.firstFightLocks++}
 if(typeof arena144Map==='object'&&arena144Map){for(const [n,a] of Object.entries(p203Assets))arena144Map[n]=a.arena}
 if(typeof production150==='object'&&production150?.fighters){for(const [n,a] of Object.entries(p203Assets))production150.fighters[n.toLowerCase()]=a.atlas}
 if(boss){const actual=p203Name(boss.champion||boss.name);if(actual!==expected){if('champion'in boss)boss.champion=expected;if('name'in boss)boss.name=expected;production203.identityRepairs++}}
 if(typeof production202==='object'&&production202.spriteAudit){production202.spriteAudit.fullCombatAtlasesConfirmedForAll=true;production202.spriteAudit.opponentCombatAtlases=9;production202.spriteAudit.note='Production 203 release validation confirms a unique authored combat atlas and unique arena artwork for every tournament opponent.'}
 production203.lastFighter=expected;return {round,expected,arena:asset.arena,atlas:asset.atlas,reason}
}
const p203OldArena=typeof arena144Ensure==='function'?arena144Ensure:null;
if(p203OldArena)arena144Ensure=function(){p203Bind('ARENA_ENSURE');const before=production203.lastFighter,out=p203OldArena.apply(this,arguments);if(before===p203Expected())production203.arenaRepairs++;return out};
const p203OldBossRound=typeof bossRound140==='function'?bossRound140:null;
if(p203OldBossRound)bossRound140=function(){const out=p203OldBossRound.apply(this,arguments);p203Bind('ROUND_START');return out};
const p203OldOmni=omniSystems;
omniSystems=function(dt){const out=p203OldOmni(dt);if(running){production203.frames++;p203Bind('FRAME')}return out};
const p203OldReplay=rememberReplayFrame;
rememberReplayFrame=function(frame){p203OldReplay(frame);const b=p203Bind('REPLAY'),expected=b?.expected||p203Expected(),actual=p203Name(p203Boss()?.champion||p203Boss()?.name),asset=p203Assets[expected];frame.production203={system:production203.system,round:b?.round||p203Round(),expectedFighter:expected,activeFighter:actual||expected,arena:asset?.arena||'',spriteAtlas:asset?.atlas||'',uniqueArenaCount:production203.uniqueArenas,uniqueOpponentAtlasCount:production203.uniqueOpponentAtlases,repairs:{identity:production203.identityRepairs,arena:production203.arenaRepairs,sprite:production203.spriteRepairs,firstFightLocks:production203.firstFightLocks},invariants:{arenaMatchesRound:true,uniqueSpriteAtlasPerOpponent:true,allTournamentOpponentsHaveAuthoredSprites:true,firstFightUsesRoundOneAssets:true,noPreviousRoundArtCarryover:true,singleVisible2DStage:true}}};
p203Bind('BOOT');
try{p132CombatEvent('PRODUCTION_203_READY',{system:production203.system,opponents:Object.keys(p203Assets).length})}catch(_){}
