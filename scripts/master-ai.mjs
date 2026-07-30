#!/usr/bin/env node
// Production factory: create one focused candidate, then perform a complete
// AI architecture regeneration. Constant-only descendants are never publishable.
import fs from'node:fs';
await import('./synthesize-factory.mjs');
const pp='reports/pending-factory.json',p=JSON.parse(fs.readFileSync(pp,'utf8'));
if(!Array.isArray(p.batch)||!p.batch.length)throw Error('Factory produced no candidates');
// Rotate through the four specialist families, one complete controller per run.
const i=Math.abs((Number(p.cycle)||1)-1)%p.batch.length;
p.batch=[p.batch[i]];p.candidateCount=1;p.selection='one rotating family with complete AI architecture regeneration';
fs.writeFileSync(pp,JSON.stringify(p,null,2));
await import('./full-ai-architect.mjs');
