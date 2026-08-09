import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const exists=p=>fs.existsSync(p);
const genome=read('michael/visual/genome.json');
const truth=read('truth/truth.json');
const rec=exists('nickelle/reconstruction.json')?read('nickelle/reconstruction.json'):{confidence:0};
const temporal=exists('/tmp/nickelle-temporal.json')?read('/tmp/nickelle-temporal.json'):null;
const candidate=exists('/tmp/michael-decision.json')?read('/tmp/michael-decision.json'):null;
const runtime=fs.readFileSync('jarvis/mjx7303-racing-michael-v39.js','utf8');
const protectedChecks={
  steering:/lat=clamp\(\(p\?\.x\|\|0\)\*1\.55/.test(runtime),
  chase:/function chaseRoad/.test(runtime),
  ownerTruth:truth.rules.generatedEvidenceMayOverwriteOwnerTruth===false,
  reconstruction:rec.confidence>=.45
};
let jsOK=true;try{const r=spawnSync(process.execPath,['--check','jarvis/mjx7303-racing-michael-v39.js'],{encoding:'utf8'});jsOK=r.status===0}catch{jsOK=false}
protectedChecks.javascript=jsOK;
const frame=Number(temporal?.frameMs||temporal?.meanFrameMs||0);
const performanceOK=!frame||frame<=20;
const candidateOK=!candidate||candidate.promote!==false;
const pass=Object.values(protectedChecks).every(Boolean)&&performanceOK&&candidateOK;
const report={schema:1,engine:'JARVIS_PROVING_GROUND_V1',at:new Date().toISOString(),pass,protectedChecks,performance:{frameMs:frame,budgetMs:20,ok:performanceOK},candidateGate:candidateOK,genomeGeneration:genome.generation||0,reconstructionConfidence:rec.confidence||0};
fs.writeFileSync('/tmp/jarvis-proving-ground.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!pass)process.exitCode=3;
