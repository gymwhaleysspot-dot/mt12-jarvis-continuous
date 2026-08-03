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
const activePath=path.resolve('public/builds/forced-status.json');
const logs=fs.existsSync('/tmp/logs.txt')?fs.readFileSync('/tmp/logs.txt','utf8').split(/\r?\n/).filter(Boolean).filter(fs.existsSync):[];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const run=(c,a,o={})=>execFileSync(c,a,{encoding:'utf8',maxBuffer:256*1024*1024,...o});
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n')};
const now=()=>new Date().toISOString();
const source=fs.readFileSync(parent,'utf8');
const attempts=[];
fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root,{recursive:true});fs.mkdirSync(publicDir,{recursive:true});

function heartbeat(phase,extra={}){
 const state={schema:2,id,mission,model,phase,updatedAt:now(),logs:logs.length,attempts:attempts.map(x=>({strategy:x.strategy,round:x.round,status:x.status,reason:x.reason||null})),...extra};
 write(path.join(root,'LIVE-STATUS.json'),state);write(activePath,state);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\n### ${phase}\n\n\`${JSON.stringify(extra)}\`\n`);
 console.log(`[${state.updatedAt}] ${phase}`,extra);
}
function extractJson(text){const f=text.match(/```(?:json)?\s*([\s\S]*?)```/i);if(f)text=f[1];const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON');return JSON.parse(text.slice(a,b+1));}
async function ask(strategy,feedback=''){
 const evidence=logs.map(p=>({file:p,bytes:fs.statSync(p).size,sha256:sha(p),header:fs.readFileSync(p,'utf8').split(/\r?\n/,2)[0]}));
 const prompt=`Mission: ${mission}\nStrategy: ${strategy}\nReplay evidence: ${JSON.stringify(evidence)}\n${feedback?`Previous failure: ${feedback}\n`:''}Return strict JSON {"summary":"","hypothesis":"","patches":[{"find":"exact unique source text","replace":"complete replacement text","reason":""}]}. Make one small functional controller improvement supported by the logs. Preserve MT12 file I/O, GV7=1024 throttle pass-through, car-off guard, persistence schema, dashboard, logging, channel mapping, fail-open behavior, and all existing functions. Do not simplify. Use at most 4 exact patches. SOURCE:\n${source}`;
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),120000);
 try{
  const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:.18,max_tokens:18000,messages:[{role:'system',content:'You are a senior RadioMaster MT12 EdgeTX Lua 5.3 embedded-control engineer. Produce bounded exact-match patches only.'},{role:'user',content:prompt}]})});
  if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);const j=await r.json();return extractJson(j.choices?.[0]?.message?.content||'');
 }catch(e){if(e?.name==='AbortError')throw Error('GitHub Models request timed out after 120 seconds');throw e}finally{clearTimeout(timeout)}
}
function patch(src,items){if(!Array.isArray(items)||!items.length||items.length>4)throw Error('invalid patch count');let out=src;for(const [i,p] of items.entries()){if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`patch ${i+1} malformed`);const at=out.indexOf(p.find);if(at<0)throw Error(`patch ${i+1} find missing`);if(out.indexOf(p.find,at+1)>=0)throw Error(`patch ${i+1} find not unique`);out=out.slice(0,at)+p.replace+out.slice(at+p.find.length);}if(out===src)throw Error('unchanged candidate');if(Math.abs(out.length-src.length)/src.length>.08)throw Error('candidate exceeds 8% bounded-change limit');return out;}
function scoreReport(report){
 const normalized=Number(report.child?.normalizedBytes);
 if(!Number.isFinite(normalized))throw Error('workbench report missing child.normalizedBytes');
 return Number(report.replayExecution?.executedLogs||report.replays?.length||0)*10000-normalized-Number(report.comparison?.changedRows||0)*2-Number(report.comparison?.maxDelta||0);
}
function copyIf(src,name){if(fs.existsSync(src))fs.copyFileSync(src,path.join(publicDir,name));}
function writeIndex(status){
 fs.mkdirSync('public/builds',{recursive:true});const indexPath='public/builds/index.json';let index={schema:1,updatedAt:null,builds:[]};try{index=JSON.parse(fs.readFileSync(indexPath,'utf8'))}catch{}
 index.updatedAt=now();index.builds=[{mission:id,profile:status.profile,authority:status.authority,createdAt:status.createdAt,sourceSha256:status.source?.sha256||null,luacSha256:status.luac?.sha256||null,luacBytes:status.luac?.bytes||null,replayLogs:logs.length,base:`public/builds/${id}/`},...(index.builds||[]).filter(x=>x.mission!==id)].slice(0,100);write(indexPath,index);
}
function finishFiles(status,report){
 write(path.join(publicDir,'STATUS.json'),status);write(path.join(publicDir,'FORCE-REPORT.json'),report);
 const files=fs.readdirSync(publicDir).filter(n=>n!=='SHA256SUMS.txt'&&fs.statSync(path.join(publicDir,n)).isFile()).sort();fs.writeFileSync(path.join(publicDir,'SHA256SUMS.txt'),files.map(n=>`${sha(path.join(publicDir,n))}  ${n}`).join('\n')+'\n');writeIndex(status);heartbeat(status.authority,{profile:status.profile,luacBytes:status.luac?.bytes||null});
}
function publishControlFallback(reason){
 heartbeat('BUILDING_TRUSTED_CONTROL_FALLBACK',{reason});
 const outSource=path.join(publicDir,'candidate.lua'),outLuac=path.join(publicDir,'candidate.luac');fs.copyFileSync(parent,outSource);run('bash',['toolchain/compile_mt12.sh',outSource,outLuac],{env:{...process.env,MAX_BYTES:'87000'}});
 const status={schema:3,mission:id,profile:'trusted-parent-control',authority:'FORCED_CONTROL_NO_BEHAVIOR_CHANGE',forced:true,automaticPromotion:false,hardGatesPassed:true,behaviorChanged:false,benchRequired:false,roadRequired:false,createdAt:now(),model,logs,source:{file:'candidate.lua',sha256:sha(outSource),bytes:fs.statSync(outSource).size},luac:{file:'candidate.luac',sha256:sha(outLuac),bytes:fs.statSync(outLuac).size,format:'MT12 normalized Lua 5.3'},warnings:['All behavioral candidates failed hard gates. This is a verified compile of the trusted parent, not an improvement.','Do not use it as evidence of an Aegis controller change.']};
 write(path.join(publicDir,'REPORT.json'),{schema:1,type:'TRUSTED_PARENT_CONTROL',reason,parentSha256:sha(parent),normalizedBytes:status.luac.bytes});finishFiles(status,{id,mission,model,logs,attempts,fallback:true,fallbackReason:reason,winner:{strategy:'trusted-parent-control'}});
}

