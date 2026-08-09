import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const identity=JSON.parse(fs.readFileSync('nickelle/identity.json','utf8'));
const memoryPath='nickelle/memory.json',heavyMemoryPath='nickelle/heavy-memory.json';
const readMemory=()=>JSON.parse(fs.readFileSync(memoryPath,'utf8'));
const readHeavy=()=>fs.existsSync(heavyMemoryPath)?JSON.parse(fs.readFileSync(heavyMemoryPath,'utf8')):null;
const run=(tool,args,out)=>{const r=spawnSync(process.execPath,[tool,...args],{encoding:'utf8'});if(r.status!==0)throw Error(`${tool} failed: ${r.stderr||r.stdout}`);return JSON.parse(fs.readFileSync(out,'utf8'))};
const runInternal=(args,out)=>run('tools/michael_internal_vision.mjs',args,out);
const runNeural=(args,out)=>run('tools/nickelle_neural_vision.mjs',args,out);
const dirKey=(k,v)=>{const old=genome.parameters[k];if(!Number.isFinite(old)||!Number.isFinite(v)||v===old)return`${k}:0`;return`${k}:${v>old?'+':'-'}`};
const clampHistory=h=>h.slice(-60);

function propose(renderDir,out){
  const sensor='/tmp/nickelle-internal-proposal.json',neuralOut='/tmp/nickelle-neural-predict.json';
  const base=runInternal(['propose',renderDir,sensor],sensor),mem=readMemory(),heavy=readHeavy();let neural=null;try{neural=runNeural(['predict',renderDir,neuralOut],neuralOut)}catch{}
  const cand={...(base.candidateParameters||{})},notes=[...(base.diagnosis||[])],hv=heavy?.last||null;
  if(hv){notes.push(`Heavy Vision: SegFormer-B5 + Depth Anything V2 confidence ${(100*(hv.confidence||0)).toFixed(1)}%, multiview consistency ${(100*(hv.summary?.consistency||0)).toFixed(1)}%.`)}
  for(const [k,v] of Object.entries(cand)){if(!Number.isFinite(genome.parameters[k])||!Number.isFinite(v))continue;const key=dirKey(k,v),st=mem.parameterDirections[key];if(st&&st.attempts>=2&&st.losses>st.wins&&st.averageGain<-.15){const old=genome.parameters[k],factor=st.losses>=4?.20:.45;cand[k]=Math.round((old+(v-old)*factor)*10000)/10000;notes.push(`Nickelle memory damped ${key}; repeated losses (${st.losses}) with average gain ${st.averageGain.toFixed(3)}.`)}}
  const ranked=Object.entries(base.subsystemScores||{}).map(([k,v])=>{const m=mem.subsystems[k]||{priority:1,confidence:.5};let heavyFactor=1;if(hv&&(k==='sideSilhouette'||k==='threeSilhouette'))heavyFactor+=Math.max(0,1-(hv.summary?.consistency||0))*.65;if(hv&&k==='edgeDetail'&&(hv.summary?.depthEdge||0)<.025)heavyFactor+=.18;return{k,score:v,need:(100-v)*(m.priority||1)*(0.65+0.35*(m.confidence??.5))*heavyFactor}}).sort((a,b)=>b.need-a.need);
  const result={...base,candidateParameters:cand,diagnosis:notes,nickelle:{name:identity.name,version:identity.version,primary:true,weakest:ranked.slice(0,5),learnedDirections:Object.keys(mem.parameterDirections).length,cycles:mem.cycles,heavyVision:hv?{confidence:hv.confidence,summary:hv.summary,segmentationModel:hv.segmentationModel,depthModel:hv.depthModel}:null,neuralVision:neural?{scores:neural.scores,confidence:neural.confidence,samples:neural.samples}:null},rationale:[...(base.rationale||[]),'Nickelle selected/damped mutations using persistent win-loss memory and subsystem priorities.','Heavy Vision supplies pretrained transformer segmentation/depth evidence from the latest champion scan.','Neural Vision observes raw five-view pixels and gains decision authority only as training confidence increases.']};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}

