import fs from 'node:fs';
const core='jarvis/core-survivor.js',inc='jarvis/production196-contact-choreography.inc.js';
let s=fs.readFileSync(core,'utf8');const p=fs.readFileSync(inc,'utf8');
if(s.includes('PRODUCTION_196_READY')){console.log('Production 196 already built');process.exit(0)}
const end='\n})();';const i=s.lastIndexOf(end);if(i<0)throw Error('core-survivor closing IIFE not found');
s=s.slice(0,i)+'\n\n'+p+'\n'+s.slice(i);fs.writeFileSync(core,s);console.log('Built Production 196',s.length);