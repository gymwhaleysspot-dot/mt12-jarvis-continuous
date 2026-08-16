import fs from 'node:fs';

const core = 'jarvis/core-survivor.js';
const inc = 'jarvis/production198-replay43.inc.js';
const htmlPath = 'survivor.html';

let source = fs.readFileSync(core, 'utf8');
const patch = fs.readFileSync(inc, 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');

if (!source.includes('PRODUCTION_198_READY')) {
  const end = '\n})();';
  const index = source.lastIndexOf(end);
  if (index < 0) throw new Error('core-survivor closing IIFE not found');
  source = `${source.slice(0, index)}\n\n${patch}\n${source.slice(index)}`;
  fs.writeFileSync(core, source);
}

html = html.replace(
  /core-survivor\.js\?v=[^"']+/,
  'core-survivor.js?v=20260816production198',
);
if (!html.includes('core-survivor.js?v=20260816production198')) {
  throw new Error('Survivor cache key was not updated to Production 198');
}
fs.writeFileSync(htmlPath, html);

console.log('Built Survivor Production 198', {
  coreBytes: source.length,
  cache: '20260816production198',
});
