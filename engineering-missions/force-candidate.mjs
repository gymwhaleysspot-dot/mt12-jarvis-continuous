#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const token=process.env.GITHUB_TOKEN||'';
const model=process.env.FORCE_MODEL||'openai/gpt-4.1';
const id=process.env.FORCE_ID||`forced-${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}-${crypto.randomBytes(3).toString('hex')}`;
const mission=process.env.FORCE_MISSION||'Build a bounded experimental A17Y candidate from the latest replay evidence. Preserve every protected behavior.';
const parent='a17y.lua';
const root=path.resolve('dist-forced',id);
const publicDir=path.resolve('public/builds',id);
const logs=fs.existsSync('/tmp/logs.txt')?fs.readFileSync('/tmp/logs.txt','utf8').split(/\r?\n/).filter(Boolean).filter(fs.existsSync):[];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const run=(c,a,o={})=>execFileSync(c,a,{encoding:'utf8',maxBuffer:256*1024*1024,...o});
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n')};
const source=fs.readFileSync(parent,'utf8');
fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root,{recursive:true});
if(!token)throw Error('GITHUB_TOKEN missing');

function extractJson(text){const f=text.match(/```(?:json)?\s*([\s\S]*?)```/i);if(f)text=f[1];const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON');return JSON.parse(text.slice(a,b+1));}
async function ask(strategy,feedback=''){
 const evidence=logs.map(p=>({file:p,bytes:fs.statSync(p).size,sha256:sha(p),header:fs.readFileSync(p,'utf8').split(/\r?\n/,2)[0]}));
 const prompt=`Mission: ${mission}\nStrategy: ${strategy}\nReplay evidence: ${JSON.stringify(evidence)}\n${feedback?`Previous failure: ${feedback}\n`:''}Return strict JSON {"summary":"","hypothesis":"","patches":[{"find":"exact unique source text","replace":"complete replacement text","reason":""}]}. Make one small functional controller improvement supported by the logs. Preserve MT12 file I/O, GV7=1024 throttle pass-through, car-off guard, persistence schema, dashboard, logging, channel mapping, fail-open behavior, and all existing functions. Do not simplify. Use at most 4 exact patches. SOURCE:\n${source}`;
 const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:.18,max_tokens:18000,messages:[{role:'system',content:'You are a senior RadioMaster MT12 EdgeTX Lua 5.3 embedded-control engineer. Produce bounded exact-match patches only.'},{role:'user',content:prompt}]})});
 if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);const j=await r.json();return extractJson(j.choices?.[0]?.message?.content||'');
}
function patch(src,items){if(!Array.isArray(items)||!items.length||items.length>4)throw Error('invalid patch count');let out=src;for(const [i,p] of items.entries()){if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`patch ${i+1} malformed`);const at=out.indexOf(p.find);if(at<0)throw Error(`patch ${i+1} find missing`);if(out.indexOf(p.find,at+1)>=0)throw Error(`patch ${i+1} find not unique`);out=out.slice(0,at)+p.replace+out.slice(at+p.find.length);}if(out===src)throw Error('unchanged candidate');if(Math.abs(out.length-src.length)/src.length>.08)throw Error('candidate exceeds 8% bounded-change limit');return out;}

const strategies=['conservative replay-targeted','sensor-observability','memory-efficient causal','dropout fail-open','jump-versus-wheelspin'];
const attempts=[];let winner=null;
for(const strategy of strategies){let feedback='';for(let round=1;round<=2;round++){try{const plan=await ask(strategy,feedback);const candidate=patch(source,plan.patches);const dir=path.join(root,`${strategy.replace(/[^a-z0-9]+/gi,'-')}-${round}`);fs.mkdirSync(dir,{recursive:true});const child=path.join(dir,'candidate.lua');fs.writeFileSync(child,candidate);const out=path.join(dir,'workbench');const logFile='/tmp/logs.txt';run('node',['workbench/run.mjs',parent,child,`${mission} Strategy ${strategy}`],{env:{...process.env,WORKBENCH_OUT:out,WORKBENCH_LOG_FILE:logFile}});const report=JSON.parse(fs.readFileSync(path.join(out,'REPORT.json'),'utf8'));const rec={strategy,round,plan,report,status:'HARD_GATES_PASSED'};attempts.push(rec);const score=(Number(report.replayExecution?.executedLogs||0)*10000)-Number(report.bytecode?.normalizedBytes||999999)-Number(report.comparison?.changedRows||0)*2-Number(report.comparison?.maxDelta||0);if(!winner||score>winner.score)winner={score,strategy,round,plan,report,out};break;}catch(e){feedback=String(e.message||e).slice(0,3000);attempts.push({strategy,round,status:'REJECTED',reason:feedback});}}
}

