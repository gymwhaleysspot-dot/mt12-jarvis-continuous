#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync('director/config.json','utf8'));
const memoryPath='director/memory.json';
const memory=JSON.parse(fs.readFileSync(memoryPath,'utf8'));
const contract=JSON.parse(fs.readFileSync('protected/a17y-contract.json','utf8'));
const parentPath=path.resolve(cfg.parent);
const out=path.resolve(process.env.DIRECTOR_OUT||'dist-director');
const mission=(process.env.DIRECTOR_MISSION||'Autonomously diagnose and improve the highest-value evidence-supported weakness').trim();
const logPaths=(process.env.DIRECTOR_LOGS||'').split(/\s+/).filter(Boolean).filter(fs.existsSync);
const token=process.env.GITHUB_TOKEN;
const modelId=process.env.DIRECTOR_MODEL||cfg.model;
const now=new Date().toISOString();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n')};
const run=(c,a,o={})=>execFileSync(c,a,{encoding:'utf8',maxBuffer:128*1024*1024,...o});
const clip=(s,n=120000)=>s.length>n?s.slice(0,n):s;
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
if(!token)throw Error('GITHUB_TOKEN missing');
if(!fs.existsSync(parentPath))throw Error('protected parent missing');
const parent=read(parentPath);
if(sha(Buffer.from(parent))!==contract.sha256)throw Error('protected parent SHA mismatch');

function extractJson(text){
 const fenced=text.match(/```(?:json)?\s*([\s\S]*?)```/i);if(fenced)text=fenced[1];
 const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON object');
 return JSON.parse(text.slice(a,b+1));
}
async function ask(role,prompt,temp=.25,maxTokens=10000){
 const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model:modelId,temperature:temp,max_tokens:maxTokens,messages:[{role:'system',content:role},{role:'user',content:prompt}]})});
 if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);
 const j=await r.json();return extractJson(j.choices?.[0]?.message?.content||'');
}
function summarizeLogs(){
 return logPaths.map(p=>{const text=read(p),lines=text.split(/\r?\n/).filter(Boolean),head=lines[0]?.split(',')||[];return{file:p,bytes:fs.statSync(p).size,rows:Math.max(0,lines.length-1),columns:head.slice(0,80),sha256:sha(fs.readFileSync(p)),sample:lines.slice(1,5)}});
}
function applyPatches(src,patches){
 if(!Array.isArray(patches)||patches.length<1||patches.length>cfg.maxPatches)throw Error('invalid patch count');
 let out=src,changed=0;for(const [i,p] of patches.entries()){
  if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`patch ${i+1} malformed`);
  const at=out.indexOf(p.find);if(at<0)throw Error(`patch ${i+1} find not found`);if(out.indexOf(p.find,at+1)>=0)throw Error(`patch ${i+1} find not unique`);
  out=out.slice(0,at)+p.replace+out.slice(at+p.find.length);changed+=Math.max(p.find.length,p.replace.length);
 }
 if(out===src)throw Error('candidate is unchanged');
 if(Math.abs(out.length-src.length)/src.length>cfg.maximumChangedFraction)throw Error('candidate exceeds bounded-change fraction');
 return{source:out,changed};
}
function runRcos(candidate,name,hypothesis){
 const candidatePath=path.join(out,`${name}.lua`);write(candidatePath,candidate);
 const rcosOut=path.join(out,`${name}-rcos`);run('node',['workbench/rcos.mjs',parentPath,candidatePath,hypothesis,...logPaths],{env:{...process.env,RCOS_OUT:rcosOut}});
 const report=JSON.parse(read(path.join(rcosOut,'REPORT.json')));
 return{candidatePath,rcosOut,report};
}
function deterministicScore(report){
 let score=100;
 if(report.child.normalizedBytes>contract.maxNormalizedBytes)score-=100;
 if(report.comparison.maxDelta>700)score-=30;
 if(report.comparison.changedRows===0)score-=25;
 if(report.comparison.changedRows>500)score-=15;
 if(!report.replays.length)score-=8;
 const margin=contract.maxNormalizedBytes-report.child.normalizedBytes;if(margin<1000)score-=10;
 return Math.max(0,score);
}
const evidence={mission,parent:{bytes:Buffer.byteLength(parent),sha256:contract.sha256},logs:summarizeLogs(),memory:{lastDecision:memory.lastDecision,recentGenerations:memory.generations.slice(-8),lessons:memory.lessons.slice(-20),rejectedHypotheses:memory.rejectedHypotheses.slice(-20)},prioritySystems:cfg.prioritySystems,protectedSystems:cfg.protectedSystems};
write(path.join(out,'EVIDENCE.json'),evidence);

