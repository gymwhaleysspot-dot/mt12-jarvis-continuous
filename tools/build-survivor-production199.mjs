import fs from 'node:fs';
import path from 'node:path';

const core='jarvis/core-survivor.js';
const htmlPath='survivor.html';
if(!fs.existsSync(core))throw Error(`Missing ${core}`);
if(!fs.existsSync(htmlPath))throw Error(`Missing ${htmlPath}`);

const jarvisFiles=fs.readdirSync('jarvis');
const findLayer=(prefix,exact)=>{
  if(exact&&fs.existsSync(exact))return exact;
  const name=jarvisFiles.find(n=>n.startsWith(prefix)&&n.endsWith('.inc.js'));
  if(!name)throw Error(`Missing ${prefix}*.inc.js`);
  return path.join('jarvis',name);
};
const layers=[
  {marker:'PRODUCTION_196_READY',file:findLayer('production196','jarvis/production196-contact-choreography.inc.js')},
  {marker:'PRODUCTION_197_READY',file:findLayer('production197')},
  {marker:'PRODUCTION_198_READY',file:findLayer('production198','jarvis/production198-full-fight-pass.inc.js')},
  {marker:'PRODUCTION_199_READY',file:findLayer('production199','jarvis/production199-replay43-closures.inc.js')}
];
let source=fs.readFileSync(core,'utf8');
const closing='\n})();';
for(const layer of layers){
  if(source.includes(layer.marker))continue;
  const at=source.lastIndexOf(closing);if(at<0)throw Error('core-survivor closing IIFE not found');
  const payload=fs.readFileSync(layer.file,'utf8').trim();
  source=source.slice(0,at)+'\n\n'+payload+'\n'+source.slice(at);
  if(!source.includes(layer.marker))throw Error(`Failed to inject ${layer.marker}`);
}
fs.writeFileSync(core,source);

let html=fs.readFileSync(htmlPath,'utf8');
const script=/jarvis\/core-survivor\.js(?:\?v=[^"'<>\s]*)?/;
if(!script.test(html))throw Error('survivor core script tag not found');
html=html.replace(script,'jarvis/core-survivor.js?v=20260816production199');
fs.writeFileSync(htmlPath,html);
console.log({built:layers.map(x=>x.marker),bytes:source.length,cache:'production199'});
