#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';import{spawnSync}from'node:child_process';
const root=process.cwd(),R=path.join(root,'reports'),G=path.join(root,'generations'),progress=path.join(R,'multi-agent-progress.json'),pending=path.join(R,'pending-factory.json'),status=path.join(R,'status.json');
const read=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}},write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)),run=(cmd,args)=>{const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.error||r.status!==0)throw Error(`${cmd} failed: ${r.error?.message||r.status}`)};

// Guaranteed deterministic deploy build. This does not depend on GitHub Models.
fs.mkdirSync(R,{recursive:true});fs.mkdirSync(G,{recursive:true});
run(process.execPath,['scripts/build-a15xr.mjs']);
run('luac5.3',['-p','a15xr.lua']);
run('luac5.3',['-s','-o',path.join(G,'a15xr_raw.luac'),'a15xr.lua']);
run(process.execPath,['toolchain/normalize_luac53_mt12.cjs',path.join(G,'a15xr_raw.luac'),path.join(G,'a15xr.luac')]);
fs.rmSync(path.join(G,'a15xr_raw.luac'),{force:true});fs.copyFileSync('a15xr.lua',path.join(G,'a15xr.lua'));
const bytes=fs.statSync(path.join(G,'a15xr.luac')).size,limit=88944;
write(path.join(R,'a15xr-build.json'),{file:'generations/a15xr.luac',source:'generations/a15xr.lua',bytes,limit,margin:limit-bytes,normalized:true,compiler:'luac5.3 -s',created:new Date().toISOString()});
console.log(`a15xr normalized deploy: ${bytes} bytes, margin ${limit-bytes}`);

await import('./synthesize-factory.mjs');
try{
  await import('./multi-agent-architect.mjs');
}catch(e){
  const r=read(progress)||{},msg=String(r.error||e?.stack||e||''),serviceDeferred=/github_models_retirement_brownout|scheduled retirement brownout|model catalog HTTP 410/i.test(msg);
  if(!serviceDeferred)throw e;
  const now=new Date().toISOString(),p=read(pending)||{};
  p.mode='real-ai-service-deferred';p.deferred=true;p.deferReason='github-models-retirement-brownout';p.candidateCount=0;p.batch=[];p.updated=now;write(pending,p);
  write(progress,{...r,status:'service-deferred',deferred:true,deferReason:'github-models-retirement-brownout',modelGenerated:false,finished:now,error:msg});
  write(status,{status:'service-deferred',mode:'cognitive-governed-metacognitive-factory',stage:'GitHub Models scheduled brownout',deferred:true,championPreserved:true,a15xrBuilt:true,updated:now,diagnostics:'reports/multi-agent-progress.json'});
  console.log('GitHub Models scheduled brownout: cleanly deferred; no AI candidate generated and current champion preserved.');
}
