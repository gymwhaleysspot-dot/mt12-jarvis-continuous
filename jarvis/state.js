import{GitHubAPI as api}from'./api.js';
const fixedPaths=[
 'factory/canonical-controller.json','public/builds/index.json','public/jarvis-data/active-mission.json',
 'public/jarvis-data/knowledge-graph.json','public/jarvis-data/summary.json','public/jarvis-data/experiment-plan.json',
 'public/evidence-data/sync.json','factory/memory/historical-log-index.json','factory/memory/episodes.json',
 'factory/memory/planner-history.json','public/device-data/releases.json','research/current.json','research/questions.json'
];
const listeners=new Set();
export const state={capabilities:null,data:{},runs:[],rewriteRuns:[],workflows:[],releases:[],connected:false,user:null,rate:null,loading:false,error:null,updatedAt:null,workspace:'command',generations:[],canonical:null,selectedGeneration:null};
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function emit(){for(const fn of listeners)fn(state)}
export function setWorkspace(id){state.workspace=id;location.hash=id;emit()}
export function selectGeneration(id){state.selectedGeneration=id;emit()}
const missionForRun=r=>`rewrite-${r.id}-${r.run_attempt||1}`;
async function loadCanonical(){
 const authority=state.data['factory/canonical-controller.json'];if(!authority?.release)return null;
 const name=authority.release,base=`public/builds/releases/${name}/`,manifest=await api.optionalFile(base+'MANIFEST.json');
 return{...authority,...(manifest||{}),name,base,lineageFloor:authority.lineageFloor||[],manifest};
}
async function loadGeneration(run){
 const mission=missionForRun(run),base=`public/builds/${mission}/`;
 const[tournament,manifest]=await Promise.all([api.optionalFile(base+'TOURNAMENT.json'),api.optionalFile(base+'BUILD-MANIFEST.json')]);
 if(!tournament&&!manifest)return null;
 const candidates=tournament?.candidates||[];const winner=candidates.find(c=>c.candidate===tournament?.winner)||null;
 const synthesis=candidates.find(c=>c.profile==='synthesis'||c.candidate==='jrw6')||null;
 return{mission,runId:run.id,runNumber:Number(run.run_number||0),attempt:run.run_attempt||1,status:run.status,conclusion:run.conclusion,createdAt:run.created_at,updatedAt:run.updated_at,headSha:run.head_sha,htmlUrl:run.html_url,base,tournament,manifest,candidates,winner,synthesis};
}
async function discoverGenerations(runs){
 const eligible=runs.filter(r=>r.status==='completed'&&r.conclusion==='success').slice(0,20);
 const out=await Promise.allSettled(eligible.map(loadGeneration));
 return out.map(x=>x.status==='fulfilled'?x.value:null).filter(Boolean).sort((a,b)=>b.runNumber-a.runNumber||b.runId-a.runId);
}
export async function refresh(){
 state.loading=true;state.error=null;emit();
 try{
  state.capabilities=await fetch('jarvis/capabilities.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(`Capabilities ${r.status}`);return r.json()});
  const calls=[api.runs(100),api.workflowRuns('jarvis-complete-rewrite-factory.yml',30),api.workflows(),api.releases(),api.user(),api.rate(),...fixedPaths.map(p=>api.optionalFile(p))];
  const s=await Promise.allSettled(calls),[runs,rewriteRuns,workflows,releases,user,rate,...files]=s;
  state.runs=runs.value?.workflow_runs||[];state.rewriteRuns=rewriteRuns.value?.workflow_runs||[];state.workflows=workflows.value?.workflows||[];state.releases=releases.value||[];
  state.user=user.status==='fulfilled'?user.value:null;state.rate=rate.status==='fulfilled'?rate.value:null;state.connected=!!state.user;
  fixedPaths.forEach((p,i)=>state.data[p]=files[i]?.status==='fulfilled'?files[i].value:null);
  state.generations=await discoverGenerations(state.rewriteRuns);state.canonical=await loadCanonical();
  if(!state.selectedGeneration||!state.generations.some(g=>g.mission===state.selectedGeneration))state.selectedGeneration=state.generations[0]?.mission||null;
  state.updatedAt=new Date().toISOString();
 }catch(e){state.error=e.message;state.connected=false}finally{state.loading=false;emit()}
}
export function latestGeneration(){return state.generations[0]||null}
export function selectedGeneration(){return state.generations.find(g=>g.mission===state.selectedGeneration)||latestGeneration()}
export function producerState(){const active=state.rewriteRuns.find(r=>['queued','in_progress','waiting','pending'].includes(r.status)),latest=state.rewriteRuns[0];return active?{state:'RUNNING',run:active}:{state:latest?.conclusion==='success'?'READY':'ATTENTION',run:latest||null}}
export function planner(){return state.data['public/jarvis-data/experiment-plan.json']||{}}
export function evidence(){return{sync:state.data['public/evidence-data/sync.json']||{},logs:state.data['factory/memory/historical-log-index.json']||{},episodes:state.data['factory/memory/episodes.json']||{}}}
export function intelligence(){return{graph:state.data['public/jarvis-data/knowledge-graph.json']||{},summary:state.data['public/jarvis-data/summary.json']||{},plan:planner(),history:state.data['factory/memory/planner-history.json']||{}}}
export function hypothesisMap(g=selectedGeneration()){
 const fallback={jrw1:'sensor-dropout-recovery',jrw2:'traction-control',jrw3:'jump-landing-classification',jrw4:'truth-speed-fusion',jrw5:'abs-control',jrw6:'synthesis'};
 return(g?.candidates||[]).map(c=>({...c,hypothesis:c.hypothesisArea||fallback[c.candidate]||c.profile,buildName:`${String(c.candidate||'').toUpperCase()}-${g.runNumber}`}));
}
export function metrics(){const i=intelligence(),e=evidence(),g=latestGeneration(),w=g?.winner,s=g?.synthesis,b=state.data['public/builds/index.json']||{};return{canonical:state.canonical?.name||'—',latestRun:g?.runNumber||null,winner:w?.candidate||g?.tournament?.winner||'—',synthesis:s?.candidate||'—',winnerBytes:w?.normalizedBytes||null,generations:state.generations.length,facts:i.summary.evidenceFacts??i.summary.facts??0,nodes:i.graph.nodes?.length??i.graph.nodeCount??0,edges:i.graph.edges?.length??i.graph.edgeCount??0,logs:e.logs.logs?.length??e.logs.uniqueLogs??0,episodes:e.episodes.episodes?.length??e.episodes.count??0,uniqueBuilds:b.uniqueBuilds??b.builds?.length??0,duplicates:b.duplicatesRejected??0}}
export function health(){const p=producerState(),latest=latestGeneration();return{producer:p.state,scheduler:state.runs.some(r=>r.name==='Jarvis Always-On Orchestrator'&&['queued','in_progress'].includes(r.status))?'RUNNING':'READY',generation:latest?.conclusion==='success'?'PUBLISHED':'UNKNOWN',github:state.connected?'CONNECTED':'PUBLIC',pages:state.runs.some(r=>r.name==='pages build and deployment'&&r.conclusion==='success')?'READY':'UNKNOWN'}}
export async function runMission(id,inputs={}){const m=state.capabilities?.missions?.find(x=>x.id===id);if(!m)throw Error('Unknown mission');if(!state.workflows.some(w=>w.path===`.github/workflows/${m.workflow}`))throw Error(`Workflow is not active: ${m.workflow}`);await api.dispatch(m.workflow,{...m.inputs,...inputs});await refresh();return m}
export async function syncMT12(inputs={}){const workflow='mt12-sync.yml';if(!state.workflows.some(w=>w.path===`.github/workflows/${workflow}`))throw Error('Jarvis MT12 Sync workflow is not active.');await api.dispatch(workflow,{include_radio_logs:'true',include_blackbox:'true',backup_first:'true',start_learning:'true',...inputs});await refresh();return true}
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(state.capabilities?.workspaces?.some(x=>x.id===id)){state.workspace=id;emit()}});
