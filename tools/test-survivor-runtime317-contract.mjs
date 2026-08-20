import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('survivor-runtime317.html', 'utf8');
const required = [
  'RUNTIME=317', 'MODEL_RENDERER_VERSION=7', 'BALANCE_VERSION=12', 'CHOREOGRAPHY_VERSION=12',
  'RESILIENT_CINEMATIC_ATLAS_3D_V3', "schema:'jarvis-survivor-replay-v13'",
  "function snapshot(reason='TICK')", 'replay.frames.push', 'frameTelemetryHz:10',
  'hpBefore', 'hpAfter', 'strikeId', "comboSemantics:'CONFIRMED_CONSECUTIVE_HITS'",
  'FINISHER_START', 'FINISHER_IMPACT', "emit('KO'", 'FINISHER_COMPLETE',
  'PROJECTILE_EXPIRE', "reason:current?'OUT_OF_RANGE':'STALE_TARGET'",
  "emit('RUNTIME_BOOT'", "bind(0,false)", 'griffin-ascended-atlas-v3.webp',
  'rivals/kairox-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp', 'awaitCriticalAssets', 'fallbackFighter', 'heroAtlasReady', 'ASSET_FAILED', "emit(defense"
];
for (const marker of required) assert.ok(html.includes(marker), `missing ${marker}`);
assert.ok(html.indexOf("emit('RUNTIME_BOOT'") < html.indexOf('bind(0,false)'), 'runtime boot must precede level binding');
assert.equal((html.match(/function drawFighter\(/g) || []).length, 1, 'single fighter renderer required');
assert.equal((html.match(/<canvas/g) || []).length, 1, 'single canvas required');
assert.equal((html.match(/schema:'jarvis-survivor-replay-v13'/g) || []).length, 1, 'single replay schema authority required');
console.log(JSON.stringify({runtime:317,replay:'v13',frames:'10Hz + transitions',combo:'confirmed hits',finisher:'lethal completion',renderer:'RESILIENT_CINEMATIC_ATLAS_3D_V3',result:'PASS'}));