const diagnosis=await ask(
 'You are the Director of an embedded-control engineering laboratory. Diagnose from evidence, distinguish facts from hypotheses, quantify uncertainty, and prefer NO_CHANGE when evidence is weak. Never propose cosmetic work.',
 `Mission: ${mission}\nEvidence: ${JSON.stringify(evidence)}\nController source follows. Return strict JSON {"decision":"INVESTIGATE|NO_CHANGE","problem":"","evidence":[""],"confidence":0.0,"affectedSystems":[""],"missingEvidence":[""],"successMetrics":[{"metric":"","direction":"increase|decrease|preserve","threshold":""}],"reason":""}. A diagnosis below ${cfg.minimumDiagnosisConfidence} confidence must be NO_CHANGE.\nSOURCE:\n${clip(parent)}`,
 .18,9000
);
write(path.join(out,'DIAGNOSIS.json'),diagnosis);

const generation={id:`gen-${Date.now()}`,at:now,mission,model:modelId,diagnosis,candidates:[],decision:null};
if(diagnosis.decision!=='INVESTIGATE'||Number(diagnosis.confidence)<cfg.minimumDiagnosisConfidence){
 generation.decision={status:'NO CHANGE RECOMMENDED',reason:diagnosis.reason||'Insufficient evidence',confidence:Number(diagnosis.confidence)||0};
 memory.lastDecision=generation.decision;memory.generations.push(generation);memory.generations=memory.generations.slice(-100);write(memoryPath,memory);write(path.join(out,'DIRECTOR-REPORT.json'),generation);write(path.join(out,'STATUS.txt'),'NO CHANGE RECOMMENDED\n');process.exit(0);
}

