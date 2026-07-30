#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),R=path.join(root,'reports'),results=path.join(R,'factory-results.tsv'),catalogPath=path.join(R,'factory-catalog.json'),pendingPath=path.join(R,'pending-factory.json');
const old=fs.existsSync(catalogPath)?JSON.parse(fs.readFileSync(catalogPath,'utf8')):{builds:[]};
const pending=fs.existsSync(pendingPath)?JSON.parse(fs.readFileSync(pendingPath,'utf8')):{cycle:0,batch:[]};
const rows=fs.existsSync(results)?fs.readFileSync(results,'utf8').trim().split('\n').filter(Boolean).map(line=>{const [pass,score,family,base]=line.split('\t');return{pass:pass==='1',score:Number(score)||0,family,base}}):[];
const byBase=new Map((old.builds||[]).map(x=>[x.base,x]));
for(const r of rows.filter(x=>x.pass)){
 const meta=(pending.batch||[]).find(x=>path.basename(x.file||'', '.lua')===r.base)||{};
 const simPath=path.join(R,`${r.base}-sim.json`),changePath=path.join(R,`${r.base}-changelog.json`);
 const sim=fs.existsSync(simPath)?JSON.parse(fs.readFileSync(simPath,'utf8')):{};
 const change=fs.existsSync(changePath)?JSON.parse(fs.readFileSync(changePath,'utf8')):{};
 byBase.set(r.base,{pass:true,score:r.score,family:r.family,base:r.base,generation:sim.generation??meta.generation??r.base,style:sim.style??meta.style??'factory',novelty:sim.novelty??0,improvement:sim.improvement??0,dynamic:change.dynamic??meta.dynamic??true,functionChanges:change.functionChanges??meta.functionChanges??(meta.changes?.length||0),allFunctionsRewritten:change.allFunctionsRewritten??meta.allFunctionsRewritten??false,aiArchitect:change.aiArchitect??meta.aiArchitect??false,lua:`generations/factory/${r.family}/${r.base}.lua`,luac:`generations/factory/${r.family}/${r.base}.luac`,changelog:`generations/factory/${r.family}/${r.base}-CHANGELOG.md`,changelogJson:`generations/factory/${r.family}/${r.base}-changelog.json`,acceptedLua:`generations/accepted/${r.base}.lua`,acceptedLuac:`generations/accepted/${r.base}.luac`,acceptedChangelog:`generations/accepted/${r.base}-CHANGELOG.md`,created:new Date().toISOString()});
}
old.builds=[...byBase.values()].sort((a,b)=>String(b.created||'').localeCompare(String(a.created||''))).slice(0,100);
old.latestBatch=pending.cycle||old.latestBatch||0;old.updated=new Date().toISOString();old.downloads='Every accepted build exposes Lua, normalized MT12 LUAC, Markdown changelog and JSON changelog';old.liveStatus='reports/status.json';
fs.writeFileSync(catalogPath,JSON.stringify(old,null,2));
console.log(`Catalog synchronized: ${old.builds.length} builds, batch ${old.latestBatch}`);
