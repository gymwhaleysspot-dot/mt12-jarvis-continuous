#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd(), pub='public/control-data';
const read=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';
const json=(p,f)=>{try{return JSON.parse(read(p)||'')}catch{return f}};
const walk=(d,a=[])=>{if(!fs.existsSync(d))return a;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p,a):a.push(p)}return a};
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const now=new Date().toISOString();
fs.mkdirSync(pub,{recursive:true});

const roots=['tests/replays','evidence','research','discovery','director','reports','archive'];
const files=roots.flatMap(walk).filter(fs.existsSync).map(p=>({path:p,name:path.basename(p),ext:path.extname(p).toLowerCase(),bytes:fs.statSync(p).size,modified:fs.statSync(p).mtime.toISOString(),sha256:sha(p),category:p.split('/')[0]}));
const logs=files.filter(x=>x.ext==='.csv');
const sources=walk('.').filter(p=>/\.lua$/i.test(p)&&!p.includes('/.git/')).map(p=>({path:p,bytes:fs.statSync(p).size,sha256:sha(p)}));
const candidates=walk('.').filter(p=>/candidate-.*\.lua$|WINNER\.lua$/i.test(p)).map(p=>({path:p,bytes:fs.statSync(p).size,sha256:sha(p)}));
const workflows=walk('.github/workflows').filter(p=>/\.ya?ml$/i.test(p)).map(p=>({path:p,name:path.basename(p),bytes:fs.statSync(p).size,sha256:sha(p)}));
const config=json('operations/config.json',{}),state=json('operations/state.json',{}),memory=json('director/memory.json',{}),research=json('research/current.json',{}),discoveries=json('discovery/state.json',{}),health=json('public/v3-data/health.json',{});

const duplicateGroups=[];const bySha=new Map();for(const f of files){const a=bySha.get(f.sha256)||[];a.push(f.path);bySha.set(f.sha256,a)}for(const [hash,paths] of bySha)if(paths.length>1)duplicateGroups.push({sha256:hash,paths});
const stale=files.filter(f=>Date.now()-new Date(f.modified).getTime()>90*86400000);
const orphanCandidates=candidates.filter(c=>!JSON.stringify(memory).includes(c.sha256)&&!JSON.stringify(state).includes(c.sha256));
const unsupportedClaims=[];for(const l of memory.lessons||[]){if((l.result||l.claim)&&!(l.evidence?.length||l.metrics))unsupportedClaims.push({claim:l.claim||l.lesson||l.result,reason:'No linked evidence or metrics',status:'UNPROVEN'})}
const cleanup={generatedAt:now,duplicates:duplicateGroups,staleFiles:stale,orphanCandidates,unusedWorkflows:workflows.filter(w=>/a16|factory/i.test(w.name)),recommendations:[]};
if(duplicateGroups.length)cleanup.recommendations.push(`Archive or remove ${duplicateGroups.length} exact duplicate groups.`);
if(stale.length)cleanup.recommendations.push(`Review ${stale.length} files older than 90 days.`);
if(orphanCandidates.length)cleanup.recommendations.push(`Review ${orphanCandidates.length} candidates with no memory or promotion reference.`);

const usage={generatedAt:now,estimated:{researchRuns:(research.history||[]).length,directorGenerations:(memory.generations||[]).length,discoveries:(discoveries.history||[]).length,modelCallsApprox:(research.history||[]).length*3+(memory.generations||[]).length*10},limit:config.limits?.monthlyModelCalls||null};
const truthAudit={generatedAt:now,unsupportedClaims,verifiedLessons:(memory.lessons||[]).length-unsupportedClaims.length,rule:'Claims without evidence and metrics are marked UNPROVEN.'};
const catalog={generatedAt:now,files,logs,sources,candidates,workflows,counts:{files:files.length,logs:logs.length,sources:sources.length,candidates:candidates.length,workflows:workflows.length}};
const dashboard={generatedAt:now,config,state,health,research:{topic:research.topic||null,findings:(research.acceptedFindings||[]).length},discovery:{status:discoveries.status||'UNKNOWN',count:(discoveries.discoveries||[]).length,top:(discoveries.discoveries||[])[0]||null},memory:{generations:(memory.generations||[]).length,lessons:(memory.lessons||[]).length,lastDecision:memory.lastDecision||null},catalog:catalog.counts,usage,alerts:[...(state.notifications||[]),...unsupportedClaims.slice(0,5).map(x=>({severity:'warning',message:`UNPROVEN: ${x.claim}`}))]};
for(const [name,data] of Object.entries({catalog,cleanup,usage,'truth-audit':truthAudit,dashboard}))fs.writeFileSync(`${pub}/${name}.json`,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({ok:true,generatedAt:now,counts:catalog.counts,unsupportedClaims:unsupportedClaims.length,cleanupRecommendations:cleanup.recommendations.length}));