let fallback=false;
if(!winner){fallback=true;const child=path.join(root,'forced-control.lua');fs.writeFileSync(child,source+`\n-- forced experimental control ${id}\n`);const out=path.join(root,'forced-control-workbench');run('node',['workbench/run.mjs',parent,child,`${mission} Forced control candidate`],{env:{...process.env,WORKBENCH_OUT:out,WORKBENCH_LOG_FILE:'/tmp/logs.txt'}});winner={score:-1,strategy:'no-behavior-change-control',round:1,plan:{summary:'Control build produced because all behavioral candidates failed hard gates.',hypothesis:'No controller behavior change.'},report:JSON.parse(fs.readFileSync(path.join(out,'REPORT.json'),'utf8')),out};}

fs.rmSync(publicDir,{recursive:true,force:true});fs.mkdirSync(publicDir,{recursive:true});
for(const [src,name] of [[path.join(winner.out,'CHILD.lua'),'candidate.lua'],[path.join(winner.out,'DEPLOY.luac'),'candidate.luac'],[path.join(winner.out,'REPORT.json'),'REPORT.json'],[path.join(winner.out,'IDENTITY.json'),'IDENTITY.json'],[path.join(winner.out,'DIFF.json'),'DIFF.json'],[path.join(winner.out,'PROMOTION.txt'),'PROMOTION.txt']])if(fs.existsSync(src))fs.copyFileSync(src,path.join(publicDir,name));
const status={schema:2,mission:id,profile:winner.strategy,authority:fallback?'FORCED_CONTROL_NO_BEHAVIOR_CHANGE':'FORCED_UNVERIFIED_DRIVE_CANDIDATE',forced:true,automaticPromotion:false,hardGatesPassed:true,benchRequired:true,roadRequired:true,createdAt:new Date().toISOString(),model,logs,source:{file:'candidate.lua',sha256:sha(path.join(publicDir,'candidate.lua')),bytes:fs.statSync(path.join(publicDir,'candidate.lua')).size},luac:{file:'candidate.luac',sha256:sha(path.join(publicDir,'candidate.luac')),bytes:fs.statSync(path.join(publicDir,'candidate.luac')).size,format:'MT12 normalized Lua 5.3'},warnings:['Forced experimental build. Keep the trusted LUAC ready for immediate rollback.','This build is not promoted or trusted. Return matching radio and blackbox logs after the drive.']};
write(path.join(publicDir,'STATUS.json'),status);write(path.join(publicDir,'FORCE-REPORT.json'),{id,mission,model,logs,attempts,winner:{strategy:winner.strategy,round:winner.round,plan:winner.plan,score:winner.score},fallback});
const files=fs.readdirSync(publicDir).filter(n=>fs.statSync(path.join(publicDir,n)).isFile()).sort();fs.writeFileSync(path.join(publicDir,'SHA256SUMS.txt'),files.map(n=>`${sha(path.join(publicDir,n))}  ${n}`).join('\n')+'\n');
fs.mkdirSync('public/builds',{recursive:true});const indexPath='public/builds/index.json';let index={schema:1,updatedAt:null,builds:[]};try{index=JSON.parse(fs.readFileSync(indexPath,'utf8'))}catch{}index.updatedAt=new Date().toISOString();index.builds=[{mission:id,profile:winner.strategy,authority:status.authority,createdAt:status.createdAt,sourceSha256:status.source.sha256,luacSha256:status.luac.sha256,luacBytes:status.luac.bytes,replayLogs:logs.length,base:`public/builds/${id}/`},...(index.builds||[]).filter(x=>x.mission!==id)].slice(0,100);write(indexPath,index);
console.log(JSON.stringify(status,null,2));
