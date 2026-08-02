#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return i<0?[x,true]:[x.slice(0,i),x.slice(i+1)]}));
const now=new Date();
const id=(args.id||`${now.toISOString().replace(/\D/g,'').slice(0,14)}-${crypto.randomBytes(3).toString('hex')}`).replace(/[^A-Za-z0-9._-]/g,'-');
const root=path.resolve(args.out||`dist-mission/${id}`);
const question=String(args.question||process.env.MISSION_QUESTION||'Find and improve the highest-value evidence-supported weakness');
const hypothesis=String(args.hypothesis||process.env.MISSION_HYPOTHESIS||'A bounded controller change can improve the target without protected-behavior regressions');
const selected=String(args.logs||process.env.MISSION_LOGS||'').split(/[\s,]+/).filter(Boolean);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const safeJson=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}};
const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const write=(n,v)=>fs.writeFileSync(path.join(root,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const run=(c,a,o={})=>execFileSync(c,a,{encoding:'utf8',maxBuffer:512*1024*1024,...o});
mkdir(root);

const allLogs=selected.length?selected:(fs.existsSync('tests/replays')?[...fs.readdirSync('tests/replays',{recursive:true})].map(x=>path.join('tests/replays',x)).filter(x=>x.toLowerCase().endsWith('.csv')&&fs.existsSync(x)):[]);
const labelsDir='evidence/labels';
const labels=fs.existsSync(labelsDir)?fs.readdirSync(labelsDir).filter(x=>x.endsWith('.json')).flatMap(x=>safeJson(path.join(labelsDir,x))||[]):[];
const logMeta=allLogs.map(p=>({path:p,sha256:sha(p),bytes:fs.statSync(p).size,role:/black|bb/i.test(p)?'blackbox':/bench/i.test(p)?'bench':/road/i.test(p)?'road':'radio',offsetMs:0}));

function parseCsv(text){const rows=[];let row=[],v='',q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&q&&n==='"'){v+='"';i++}else if(c==='"')q=!q;else if(c===','&&!q){row.push(v);v=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&n==='\n')i++;row.push(v);v='';if(row.some(Boolean))rows.push(row);row=[]}else v+=c}if(v||row.length){row.push(v);rows.push(row)}return rows}
const aliases={time:['time','timestamp','tick','frame'],speed:['speed','mph','gps','gspd'],rpm:['rpm'],throttle:['thr','throttle','tct'],steering:['steer','st'],tc:['tc','traction'],abs:['abs'],jump:['jump','air','airborne'],landing:['land'],drop:['drop','loss','failsafe'],slip:['slip'],gyro:['gyro','gyr']};
function findCol(head,names){const h=head.map(x=>String(x).toLowerCase());for(const n of names){const i=h.findIndex(x=>x===n||x.includes(n));if(i>=0)return i}return-1}
function analyzeLog(p){const rows=parseCsv(fs.readFileSync(p,'utf8'));const head=rows[0]||[],data=rows.slice(1);const cols=Object.fromEntries(Object.entries(aliases).map(([k,v])=>[k,findCol(head,v)]));const num=(r,k)=>{const i=cols[k];if(i<0)return NaN;const n=Number(r[i]);return Number.isFinite(n)?n:NaN};const events=[];let current=null;const classify=r=>{if(Math.abs(num(r,'jump'))>0.01)return'jump';if(Math.abs(num(r,'landing'))>0.01)return'landing';if(Math.abs(num(r,'abs'))>0.01)return'abs';if(Math.abs(num(r,'tc'))>0.01)return'tc';if(Math.abs(num(r,'drop'))>0.01)return'dropout';if(Number.isFinite(num(r,'speed'))&&Number.isFinite(num(r,'rpm'))&&num(r,'rpm')>1000&&num(r,'speed')<0.5)return'rpm-lag';return'calm'};for(let i=0;i<data.length;i++){const type=classify(data[i]);if(!current||current.type!==type){if(current)events.push(current);current={type,startFrame:i,endFrame:i,frames:1}}else{current.endFrame=i;current.frames++}}if(current)events.push(current);const sums={rows:data.length,columns:head.length};for(const k of Object.keys(cols)){const vals=data.map(r=>num(r,k)).filter(Number.isFinite);sums[k]={available:cols[k]>=0,count:vals.length,min:vals.length?Math.min(...vals):null,max:vals.length?Math.max(...vals):null,mean:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}}return{path:p,headers:head,columns:cols,summary:sums,events}}
const analyses=allLogs.map(analyzeLog);
const eventTypes=['launch','tc','abs','jump','landing','gps-loss','rpm-lag','dropout','corner-entry','corner-exit','calm'];
const events=analyses.flatMap(a=>a.events.map(e=>({...e,log:a.path}))).filter(e=>eventTypes.includes(e.type)||e.type==='calm');
const baseline={controller:'a17y.lua',sha256:fs.existsSync('a17y.lua')?sha('a17y.lua'):null,logs:analyses.map(a=>({path:a.path,summary:a.summary,eventCount:a.events.length})),eventCounts:Object.fromEntries(eventTypes.map(t=>[t,events.filter(e=>e.type===t).length])),fresh:true,generatedAt:now.toISOString()};

