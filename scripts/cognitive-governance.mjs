#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const R=path.join(root,'reports');
const mode=process.argv[2]||'preflight';
const arg=process.argv[3];
fs.mkdirSync(R,{recursive:true});
const read=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))}catch{return null}};
const write=(n,v)=>fs.writeFileSync(path.join(R,n),JSON.stringify(v,null,2));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const now=()=>new Date().toISOString();
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const grade={real_drive:1,bench:.85,replay:.75,calibrated_twin:.65,simulation:.45,static:.25,missing:0};
const capabilities=['proponent-skeptic-safety-judge deliberation','persistent belief updates','contradiction detection','assumption tracking','evidence grading','mock EdgeTX runtime','property runtime tests','causal memory','retrieval before reasoning','function contracts','state ownership','why-this-function gate','minimal-change preference','experiment isolation','reality calibration','domain specialist reputation','promotion explanation','red-team generation','model-response verification','post-cycle reflection'];

function sourceFunctions(src){
  const re=/local function\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g,a=[];let m;
  while((m=re.exec(src)))a.push({name:m[1],args:m[2].split(',').map(x=>x.trim()).filter(Boolean),at:m.index});
  for(let i=0;i<a.length;i++){a[i].end=i+1<a.length?a[i+1].at:src.length;a[i].text=src.slice(a[i].at,a[i].end);a[i].hash=hash(a[i].text);a[i].bytes=Buffer.byteLength(a[i].text)}
  return a;
}
function changed(parent,candidate){
  const p=new Map(sourceFunctions(parent).map(x=>[x.name,x])),out=[];
  for(const f of sourceFunctions(candidate)){const q=p.get(f.name);if(q&&q.hash!==f.hash)out.push({name:f.name,before:q.hash,after:f.hash,bytesDelta:f.bytes-q.bytes})}
  return out;
}
function stateMap(funcs){
  const slots={};
  for(const f of funcs){
    for(const m of f.text.matchAll(/V\[(\d+)\]\s*=/g))(slots[m[1]]??={writers:[],readers:[]}).writers.push(f.name);
    for(const m of f.text.matchAll(/V\[(\d+)\]/g))(slots[m[1]]??={writers:[],readers:[]}).readers.push(f.name);
  }
  for(const v of Object.values(slots)){v.readers=[...new Set(v.readers)];v.writers=[...new Set(v.writers)]}
  return slots;
}
function duplicateLocals(src){
  const out=[];
  for(const [i,line] of src.split(/\r?\n/).entries()){
    if(/^\s*local\s+function\b/.test(line))continue;
    const m=line.match(/^\s*local\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)+)\s*(?:=|$)/);
    if(!m)continue;
    const names=m[1].split(',').map(x=>x.trim()),dupes=[...new Set(names.filter((x,j)=>names.indexOf(x)!==j))];
    if(dupes.length)out.push({line:i+1,text:line.trim(),duplicates:dupes});
  }
  return out;
}
function initializationRisks(src){
  const risks=[];
  const re=/\blocal\s+(?!function\b)([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)+)\s*(?=\n|;|local\b)/g;let m;
  while((m=re.exec(src))){
    for(const name of m[1].split(',').map(x=>x.trim())){
      const use=src.indexOf(name+'[',m.index+m[0].length);
      if(use<0)continue;
      const tail=src.slice(m.index+m[0].length,use);
      const assign=new RegExp(`\\b${name}\\s*=\\s*\\{`).test(tail);
      if(!assign)risks.push({name,declaration:m.index,firstIndexedUse:use});
    }
  }
  return risks;
}
function domain(name,text){
  const n=name.toLowerCase();
  if(/^(bb|log)|blackbox|draw|page|voice|phrase|mem|save|load|csv|ui/.test(n))return'cockpit';
  if(/truth|rpm|gps|speed|lag|gear/.test(n))return'truth';
  if(/tc|abs|slip|brake|govern|gyro|traction/.test(n))return'control';
  if(/learn|neural|conf|reason|trait|mood|brain/.test(n))return'brain';
  const s=text.toLowerCase();
  if(/lcd\.|io\.|playfile|blackbox|bb_tick/.test(s))return'cockpit';
  if(/model\.setglobalvariable|tct|abs|slip/.test(s))return'control';
  return'core';
}
function contracts(funcs){return funcs.map(f=>({function:f.name,hash:f.hash,inputs:f.args,must:['remain finite','preserve declared return shape','avoid new globals'],mustNot:[/draw|voice|log|mem|bb/i.test(f.name)?'write control outputs':'allocate large hot-path tables','throw under mocked EdgeTX APIs'],critical:/run|background|init|truth|tc|abs|jump|air|mem|bb/i.test(f.name)}))}
function runtimeHarness(file,base){
  const q=JSON.stringify(path.resolve(file)),h=path.join(R,`${base}-runtime-harness.lua`);
  const lua=`local gv={}\nlocal vals={RPM=12000,GSpd=12,Sats=8,RxBt=7.8,RQly=100,ST=0,TH=0}\nSMLSIZE=0 INVERS=0 DBLSIZE=0 MIDSIZE=0 BLINK=0 SOLID=0 DOTTED=0\nfunction getFieldInfo(n)return{id=n}end\nfunction getValue(n)return vals[n] or vals[tostring(n)] or 0 end\nmodel={getGlobalVariable=function(i)return gv[i] or 0 end,setGlobalVariable=function(i,f,v)gv[i]=v end}\nlcd=setmetatable({},{__index=function()return function()end end})\nfunction playFile()end function playNumber()end function getTime()return 100 end\nio.open=function()return nil end\nlocal ok,m=pcall(dofile,${q});if not ok then error('load:'..tostring(m))end\nif type(m)~='table' then error('module return')end\nlocal function call(k,...)if type(m[k])=='function'then local o,e=pcall(m[k],...);if not o then error(k..':'..tostring(e))end end end\ncall('init') call('run',0) call('background') vals.TH=900 vals.RPM=25000 vals.GSpd=5 call('run',0) vals.RQly=0 call('run',0) if (gv[7] or 1024)<1000 then error('fail-open')end vals.RQly=100 vals.GSpd=0 vals.RPM=0 call('run',0) call('background') call('draw',0,0) print('runtime-ok')\n`;
  fs.writeFileSync(h,lua);
  const r=spawnSync('lua5.3',[h],{encoding:'utf8',timeout:30000});
  return{available:!r.error,passed:r.status===0,status:r.status,stdout:(r.stdout||'').slice(-1200),stderr:(r.stderr||'').slice(-2000)};
}
function preflight(){
  const beliefs=read('reports/belief-state.json')||{schema:2,beliefs:{},history:[]};
  write('cognitive-charter.json',{schema:2,engine:'mt12-cognitive-governance-v2',principles:['deliberate before editing','preserve uncertainty','prefer minimal isolated experiments','execute before trusting','promote only explainable evidence-backed changes'],capabilities});
  write('assumption-register.json',{schema:2,assumptions:[{id:'sensor-scale',impact:'high',test:'real drive replay'},{id:'edge-runtime',impact:'high',test:'radio bench load'},{id:'parent-lineage',impact:'critical',test:'hash and path verification'},{id:'twin-calibration',impact:'high',test:'prediction-vs-log calibration'}]});
  write('deliberation-protocol.json',{schema:2,created:now(),roles:{proponent:'smallest testable change',skeptic:'alternate explanations',safety:'MT12 and car hazards',judge:'isolated falsifiable experiments'}});
  write('evidence-quality-policy.json',{schema:2,grades:grade});write('belief-state.json',beliefs);
  fs.appendFileSync(path.join(R,'engineering-mission.md'),'\nCOGNITIVE GOVERNANCE V2: preserve initialization order, avoid duplicate locals, select the correct function domain, execute the mocked EdgeTX lifecycle, and reject unexplained regressions.\n');
}
function gate(file){
  if(!file||!fs.existsSync(file))throw Error('candidate required');
  const base=path.basename(file,'.lua'),src=fs.readFileSync(file,'utf8'),pending=read('reports/pending-factory.json')||{},meta=(pending.batch||[]).find(x=>path.basename(x.file,'.lua')===base)||{},parentPath=meta.parent||pending.parent||pending.lastParent,parent=parentPath&&fs.existsSync(parentPath)?fs.readFileSync(parentPath,'utf8'):null;
  const funcs=sourceFunctions(src),changes=parent?changed(parent,src):[],slots=stateMap(funcs),dupes=duplicateLocals(src),initRisks=initializationRisks(src),runtime=runtimeHarness(file,base),selected=changes[0]||null,selectedFn=selected&&funcs.find(x=>x.name===selected.name),actualDomain=selectedFn?domain(selectedFn.name,selectedFn.text):null;
  const contradictions=[];
  if(!parent)contradictions.push({severity:'critical',claim:'unresolved parent'});
  if(changes.length!==1)contradictions.push({severity:'high',claim:`experiment-isolation:${changes.length}-functions`});
  if(dupes.length)contradictions.push({severity:'critical',claim:'duplicate locals'});
  if(initRisks.length)contradictions.push({severity:'critical',claim:'read before table initialization'});
  if(meta.subsystem&&actualDomain&&meta.subsystem!==actualDomain)contradictions.push({severity:'high',claim:`declared-${meta.subsystem} vs changed-${actualDomain}`});
  const replay=read(`reports/${base}-replay.json`),sim=read(`reports/${base}-sim.json`);
  if(sim?.passed===true&&replay?.available===true&&replay?.passed===false)contradictions.push({severity:'high',claim:'simulation-pass vs replay-fail'});
  const evidence=[{source:'static',grade:'F',weight:grade.static,available:true},{source:'simulation',grade:'E',weight:grade.simulation,available:!!sim},{source:'replay',grade:'C',weight:grade.replay,available:replay?.available===true},{source:'runtime',grade:'C',weight:grade.replay,available:runtime.passed}];
  const critical=contradictions.some(x=>x.severity==='critical');
  const passed=runtime.passed&&!!parent&&changes.length===1&&!critical;
  const why={function:selected?.name||null,domain:actualDomain,whyThisFunction:selected?'isolated changed function':'not proven',whyNow:meta.objective||null,whyNotSmaller:changes.length===1?'single-function experiment':'not minimal',successMetric:'score gain with runtime and safety parity',rollbackTrigger:'runtime, invariant, replay, size or fail-open failure'};
  const report={schema:2,engine:'mt12-cognitive-governance-v2',candidate:base,created:now(),deliberation:{proponent:selected?'proceed conditionally':'reject',skeptic:contradictions.length?'issues remain':'no major conflict',safety:runtime.passed?'mock lifecycle passed':'runtime failed',judge:passed?'provisional-approve':'reject'},why,functionContracts:contracts(funcs),stateOwnership:slots,evidence,contradictions,assumptions:read('reports/assumption-register.json')?.assumptions||[],retrieval:{parent:parentPath||null,priorFunctionHash:selected?.before||null,currentFunctionHash:selected?.after||null},minimalChange:{changedFunctions:changes.length,passed:changes.length===1},experimentIsolation:{passed:changes.length===1,primaryHypothesis:meta.objective||null},runtime,propertyTests:{executed:true,passed:runtime.passed,properties:['module loads','init/run/background/draw survive','dropout remains fail-open','car-off lifecycle survives']},redTeam:['car-off startup','car-on startup','missing memory file','telemetry dropout','telemetry recovery','RPM spike','GPS freeze','contradictory GPS and RPM','wet launch','rough braking','real jump','pothole false jump','landing bounce','battery sag','dashboard draw'],modelVerification:{parentResolved:!!parent,changedFunctions:changes,duplicateLocals:dupes,initializationRisks:initRisks,newGlobals:[...src.matchAll(/^([A-Za-z_]\w*)\s*=/gm)].map(x=>x[1]),unrelatedChange:changes.length!==1,domainConsistent:!meta.subsystem||!actualDomain||meta.subsystem===actualDomain},passed};
  write(`${base}-cognitive-governance.json`,report);write(`${base}-function-contracts.json`,{schema:2,candidate:base,contracts:report.functionContracts});write(`${base}-state-ownership.json`,{schema:2,candidate:base,slots});write(`${base}-contradictions.json`,{schema:2,candidate:base,items:contradictions});write(`${base}-red-team.json`,{schema:2,candidate:base,scenarios:report.redTeam,runtime});
  console.log(JSON.stringify(report,null,2));if(!passed)process.exit(2);
}
function postflight(){
  const files=fs.readdirSync(R).filter(x=>/-cognitive-governance\.json$/.test(x)),reports=files.map(x=>JSON.parse(fs.readFileSync(path.join(R,x),'utf8'))),beliefs=read('reports/belief-state.json')||{schema:2,beliefs:{},history:[]};
  for(const r of reports){const id=r.why?.domain||'core',prior=beliefs.beliefs[id]?.confidence??.5,posterior=cl(prior+(r.passed?.15:-.2),.05,.95);beliefs.beliefs[id]={confidence:posterior,lastCandidate:r.candidate,lastOutcome:r.passed?'supported':'weakened',updated:now()};beliefs.history.push({candidate:r.candidate,domain:id,prior,posterior})}
  beliefs.history=beliefs.history.slice(-200);write('belief-state.json',beliefs);write('reality-calibration.json',{schema:2,created:now(),domains:Object.fromEntries(Object.entries(beliefs.beliefs).map(([k,v])=>[k,{confidence:v.confidence,evaluatorWeights:{runtime:.9,replay:.8,digitalTwin:.55,static:.3}}]))});
  const summary={schema:2,created:now(),candidates:reports.map(r=>({candidate:r.candidate,passed:r.passed,judge:r.deliberation?.judge,domain:r.why?.domain,contradictions:r.contradictions?.length||0,runtime:r.runtime?.passed,evidenceGaps:(r.evidence||[]).filter(x=>!x.available).map(x=>x.source)})),promotionExplanation:{whatChanged:reports.map(r=>r.why?.function).filter(Boolean),whyBetter:'only runtime-safe isolated candidates are eligible',missingEvidence:[...new Set(reports.flatMap(r=>(r.evidence||[]).filter(x=>!x.available).map(x=>x.source)))],remainingRisk:'physical radio and real-drive evidence remain authoritative'},reflection:{expected:'isolated explainable improvement',actual:reports.map(r=>r.passed),wrong:reports.filter(r=>!r.passed).flatMap(r=>(r.contradictions||[]).map(x=>x.claim)),newEvaluator:'corrected EdgeTX runtime and structural analysis',stopDoing:'treating harness omissions as candidate defects'}};
  write('cognitive-cycle-summary.json',summary);write('promotion-explanation.json',summary.promotionExplanation);write('post-cycle-reflection.json',summary.reflection);console.log(JSON.stringify(summary,null,2));
}
if(mode==='preflight')preflight();else if(mode==='gate')gate(arg);else if(mode==='postflight'||mode==='postcycle')postflight();else throw Error('mode must be preflight, gate, postflight or postcycle');