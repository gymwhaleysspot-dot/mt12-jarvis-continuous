#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';
const root=process.cwd(),R=path.join(root,'reports'),progress=path.join(R,'multi-agent-progress.json'),pending=path.join(R,'pending-factory.json'),status=path.join(R,'status.json');
const read=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}},write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2));
await import('./synthesize-factory.mjs');
try{
  await import('./multi-agent-architect.mjs');
}catch(e){
  const r=read(progress)||{},msg=String(r.error||e?.stack||e||''),serviceDeferred=/github_models_retirement_brownout|scheduled retirement brownout|model catalog HTTP 410/i.test(msg);
  if(!serviceDeferred)throw e;
  const now=new Date().toISOString(),p=read(pending)||{};
  p.mode='real-ai-service-deferred';p.deferred=true;p.deferReason='github-models-retirement-brownout';p.candidateCount=0;p.batch=[];p.updated=now;write(pending,p);
  write(progress,{...r,status:'service-deferred',deferred:true,deferReason:'github-models-retirement-brownout',modelGenerated:false,finished:now,error:msg});
  write(status,{status:'service-deferred',mode:'cognitive-governed-metacognitive-factory',stage:'GitHub Models scheduled brownout',deferred:true,championPreserved:true,updated:now,diagnostics:'reports/multi-agent-progress.json'});
  console.log('GitHub Models scheduled brownout: cleanly deferred; no candidate generated and current champion preserved.');
}