const counterfactuals=[
  {id:'gps-early',mutation:'remove GPS 500 ms before each observed loss',status:'planned'},
  {id:'rpm-freeze',mutation:'freeze RPM for bounded windows',status:'planned'},
  {id:'throttle-drop',mutation:'drop throttle for one frame',status:'planned'},
  {id:'short-jump',mutation:'shorten airborne evidence',status:'planned'},
  {id:'steered-landing',mutation:'inject steering during landing',status:'planned'},
  {id:'memory-corrupt',mutation:'load truncated and corrupt memory',status:'planned'}
];
const fuzz={seed:Number(args.seed||20260802),cases:Number(args.fuzz||10000),domains:['extreme-values','rapid-transitions','missing-fields','non-finite-substitutes','sensor-freezes','restart-sequences','low-speed-noise','high-speed-dropouts'],invariants:['no-crash','finite-gvars','car-off-safe','fail-open','protected-channel-map'],status:'planned'};
const memoryCompatibility={cases:['empty','current-schema','older-schema','truncated','corrupt-row','oversized-values','partial-write','repeated-load-save'],required:true,status:'planned'};
const protectedTests=['TCT=1024 pass-through','CH15 TCT preserved','CH16 GYR preserved','car-off safe','no static brake','dropout fail-open','dashboard contract','io.read(fileHandle,...)','memory schema compatibility'];
const tournamentProfiles=['conservative','performance','learning','memory-efficient','alternative-algorithm'];
const candidates=tournamentProfiles.map((profile,i)=>({id:`${id}-c${i+1}`,profile,status:'QUEUED',mission:`${question}. Strategy: ${profile}`,metrics:{},artifacts:[]}));
const releaseStages=['GENERATED','STATIC_CHECKED','COMPILED','NORMALIZED','SIMULATION_PASSED','LOG_REPLAY_PASSED','ADVERSARIAL_REVIEW_PASSED','MT12_BENCH_PASSED','ROAD_TESTED','TRUSTED_RELEASE'];
const releaseLadder=releaseStages.map((stage,i)=>({stage,passed:i===0,evidence:i===0?[`mission:${id}`]:[]}));
const mission={id,question,hypothesis,createdAt:now.toISOString(),updatedAt:now.toISOString(),stage:'GENERATED',hardwareFingerprint:{radio:'RadioMaster MT12',edgeTx:args.edgeTx||'unknown',elrs:args.elrs||'unknown',modelYamlSha256:args.yml&&fs.existsSync(args.yml)?sha(args.yml):'',luaSha256:baseline.sha256||'',luacSha256:'',vehicle:args.vehicle||'MJX Hyper Go 7303',gearing:args.gearing||'unknown',tires:args.tires||'stock/unknown',battery:args.battery||'unknown',surface:args.surface||'unknown',weather:args.weather||'unknown',driver:args.driver||'Michael'},evidence:{logs:logMeta,labels,research:[],bench:[],road:[]},baseline,events,counterfactuals,fuzz,candidates,adversarialReview:{status:'QUEUED',checks:['overfit','hidden-regression','unreachable-protection','false-confidence','sensor-state-gaps','memory-risk','dashboard-breakage','persistence-breakage']},memoryCompatibility,runtimeProfile:{radioCertificateRequired:true,metrics:['free-before-load','after-init','after-car-connect','after-memory-load','event-peak','logging-peak','ten-minute-memory','gc-pressure','average-frame-time','worst-frame-time','allocations-per-frame'],status:'AWAITING_BENCH'},driverPreference:{smoothVsAggressive:args.feel||'balanced',earlyVsLate:'balanced',launch:'strong-smooth',landing:'soft-stable'},surfaceProfile:{requested:args.surface||'auto-cluster',clusters:[]},calibration:{watch:['rpm-to-mph','gps-lag','rpm-lag','tire-diameter','battery-sag','steering-center','dropout-rate'],status:'MONITOR'},protectedTests,releaseLadder,rollback:{recommended:false,reason:'No road comparison yet'},notifications:[],audit:{claimsMustLinkMetrics:true,offlineQueueSupported:true,retention:{trusted:'permanent',rejected:'keep-reason',intermediateDays:90}}};
write('MISSION.json',mission);write('BASELINE.json',baseline);write('EVENTS.json',events);write('TOURNAMENT.json',{mission:id,candidates});write('COUNTERFACTUALS.json',counterfactuals);write('FUZZ-PLAN.json',fuzz);write('MEMORY-COMPATIBILITY.json',memoryCompatibility);write('PROTECTED-TESTS.json',protectedTests);write('RELEASE-LADDER.json',releaseLadder);
const benchPackage={mission:id,required:[...runtimeProfileMetrics(),...protectedTests],files:['normalized .luac','matching source','matching YML','hash manifest','rollback build'],instructions:['Car off load','Car on initialization','Saved-memory load','Logging stress','TC/ABS event','Jump/landing event','Ten-minute soak']};
function runtimeProfileMetrics(){return mission.runtimeProfile.metrics}
write('BENCH-PACKAGE.json',benchPackage);
write('RELEASE-NOTES.md',`# Mission ${id}\n\n## Question\n${question}\n\n## Hypothesis\n${hypothesis}\n\n## Evidence\n${logMeta.length} logs, ${labels.length} human labels, ${events.length} detected event windows.\n\n## Current authority\nGENERATED. No performance claim is trusted until linked replay, bench, and road evidence passes.\n`);
write('AUDIT-EXPORT.json',{mission,analyses,generatedAt:now.toISOString(),sourceHashes:{missionEngine:sha(new URL(import.meta.url).pathname)}});
console.log(JSON.stringify({id,root,logs:logMeta.length,events:events.length,candidates:candidates.length,stage:mission.stage},null,2));
