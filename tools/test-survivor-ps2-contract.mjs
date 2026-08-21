import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('survivor-ps2.html','utf8');
for(const marker of [
  'name="jarvis-game" content="survivor-ps2-v1"','JARVIS_PS2_ARENA_V1','fixedStep:FIXED',
  'jarvis-ps2-replay-v1','jarvis-ps2-save-v1','globalThis.JarvisPS2','requestAnimationFrame(loop)',
  "ROSTER=['LIRA','KAIROX','SOLENNE','MIREYA','ZEPHYRA','ORUN','MORDREN','SABLE','KRAKEN']",
  'lockOn:true','flight:true','transformations:11','beamClash:true','cinematicFinishers:true',
  'touch:true','keyboard:true','gamepad:true','saveStates:true','replay:true','adaptiveMobile:true',
  'noBios:true','noRom:true','function finisher','FINISHER_START','FINISHER_IMPACT','FINISHER_COMPLETE',
  'function transform','function projectileStep','BEAM_CLASH','function saveGame','function exportReplay',
  'function arena','function drawFighter','function camera','function project','width="640" height="360"'
])assert.ok(html.includes(marker),`missing ${marker}`);
assert.equal((html.match(/<canvas\b/g)||[]).length,1,'one visible renderer required');
assert.equal((html.match(/requestAnimationFrame\s*\(/g)||[]).length,2,'bounded RAF topology required');
assert.ok(!/OffscreenCanvas|new Worker\s*\(|setInterval\s*\(/.test(html),'secondary renderer/timer prohibited');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'inline engine script required');
new vm.Script(script,{filename:'survivor-ps2.inline.js'});
assert.ok(html.trimEnd().endsWith('</script></body></html>'),'document truncated');
console.log(JSON.stringify({game:'survivor-ps2',engine:'JARVIS_PS2_ARENA_V1',fighters:10,renderer:'single-canvas-pseudo-3d',result:'PASS'}));
