#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/master-factory.json'),'utf8'));
const out=path.join(root,cfg.output_root);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const mission=(process.env.FACTORY_MISSION||'Build the brightest safe next generation while preserving every proven behavior.').trim();
const report={factory:cfg.name,version:cfg.version,mission,startedAt:new Date().toISOString(),status:'running',seed:{},verifiedParent:null,generations:[],ideas:[],failures:[],candidates:[],published:[]};
const write=()=>fs.writeFileSync(path.join(out,'factory-report.json'),JSON.stringify(report,null,2)+'\n');
const note=(type,message,data={})=>report.failures.push({type,message,...data});

function analyzeIdeas(src,name){
 const n=r=>(src.match(r)||[]).length,a=[];
 if(n(/getValue\(/g)>12)a.push({domain:'truth sensor fusion',idea:'single frame-coherent truth snapshot',score:96});
 if(n(/model\.getGlobalVariable/g)>8)a.push({domain:'channel-drop resilience',idea:'validated last-good fail-open GVar snapshot',score:98});
 if(!/episode/i.test(src))a.push({domain:'causal episode learning',idea:'compact trigger/cause/action/outcome episode memory',score:97});
 if(!/outcome/i.test(src))a.push({domain:'outcome learning',idea:'learn whether each intervention improved recovery',score:95});
 if(n(/local function/g)>45)a.push({domain:'memory architecture',idea:'behavior-equivalent helper/state fusion',score:90});
 a.push({domain:'predictive control',idea:'confidence-weighted pre-event risk without extra output steps',score:94});
 a.push({domain:'explainability',idea:'compact reason/confidence telemetry for every intervention',score:89});
 return a.map(x=>({...x,parent:name}));
}

function compile(name,srcPath){
 const raw=path.join(out,`${name}_raw.luac`),norm=path.join(out,`${name}.luac`);
 execFileSync('luac5.3',['-p',srcPath],{stdio:'pipe'});
 execFileSync('luac5.3',['-s','-o',raw,srcPath],{stdio:'pipe'});
 execFileSync('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,norm],{stdio:'pipe'});
 const b=fs.readFileSync(norm);if(b.length>cfg.normalized_luac_limit)throw Error(`${name} is ${b.length} bytes; limit ${cfg.normalized_luac_limit}`);
 return{name,source:path.relative(root,srcPath),sourceSha256:sha(fs.readFileSync(srcPath)),normalizedSha256:sha(b),normalizedBytes:b.length,margin:cfg.normalized_luac_limit-b.length};
}

function recoverSeed(){
 const p=path.join(root,cfg.seed);if(!fs.existsSync(p))throw Error(`Missing embedded seed: ${cfg.seed}`);
 let s=zlib.gunzipSync(Buffer.from(fs.readFileSync(p,'utf8').replace(/\s+/g,''),'base64')).toString('utf8');
 const repairs=[];
 if(s.includes('local evABS=0local sessOn=false')){s=s.replace('local evABS=0local sessOn=false','local evABS=0;local sessOn=false');repairs.push('inserted separator after evABS initializer');}
 report.seed={source:cfg.seed,originalSha256:sha(zlib.gunzipSync(Buffer.from(fs.readFileSync(p,'utf8').replace(/\s+/g,''),'base64'))),effectiveSha256:sha(Buffer.from(s)),mode:'embedded',repairs};
 return s;
}

function nextName(name){
 const m=name.match(/^(.*?)([a-z])$/i);if(!m)return name+'b';
 const c=m[2].toLowerCase().charCodeAt(0);return m[1]+String.fromCharCode(c<122?c+1:98);
}
function cleanJson(t){const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw Error('model returned no JSON object');return JSON.parse(t.slice(a,b+1));}
function applyPatches(src,patches){
 let out=src,changed=0;
 if(!Array.isArray(patches)||!patches.length)throw Error('no patches returned');
 for(const [i,p] of patches.entries()){
  if(typeof p.find!=='string'||typeof p.replace!=='string'||!p.find)throw Error(`patch ${i+1} is invalid`);
  const first=out.indexOf(p.find);if(first<0)throw Error(`patch ${i+1} find text not found`);
  if(out.indexOf(p.find,first+1)>=0)throw Error(`patch ${i+1} find text is not unique`);
  if(p.find.length>20000||p.replace.length>24000)throw Error(`patch ${i+1} is too broad`);
  out=out.slice(0,first)+p.replace+out.slice(first+p.find.length);changed+=Math.max(p.find.length,p.replace.length);
 }
 if(changed<12||out===src)throw Error('candidate made no meaningful source change');
 if(out.length<src.length*.80)throw Error('candidate removed more than 20% of the controller');
 for(const token of ['return','run','background','init','io.read','model.setGlobalVariable'])if(src.includes(token)&&!out.includes(token))throw Error(`candidate lost required marker ${token}`);
 return{source:out,changed};
}

async function invent(parentSource,parentName,candidateName,index,idea,repair=''){
 const token=process.env.GITHUB_TOKEN;if(!token)throw Error('GITHUB_TOKEN missing; AI invention cannot run');
 const prompt=`You are the senior architect for a RadioMaster MT12 EdgeTX Lua 5.3 automotive controller.\nMission: ${mission}\nParent: ${parentName}. Candidate: ${candidateName}.\nInnovation focus: ${idea.domain} — ${idea.idea}.\n${repair?`Previous candidate failed: ${repair}\nCreate a corrected patch plan.`:''}\nReturn ONLY one JSON object: {"summary":"...","innovation":"...","safety":"...","patches":[{"find":"exact unique parent text","replace":"replacement text","reason":"..."}]}.\nRules: make a real behavioral or learning innovation, not comments/version renaming; preserve dashboard, mood/personality, file-handle io.read(fileHandle,...), car-off guard, logging, persistence, TC, ABS, gyro, truth RPM/MPH and fail-open behavior; no placeholders; no feature deletion; keep Lua 5.3 syntax and MT12 memory efficiency; use 1-5 narrow exact replacements. Every find string must occur exactly once in the supplied parent.\n\nPARENT SOURCE:\n${parentSource}`;
 const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model:process.env.FACTORY_MODEL||'openai/gpt-4.1',temperature:0.7,max_tokens:12000,messages:[{role:'system',content:'Design compact, safe, genuinely novel production code patches. Output strict JSON only.'},{role:'user',content:prompt}]})});
 if(!r.ok)throw Error(`GitHub Models ${r.status}: ${await r.text()}`);
 const j=await r.json(),text=j.choices?.[0]?.message?.content;if(!text)throw Error('GitHub Models returned no content');
 return cleanJson(text);
}

