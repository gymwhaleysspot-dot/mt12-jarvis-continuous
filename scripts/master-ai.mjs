#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';import{spawnSync}from'node:child_process';
const root=process.cwd(),R=path.join(root,'reports'),G=path.join(root,'generations'),progress=path.join(R,'multi-agent-progress.json'),pending=path.join(R,'pending-factory.json'),status=path.join(R,'status.json');
const read=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}},write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),run=(cmd,args,opt={})=>{const r=spawnSync(cmd,args,{stdio:opt.capture?'pipe':'inherit',encoding:'utf8'});if(r.error||r.status!==0)throw Error(`${cmd} failed: ${r.error?.message||r.stderr||r.status}`);return opt.capture?String(r.stdout||'').trim():''};

fs.mkdirSync(R,{recursive:true});fs.mkdirSync(G,{recursive:true});

// Scratch requests are built inside this already-proven workflow so they do not
// depend on a newly-created workflow being activated by GitHub Actions.
const inbox=path.join(root,'factory_inbox'),scratchRoot=path.join(G,'scratch'),limit=88944;
fs.mkdirSync(scratchRoot,{recursive:true});
const specs=fs.existsSync(inbox)?fs.readdirSync(inbox).filter(x=>/^scratch-.*\.json$/.test(x)).sort():[];
for(const file of specs){
  const specPath=path.join(inbox,file),spec=read(specPath)||{},name=String(spec.name||'').toLowerCase();
  if(!/^[a-z0-9_-]{1,6}$/.test(name))throw Error(`invalid scratch name in ${file}`);
  const out=path.join(scratchRoot,name),buildPath=path.join(out,'build.json'),old=read(buildPath);
  if(old?.status==='PASS'&&old?.spec_sha===fs.statSync(specPath).mtimeMs)continue;
  fs.mkdirSync(out,{recursive:true});
  const generated=run(process.execPath,['scripts/scratch-lua-generator.mjs',specPath],{capture:true}).split(/\r?\n/).filter(Boolean).at(-1);
  if(!generated||!fs.existsSync(generated))throw Error(`scratch generator produced no file for ${name}`);
  const lua=path.join(out,`${name}.lua`),raw=path.join(out,`${name}_raw.luac`),luac=path.join(out,`${name}.luac`);
  fs.copyFileSync(generated,lua);run('luac5.3',['-p',lua]);run('luac5.3',['-s','-o',raw,lua]);run(process.execPath,['toolchain/normalize_luac53_mt12.cjs',raw,luac]);fs.rmSync(raw,{force:true});
  const bytes=fs.statSync(luac).size;if(bytes>limit)throw Error(`${name}.luac ${bytes} exceeds MT12 limit ${limit}`);
  const sha=p=>run('sha256sum',[p],{capture:true}).split(/\s+/)[0];
  write(buildPath,{status:'PASS',name,source:`generations/scratch/${name}/${name}.lua`,luac:`generations/scratch/${name}/${name}.luac`,bytes,limit,margin:limit-bytes,source_sha256:sha(lua),luac_sha256:sha(luac),spec:`factory_inbox/${file}`,spec_sha:fs.statSync(specPath).mtimeMs,built:new Date().toISOString()});
  console.log(`scratch ${name}: ${bytes} bytes, margin ${limit-bytes}`);
}
const builds=[];for(const name of fs.readdirSync(scratchRoot)){const b=read(path.join(scratchRoot,name,'build.json'));if(b?.status==='PASS')builds.push(b)}builds.sort((a,b)=>String(b.built).localeCompare(String(a.built)));write(path.join(R,'scratch-catalog.json'),{updated:new Date().toISOString(),builds});if(builds[0])write(path.join(R,'scratch-latest.json'),builds[0]);

// Guaranteed deterministic deploy build. This does not depend on GitHub Models.
run(process.execPath,['scripts/build-a15xr.mjs']);
run('luac5.3',['-p','a15xr.lua']);
run('luac5.3',['-s','-o',path.join(G,'a15xr_raw.luac'),'a15xr.lua']);
run(process.execPath,['toolchain/normalize_luac53_mt12.cjs',path.join(G,'a15xr_raw.luac'),path.join(G,'a15xr.luac')]);
fs.rmSync(path.join(G,'a15xr_raw.luac'),{force:true});fs.copyFileSync('a15xr.lua',path.join(G,'a15xr.lua'));
const bytes=fs.statSync(path.join(G,'a15xr.luac')).size;
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
