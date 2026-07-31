#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/master-factory.json'),'utf8'));
const out=path.join(root,cfg.output_root);
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={factory:cfg.name,version:cfg.version,startedAt:new Date().toISOString(),status:'running',seed:{source:null,sha256:null},verifiedParent:null,generations:[],ideas:[],failures:[],published:[]};
const write=()=>fs.writeFileSync(path.join(out,'factory-report.json'),JSON.stringify(report,null,2)+'\n');
const note=(type,message,data={})=>report.failures.push({type,message,...data});

function analyzeIdeas(src,name){
  const count=re=>(src.match(re)||[]).length,ideas=[];
  if(count(/\{\}/g)>20) ideas.push({domain:'allocation reduction',idea:'Replace repeated transient tables with shared scalar state or reused buffers',score:90});
  if(count(/getValue\(/g)>12) ideas.push({domain:'truth sensor fusion',idea:'Cache telemetry reads once per frame and feed every consumer from one truth snapshot',score:94});
  if(count(/model\.getGlobalVariable/g)>8) ideas.push({domain:'channel-drop resilience',idea:'Create one validated GVar snapshot with fail-open last-good fallback',score:96});
  if(!/episode/i.test(src)) ideas.push({domain:'causal episode learning',idea:'Unify trigger, cause, intervention, outcome and learning eligibility into one compact episode record',score:97});
  if(!/outcome/i.test(src)) ideas.push({domain:'intervention outcome learning',idea:'Measure post-intervention recovery and learn whether TC, ABS or gyro action helped',score:95});
  if(count(/local function/g)>45) ideas.push({domain:'state deduplication',idea:'Fuse repeated clamps, gates and confidence math without behavior loss',score:82});
  if(!/why|reason|cause/i.test(src)) ideas.push({domain:'explainable telemetry',idea:'Expose compact reason and confidence codes without changing control behavior',score:88});
  return ideas.map(x=>({...x,parent:name}));
}

function compile(name,srcPath){
  const raw=path.join(out,`${name}_raw.luac`),norm=path.join(out,`${name}.luac`);
  execFileSync('luac5.3',['-p',srcPath],{stdio:'pipe'});
  execFileSync('luac5.3',['-s','-o',raw,srcPath],{stdio:'pipe'});
  execFileSync('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,norm],{stdio:'pipe'});
  const b=fs.readFileSync(norm);
  if(b.length>cfg.normalized_luac_limit) throw new Error(`${name} is ${b.length} bytes; limit ${cfg.normalized_luac_limit}`);
  return {name,source:path.relative(root,srcPath),sourceSha256:sha(fs.readFileSync(srcPath)),normalizedSha256:sha(b),normalizedBytes:b.length,margin:cfg.normalized_luac_limit-b.length};
}

function recoverSeed(){
  const configured=path.join(root,cfg.seed);
  if(fs.existsSync(configured)){
    const encoded=fs.readFileSync(configured,'utf8').replace(/\s+/g,'');
    const seed=zlib.gunzipSync(Buffer.from(encoded,'base64'));
    report.seed={source:cfg.seed,sha256:sha(seed),mode:'embedded'};
    return seed;
  }
  const text=execFileSync('git',['log','--all','--format=@@%H','--name-only','--','*.lua'],{encoding:'utf8',maxBuffer:64*1024*1024});
  let commit='',found=[];
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(line.startsWith('@@')){commit=line.slice(2);continue}
    if(commit&&/(^|\/)(a15ya(?:\([^)]*\))?\.lua)$/i.test(line)) found.push({commit,path:line});
  }
  const seen=new Set();
  found=found.filter(x=>{const k=x.commit+'\0'+x.path;if(seen.has(k))return false;seen.add(k);return true});
  for(const x of found){
    try{
      const seed=execFileSync('git',['show',`${x.commit}:${x.path}`],{maxBuffer:16*1024*1024});
      if(seed.length<1000||!seed.includes(Buffer.from('return'))) continue;
      const probe=path.join(out,'seed-probe.lua');fs.writeFileSync(probe,seed);
      execFileSync('luac5.3',['-p',probe],{stdio:'pipe'});
      const packed=zlib.gzipSync(seed,{level:9}).toString('base64').replace(/(.{76})/g,'$1\n')+'\n';
      fs.writeFileSync(path.join(out,'a15ya.lua'),seed);
      fs.writeFileSync(path.join(out,'a15ya.lua.gz.b64'),packed);
      report.seed={source:`git:${x.commit}:${x.path}`,sha256:sha(seed),mode:'history-recovery'};
      return seed;
    }catch(e){note('seed-candidate-rejected',`${x.commit}:${x.path}`,{error:String(e.message||e)});}
  }
  throw new Error('No valid A15YA source could be reconstructed from the embedded seed or complete Git history');
}

try{
  const seed=recoverSeed();
  const work=path.join(out,'lineage');fs.mkdirSync(work,{recursive:true});
  let current=path.join(work,'a15ya.lua');fs.writeFileSync(current,seed);
  let currentName='a15ya';
  let built=compile(currentName,current);report.generations.push(built);report.verifiedParent=built;report.published.push(currentName);
  report.ideas.push(...analyzeIdeas(seed.toString('utf8'),currentName));

  const genRoot=path.join(root,cfg.generation_root);
  const dirs=fs.existsSync(genRoot)?fs.readdirSync(genRoot,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort():[];
  for(const dir of dirs){
    const folder=path.join(genRoot,dir),contractPath=path.join(folder,'contract.json'),transformPath=path.join(folder,'transform.mjs');
    if(!fs.existsSync(contractPath)||!fs.existsSync(transformPath)){note('invalid-generation',`Skipped ${dir}: missing contract or transform`);continue}
    const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
    if(contract.parent!==currentName){note('lineage-mismatch',`Skipped ${dir}: expected parent ${currentName}, declared ${contract.parent}`);continue}
    let accepted=false,lastError='';
    for(let round=1;round<=cfg.max_repair_rounds&&!accepted;round++){
      const candidate=path.join(work,`${dir}.lua`);
      try{
        execFileSync('node',[transformPath,current,candidate,String(round)],{stdio:'pipe'});
        const text=fs.readFileSync(candidate,'utf8');
        for(const token of contract.required_tokens||[]) if(!text.includes(token)) throw new Error(`missing required token ${token}`);
        for(const token of contract.forbidden_tokens||[]) if(text.includes(token)) throw new Error(`forbidden token ${token}`);
        const result=compile(dir,candidate);
        result.parent=currentName;result.round=round;result.new_capabilities=contract.new_capabilities||[];
        report.generations.push(result);report.verifiedParent=result;report.published.push(dir);report.ideas.push(...analyzeIdeas(text,dir));
        current=candidate;currentName=dir;accepted=true;
      }catch(e){lastError=String(e.message||e);note('candidate-repair',`${dir} round ${round} rejected`,{error:lastError});}
    }
    if(!accepted) note('generation-held',`${dir} did not qualify; retained ${currentName} as verified parent`,{error:lastError});
  }
  report.status='complete';
}catch(e){report.status='protected-error';note('factory-error',String(e.stack||e));}
report.ideas.sort((a,b)=>b.score-a.score);
report.finishedAt=new Date().toISOString();write();
fs.writeFileSync(path.join(out,'STATUS.txt'),`${report.status}\nseed: ${report.seed.source||'none'}\nverified parent: ${report.verifiedParent?.name||'none'}\n`);
