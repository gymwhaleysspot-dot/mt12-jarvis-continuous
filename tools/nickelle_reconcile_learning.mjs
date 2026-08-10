import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const [runIdRaw, dirRaw] = process.argv.slice(2);
if (!runIdRaw || !dirRaw) throw new Error('usage: nickelle_reconcile_learning.mjs RUN_ID ARTIFACT_DIR');
const runId = String(runIdRaw);
const dir = path.resolve(dirRaw);
const ledgerPath = 'nickelle/learning-ledger.json';
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
ledger.processedRuns ||= [];
if (ledger.processedRuns.some(x => String(typeof x === 'object' ? x.runId : x) === runId)) {
  console.log(JSON.stringify({runId, skipped:true, reason:'already processed'}));
  process.exit(0);
}
const find = name => {
  const direct = path.join(dir, name);
  if (fs.existsSync(direct)) return direct;
  const stack=[dir];
  while(stack.length){
    const d=stack.pop();
    for(const ent of fs.readdirSync(d,{withFileTypes:true})){
      const p=path.join(d,ent.name);
      if(ent.isDirectory()) stack.push(p);
      else if(ent.name===name) return p;
    }
  }
  return null;
};
const required=['michael-proposal.json','michael-verdict.json','michael-decision.json'];
const files=Object.fromEntries(required.map(n=>[n,find(n)]));
for(const n of required) if(!files[n]) throw new Error(`run ${runId}: missing ${n}`);
const run=(cmd,args,optional=false)=>{
  const r=spawnSync(cmd,args,{stdio:'inherit'});
  if(r.status!==0&&!optional) throw new Error(`${cmd} ${args.join(' ')} failed with ${r.status}`);
  return r.status===0;
};
run(process.execPath,['tools/nickelle_visual_ai.mjs','learn',files['michael-proposal.json'],files['michael-verdict.json'],files['michael-decision.json'],'nickelle/memory.json']);
const baseline=find('front.png') ? null : null;
const baseDir=find('michael-baseline');
const candDir=find('michael-candidate');
// Artifact directories are normally preserved by name; locate them by walking when needed.
function findDirNamed(name){const stack=[dir];while(stack.length){const d=stack.pop();if(path.basename(d)===name)return d;for(const ent of fs.readdirSync(d,{withFileTypes:true}))if(ent.isDirectory())stack.push(path.join(d,ent.name));}return null;}
const bdir=findDirNamed('michael-baseline'), cdir=findDirNamed('michael-candidate');
if(bdir&&cdir) run(process.execPath,['tools/nickelle_neural_vision.mjs','train',bdir,cdir,files['michael-verdict.json'],files['michael-decision.json'],'nickelle/neural-model.json'],true);
const analysis=find('nickelle-candidate-analysis.json'), temporal=find('nickelle-temporal.json');
const metrics=cdir?path.join(cdir,'metrics.json'):null;
if(analysis&&temporal&&metrics&&fs.existsSync(metrics)) run(process.execPath,['tools/nickelle_graphics_lab.mjs','learn',files['michael-proposal.json'],files['michael-verdict.json'],files['michael-decision.json'],analysis,temporal,metrics],true);
const decision=JSON.parse(fs.readFileSync(files['michael-decision.json'],'utf8'));
const verdict=JSON.parse(fs.readFileSync(files['michael-verdict.json'],'utf8'));
ledger.processedRuns.push({runId,at:new Date().toISOString(),promote:!!decision.promote,baselineScore:verdict.baselineScore??null,candidateScore:verdict.candidateScore??null});
ledger.processedRuns=ledger.processedRuns.slice(-200);
ledger.lastReconciledAt=new Date().toISOString();
ledger.lastProcessedRun=runId;
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({runId,reconciled:true,promote:!!decision.promote,baselineScore:verdict.baselineScore??null,candidateScore:verdict.candidateScore??null},null,2));
