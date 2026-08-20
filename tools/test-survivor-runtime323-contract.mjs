import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('survivor-runtime323.html', 'utf8');
const required = [
  'RUNTIME=323', 'MODEL_RENDERER_VERSION=13', 'BALANCE_VERSION=17', 'CHOREOGRAPHY_VERSION=18',
  'LIMIT_BREAK_ANIME_3D_V9', "schema:'jarvis-survivor-replay-v19'",
  "function snapshot(reason='TICK')", 'replay.frames.push', 'frameTelemetryHz:10',
  'hpBefore', 'hpAfter', 'strikeId', "comboSemantics:'CONFIRMED_CONSECUTIVE_HITS'",
  'FINISHER_START', 'FINISHER_IMPACT', "emit('KO'", 'FINISHER_COMPLETE',
  'PROJECTILE_EXPIRE', "reason:current?'OUT_OF_RANGE':'STALE_TARGET'",
  "emit('RUNTIME_BOOT'", "bind(0,false)", 'griffin-ascended-atlas-v3.webp',
  'rivals/kairox-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp', 'awaitCriticalAssets', 'fallbackFighter', 'heroAtlasReady', 'ASSET_FAILED', "emit(defense", 'maybeTransform', 'BATTLE_ASCENSION', 'TRANSFORMATION_COMPLETE', 'TELEMETRY_POSES', 'koEmitted=true', 'GRAPHICS_PROFILE', 'drawArenaDepth', 'drawSpeedLines', 'drawCinematicGrade', 'shockwave', 'imageSmoothingQuality', 'ROUND_RECOVERY', 'attacker:a.name', 'drawDepthFog', 'drawFighterReflection', 'drawImpactGlyphs', 'ULTIMATE_INTERCEPT', 'STARTING_LIVES=3', 'SENZU_REVIVAL', 'RUN_EXHAUSTED', 'persistFinalReplay', 'uploadReplay', 'replays/survivor/', 'ARENA_DYNAMICS', 'ARENA_DYNAMIC_BIND', 'drawDynamicArena', 'environment:{profile', 'if(!h.koEmitted)', 'h.koEmitted=false', 'RIVAL_DOCTRINES', 'SIGNATURE_ATTACK', 'RUSH_CHAIN', 'LIMIT_BREAK_AWAKENING', 'ARENA_FRACTURE', 'drawArenaFractures', 'testLimitBreakCombat'
];
for (const marker of required) assert.ok(html.includes(marker), `missing ${marker}`);
assert.ok(html.indexOf("emit('RUNTIME_BOOT'") < html.indexOf('bind(0,false)'), 'runtime boot must precede level binding');
assert.equal((html.match(/function drawFighter\(/g) || []).length, 1, 'single fighter renderer required');
assert.equal((html.match(/<canvas/g) || []).length, 1, 'single canvas required');
assert.equal((html.match(/schema:'jarvis-survivor-replay-v19'/g) || []).length, 1, 'single replay schema authority required');
console.log(JSON.stringify({runtime:323,replay:'v19',frames:'10Hz + transitions',combo:'confirmed hits',finisher:'lethal completion',renderer:'LIMIT_BREAK_ANIME_3D_V9',result:'PASS'}));
