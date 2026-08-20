import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('survivor-runtime315.html', 'utf8');
const required = [
  'RUNTIME=315', 'MODEL_RENDERER_VERSION=5', 'CHOREOGRAPHY_VERSION=10',
  'AUTHORED_ATLAS_EXTRUSION_3D_V1', 'layers:16', 'extrusion:12',
  'formAtlasSwap:true', 'poseFrameBinding:true', 'parallaxArenas:true',
  'griffin-ascended-atlas-v3.webp', 'lira-empress-atlas-v3.webp',
  'rivals/kairox-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp',
  'atlasInventory:{hero:HERO_ATLASES.length,rivals:Object.keys(RIVAL_ATLASES).length,arenas:Object.keys(ARENA_ASSETS).length}'
];
for (const marker of required) assert.ok(html.includes(marker), `missing ${marker}`);

const assets = [
  'griffin-atlas-v3.webp', 'griffin-saiyan-spark-atlas-v3.webp', 'griffin-ascended-atlas-v3.webp',
  'griffin-hyper-atlas-v3.webp', 'griffin-speed-form-atlas-v1.webp', 'griffin-guardian-form-atlas-v1.webp',
  'griffin-destroyer-form-atlas-v1.webp', 'griffin-celestial-overdrive-atlas-v1.webp',
  'griffin-omega-instinct-atlas-v1.webp', 'griffin-instinct-form-atlas-v1.webp', 'griffin-instinct-atlas-v3.webp',
  'lira-empress-atlas-v3.webp', 'rivals/kairox-awakened-atlas-v3.webp',
  'rivals/solenne-awakened-atlas-v4.webp', 'rivals/mireya-awakened-atlas-v3.webp',
  'rivals/zephyra-awakened-atlas-v3.webp', 'rivals/orun-awakened-atlas-v3.webp',
  'rivals/mordren-awakened-atlas-v3.webp', 'rivals/sable-awakened-atlas-v3.webp',
  'rivals/kraken-awakened-atlas-v3.webp', 'arenas/lira-nexus-v1.webp',
  'arenas/kairox-caldera-v1.webp', 'arenas/solenne-corona-v1.webp', 'arenas/mireya-prism-v1.webp',
  'arenas/zephyra-tempest-v1.webp', 'arenas/orun-ion-v1.webp', 'arenas/mordren-singularity-v1.webp',
  'arenas/sable-eclipse-v1.webp', 'arenas/kraken-abyss-v1.webp'
];
for (const path of assets) {
  const full = `jarvis/assets/survivor/${path}`;
  assert.ok(fs.existsSync(full), `missing asset ${full}`);
  assert.ok(fs.statSync(full).size > 50_000, `asset too small ${full}`);
}
assert.equal((html.match(/function drawFighter\(/g) || []).length, 1, 'single fighter renderer required');
assert.equal((html.match(/<canvas/g) || []).length, 1, 'single canvas required');
console.log(JSON.stringify({runtime:315,heroAtlases:11,rivalAtlases:9,arenas:9,renderer:'AUTHORED_ATLAS_EXTRUSION_3D_V1',result:'PASS'}));
