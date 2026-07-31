#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/master-factory.json'),'utf8')),out=path.join(root,cfg.output_root);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),mission=(process.env.FACTORY_MISSION||cfg.default_mission).trim();
const report={factory:cfg.name,version:cfg.version,mission,startedAt:new Date().toISOString(),status:'running',seed:{},baseline:null,architectures:[],candidates:[],failures:[],winner:null};
const note=(type,message,data={})=>report.failures.push({type,message,...data});
const write=()=>fs.writeFileSync(path.join(out,'factory-report.json'),JSON.stringify(report,null,2)+'\n');
function run(cmd,args,opt={}){return execFileSync(cmd,args,{encoding:'utf8',maxBuffer:128*1024*1024,...opt});}
function compile(name,src){
 const raw=path.join(out,`${name}_raw.luac`),norm=path.join(out,`${name}.luac`),trace=path.join(out,`${name}-trace.csv`);
 run('luac5.3',['-p',src]);run('luac5.3',['-s','-o',raw,src]);run('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,norm]);
 const b=fs.readFileSync(norm);if(b.length>cfg.normalized_luac_limit)throw Error(`normalized LUAC ${b.length} exceeds ${cfg.normalized_luac_limit}`);
 run('lua5.3',[path.join(root,'scripts/mt12-harness.lua'),src,trace]);
 return{name,source:path.relative(root,src),sourceBytes:fs.statSync(src).size,sourceSha256:sha(fs.readFileSync(src)),normalizedBytes:b.length,normalizedSha256:sha(b),margin:cfg.normalized_luac_limit-b.length,trace:path.basename(trace)};
}
function auditSource(src,parent){
 const problems=[];
 for(const r of cfg.required_regex||[])if(!new RegExp(r,'m').test(src))problems.push(`missing capability pattern ${r}`);
 for(const r of cfg.forbidden_regex||[])if(new RegExp(r,'m').test(src))problems.push(`forbidden pattern ${r}`);
 if(src.includes(':read('))problems.push('MT12-incompatible fileHandle:read method');
 if(!src.includes('io.read('))problems.push('missing MT12-compatible io.read(fileHandle,...)');
 if(!/setgv\(7,1024\)/.test(src))problems.push('missing GV7=1024 throttle pass-through guard');
 if(parent){
  if(src===parent)problems.push('candidate is byte-identical to parent');
  if(src.length<parent.length*.82)problems.push('candidate deleted more than 18% of source');
  const changed=diffBytes(parent,src);if(changed<cfg.minimum_changed_bytes)problems.push(`only ${changed} changed bytes`);
 }
 if(problems.length)throw Error(problems.join('; '));
}
function diffBytes(a,b){let p=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;let s=0;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;return Math.max(a.length,b.length)-p-s;}
function compareTrace(parentFile,candFile){
 const parse=p=>fs.readFileSync(p,'utf8').trim().split(/\r?\n/).slice(1).map(x=>x.split(',').map(Number));
 const a=parse(parentFile),b=parse(candFile);if(a.length!==b.length)throw Error('harness trace length changed');
 let max=[0,0,0,0,0],sum=0;for(let i=0;i<a.length;i++)for(let j=1;j<6;j++){const d=Math.abs(a[i][j]-b[i][j]);max[j-1]=Math.max(max[j-1],d);sum+=d;}
 if(max[4]>0)throw Error('GV7 throttle pass-through changed');
 if(max[2]>cfg.max_tca_delta)throw Error(`unsafe TCA delta ${max[2]}`);
 if(max[0]>cfg.max_monitor_delta||max[1]>cfg.max_monitor_delta)throw Error(`control monitor delta too large ${max[0]}/${max[1]}`);
 return{maxDelta:{g0:max[0],g1:max[1],g3:max[2],g4:max[3],g7:max[4]},totalDelta:sum};
}
function extractJson(t){const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON');return JSON.parse(t.slice(a,b+1));}
async function model(messages,temp=.45,max_tokens=14000){
 const token=process.env.GITHUB_TOKEN;if(!token)throw Error('GITHUB_TOKEN missing');
 const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model:process.env.FACTORY_MODEL||cfg.default_model,temperature:temp,max_tokens,messages})});
 if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);const j=await r.json();return j.choices?.[0]?.message?.content||'';
}
async function architect(src){
 const prompt=`Mission: ${mission}\nDesign ${cfg.candidate_count} genuinely different, compact innovations for this exact RadioMaster MT12 EdgeTX Lua 5.3 controller. Preserve every existing behavior and interface. Focus on causal learning, predictive control, jump classification, truth RPM/MPH, channel-drop resilience, adaptive confidence, intervention outcome learning, memory efficiency, explainability, and runtime safety. Return strict JSON {"proposals":[{"title":"...","problem":"...","design":"...","measurable_gain":"...","risk":"...","implementation_targets":["exact function or state names"]}]}. Do not propose comments, renames, disabled toggles, feature removal, or generic refactoring.\nSOURCE:\n${src}`;
 const x=extractJson(await model([{role:'system',content:'You are an adversarial embedded-control architect. Produce concrete novel designs only.'},{role:'user',content:prompt}],.75,9000));
 if(!Array.isArray(x.proposals)||x.proposals.length<2)throw Error('architect returned too few proposals');return x.proposals.slice(0,cfg.candidate_count);
}
async function engineer(src,name,proposal,feedback=''){
 const prompt=`Create candidate ${name} from the parent source below. Mission: ${mission}. Architecture: ${JSON.stringify(proposal)}. ${feedback?`Previous rejection: ${feedback}. Correct it.`:''}\nReturn strict JSON {"summary":"...","innovation":"...","expected_behavior":"...","patches":[{"find":"exact unique parent text","replace":"complete replacement","reason":"..."}]}. Use 1-${cfg.max_patches} narrow exact replacements. Make a real algorithmic/learning/control innovation. Preserve dashboard, mood/personality, logging, persistence format compatibility, TC, ABS, gyro, jump logic, truth RPM/MPH, car-off guard, GV7=1024, and io.read(fileHandle,...). No placeholders, no feature deletion, no fileHandle:read, no output steps.\nPARENT SOURCE:\n${src}`;
 return extractJson(await model([{role:'system',content:'You are a senior EdgeTX Lua engineer. Return strict JSON patches that compile and fit MT12.'},{role:'user',content:prompt}],.55,15000));
}
function apply(src,patches){if(!Array.isArray(patches)||!patches.length||patches.length>cfg.max_patches)throw Error('invalid patch count');let out=src,total=0;for(const [i,p] of patches.entries()){if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`bad patch ${i+1}`);const at=out.indexOf(p.find);if(at<0)throw Error(`patch ${i+1} find not found`);if(out.indexOf(p.find,at+1)>=0)throw Error(`patch ${i+1} find not unique`);out=out.slice(0,at)+p.replace+out.slice(at+p.find.length);total+=Math.max(p.find.length,p.replace.length);}return{out,total};}
async function critic(parent,candidate,proposal,meta){
 const prompt=`Audit this candidate for a RadioMaster MT12 EdgeTX Lua controller. Architecture: ${JSON.stringify(proposal)}. Build facts: ${JSON.stringify(meta)}. Identify semantic regressions, fake innovation, persistence/schema breakage, unsafe throttle/GVar behavior, sensor-drop failures, runtime allocation risks, and whether the claimed gain is real. Return strict JSON {"verdict":"accept|reject","score":0-100,"innovation_score":0-100,"safety_score":0-100,"reasons":["..."],"required_fix":"..."}. Reject cosmetic changes.\nPARENT:\n${parent}\nCANDIDATE:\n${candidate}`;
 return extractJson(await model([{role:'system',content:'You are the final adversarial safety auditor. Be skeptical and precise.'},{role:'user',content:prompt}],.15,7000));
}
async function main(){
 const seedPath=path.join(root,cfg.seed);if(!fs.existsSync(seedPath))throw Error(`Root seed missing: ${cfg.seed}`);
 let seed=fs.readFileSync(seedPath,'utf8');const originalSeed=seed;const repairs=[];if(seed.includes('local evABS=0local sessOn=false')){seed=seed.replace('local evABS=0local sessOn=false','local evABS=0;local sessOn=false');repairs.push('fixed missing separator after evABS initializer');}auditSource(seed);report.seed={source:cfg.seed,originalSha256:sha(Buffer.from(originalSeed)),effectiveSha256:sha(Buffer.from(seed)),bytes:Buffer.byteLength(seed),repairs};
 const work=path.join(out,'lineage');fs.mkdirSync(work,{recursive:true});const basePath=path.join(work,'a15ya.lua');fs.writeFileSync(basePath,seed);
 const base=compile('a15ya',basePath);report.baseline=base;
 const proposals=await architect(seed);report.architectures=proposals;let winner=null;
 for(let i=0;i<proposals.length;i++){
  const name=`a15yb${i?i+1:''}`;let feedback='';
  for(let round=1;round<=cfg.max_repair_rounds;round++){
   try{
    const plan=await engineer(seed,name,proposals[i],feedback),ap=apply(seed,plan.patches),dst=path.join(work,`${name}.lua`);fs.writeFileSync(dst,ap.out);auditSource(ap.out,seed);
    const built=compile(name,dst),trace=compareTrace(path.join(out,base.trace),path.join(out,built.trace));
    const review=await critic(seed,ap.out,proposals[i],{...built,trace,changedBytes:ap.total,summary:plan.summary,innovation:plan.innovation});
    const rec={...built,parent:'a15ya',round,proposal:proposals[i],plan:{summary:plan.summary,innovation:plan.innovation,expected_behavior:plan.expected_behavior,patchCount:plan.patches.length},trace,review,status:review.verdict==='accept'?'verified':'critic-rejected'};report.candidates.push(rec);
    fs.writeFileSync(path.join(out,`${name}-innovation.json`),JSON.stringify({proposal:proposals[i],plan,trace,review},null,2)+'\n');
    if(review.verdict!=='accept'||review.safety_score<cfg.min_safety_score||review.innovation_score<cfg.min_innovation_score)throw Error(`critic rejected: ${(review.reasons||[]).join('; ')}`);
    rec.compositeScore=review.score+review.innovation_score*.35+review.safety_score*.45+Math.min(8,built.margin/2000);
    if(!winner||rec.compositeScore>winner.meta.compositeScore)winner={path:dst,meta:rec};break;
   }catch(e){feedback=String(e.message||e);note('candidate-rejected',`${name} round ${round}`,{error:feedback});}
  }
 }
 if(!winner){report.status='protected-no-winner';throw Error('No candidate passed compile, normalized size, harness, trace, capability and adversarial review gates');}
 report.winner=winner.meta;report.status='verified-ai-release';fs.copyFileSync(winner.path,path.join(out,`${winner.meta.name}.lua`));fs.copyFileSync(path.join(out,`${winner.meta.name}.luac`),path.join(out,'DEPLOY.luac'));
 fs.writeFileSync(path.join(out,'CHANGELOG.md'),`# ${winner.meta.name}\n\n${winner.meta.plan.innovation}\n\n- Parent: a15ya\n- Normalized: ${winner.meta.normalizedBytes} bytes\n- Margin: ${winner.meta.margin} bytes\n- Safety score: ${winner.meta.review.safety_score}\n- Innovation score: ${winner.meta.review.innovation_score}\n`);
}
main().catch(e=>{note('factory-error',String(e.stack||e));if(report.status==='running')report.status='protected-error';}).finally(()=>{report.finishedAt=new Date().toISOString();write();fs.writeFileSync(path.join(out,'STATUS.txt'),`${report.status}\nseed: ${report.seed.source||'none'}\nbaseline: ${report.baseline?.name||'none'}\nwinner: ${report.winner?.name||'none'}\n`);});
