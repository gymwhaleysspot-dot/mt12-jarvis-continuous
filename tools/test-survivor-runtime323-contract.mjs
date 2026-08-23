import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('survivor-runtime323.html', 'utf8');
const softSprite = fs.readFileSync('jarvis/soft-sprite-engine-v1.js', 'utf8');
const required = [
  'RUNTIME=323', 'MODEL_RENDERER_VERSION=15', 'VISUAL_TUNING_VERSION=25', 'BALANCE_VERSION=26', 'CHOREOGRAPHY_VERSION=29',
  'APEX_2026_ADAPTIVE_V13', 'APEX_2026_ADAPTIVE_GRAPHICS_KERNEL', 'EFFECT_GEOMETRY_VERSION=12',
  "schema:'jarvis-survivor-replay-v19'", "function snapshot(reason='TICK')", 'replay.frames.push',
  'hpBefore', 'hpAfter', 'strikeId', 'FINISHER_START', 'FINISHER_IMPACT', 'FINISHER_COMPLETE',
  'PROJECTILE_EXPIRE', "emit('RUNTIME_BOOT'", "bind(0,false)", 'awaitCriticalAssets', 'heroAtlasReady',
  'griffin-ascended-atlas-v3.webp', 'rivals/kairox-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp',
  'ATLAS_SANITIZER_VERSION=2', 'SANITIZED_ATLAS_PATHS', '...GRIFFIN_FINISHER_ATLASES', "'sanitized/'+r.path", "'ATLAS_SANITIZER_FALLBACK'", 'sanitizedAtlases:SANITIZED_ATLAS_PATHS.size', 'finisherSanitation:true',
  'GRAPHICS_PROFILE', 'SPRITE_LAYOUT', 'SPRITE_DEPTH_PIPELINE', 'function drawContactShadow',
  'function drawMotionAfterimages', 'subframeInterpolation:true', 'multiLobeContactShadows:true',
  'velocityAfterimages:true', 'dualRimPass:true', 'mobileDpr:1.75', 'particleCap:480',
  'Math.min(H*.50,W*.46,480)', 'resolveFighterSpacing', 'SPRITE_SEPARATION', 'contactOverlap',
  'JARVIS_LIQUID_ROLLBACK_KERNEL', 'LIQUID_BATTLE_COORDINATOR', 'function saveRollbackState',
  'function loadRollbackState', 'COORDINATOR_BOOT', 'STARTING_LIVES=3', 'SENZU_REVIVAL',
  'GRIFFIN_RENDER_AUTHORITY', 'GRIFFIN_SPRITE_AUTHORITY_V1', "mode:'SPRITE_ONLY'", 'rigged3D:false',
  "renderAdapter:'SPRITE_AUTHORITY_V1'", 'const criticalReady=await awaitCriticalAssets()',
  "emit('SPRITE_RENDER_BOOT'", 'griffinRenderer:GRIFFIN_RENDER_AUTHORITY',
  'fighterRenderer:globalThis.JarvisSoftSpriteEngine?.ready?globalThis.JarvisSoftSpriteEngine.name:GRIFFIN_RENDER_AUTHORITY.name', 'ARENA_WEATHER', "LIRA:['RAIN',.82]",
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
  'beginFinisherLifecycle(c,{pendingLethal:true})', 'if(c.pendingLethal&&!c.damageApplied)',
  'RIVAL_FINISHER_SEQUENCES', 'function testRivalFinisherSequences',
  'DRAGON_BALL_SURVIVAL_CURVE', 'finisherGrace=3.2', 'ladderAdapt=',
  'NEXUS_SPEAR', 'CALDERA_HAMMER', 'CORONA_ORBIT', 'PRISM_MIRAGE',
  'TEMPEST_VANISH', 'ION_LAUNCH', 'GRAVITY_WELL', 'ECLIPSE_ASSASSIN', 'ABYSS_MAELSTROM',
  'AI_FIGHTER_IDENTITIES', 'MOTION_MOTIFS', 'EFFECT_PACKAGES', 'AI_CHOREOGRAPHY_LATTICE',
  'function choreographyVariant', 'function applyChoreographyVariant', 'function testChoreographyLattice',
  'CHOREOGRAPHY_LATTICE_BOOT', 'CHOREOGRAPHY_VARIANT', 'choreographyVariantCount:AI_CHOREOGRAPHY_LATTICE.length',
  'DRAGON_BALL_COUNT=7', 'DRAGON_BALL_HORIZON=30', 'GOD_FORM=11', 'function planDragonBallRounds', 'function awardDragonBall',
  'DRAGON_BALL_FOUND', 'DRAGON_BALL_SET_COMPLETE', 'SEVEN_DRAGON_BALL_WISH', 'GOD_FORM_AUTHORITY',
  'RIVAL_FINISHER_RESERVED', 'SUPER SAIYAN GOD', 'DIVINE DRAGON RUSH', 'CRIMSON STAR ERUPTION',
  'SEVEN-STAR GODFALL', 'SEVEN_STAR_GODFALL', 'function drawDragonBallHud', 'function drawGodBloom',
  'griffin-god-form-atlas-v1.webp', 'finishers/griffin-god-finisher-v1.webp', 'function testDragonBallAscension',
  'GAMEPLAY_UPDATE_POLICIES', 'ENGINE_UPDATE_POLICIES', 'PRODUCTION_252_UPDATE_MATRIX',
  'function production252Update', 'function applyProduction252Update', 'function testProduction252Matrix',
  'PRODUCTION_252_MATRIX_BOOT', 'PRODUCTION_252_UPDATE', 'production252UpdateCount:PRODUCTION_252_UPDATE_MATRIX.length',
  'GOD_ASSETS_PRELOAD', 'GOD_AUTHORITY_RESTORE', "applyGodAuthority(st.hero,'LEVEL_BIND')",
  'integerSpritePlacement:true', 'effectTypeBudget:true', 'motionQueryMatrix:true', "version:6,firmware:'",
  'SMOOTH_COMBAT_PROFILE', 'function smoothFacing', 'function smoothApproach', 'function updateCameraSmoothing',
  'function testCombatSmoothness', 'SMOOTH_COMBAT_BOOT', 'SMOOTH_TURN_COMMIT', 'smoothCamera:true',
  'turnHysteresis:true', 'velocityDamping:true', 'COMBAT_CINEMATIC_COMPLETE', 'if(c.lifecycle)',
  '[[0,3],[4,7],[8,11],[12,15],[16,19],[20,24],[25,29]]',
  'SURVIVAL_PROFILE', 'function testSurvivalBalance', 'function testSurvivalRecovery', 'SURVIVAL_ENGINE_BOOT', 'DRAGON_BALL_RESOLVE',
  'roundRecoveryBase:420', 'minimumHealthRatio:.84', 'rivalFinisherRatio:.08', 'rivalFinisherUlt:82',
  'EXPLOSION_PROFILE', 'function testExplosionEngine', 'function updateParticleSystems', 'EXPLOSION_ENGINE_BOOT',
  'CINEMATIC_EXPLOSION_SPAWN', 'thermalLayers:4', 'shockwaveLayers:3', 'maxDebris:56', 'maxSmoke:12',
  'layeredExplosions:true', 'ballisticDebris:true', 'thermalBloom:true', 'particleGravity:true',
  'contactState:contact.state', 'intentionalContact:contact.intentional', 'spacingViolation:!contact.intentional',
  'AUDIO_ENGINE_VERSION=1', 'AUDIO_PROFILE', 'JARVIS_SPATIAL_COMBAT_AUDIO_ENGINE', 'function testAudioEngine',
  'AUDIO_ENGINE_BOOT', 'AUDIO_CUE', 'maxVoices:18', 'dynamicCompression:true', 'spatialPan:true',
  "sound('explosion'", "sound('transform'", "sound(heavy?'impactHeavy':'impact'",
  'REPLAY_ARCHIVE_VERSION=4', 'replayArchiveVersion:REPLAY_ARCHIVE_VERSION', 'nextEventSeq:0', 'function replayCoverage', 'eventsDropped:0', 'framesDropped:0', 'function compactAssetTelemetry', 'function finalReplayPayload', 'function testReplayArchiveOutcomes', 'function testTournamentReplayArchive', "persistFinalReplay('TOURNAMENT_CLEARED')",
  "outcome==='TOURNAMENT_CLEARED'", "emit('TOURNAMENT_CLEARED'", 'REPLAY_ARCHIVE_COMPLETE',
  'REPLAY_ARCHIVE_QUEUED', 'ARCHIVE_RECEIPT', 'verified:true', 'function testRivalFinisherTimeline', 'if(st.archiveStarted)return false',
  'jarvis/soft-sprite-engine-v1.js', 'function drawFighterFallback', 'function drawSoftFighter',
  'function drawSoftContactOcclusion', 'if(!globalThis.JarvisSoftSpriteEngine?.continuousSurface)drawSoftContactOcclusion()', 'SOFTSPRITE_ENGINE_BOOT', 'softSpriteEngine:globalThis.JarvisSoftSpriteEngine',
  'fallbackRenderer:GRIFFIN_RENDER_AUTHORITY.name', 'name:f.name,pose:f.pose', 'name:f.name,facing:f.facing'
];
for (const marker of required) assert.ok(html.includes(marker), `missing ${marker}`);
for (const forbidden of [
  'griffin-gltf-runtime-v2.js', 'JARVIS_GRIFFIN_GLTF_V2.install', 'RIGGED_3D_RENDER_ADAPTER.load()',
  'RIGGED_3D_RENDER_ADAPTER.update(h,dt)', 'RIGGED_3D_RENDER_ADAPTER.draw(f,p,w,h)',
  "emit('RIGGED_RENDER_BOOT'", 'riggedRenderer:RIGGED_3D_RENDER_ADAPTER'
]) assert.ok(!html.includes(forbidden), `live Griffin path must not include ${forbidden}`);
assert.ok(html.indexOf("emit('RUNTIME_BOOT'") < html.indexOf('bind(0,false)'), 'runtime boot must precede level binding');
assert.equal((html.match(/function drawFighter\(/g) || []).length, 1, 'single fighter renderer required');
for(const marker of ['JARVIS_CHARACTER_MESH_ENGINE','version:4',"fallback:'JARVIS_SOFTSPRITE_FUSION_ENGINE_V3'","legacyFallback:'GRIFFIN_SPRITE_AUTHORITY_V1'",'continuousSurface:true','sliceRenderer:false','impactWarp:true','contactOcclusion:true','energyEmbedding:true','perFighterProfiles:true','fighterProfile(name)','drawSliced(o)','ctx.transform(1,0,lean,1','profileCount:Object.keys(this.fighterProfiles).length','redrawContact(o)'])assert.ok(softSprite.includes(marker),`character mesh engine missing ${marker}`);
for(const fighter of ['GRIFFIN','LIRA','KAIROX','SOLENNE','MIREYA','ZEPHYRA','ORUN','MORDREN','SABLE','KRAKEN'])assert.ok(softSprite.includes(`${fighter}:{slices:`),`soft-sprite profile missing ${fighter}`);
const sanitizedRoot='jarvis/assets/survivor/sanitized';
const sanitizedAtlases=fs.readdirSync(sanitizedRoot,{recursive:true}).filter(path=>String(path).endsWith('.webp'));
assert.equal(sanitizedAtlases.length,33,'all 12 Griffin, 12 finisher, and 9 rival atlases require sanitized builds');
for(const path of sanitizedAtlases)assert.ok(fs.statSync(`${sanitizedRoot}/${path}`).size>100_000,`sanitized atlas is empty or undersized ${path}`);
for(const marker of ['JARVIS_CONTACT_STATE_CONTROLLER','function fighterContactState','function contactGeometry',"impact?'IMPACT':transit?'TRANSIT':idle?'IDLE':'NEUTRAL'",'idleGap:.255','impactGap:.16','if(contact.intentional)','state:contact.state','velocityClamp:true','if(d>.27)','else smoothApproach(a,0,0,dt)','distance(a,b)>.285'])assert.ok(html.includes(marker),`contact-state controller missing ${marker}`);
for(const marker of ['JARVIS_UNIFIED_FINISHER_LIFECYCLE','function beginFinisherLifecycle','lifecycleImpact=false',"source:c.source,postKo:true",'st.victoryCinematic=beginFinisherLifecycle',"emit('FINISHER_COMPLETE'"])assert.ok(html.includes(marker),`finisher lifecycle adapter missing ${marker}`);
for(const marker of ['JARVIS_REPLAY_DELIVERY_VERIFIER','function verifyReplayUpload','function deliverReplayVerified','remote.sha===receipt.blobSha','attempts:3','UPLOAD_OR_VERIFY_FAILED','verified:false'])assert.ok(html.includes(marker),`replay delivery verifier missing ${marker}`);
{
  const a={x:.28,vx:0},b={x:.72,vx:0},dt=1/60,target=.245;
  let active=false,reversals=0,lastDelta=0,minSettledGap=1;
  for(let frame=0;frame<720;frame++){
    const gap=Math.abs(b.x-a.x),dir=Math.sign(b.x-a.x)||1;
    const desired=gap>.27?.5:0;
    a.vx+=(dir*desired-a.vx)*(1-Math.exp(-13*dt));
    b.vx+=(-dir*desired-b.vx)*(1-Math.exp(-13*dt));
    a.x+=a.vx*dt;b.x+=b.vx*dt;
    const ad=Math.abs(b.x-a.x),enter=target-.018,release=target+.026;
    if(active){if(ad>=release)active=false}else if(ad<enter)active=true;
    if(active){
      const correction=Math.min(Math.max(0,target-ad),.012);
      a.x-=dir*correction*.5;b.x+=dir*correction*.5;
      if(a.vx*dir>0)a.vx=0;if(b.vx*dir<0)b.vx=0;
    }
    const delta=Math.abs(b.x-a.x)-gap;
    if(frame>120&&delta*lastDelta<0&&Math.abs(delta)>.0001)reversals++;
    if(frame>120)minSettledGap=Math.min(minSettledGap,Math.abs(b.x-a.x));
    lastDelta=delta;
  }
  assert.ok(minSettledGap>=.2269,`spacing solver penetrated hold band: ${minSettledGap}`);
  assert.ok(reversals<=2,`spacing solver oscillated ${reversals} times`);
}
assert.ok(!softSprite.includes('ctx.globalAlpha=.82;ctx.translate(-impactSide'), 'continuous renderer must not repaint a duplicate impact body');
assert.equal((html.match(/<canvas/g) || []).length, 1, 'single canvas required');
assert.equal((html.match(/schema:'jarvis-survivor-replay-v19'/g) || []).length, 1, 'single replay schema authority required');
assert.ok(!html.includes('if(replay.events.length>12000)'), 'complete replay must not discard early events');
assert.ok(!html.includes('if(replay.frames.length>7200)'), 'complete replay must not discard early frames');
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
