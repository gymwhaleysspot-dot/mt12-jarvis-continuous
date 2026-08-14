#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [parent,candidate,out]=process.argv.slice(2);
if(!parent||!candidate||!out)throw Error('usage: node evaluate-fitness.mjs parent.lua candidate.lua output.json');
const root=process.cwd(),tmp=path.dirname(out);
const run=(cmd,args)=>execFileSync(cmd,args,{encoding:'utf8',maxBuffer:128*1024*1024});
const ph=path.join(tmp,'.parent-fitness.json'),ch=path.join(tmp,'.candidate-fitness.json');
run('lua5.3',[path.join(root,'scripts/fitness-harness.lua'),parent,ph]);
run('lua5.3',[path.join(root,'scripts/fitness-harness.lua'),candidate,ch]);
const p=JSON.parse(fs.readFileSync(ph,'utf8')),c=JSON.parse(fs.readFileSync(ch,'utf8'));
const ps=Object.fromEntries(p.scenarios.map(x=>[x.name,x])),cs=Object.fromEntries(c.scenarios.map(x=>[x.name,x]));
const src=fs.readFileSync(candidate,'utf8'),base=fs.readFileSync(parent,'utf8');
const hard=[],warnings=[];
for(const [name,x] of Object.entries(cs)){
 if(!x.ok)hard.push(`${name}: ${x.error}`);
 if(x.g7min<1000)hard.push(`${name}: GV7 fell to ${x.g7min}`);
 if(x.maxAbs>=1e8)hard.push(`${name}: runaway output ${x.maxAbs}`);
 const b=ps[name];if(b&&x.maxStep>b.maxStep+700)hard.push(`${name}: output step regression ${x.maxStep} vs ${b.maxStep}`);
}
const patterns={
 persistence:/wrmem|rdmem|MEMPATH/,
 truthFusion:/rpmMph|RPM2MPH|GPS_LOST/,
 traction:/TC|tcSlip|pK/,
 abs:/ABS|absLock/,
 jump:/jump|airborne|landing/i,
 voice:/voice|playFile|playNumber/,
 mood:/mood|trait/,
 logging:/bb_line|bb_tick|LOGS/,
 dashboard:/lcd\./,
 passThrough:/setgv\(7,1024\)/
};
for(const [k,r] of Object.entries(patterns))if(!r.test(src))hard.push(`missing ${k} capability`);
if(src.includes(':read('))hard.push('fileHandle:read is forbidden');
if(!src.includes('io.read('))hard.push('MT12 io.read(handle,...) missing');
if(/\dlocal\s+[A-Za-z_]/.test(src)||/local\s+[A-Za-z_]\w*\s*=\s*[^;\n]+local\s+[A-Za-z_]/.test(src))hard.push('joined declaration syntax hazard');
const changed=Math.max(src.length,base.length)-commonPrefix(src,base)-commonSuffix(src,base);
if(changed<40)hard.push(`insufficient meaningful change: ${changed} bytes`);
if(src.length<base.length*.82)hard.push('candidate removed more than 18% of source');
const addedLocals=[...src.matchAll(/local\s+([A-Za-z_]\w*)/g)].map(m=>m[1]).filter(n=>!base.includes(`local ${n}`));
const dead=[];for(const n of addedLocals){const count=(src.match(new RegExp(`\\b${n}\\b`,'g'))||[]).length;if(count<2)dead.push(n)}
if(dead.length)warnings.push(`possibly unused new locals: ${dead.slice(0,12).join(',')}`);
const scenarioScore=c.scenarios.reduce((s,x)=>s+(x.ok&&x.g7min>=1000?1:0),0)/c.scenarios.length*100;
let smooth=100;for(const x of c.scenarios){const b=ps[x.name];if(b&&x.maxStep>b.maxStep)smooth-=Math.min(8,(x.maxStep-b.maxStep)/100)}
smooth=Math.max(0,smooth);
const safety=Math.round(Math.min(100,scenarioScore*.7+smooth*.3));
const capability=Object.values(patterns).filter(r=>r.test(src)).length/Object.keys(patterns).length*100;
const innovation=Math.round(Math.min(100,35+Math.log10(Math.max(10,changed))*16+(dead.length? -8:0)));
const score=Math.round(safety*.45+capability*.2+innovation*.2+smooth*.15);
const result={status:hard.length?'reject':'pass',score,safetyScore:safety,innovationScore:innovation,capabilityScore:Math.round(capability),smoothnessScore:Math.round(smooth),changedBytes:changed,hardFailures:hard,warnings,parent:p,candidate:c};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
fs.rmSync(ph,{force:true});fs.rmSync(ch,{force:true});
if(hard.length){console.error(JSON.stringify(result,null,2));process.exit(2)}
console.log(JSON.stringify({status:result.status,score,safety,innovation,changed},null,2));
function commonPrefix(a,b){let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i}
function commonSuffix(a,b){let i=0;while(i<a.length&&i<b.length&&a[a.length-1-i]===b[b.length-1-i])i++;return i}
