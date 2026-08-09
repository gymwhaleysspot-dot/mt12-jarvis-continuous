import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const identity=JSON.parse(fs.readFileSync('nickelle/identity.json','utf8'));
const memoryPath='nickelle/memory.json';
const readMemory=()=>JSON.parse(fs.readFileSync(memoryPath,'utf8'));
const runInternal=(args,out)=>{const r=spawnSync(process.execPath,['tools/michael_internal_vision.mjs',...args],{encoding:'utf8'});if(r.status!==0)throw Error(`Internal Vision failed: ${r.stderr||r.stdout}`);const text=fs.readFileSync(out,'utf8');return JSON.parse(text)};
const dirKey=(k,v)=>{const old=genome.parameters[k];if(!Number.isFinite(old)||!Number.isFinite(v)||v===old)return`${k}:0`;return`${k}:${v>old?'+':'-'}`};
const clampHistory=h=>h.slice(-60);

function propose(renderDir,out){
  const sensor='/tmp/nickelle-internal-proposal.json';
  const base=runInternal(['propose',renderDir,sensor],sensor),mem=readMemory();
  const cand={...(base.candidateParameters||{})},notes=[...(base.diagnosis||[])];
  for(const [k,v] of Object.entries(cand)){
    if(!Number.isFinite(genome.parameters[k])||!Number.isFinite(v))continue;
    const key=dirKey(k,v),st=mem.parameterDirections[key];
    if(st&&st.attempts>=2&&st.losses>st.wins&&st.averageGain<-.15){
      const old=genome.parameters[k],factor=st.losses>=4?.20:.45;
      cand[k]=Math.round((old+(v-old)*factor)*10000)/10000;
      notes.push(`Nickelle memory damped ${key}; repeated losses (${st.losses}) with average gain ${st.averageGain.toFixed(3)}.`);
    }
  }
  const ranked=Object.entries(base.subsystemScores||{}).map(([k,v])=>{const m=mem.subsystems[k]||{priority:1,confidence:.5};return{k,score:v,need:(100-v)*(m.priority||1)*(0.65+0.35*(m.confidence??.5))}}).sort((a,b)=>b.need-a.need);
  const result={...base,candidateParameters:cand,diagnosis:notes,nickelle:{name:identity.name,version:identity.version,primary:true,weakest:ranked.slice(0,5),learnedDirections:Object.keys(mem.parameterDirections).length,cycles:mem.cycles},rationale:[...(base.rationale||[]),'Nickelle selected/damped mutations using persistent win-loss memory and subsystem priorities.']};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}

function compare(baseDir,candDir,proposalPath,out){
  const sensor='/tmp/nickelle-internal-verdict.json';
  const iv=runInternal(['compare',baseDir,candDir,sensor],sensor),mem=readMemory(),proposal=JSON.parse(fs.readFileSync(proposalPath,'utf8'));
  const gain=(iv.candidateScore??0)-(iv.baselineScore??0),reg=[...(iv.regressions||[])];
  const bp=iv.baseline?.parts||{},cp=iv.candidate?.parts||{};
  for(const k of Object.keys(bp))if(Number.isFinite(cp[k])&&cp[k]<bp[k]-6&&!reg.some(x=>x.includes(k)))reg.push(`${k} regressed ${bp[k]} -> ${cp[k]}`);
  const threshold=Math.max(1,genome.minimumPromotionGain||1.5);
  const promote=gain>=threshold&&!reg.length&&(iv.confidence??0)>=.55;
  const result={...iv,promote,regressions:reg,reason:`Nickelle visual verdict: gain ${gain.toFixed(3)}, threshold ${threshold.toFixed(2)}, confidence ${(iv.confidence??0).toFixed(3)}.`,nickelle:{name:identity.name,primary:true,proposalParameters:proposal.candidateParameters||{},memoryCycles:mem.cycles}};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}

function learn(proposalPath,verdictPath,decisionPath,out=memoryPath){
  const mem=readMemory(),p=JSON.parse(fs.readFileSync(proposalPath,'utf8')),v=JSON.parse(fs.readFileSync(verdictPath,'utf8')),d=JSON.parse(fs.readFileSync(decisionPath,'utf8'));
  const promote=!!d.promote,gain=(v.candidateScore??0)-(v.baselineScore??0);mem.cycles=(mem.cycles||0)+1;mem.lastRun=new Date().toISOString();mem.lastScore=v.candidateScore??null;mem.lastDecision=promote?'PROMOTE':'REJECT';if(promote){mem.accepted=(mem.accepted||0)+1;mem.generation=(mem.generation||0)+1;mem.championScore=v.candidateScore}else mem.rejected=(mem.rejected||0)+1;
  for(const [k,val] of Object.entries(p.candidateParameters||{})){if(!Number.isFinite(genome.parameters[k])||!Number.isFinite(val)||val===genome.parameters[k])continue;const key=dirKey(k,val),s=mem.parameterDirections[key]||{attempts:0,wins:0,losses:0,totalGain:0,averageGain:0};s.attempts++;if(promote)s.wins++;else s.losses++;s.totalGain+=gain;s.averageGain=s.totalGain/s.attempts;s.lastGain=gain;s.lastDecision=promote?'PROMOTE':'REJECT';mem.parameterDirections[key]=s}
  const bp=v.baseline?.parts||{},cp=v.candidate?.parts||{};for(const k of Object.keys(mem.subsystems||{})){const s=mem.subsystems[k];if(Number.isFinite(bp[k])&&Number.isFinite(cp[k])){const delta=cp[k]-bp[k];if(delta>1)s.wins++;else if(delta<-1)s.losses++;s.confidence=Math.max(.2,Math.min(.98,.5+(s.wins-s.losses)*.035));s.priority=Math.max(.55,Math.min(1.8,1+(100-cp[k])/180+(s.losses-s.wins)*.025))}}
  for(const line of p.diagnosis||[])if(/native renderer authority|native geometry|no wheel-size authority/i.test(line)&&!mem.nativeEscalations.includes(line))mem.nativeEscalations.push(line);mem.nativeEscalations=mem.nativeEscalations.slice(-20);
  mem.history=clampHistory([...(mem.history||[]),{at:mem.lastRun,promote,gain,baseline:v.baselineScore,candidate:v.candidateScore,parameters:p.candidateParameters||{},regressions:v.regressions||[],decisionReasons:d.reasons||d.reason||null}]);
  fs.writeFileSync(out,JSON.stringify(mem,null,2)+'\n');console.log(JSON.stringify({nickelle:'learned',cycles:mem.cycles,promote,gain,accepted:mem.accepted,rejected:mem.rejected},null,2));
}

const [mode,...a]=process.argv.slice(2);
if(mode==='propose')propose(a[0],a[1]||'/tmp/michael-proposal.json');
else if(mode==='compare')compare(a[0],a[1],a[2],a[3]||'/tmp/michael-verdict.json');
else if(mode==='learn')learn(a[0],a[1],a[2],a[3]||memoryPath);
else throw Error('usage: nickelle_visual_ai.mjs propose RENDERS OUT | compare BASE CAND PROPOSAL OUT | learn PROPOSAL VERDICT DECISION [OUT]');
