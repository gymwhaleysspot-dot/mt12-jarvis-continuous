import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const registry=read('jarvis/system-registry.json');
const truth=read('truth/truth.json');
const twin=read('michael/digital-twin.json');
const reconstruction=fs.existsSync('nickelle/reconstruction.json')?read('nickelle/reconstruction.json'):null;
const runtime=fs.readFileSync('jarvis/mjx7303-racing-michael-v39.js','utf8');
const graphics=fs.readFileSync('jarvis/michael-graphics-v40.js','utf8');
const c3=fs.readFileSync('jarvis/michael-c3-v66.js','utf8');

const checks={
  steeringSign:/lat=clamp\(\(p\?\.x\|\|0\)\*1\.55/.test(runtime),
  chaseCamera:/function chaseRoad/.test(runtime),
  v40:/michael-graphics-v40\.js/.test(runtime),
  truthProtected:truth?.rules?.generatedEvidenceMayOverwriteOwnerTruth===false,
  semanticTwin:Object.keys(twin.parts||{}).length>=16,
  reconstruction:!!reconstruction,
  nativeWheelGuard:/installMichaelC3V66/.test(graphics)&&/existingRunningGearPreserved:true/.test(c3)&&/adds NO body, window, lamp, wheel/.test(c3)
};
const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const now=new Date().toISOString();
registry.health={status:failed.length?'DEGRADED':'HEALTHY',lastAudit:now,lastRepair:registry.health?.lastRepair||null,failed};
registry.causalGraph=registry.causalGraph||{nodes:[],edges:[]};
registry.causalGraph.nodes=(registry.causalGraph.nodes||[]).slice(-99);
registry.causalGraph.nodes.push({id:`audit:${now}`,type:'system_audit',status:registry.health.status,failed});
write('jarvis/system-registry.json',registry);
write('/tmp/jarvis-supervisor.json',{at:now,status:registry.health.status,checks,failed,truthAuthority:truth.name,reconstructionConfidence:reconstruction?.confidence||0});
console.log(JSON.stringify({status:registry.health.status,checks,failed},null,2));
if(failed.length)process.exitCode=2;