const hypothesisResult=await ask(
 'You are a causal systems scientist. Generate genuinely competing, falsifiable hypotheses. Each must explain the evidence through a complete observation-state-decision-outcome chain and include a disconfirming test.',
 `Diagnosis: ${JSON.stringify(diagnosis)}\nEvidence summary: ${JSON.stringify(evidence)}\nReturn strict JSON {"hypotheses":[{"title":"","causalMechanism":"","targets":[""],"predictions":[""],"disconfirmingTests":[""],"risk":"","expectedMemoryCost":"","confidence":0.0}]}. Return exactly ${cfg.candidateCount} hypotheses.`,
 .38,9000
);
const hypotheses=(hypothesisResult.hypotheses||[]).slice(0,cfg.candidateCount);write(path.join(out,'HYPOTHESES.json'),{hypotheses});
let winner=null;
for(let i=0;i<hypotheses.length;i++){
 const h=hypotheses[i],name=`candidate-${i+1}`;let feedback='';let accepted=false;
 for(let round=1;round<=cfg.maxRepairRounds+1;round++){
  try{
   const plan=await ask(
    'You are a senior RadioMaster MT12 EdgeTX Lua 5.3 control engineer. Implement bounded exact-match patches only. Preserve every protected behavior. New state must be consumed by a decision and measurable outcome. Do not simplify or delete unrelated systems.',
    `Mission: ${mission}\nDiagnosis: ${JSON.stringify(diagnosis)}\nHypothesis: ${JSON.stringify(h)}\nProtected systems: ${JSON.stringify(cfg.protectedSystems)}\n${feedback?`Previous failure requiring targeted repair: ${feedback}`:''}\nReturn strict JSON {"summary":"","expectedOutcome":"","failureModes":[""],"patches":[{"find":"exact unique source text","replace":"complete replacement text","reason":""}]}. Use at most ${cfg.maxPatches} patches. SOURCE:\n${clip(parent)}`,
    .25,18000
   );
   const applied=applyPatches(parent,plan.patches),built=runRcos(applied.source,name,h.title),dScore=deterministicScore(built.report);
   const audit=await ask(
    'You are an adversarial embedded safety auditor. Evidence outranks claims. Reject unused state, fake intelligence, hidden feature loss, persistence changes, throttle risk, sensor-drop risk, excessive allocation, and improvements not proven by deterministic evidence.',
    `Diagnosis: ${JSON.stringify(diagnosis)}\nHypothesis: ${JSON.stringify(h)}\nPlan: ${JSON.stringify(plan)}\nDeterministic RCOS report: ${JSON.stringify(built.report)}\nChanged bytes estimate: ${applied.changed}\nReturn strict JSON {"verdict":"ACCEPT|REJECT","confidence":0.0,"safety":0,"missionEvidence":0,"regressionRisk":0,"reasons":[""],"requiredRepair":""}.`,
    .08,8000
   );
   const evidenceScore=Math.round(dScore*.45+Number(audit.safety||0)*.25+Number(audit.missionEvidence||0)*.3);
   const rec={name,round,hypothesis:h,plan:{summary:plan.summary,expectedOutcome:plan.expectedOutcome,failureModes:plan.failureModes,patchCount:plan.patches.length},deterministicScore:dScore,evidenceScore,audit,report:built.report,status:'REJECTED'};
   generation.candidates.push(rec);write(path.join(out,`${name}-EVIDENCE.json`),rec);
   if(audit.verdict!=='ACCEPT'||Number(audit.confidence)<cfg.minimumCandidateConfidence||evidenceScore<cfg.minimumEvidenceScore)throw Error(`audit rejected: ${(audit.reasons||[]).join('; ')} ${audit.requiredRepair||''}`);
   rec.status='REPLAY VERIFIED';rec.composite=evidenceScore+Math.min(5,(contract.maxNormalizedBytes-built.report.child.normalizedBytes)/2000)-Number(audit.regressionRisk||0)*.05;
   if(!winner||rec.composite>winner.record.composite)winner={record:rec,source:applied.source,rcosOut:built.rcosOut};accepted=true;break;
  }catch(e){feedback=String(e.message||e);memory.lessons.push({at:now,hypothesis:h.title,attempt:name,round,result:'rejected',lesson:feedback.slice(0,1000)});}
 }
 if(!accepted)memory.rejectedHypotheses.push({at:now,title:h.title,reason:feedback.slice(0,1000)});
}

if(!winner){
 generation.decision={status:'NO CHANGE RECOMMENDED',reason:'No candidate cleared deterministic, replay, safety, confidence and evidence gates',confidence:Number(diagnosis.confidence)||0};
 memory.lastDecision=generation.decision;memory.generations.push(generation);memory.generations=memory.generations.slice(-100);memory.lessons=memory.lessons.slice(-300);memory.rejectedHypotheses=memory.rejectedHypotheses.slice(-200);write(memoryPath,memory);write(path.join(out,'DIRECTOR-REPORT.json'),generation);write(path.join(out,'STATUS.txt'),'NO CHANGE RECOMMENDED\n');process.exit(0);
}

generation.decision={status:'REPLAY VERIFIED',candidate:winner.record.name,hypothesis:winner.record.hypothesis.title,evidenceScore:winner.record.evidenceScore,automaticPromotionCeiling:cfg.automaticPromotionCeiling,benchVerified:false,roadVerified:false,parentReplacementAllowed:false};
memory.lastDecision=generation.decision;memory.generations.push(generation);memory.successfulPatterns.push({at:now,hypothesis:winner.record.hypothesis.title,summary:winner.record.plan.summary,evidenceScore:winner.record.evidenceScore});memory.generations=memory.generations.slice(-100);memory.lessons=memory.lessons.slice(-300);memory.rejectedHypotheses=memory.rejectedHypotheses.slice(-200);memory.successfulPatterns=memory.successfulPatterns.slice(-100);write(memoryPath,memory);
write(path.join(out,'WINNER.lua'),winner.source);fs.copyFileSync(path.join(winner.rcosOut,'DEPLOY.luac'),path.join(out,'DEPLOY.luac'));fs.copyFileSync(path.join(winner.rcosOut,'REPORT.json'),path.join(out,'WINNER-RCOS-REPORT.json'));write(path.join(out,'DIRECTOR-REPORT.json'),generation);write(path.join(out,'STATUS.txt'),'REPLAY VERIFIED\nManual bench and road evidence required before parent replacement.\n');
