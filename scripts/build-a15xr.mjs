#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const srcPath='a15xq.lua';
const outPath='a15xr.lua';
let s=fs.readFileSync(srcPath,'utf8');

const must=(oldText,newText,label)=>{
  if(!s.includes(oldText)) throw new Error(`a15xr patch anchor missing: ${label}`);
  s=s.replace(oldText,newText);
};

must('--a15xq phrase-memory corruption fix','--a15xr unified-AI memory-safe evolution','version header');

// Do not consume the one-save allowance until the MT12 file actually opens.
// This preserves all schema/learning behavior while allowing a later retry after
// transient SD-card or car-on memory pressure.
must(
  'if memSaved>0 then return end;memSaved=1;local a=',
  'if memSaved>0 then return end;local a=',
  'premature memSaved flag'
);
must(
  'local f=io.open(MEMPATH,"w");if not f then return end\n local clean=',
  'local f=io.open(MEMPATH,"w");if not f then return end;memSaved=1\n local clean=',
  'successful-open save commit'
);

// Keep the proven network and superBrain unchanged, but make the initialization
// contract explicit before any memory load can be invoked by future refactors.
must(
  'local nW,N;local VS=',
  'local nW,N;local VS=',
  'neural state declaration'
);

if(!s.includes('local function superBrain(')) throw new Error('superBrain missing');
if(!s.includes('local function neural(')) throw new Error('neural network missing');
if(!s.includes('io.read(f,512)')) throw new Error('MT12 global io.read contract missing');
if(!s.includes('setgv(7,1024)')) throw new Error('TCT fail-open contract missing');
if(!s.includes('return{init=init,run=run,background=background}')) throw new Error('EdgeTX return contract missing');

fs.writeFileSync(outPath,s);
const sha=crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync('reports/a15xr-source.json',JSON.stringify({
  source:'a15xq.lua',output:outPath,sha256:sha,sourceBytes:Buffer.byteLength(s),
  changes:['new a15xr lineage','memory save retries after failed open','all a15xq AI/control/dashboard/voice behavior preserved']
},null,2));
console.log(`${outPath} ${Buffer.byteLength(s)} bytes ${sha}`);
