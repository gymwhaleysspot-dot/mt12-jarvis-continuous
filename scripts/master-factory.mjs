#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/master-factory.json'),'utf8'));
const out=path.join(root,cfg.output_root);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const mission=(process.env.FACTORY_MISSION||cfg.default_mission).trim();
const report={factory:cfg.name,version:cfg.version,mission,startedAt:new Date().toISOString(),status:'running',seed:{},baseline:null,architectures:[],candidates:[],failures:[],winner:null,promotion:null};
const note=(type,message,data={})=>report.failures.push({type,message,...data});
const write=()=>fs.writeFileSync(path.join(out,'factory-report.json'),JSON.stringify(report,null,2)+'\n');
const run=(cmd,args,opt={})=>execFileSync(cmd,args,{encoding:'utf8',maxBuffer:128*1024*1024,...opt});

function repairSeed(s){const repairs=[];const rules=[['local evABS=0local sessOn=false','local evABS=0;local sessOn=false','separated evABS/session declarations']];for(const [a,b,n]of rules)if(s.includes(a)){s=s.replace(a,b);repairs.push(n)}return{s,repairs}}
function compile(name,src){
 const raw=path.join(out,`${name}_raw.luac`),norm=path.join(out,`${name}.luac`),trace=path.join(out,`${name}-trace.csv`);
 run('luac5.3',['-p',src]);run('luac5.3',['-s','-o',raw,src]);run('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,norm]);
 const b=fs.readFileSync(norm),margin=cfg.normalized_luac_limit-b.length;
 if(b.length>cfg.normalized_luac_limit)throw Error(`normalized LUAC ${b.length} exceeds ${cfg.normalized_luac_limit}`);
 if(margin<(cfg.minimum_luac_margin||0))throw Error(`normalized LUAC margin ${margin} below minimum ${cfg.minimum_luac_margin}`);
 run('lua5.3',[path.join(root,'scripts/mt12-harness.lua'),src,trace]);
 return{name,source:path.relative(root,src),sourceBytes:fs.statSync(src).size,sourceSha256:sha(fs.readFileSync(src)),normalizedBytes:b.length,normalizedSha256:sha(b),margin,trace:path.basename(trace)};
}
function auditSource(src,parent){
 const p=[];for(const r of cfg.required_regex||[])if(!new RegExp(r,'m').test(src))p.push(`missing capability ${r}`);for(const r of cfg.forbidden_regex||[])if(new RegExp(r,'m').test(src))p.push(`forbidden ${r}`);
 if(src.includes(':read('))p.push('MT12-incompatible fileHandle:read');if(!src.includes('io.read('))p.push('missing io.read(handle,...)');if(!/setgv\(7,1024\)/.test(src))p.push('missing GV7=1024');
 if(/\dlocal\s+[A-Za-z_]/.test(src)||/local\s+[A-Za-z_]\w*\s*=\s*[^;\n]+local\s+[A-Za-z_]/.test(src))p.push('joined declaration syntax hazard');
 if(parent){if(src===parent)p.push('byte-identical to parent');if(src.length<parent.length*.82)p.push('removed more than 18% of source');const d=diffBytes(parent,src);if(d<cfg.minimum_changed_bytes)p.push(`only ${d} changed bytes`)}
 if(p.length)throw Error(p.join('; '));
}
function diffBytes(a,b){let p=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;let s=0;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;return Math.max(a.length,b.length)-p-s}
function compareTrace(parentFile,candFile){
 const parse=p=>fs.readFileSync(p,'utf8').trim().split(/\r?\n/).slice(1).map(x=>x.split(',').map(Number));const a=parse(parentFile),b=parse(candFile);if(a.length!==b.length)throw Error('trace length changed');let max=[0,0,0,0,0],sum=0;
 for(let i=0;i<a.length;i++)for(let j=1;j<6;j++){const d=Math.abs(a[i][j]-b[i][j]);max[j-1]=Math.max(max[j-1],d);sum+=d}
 if(max[4]>0)throw Error('GV7 pass-through changed');if(max[2]>cfg.max_tca_delta)throw Error(`unsafe TCA delta ${max[2]}`);if(max[0]>cfg.max_monitor_delta||max[1]>cfg.max_monitor_delta)throw Error(`monitor delta ${max[0]}/${max[1]}`);
 return{maxDelta:{g0:max[0],g1:max[1],g3:max[2],g4:max[3],g7:max[4]},totalDelta:sum};
}
function fitness(parent,candidate,name){const file=path.join(out,`${name}-fitness.json`);run('node',[path.join(root,'scripts/evaluate-fitness.mjs'),parent,candidate,file]);return JSON.parse(fs.readFileSync(file,'utf8'))}
function extractJson(t){const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON');return JSON.parse(t.slice(a,b+1))}
async function model(messages,temp=.45,max_tokens=15000){const token=process.env.GITHUB_TOKEN;if(!token)throw Error('GITHUB_TOKEN missing');const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model:process.env.FACTORY_MODEL||cfg.default_model,temperature:temp,max_tokens,messages})});if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);const j=await r.json();return j.choices?.[0]?.message?.content||''}
async function architect(src){
 const prompt=`Mission: ${mission}\nCreate ${cfg.candidate_count} focused, genuinely different engineering missions for this exact MT12 EdgeTX controller. Each proposal must identify one real weakness, exact functions/state touched, a complete observation->state->decision->outcome->learning path, measurable scenario gains, compatibility risks, and a test plan. Prefer jump accuracy, truth RPM/MPH, channel-drop recovery, TC/ABS release, causal episode learning, explainability, and allocation efficiency. Preserve all existing behavior. Return strict JSON {"proposals":[{"title":"","problem":"","design":"","learning_path":[""],"measurable_gain":"","risk":"","implementation_targets":[""],"tests":[""]}]}. Reject cosmetic/refactor-only ideas.\nSOURCE:\n${src}`;
 const x=extractJson(await model([{role:'system',content:'You are an adversarial embedded-control architect. Propose measurable controller evolution, not decoration.'},{role:'user',content:prompt}],.7,10000));if(!Array.isArray(x.proposals)||x.proposals.length<2)throw Error('too few proposals');return x.proposals.slice(0,cfg.candidate_count);
}
async function engineer(src,name,proposal,feedback=''){
 const prompt=`Build ${name} from the parent below. Mission: ${mission}. Architecture: ${JSON.stringify(proposal)}. ${feedback?`Previous rejection: ${feedback}`:''}\nReturn strict JSON {"summary":"","innovation":"","expected_behavior":"","mode":"surgical|function|coordinated","patches":[{"find":"exact unique text","replace":"complete replacement","reason":""}]}. You may replace complete functions or coordinate several functions when required. Use 1-${cfg.max_patches} exact replacements. Every new state must be read and affect a decision or measured outcome. Preserve dashboard, mood/personality, logging, persistence compatibility, TC, ABS, gyro, jump logic, truth RPM/MPH, car-off guard, GV7=1024, io.read(handle,...), and fail-open behavior. No placeholders, disabled toggles, comments-only changes, duplicate unused confidence counters, or feature deletion.\nPARENT:\n${src}`;
 return extractJson(await model([{role:'system',content:'You are a senior EdgeTX Lua control engineer. Produce compact compiling algorithmic changes.'},{role:'user',content:prompt}],.5,18000));
}
function apply(src,patches){if(!Array.isArray(patches)||!patches.length||patches.length>cfg.max_patches)throw Error('invalid patch count');let out=src,total=0;for(const [i,p]of patches.entries()){if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`bad patch ${i+1}`);const at=out.indexOf(p.find);if(at<0)throw Error(`patch ${i+1} find not found`);if(out.indexOf(p.find,at+1)>=0)throw Error(`patch ${i+1} find not unique`);out=out.slice(0,at)+p.replace+out.slice(at+p.find.length);total+=Math.max(p.find.length,p.replace.length)}return{out,total}}
async function critic(parent,candidate,proposal,meta){
 const prompt=`Adversarially audit this MT12 candidate. Proposal: ${JSON.stringify(proposal)}. Deterministic evidence: ${JSON.stringify(meta)}. Reject fake innovation, unused state, persistence/schema breakage, throttle/GVar risk, sensor-drop failure, jump false positives, excessive allocations, feature loss, or claims unsupported by tests. Return strict JSON {"verdict":"accept|reject","score":0-100,"innovation_score":0-100,"safety_score":0-100,"reasons":[""],"required_fix":""}.\nPARENT:\n${parent}\nCANDIDATE:\n${candidate}`;
 return extractJson(await model([{role:'system',content:'You are the final skeptical embedded safety reviewer. Evidence outranks claims.'},{role:'user',content:prompt}],.1,8000));
}
async function main(){
 const seedPath=path.join(root,cfg.seed);if(!fs.existsSync(seedPath))throw Error(`root seed missing: ${cfg.seed}`);const original=fs.readFileSync(seedPath,'utf8'),fixed=repairSeed(original),seed=fixed.s;auditSource(seed);
 report.seed={source:cfg.seed,originalSha256:sha(Buffer.from(original)),effectiveSha256:sha(Buffer.from(seed)),bytes:Buffer.byteLength(seed),repairs:fixed.repairs};
 const work=path.join(out,'lineage');fs.mkdirSync(work,{recursive:true});const basePath=path.join(work,'a15ya.lua');fs.writeFileSync(basePath,seed);const base=compile('a15ya',basePath);report.baseline=base;
 const proposals=await architect(seed);report.architectures=proposals;let winner=null;
 for(let i=0;i<proposals.length;i++){
  const name=`a15yb${i?i+1:''}`;let feedback='';
  for(let round=1;round<=cfg.max_repair_rounds;round++)try{
   const plan=await engineer(seed,name,proposals[i],feedback),ap=apply(seed,plan.patches),dst=path.join(work,`${name}.lua`);fs.writeFileSync(dst,ap.out);auditSource(ap.out,seed);
   const built=compile(name,dst),trace=compareTrace(path.join(out,base.trace),path.join(out,built.trace)),fit=fitness(basePath,dst,name);
   if(fit.status!=='pass'||fit.score<cfg.minimum_fitness_score||fit.safetyScore<cfg.minimum_fitness_safety)throw Error(`fitness rejected score=${fit.score} safety=${fit.safetyScore}: ${fit.hardFailures.join('; ')}`);
   const review=await critic(seed,ap.out,proposals[i],{built,trace,fitness:{score:fit.score,safety:fit.safetyScore,innovation:fit.innovationScore,capability:fit.capabilityScore,smoothness:fit.smoothnessScore,warnings:fit.warnings},changedBytes:ap.total,mode:plan.mode,summary:plan.summary});
   const rec={...built,parent:'a15ya',round,proposal:proposals[i],plan:{summary:plan.summary,innovation:plan.innovation,expected_behavior:plan.expected_behavior,mode:plan.mode,patchCount:plan.patches.length},trace,fitness:fit,review,status:'evaluated'};report.candidates.push(rec);
   fs.writeFileSync(path.join(out,`${name}-innovation.json`),JSON.stringify({proposal:proposals[i],plan,trace,fitness:fit,review},null,2)+'\n');
   if(review.verdict!=='accept'||review.safety_score<cfg.min_safety_score||review.innovation_score<cfg.min_innovation_score)throw Error(`critic rejected: ${(review.reasons||[]).join('; ')}`);
   rec.status='simulation-verified';rec.compositeScore=fit.score*.55+review.score*.15+review.innovation_score*.12+review.safety_score*.15+Math.min(3,built.margin/2000);
   if(!winner||rec.compositeScore>winner.meta.compositeScore)winner={path:dst,meta:rec};break;
  }catch(e){feedback=String(e.message||e);note('candidate-rejected',`${name} round ${round}`,{error:feedback})}
 }
 if(!winner){report.status='protected-no-winner';throw Error('no candidate passed compile, size, deterministic scenarios, mutation, semantic, trace, and adversarial gates')}
 report.winner=winner.meta;report.status='simulation-verified-release';report.promotion={level:'SIMULATION VERIFIED',roadVerified:false,benchVerified:false,parentEligible:false,rule:'Requires bench and road validation before replacing trusted parent'};
 fs.copyFileSync(winner.path,path.join(out,`${winner.meta.name}.lua`));fs.copyFileSync(path.join(out,`${winner.meta.name}.luac`),path.join(out,'DEPLOY.luac'));
 fs.writeFileSync(path.join(out,'CHANGELOG.md'),`# ${winner.meta.name}\n\nStatus: SIMULATION VERIFIED\n\n${winner.meta.plan.innovation}\n\n- Parent: a15ya\n- Mode: ${winner.meta.plan.mode}\n- Fitness: ${winner.meta.fitness.score}\n- Safety: ${winner.meta.fitness.safetyScore}\n- Normalized: ${winner.meta.normalizedBytes} bytes\n- Margin: ${winner.meta.margin} bytes\n- Bench verified: no\n- Road verified: no\n`);
}
main().catch(e=>{note('factory-error',String(e.stack||e));if(report.status==='running')report.status='protected-error'}).finally(()=>{report.finishedAt=new Date().toISOString();write();fs.writeFileSync(path.join(out,'STATUS.txt'),`${report.status}\nseed: ${report.seed.source||'none'}\nbaseline: ${report.baseline?.name||'none'}\nwinner: ${report.winner?.name||'none'}\npromotion: ${report.promotion?.level||'none'}\n`)})