function compare(baseDir,candDir,proposalPath,out){
  const sensor='/tmp/nickelle-internal-verdict.json',neuralOut='/tmp/nickelle-neural-verdict.json';
  const iv=runInternal(['compare',baseDir,candDir,sensor],sensor),mem=readMemory(),heavy=readHeavy(),proposal=JSON.parse(fs.readFileSync(proposalPath,'utf8'));let nv=null;try{nv=runNeural(['compare',baseDir,candDir,neuralOut],neuralOut)}catch{}
  const ivGain=(iv.candidateScore??0)-(iv.baselineScore??0),reg=[...(iv.regressions||[])],bp=iv.baseline?.parts||{},cp=iv.candidate?.parts||{};
  for(const k of Object.keys(bp))if(Number.isFinite(cp[k])&&cp[k]<bp[k]-6&&!reg.some(x=>x.includes(k)))reg.push(`${k} regressed ${bp[k]} -> ${cp[k]}`);
  const authority=nv&&nv.samples>=6?Math.min(.35,(nv.confidence||0)*.4):0,neuralGain=nv?.gain??ivGain,blendedGain=ivGain*(1-authority)+neuralGain*authority,threshold=Math.max(1,genome.minimumPromotionGain||1.5);
  const promote=ivGain>0&&blendedGain>=threshold&&!reg.length&&(iv.confidence??0)>=.55;
  const result={...iv,promote,regressions:reg,reason:`Nickelle fused verdict: internal gain ${ivGain.toFixed(3)}, neural gain ${neuralGain.toFixed(3)}, neural authority ${(authority*100).toFixed(1)}%, fused gain ${blendedGain.toFixed(3)}, threshold ${threshold.toFixed(2)}.`,nickelle:{name:identity.name,primary:true,proposalParameters:proposal.candidateParameters||{},memoryCycles:mem.cycles,heavyVision:heavy?.last||null,neuralVision:nv,neuralAuthority:authority,blendedGain}};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}

function learn(proposalPath,verdictPath,decisionPath,out=memoryPath){
  const mem=readMemory(),p=JSON.parse(fs.readFileSync(proposalPath,'utf8')),v=JSON.parse(fs.readFileSync(verdictPath,'utf8')),d=JSON.parse(fs.readFileSync(decisionPath,'utf8')),promote=!!d.promote,gain=(v.candidateScore??0)-(v.baselineScore??0);mem.cycles=(mem.cycles||0)+1;mem.lastRun=new Date().toISOString();mem.lastScore=v.candidateScore??null;mem.lastDecision=promote?'PROMOTE':'REJECT';if(promote){mem.accepted=(mem.accepted||0)+1;mem.generation=(mem.generation||0)+1;mem.championScore=v.candidateScore}else mem.rejected=(mem.rejected||0)+1;
  for(const [k,val] of Object.entries(p.candidateParameters||{})){if(!Number.isFinite(genome.parameters[k])||!Number.isFinite(val)||val===genome.parameters[k])continue;const key=dirKey(k,val),s=mem.parameterDirections[key]||{attempts:0,wins:0,losses:0,totalGain:0,averageGain:0};s.attempts++;if(promote)s.wins++;else s.losses++;s.totalGain+=gain;s.averageGain=s.totalGain/s.attempts;s.lastGain=gain;s.lastDecision=promote?'PROMOTE':'REJECT';mem.parameterDirections[key]=s}
  const bp=v.baseline?.parts||{},cp=v.candidate?.parts||{};for(const k of Object.keys(mem.subsystems||{})){const s=mem.subsystems[k];if(Number.isFinite(bp[k])&&Number.isFinite(cp[k])){const delta=cp[k]-bp[k];if(delta>1)s.wins++;else if(delta<-1)s.losses++;s.confidence=Math.max(.2,Math.min(.98,.5+(s.wins-s.losses)*.035));s.priority=Math.max(.55,Math.min(1.8,1+(100-cp[k])/180+(s.losses-s.wins)*.025))}}
  for(const line of p.diagnosis||[])if(/native renderer authority|native geometry|no wheel-size authority/i.test(line)&&!mem.nativeEscalations.includes(line))mem.nativeEscalations.push(line);mem.nativeEscalations=mem.nativeEscalations.slice(-20);mem.history=clampHistory([...(mem.history||[]),{at:mem.lastRun,promote,gain,baseline:v.baselineScore,candidate:v.candidateScore,parameters:p.candidateParameters||{},regressions:v.regressions||[],heavy:v.nickelle?.heavyVision||null,neural:v.nickelle?.neuralVision||null,decisionReasons:d.reasons||d.reason||null}]);fs.writeFileSync(out,JSON.stringify(mem,null,2)+'\n');console.log(JSON.stringify({nickelle:'learned',cycles:mem.cycles,promote,gain,accepted:mem.accepted,rejected:mem.rejected},null,2));
}

const [mode,...a]=process.argv.slice(2);if(mode==='propose')propose(a[0],a[1]||'/tmp/michael-proposal.json');else if(mode==='compare')compare(a[0],a[1],a[2],a[3]||'/tmp/michael-verdict.json');else if(mode==='learn')learn(a[0],a[1],a[2],a[3]||memoryPath);else throw Error('usage: nickelle_visual_ai.mjs propose RENDERS OUT | compare BASE CAND PROPOSAL OUT | learn PROPOSAL VERDICT DECISION [OUT]');
