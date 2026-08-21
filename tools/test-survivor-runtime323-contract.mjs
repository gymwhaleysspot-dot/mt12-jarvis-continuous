import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('survivor-runtime323.html', 'utf8');
const required = [
  'RUNTIME=323', 'MODEL_RENDERER_VERSION=15', 'BALANCE_VERSION=22', 'CHOREOGRAPHY_VERSION=25',
  'APEX_2026_ADAPTIVE_V13', 'APEX_2026_ADAPTIVE_GRAPHICS_KERNEL', 'EFFECT_GEOMETRY_VERSION=9',
  "schema:'jarvis-survivor-replay-v19'", "function snapshot(reason='TICK')", 'replay.frames.push',
  'hpBefore', 'hpAfter', 'strikeId', 'FINISHER_START', 'FINISHER_IMPACT', 'FINISHER_COMPLETE',
  'PROJECTILE_EXPIRE', "emit('RUNTIME_BOOT'", "bind(0,false)", 'awaitCriticalAssets', 'heroAtlasReady',
  'griffin-ascended-atlas-v3.webp', 'rivals/kairox-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp',
  'GRAPHICS_PROFILE', 'SPRITE_LAYOUT', 'SPRITE_DEPTH_PIPELINE', 'function drawContactShadow',
  'function drawMotionAfterimages', 'subframeInterpolation:true', 'multiLobeContactShadows:true',
  'velocityAfterimages:true', 'dualRimPass:true', 'mobileDpr:1.75', 'particleCap:480',
  'Math.min(H*.50,W*.46,480)', 'resolveFighterSpacing', 'SPRITE_SEPARATION', 'contactOverlap',
  'JARVIS_LIQUID_ROLLBACK_KERNEL', 'LIQUID_BATTLE_COORDINATOR', 'function saveRollbackState',
  'function loadRollbackState', 'COORDINATOR_BOOT', 'STARTING_LIVES=3', 'SENZU_REVIVAL',
  'GRIFFIN_RENDER_AUTHORITY', 'GRIFFIN_SPRITE_AUTHORITY_V1', "mode:'SPRITE_ONLY'", 'rigged3D:false',
  "renderAdapter:'SPRITE_AUTHORITY_V1'", 'const criticalReady=await awaitCriticalAssets()',
  "emit('SPRITE_RENDER_BOOT'", 'griffinRenderer:GRIFFIN_RENDER_AUTHORITY',
  'fighterRenderer:GRIFFIN_RENDER_AUTHORITY.name', 'ARENA_WEATHER', "LIRA:['RAIN',.82]",
  "SOLENNE:['SNOW',.5]", "MORDREN:['VOID_SNOW',.64]", 'function drawWeatherLayer',
  'function spawnCinematicExplosion', 'function drawCinematicExplosions', 'function drawVictoryCutscene',
  'function updateVictoryCinematic', 'VICTORY_CUTSCENE_START', 'VICTORY_CUTSCENE_IMPACT',
  'VICTORY_CUTSCENE_COMPLETE', "source:'COMBAT_KO'", 'cinematicVictoryFinishers:true',
  'layeredWeather:true', 'X.globalAlpha=.012', 'JARVIS_SPRITE_FIRMWARE_BIOS',
  'jarvis-sprite-bios-v1', "this.log('SEC','START')", "this.log('PEI'", "this.log('DXE'",
  "this.log('BDS','RUNTIME_HANDOFF'", 'FIRMWARE_POST', 'FIRMWARE_RUNTIME_HANDOFF',
  'JARVIS_BOUNDED_COMBAT_SCHEDULER', 'maxStepsPerFrame:8', 'FIXED_STEP_WATCHDOG_RECOVERY',
  'KERNEL_TICK_SHED', 'KERNEL_WATCHDOG_RECOVERY', 'KERNEL_PANIC_RECOVERY',
  "recoveryProfile(reason)", 'contextProbeReleased', 'p95Ms', "getExtension('WEBGL_lose_context')",
  'bios:JARVIS_SPRITE_BIOS', 'scheduler:JARVIS_KERNEL_SCHEDULER'
  , 'GRIFFIN_FINISHER_SPRITE_VERSION=1', 'GRIFFIN_FINISHER_ATLASES',
  'GRIFFIN_FORM_FINISHERS', 'function griffinVictory', 'FORM_FINISHER_BIND',
  'griffin-base-finisher-v1.webp', 'griffin-autonomous-finisher-v1.webp',
  'FINISHER_CHARGE_PEAK', 'FINISHER_TARGET_LOCK', 'FINISHER_AFTERSHOCK',
  'FINISHER_VICTORY_HALO', 'FINISHER_STARTUP_CHARGE', 'FINISHER_STARTUP_LOCK',
  'FINISHER_CRITICAL_FRAME', 'RIVAL_FINISHERS', 'function rivalVictory', 'function updateTransformation',
  'duration=1.35,commitAt=.65', "griffinVictory(h,b,'COMBAT_KO')",
  'function attackBreak', 'function testAttackBreakCombat', "emit('ATTACK_BREAK'",
  'comebackUsed:false', 'attackBreakRestored:true', 'rivalVictory(a,b,"LETHAL_FINISHER")',
  'function testFinisherTimeline', 'normalizedImpact:', 'timingError:', 'timelineId:',
  'c.pendingLethal=true', 'if(c.pendingLethal&&!c.damageApplied)',
  'RIVAL_FINISHER_SEQUENCES', 'function testRivalFinisherSequences',
  'ADAPTIVE_360_CAP', 'finisherGrace=3.2', 'ladderAdapt=',
  'NEXUS_SPEAR', 'CALDERA_HAMMER', 'CORONA_ORBIT', 'PRISM_MIRAGE',
  'TEMPEST_VANISH', 'ION_LAUNCH', 'GRAVITY_WELL', 'ECLIPSE_ASSASSIN', 'ABYSS_MAELSTROM',
  'AI_FIGHTER_IDENTITIES', 'MOTION_MOTIFS', 'EFFECT_PACKAGES', 'AI_CHOREOGRAPHY_LATTICE',
  'function choreographyVariant', 'function applyChoreographyVariant', 'function testChoreographyLattice',
  'CHOREOGRAPHY_LATTICE_BOOT', 'CHOREOGRAPHY_VARIANT', 'choreographyVariantCount:AI_CHOREOGRAPHY_LATTICE.length',
  'DRAGON_BALL_COUNT=7', 'GOD_FORM=11', 'function planDragonBallRounds', 'function awardDragonBall',
  'DRAGON_BALL_FOUND', 'DRAGON_BALL_SET_COMPLETE', 'SEVEN_DRAGON_BALL_WISH', 'GOD_FORM_AUTHORITY',
  'RIVAL_FINISHER_RESERVED', 'SUPER SAIYAN GOD', 'DIVINE DRAGON RUSH', 'CRIMSON STAR ERUPTION',
  'SEVEN-STAR GODFALL', 'SEVEN_STAR_GODFALL', 'function drawDragonBallHud', 'function drawGodBloom',
  'griffin-god-form-atlas-v1.webp', 'finishers/griffin-god-finisher-v1.webp', 'function testDragonBallAscension'
];
for (const marker of required) assert.ok(html.includes(marker), `missing ${marker}`);
for (const forbidden of [
  'griffin-gltf-runtime-v2.js', 'JARVIS_GRIFFIN_GLTF_V2.install', 'RIGGED_3D_RENDER_ADAPTER.load()',
  'RIGGED_3D_RENDER_ADAPTER.update(h,dt)', 'RIGGED_3D_RENDER_ADAPTER.draw(f,p,w,h)',
  "emit('RIGGED_RENDER_BOOT'", 'riggedRenderer:RIGGED_3D_RENDER_ADAPTER'
]) assert.ok(!html.includes(forbidden), `live Griffin path must not include ${forbidden}`);
assert.ok(html.indexOf("emit('RUNTIME_BOOT'") < html.indexOf('bind(0,false)'), 'runtime boot must precede level binding');
assert.equal((html.match(/function drawFighter\(/g) || []).length, 1, 'single fighter renderer required');
assert.equal((html.match(/<canvas/g) || []).length, 1, 'single canvas required');
assert.equal((html.match(/schema:'jarvis-survivor-replay-v19'/g) || []).length, 1, 'single replay schema authority required');
assert.ok(!html.includes('st.finisher={a,b,time:.95'), 'detached 0.95-second finisher timer is prohibited');
const finisherAtlasMatch=html.match(/const GRIFFIN_FINISHER_SPRITE_VERSION=1,GRIFFIN_FINISHER_ATLASES=(\[[^;]+\]);/);
assert.ok(finisherAtlasMatch,'Griffin finisher atlas table required');
assert.equal(Function(`return ${finisherAtlasMatch[1]}`)().length,12,'all 12 Griffin forms require unique finisher sprites');
const timingMatch=html.match(/const GRIFFIN_FORM_FINISHERS=(\[[^;]+\]);/);
assert.ok(timingMatch, 'finisher timing table required');
const timings=Function(`return ${timingMatch[1]}`)();
assert.equal(timings.length,12,'all 12 forms require timing');
for(const [name,duration,impactAt] of timings){
  assert.ok(duration>=4.2&&duration<=5.5,`${name} cinematic duration out of bounds`);
  assert.ok(impactAt>duration*.4&&impactAt<duration*.6,`${name} impact must land in the cinematic middle`);
}
for (const name of ['base','spark','ascended','radiant','velocity','guardian','destroyer','celestial','omega','instinct','autonomous','god']) {
  const path = `jarvis/assets/survivor/finishers/griffin-${name}-finisher-v1.webp`;
  assert.ok(fs.existsSync(path), `missing finisher sprite ${path}`);
  assert.ok(fs.statSync(path).size > 100_000, `finisher sprite is empty or undersized ${path}`);
}
for(const path of ['jarvis/assets/survivor/griffin-god-form-atlas-v1.webp','jarvis/assets/survivor/finishers/griffin-god-finisher-v1.webp'])assert.ok(fs.statSync(path).size>100_000,`God sprite is empty or undersized ${path}`);
console.log(JSON.stringify({runtime:323,replay:'v19',renderer:'GRIFFIN_SPRITE_AUTHORITY_V1',kernel:'JARVIS_LIQUID_ROLLBACK_KERNEL',coordinator:'v1',result:'PASS'}));