async function main(){
 if(!token)throw Error('GITHUB_TOKEN missing');heartbeat('STARTED',{strategies:5,maxRounds:2});
 const strategies=['conservative replay-targeted','sensor-observability','memory-efficient causal','dropout fail-open','jump-versus-wheelspin'];let winner=null;
 for(const [si,strategy] of strategies.entries()){
  let feedback='';for(let round=1;round<=2;round++){
   heartbeat('MODEL_REQUEST',{strategy,round,strategyNumber:si+1,totalStrategies:strategies.length});
   try{
    const plan=await ask(strategy,feedback);heartbeat('WORKBENCH',{strategy,round});const candidate=patch(source,plan.patches);const dir=path.join(root,`${strategy.replace(/[^a-z0-9]+/gi,'-')}-${round}`);fs.mkdirSync(dir,{recursive:true});const child=path.join(dir,'candidate.lua');fs.writeFileSync(child,candidate);const out=path.join(dir,'workbench');run('node',['workbench/run.mjs',parent,child,`${mission} Strategy ${strategy}`],{env:{...process.env,WORKBENCH_OUT:out,WORKBENCH_LOG_FILE:'/tmp/logs.txt'}});const report=JSON.parse(fs.readFileSync(path.join(out,'REPORT.json'),'utf8'));const score=scoreReport(report);const rec={strategy,round,plan,score,report,status:'HARD_GATES_PASSED'};attempts.push(rec);heartbeat('CANDIDATE_PASSED',{strategy,round,score,normalizedBytes:report.child.normalizedBytes});if(!winner||score>winner.score)winner={score,strategy,round,plan,report,out};break;
   }catch(e){feedback=String(e.message||e).slice(0,3000);attempts.push({strategy,round,status:'REJECTED',reason:feedback});heartbeat('CANDIDATE_REJECTED',{strategy,round,reason:feedback.slice(0,500)});}
  }
 }
 if(!winner)return publishControlFallback('No behavioral candidate cleared every hard gate.');
 fs.rmSync(publicDir,{recursive:true,force:true});fs.mkdirSync(publicDir,{recursive:true});for(const [src,name] of [[path.join(winner.out,'CHILD.lua'),'candidate.lua'],[path.join(winner.out,'DEPLOY.luac'),'candidate.luac'],[path.join(winner.out,'REPORT.json'),'REPORT.json'],[path.join(winner.out,'IDENTITY.json'),'IDENTITY.json'],[path.join(winner.out,'DIFF.json'),'DIFF.json'],[path.join(winner.out,'PROMOTION.txt'),'PROMOTION.txt']])copyIf(src,name);
 const outSource=path.join(publicDir,'candidate.lua'),outLuac=path.join(publicDir,'candidate.luac');if(!fs.existsSync(outSource)||!fs.existsSync(outLuac))throw Error('winning workbench did not produce deploy files');
 const status={schema:3,mission:id,profile:winner.strategy,authority:'FORCED_UNVERIFIED_DRIVE_CANDIDATE',forced:true,automaticPromotion:false,hardGatesPassed:true,behaviorChanged:true,benchRequired:true,roadRequired:true,createdAt:now(),model,logs,source:{file:'candidate.lua',sha256:sha(outSource),bytes:fs.statSync(outSource).size},luac:{file:'candidate.luac',sha256:sha(outLuac),bytes:fs.statSync(outLuac).size,format:'MT12 normalized Lua 5.3'},warnings:['Forced experimental build. Keep the trusted LUAC ready for immediate rollback.','This build is not promoted or trusted. Return matching radio and blackbox logs after the drive.']};finishFiles(status,{id,mission,model,logs,attempts,winner:{strategy:winner.strategy,round:winner.round,plan:winner.plan,score:winner.score},fallback:false});
}

try{await main()}catch(e){
 const reason=String(e?.stack||e);attempts.push({strategy:'pipeline',round:0,status:'FATAL',reason});heartbeat('PRIMARY_PIPELINE_FAILED',{reason:reason.slice(0,1000)});
 try{publishControlFallback(reason)}catch(fallbackError){const failure={schema:3,mission:id,profile:'none',authority:'FORCED_BUILD_FAILED',forced:true,automaticPromotion:false,hardGatesPassed:false,createdAt:now(),model,logs,error:String(fallbackError?.stack||fallbackError),primaryError:reason};write(path.join(publicDir,'STATUS.json'),failure);write(path.join(publicDir,'FORCE-REPORT.json'),{id,mission,model,logs,attempts,failure});writeIndex(failure);heartbeat('FAILED',{error:failure.error.slice(0,1000)});process.exitCode=1;}
}
