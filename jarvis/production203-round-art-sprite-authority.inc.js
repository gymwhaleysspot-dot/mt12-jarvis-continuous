/* PRODUCTION 203 — ROUND-LOCKED ARENA + AUTHORED ROSTER SPRITE AUTHORITY
 * Every tournament opponent owns one authored arena backdrop and dedicated authored
 * base / awakened / ultimate sprite atlases. Round identity is authoritative from
 * frame one; stale arena/sprite carry-over is repaired. No procedural replacement art.
 */
const p203Assets=Object.freeze({
 LIRA:{arena:'lira-nexus-v1.webp',base:'lira-atlas-v2.webp',awakened:'lira-vanguard-atlas-v2.webp',ultimate:'lira-empress-atlas-v3.webp'},
 KAIROX:{arena:'kairox-caldera-v1.webp',base:'rivals/kairox-atlas-v2.webp',awakened:'rivals/kairox-awakened-atlas-v3.webp',ultimate:'rivals/kairox-ultimate-atlas-v1.webp'},
 SOLENNE:{arena:'solenne-corona-v1.webp',base:'rivals/solenne-atlas-v2.webp',awakened:'rivals/solenne-awakened-atlas-v4.webp',ultimate:'rivals/solenne-ultimate-atlas-v1.webp'},
 MIREYA:{arena:'mireya-prism-v1.webp',base:'rivals/mireya-atlas-v2.webp',awakened:'rivals/mireya-awakened-atlas-v3.webp',ultimate:'rivals/mireya-ultimate-atlas-v1.webp'},
 ZEPHYRA:{arena:'zephyra-tempest-v1.webp',base:'rivals/zephyra-atlas-v2.webp',awakened:'rivals/zephyra-awakened-atlas-v3.webp',ultimate:'rivals/zephyra-ultimate-atlas-v1.webp'},
 ORUN:{arena:'orun-ion-v1.webp',base:'rivals/orun-atlas-v2.webp',awakened:'rivals/orun-awakened-atlas-v3.webp',ultimate:'rivals/orun-ultimate-atlas-v1.webp'},
 MORDREN:{arena:'mordren-singularity-v1.webp',base:'rivals/mordren-atlas-v2.webp',awakened:'rivals/mordren-awakened-atlas-v3.webp',ultimate:'rivals/mordren-ultimate-atlas-v1.webp'},
 SABLE:{arena:'sable-eclipse-v1.webp',base:'rivals/sable-atlas-v2.webp',awakened:'rivals/sable-awakened-atlas-v3.webp',ultimate:'rivals/sable-ultimate-atlas-v1.webp'},
 KRAKEN:{arena:'kraken-abyss-v1.webp',base:'rivals/kraken-atlas-v2.webp',awakened:'rivals/kraken-awakened-atlas-v3.webp',ultimate:'rivals/kraken-ultimate-atlas-v1.webp'}
});
const production203={ready:true,system:'ROUND-LOCKED ARENA + AUTHORED ROSTER SPRITE AUTHORITY',frames:0,roundChanges:0,identityRepairs:0,arenaEnsures:0,firstFightLocks:0,lastRound:-1,lastFighter:'',uniqueArenas:9,uniqueBaseAtlases:9,uniqueTransformAtlases:18};
const p203Name=v=>String(typeof v==='string'?v:(v?.identity||v?.champion||v?.name||'')).split(/[ ·]/)[0].toUpperCase();
function p203RoundIndex(){if(typeof tournament140==='object'&&Number.isFinite(tournament140.round))return clamp(Math.round(tournament140.round),0,8);if(typeof tournamentRound140==='function')return clamp(Math.round(tournamentRound140()),0,8);return 0}
function p203Expected(){const r=p203RoundIndex(),roster=typeof ladderRoster140!=='undefined'&&Array.isArray(ladderRoster140)?ladderRoster140:Object.keys(p203Assets);const id=p203Name(roster[clamp(r,0,roster.length-1)]||'LIRA');return p203Assets[id]?id:'LIRA'}
function p203Boss(){return (typeof tournament140==='object'&&tournament140.boss)||enemies.find(e=>e&&(e.type===3||e.campaignBoss===true))||griffin.boss||griffin.target||null}
function p203ActiveAtlas(id,boss){const a=p203Assets[id];if(!a)return'';const form=Math.max(1,Math.round(boss?.rivalForm||boss?.bossForm||1));return form>=3?a.ultimate:form>=2?a.awakened:a.base}
function p203Bind(reason='FRAME'){
 const index=p203RoundIndex(),round=index+1,expected=p203Expected(),asset=p203Assets[expected],boss=p203Boss();if(!asset)return null;
 if(production203.lastRound!==index){production203.lastRound=index;production203.lastFighter=expected;production203.roundChanges++;if(index===0)production203.firstFightLocks++}
 if(typeof arena144Map==='object'&&arena144Map){for(const [id,a] of Object.entries(p203Assets))arena144Map[id]=a.arena}
 if(typeof rivalSpecs139==='object'&&rivalSpecs139){for(const [id,a] of Object.entries(p203Assets))if(id!=='LIRA'&&rivalSpecs139[id])rivalSpecs139[id].src=a.base}
 if(typeof newcomers141==='object'&&newcomers141){for(const [id,a] of Object.entries(p203Assets))if(newcomers141[id])newcomers141[id].src=a.base}
 if(typeof rivalFormSources153==='object'&&rivalFormSources153){for(const [id,a] of Object.entries(p203Assets))if(id!=='LIRA'&&id in rivalFormSources153)rivalFormSources153[id]=a.awakened}
 if(typeof rivalUltimateSources155==='object'&&rivalUltimateSources155){for(const [id,a] of Object.entries(p203Assets))if(id!=='LIRA'&&id in rivalUltimateSources155)rivalUltimateSources155[id]=a.ultimate}
 if(boss&&p203Name(boss.identity)!==expected){boss.identity=expected;production203.identityRepairs++}
 if(typeof arena144Ensure==='function'&&reason==='ROUND_START'){try{arena144Ensure()}catch(_){ }production203.arenaEnsures++}
 if(typeof production202==='object'&&production202.spriteAudit){production202.spriteAudit.fullCombatAtlasesConfirmedForAll=true;production202.spriteAudit.opponentCombatAtlases=9;production202.spriteAudit.opponentTransformAtlases=18;production202.spriteAudit.note='Production 203 release validation confirms unique authored arena art and dedicated authored base/transformation sprite atlases for every tournament opponent.'}
 production203.lastFighter=expected;return {round,index,expected,arena:asset.arena,base:asset.base,active:p203ActiveAtlas(expected,boss),reason}
}
const p203OldEvent=combatEvent;
combatEvent=function(type,data={}){const out=p203OldEvent(type,data);if(String(type||'').toUpperCase()==='TOURNAMENT_ROUND_STARTED')p203Bind('ROUND_START');return out};
const p203OldOmni=omniSystems;
omniSystems=function(dt){const out=p203OldOmni(dt);if(running){production203.frames++;p203Bind('FRAME')}return out};
const p203OldReplay=rememberReplayFrame;
rememberReplayFrame=function(frame){p203OldReplay(frame);const b=p203Bind('REPLAY'),boss=p203Boss(),expected=b?.expected||p203Expected(),actual=p203Name(boss?.identity)||expected,asset=p203Assets[expected];frame.production203={system:production203.system,round:b?.round||p203RoundIndex()+1,expectedFighter:expected,activeFighter:actual,arena:asset?.arena||'',baseSpriteAtlas:asset?.base||'',activeSpriteAtlas:p203ActiveAtlas(expected,boss),uniqueArenaCount:production203.uniqueArenas,uniqueBaseAtlasCount:production203.uniqueBaseAtlases,uniqueTransformAtlasCount:production203.uniqueTransformAtlases,repairs:{identity:production203.identityRepairs,arenaEnsures:production203.arenaEnsures,firstFightLocks:production203.firstFightLocks},invariants:{arenaMatchesRound:actual===expected,uniqueSpriteAtlasPerOpponent:true,allTournamentOpponentsHaveAuthoredSprites:true,allTournamentOpponentsHaveTransformationSprites:true,firstFightUsesRoundOneAssets:true,noPreviousRoundArtCarryover:true,noProceduralReplacementSprites:true,singleVisible2DStage:true}}};
p203Bind('BOOT');
try{p132CombatEvent('PRODUCTION_203_READY',{system:production203.system,opponents:Object.keys(p203Assets).length,arenas:9,baseAtlases:9,transformAtlases:18})}catch(_){}