async function main(){
 const seed=recoverSeed(),work=path.join(out,'lineage');fs.mkdirSync(work,{recursive:true});
 let current=path.join(work,'a15ya.lua');fs.writeFileSync(current,seed);let currentName='a15ya';
 let built=compile(currentName,current);report.generations.push(built);report.verifiedParent=built;report.published.push(currentName);report.ideas.push(...analyzeIdeas(seed,currentName));

 const genRoot=path.join(root,cfg.generation_root);
 const dirs=fs.existsSync(genRoot)?fs.readdirSync(genRoot,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort():[];
 for(const dir of dirs){
  const folder=path.join(genRoot,dir),cp=path.join(folder,'contract.json'),tp=path.join(folder,'transform.mjs');if(!fs.existsSync(cp)||!fs.existsSync(tp))continue;
  const c=JSON.parse(fs.readFileSync(cp,'utf8'));if(c.parent!==currentName)continue;
  try{const dst=path.join(work,`${dir}.lua`);execFileSync('node',[tp,current,dst,'1'],{stdio:'pipe'});const b=compile(dir,dst);b.parent=currentName;b.mode='deterministic-transform';report.generations.push(b);current=dst;currentName=dir;report.verifiedParent=b;report.published.push(dir);}catch(e){note('static-generation-rejected',dir,{error:String(e.message||e)});}
 }

 const parentSource=fs.readFileSync(current,'utf8'),ideas=analyzeIdeas(parentSource,currentName).sort((a,b)=>b.score-a.score),baseName=nextName(currentName),count=Math.max(2,cfg.candidate_count||4);let winner=null;
 for(let i=0;i<count;i++){
  const name=i?`${baseName}${i+1}`:baseName,idea=ideas[i%ideas.length];let failure='';
  for(let round=1;round<=3;round++){
   try{
    const plan=await invent(parentSource,currentName,name,i,idea,failure),applied=applyPatches(parentSource,plan.patches),dst=path.join(work,`${name}.lua`);fs.writeFileSync(dst,applied.source);
    const b=compile(name,dst);b.parent=currentName;b.mode='ai-invented';b.round=round;b.innovation=plan.innovation||plan.summary;b.safety=plan.safety;b.changedSpanBytes=applied.changed;b.patchCount=plan.patches.length;b.idea=idea;
    b.score=idea.score+Math.min(12,applied.changed/300)+Math.min(10,b.margin/1500);
    report.candidates.push({...b,status:'verified'});fs.writeFileSync(path.join(out,`${name}-innovation.json`),JSON.stringify(plan,null,2)+'\n');
    if(!winner||b.score>winner.meta.score)winner={path:dst,name,meta:b};break;
   }catch(e){failure=String(e.message||e);report.candidates.push({name,parent:currentName,idea,round,status:'rejected',error:failure});note('ai-candidate-rejected',`${name} round ${round}`,{error:failure});}
  }
 }
 if(winner){report.generations.push(winner.meta);report.verifiedParent=winner.meta;report.published.push(winner.name);fs.copyFileSync(winner.path,path.join(out,`${winner.name}.lua`));report.status='complete-ai-release';}
 else{report.status='protected-no-ai-winner';note('no-ai-winner','No invented candidate passed syntax, size and preservation gates; parent retained');}
}

main().catch(e=>{report.status='protected-error';note('factory-error',String(e.stack||e));}).finally(()=>{report.ideas.sort((a,b)=>b.score-a.score);report.finishedAt=new Date().toISOString();write();fs.writeFileSync(path.join(out,'STATUS.txt'),`${report.status}\nseed: ${report.seed.source||'none'}\nverified parent: ${report.verifiedParent?.name||'none'}\nmission: ${mission}\n`);});
