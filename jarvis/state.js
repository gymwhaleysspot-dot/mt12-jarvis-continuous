import{GitHubAPI as api}from'./api.js';
const fixedPaths=[
  'factory/memory/episodes.json','factory/memory/historical-log-index.json',
  'public/jarvis-data/knowledge-graph.json','public/jarvis-data/summary.json','public/jarvis-data/active-mission.json',
  'public/evidence-data/sync.json','research/current.json','research/questions.json','public/builds/index.json',
  'public/device-data/releases.json','public/builds/releases/jrw6d/MANIFEST.json'
];
const listeners=new Set();
export const state={capabilities:null,data:{},runs:[],rewriteRuns:[],workflows:[],releases:[],connected:false,user:null,rate:null,loading:false,error:null,updatedAt:null,workspace:'command',generations:[],canonical:null,selectedGeneration:null};
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function emit(){for(const fn of listeners)fn(state)}
export function setWorkspace(id){state.workspace=id;location.hash=id;emit()}
export function selectGeneration(mission){state.selectedGeneration=mission;emit()}
function missionForRun(run){return`rewrite-${run.id}-${run.run_attempt||1}`}
async function loadGeneration(run){
  const mission=missionForRun(run),base=`public/builds/${mission}/`;
  const [tournament,manifest]=await Promise.all([api.optionalFile(base+'TOURNAMENT.json'),api.optionalFile(base+'BUILD-MANIFEST.json')]);
  if(!tournament&&!manifest)return null;
  const winner=tournament?.candidates?.find(c=>c.candidate===tournament.winner)||null;
  return{mission,runId:run.id,runNumber:Number(run.run_number||0),attempt:run.run_attempt||1,status:run.status,conclusion:run.conclusion,createdAt:run.created_at,updatedAt:run.updated_at,headSha:run.head_sha,htmlUrl:run.html_url,base,tournament,manifest,winner};
}
async function discoverGenerations(rewriteRuns){
  const eligible=rewriteRuns.filter(r=>r.status==='completed'&&r.conclusion==='success').slice(0,6);
  const results=await Promise.allSettled(eligible.map(loadGeneration));
  return results.map(x=>x.status==='fulfilled'?x.value:null).filter(Boolean).sort((a,b)=>b.runNumber-a.runNumber||b.runId-a.runId);
}
function deriveCanonical(){
  const manifest=state.data['public/builds/releases/jrw6d/MANIFEST.json'];
  if(manifest)return{...manifest,name:manifest.release||'jrw6d',base:'public/builds/releases/jrw6d/'};
  const parent=state.generations[0]?.tournament?.parent;
  return parent?{name:parent,release:parent,authority:'CANONICAL_PARENT',normalizedBytes:null,base:`public/builds/releases/${parent}/`}:null;
}
export async function refresh(){
  state.loading=true;state.error=null;emit();
  try{
    state.capabilities=await fetch('jarvis/capabilities.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(`Capabilities ${r.status}`);return r.json()});
    const calls=[api.runs(100),api.workflowRuns('jarvis-complete-rewrite-factory.yml',12),api.workflows(),api.releases(),api.user(),api.rate(),...fixedPaths.map(p=>api.optionalFile(p))];
    const settled=await Promise.allSettled(calls),[runs,rewriteRuns,workflows,releases,user,rate,...files]=settled;
    state.runs=runs.value?.workflow_runs||[];state.rewriteRuns=rewriteRuns.value?.workflow_runs||[];state.workflows=workflows.value?.workflows||[];state.releases=releases.value||[];
    state.user=user.status==='fulfilled'?user.value:null;state.rate=rate.status==='fulfilled'?rate.value:null;state.connected=!!state.user;
    fixedPaths.forEach((p,i)=>state.data[p]=files[i]?.status==='fulfilled'?files[i].value:null);
    state.generations=await discoverGenerations(state.rewriteRuns);state.canonical=deriveCanonical();
    if(!state.selectedGeneration||!state.generations.some(g=>g.mission===state.selectedGeneration))state.selectedGeneration=state.generations[0]?.mission||null;
    state.updatedAt=new Date().toISOString();
  }catch(error){state.error=error.message;state.connected=false}
  finally{state.loading=false;emit()}
}
export async function runMission(id,inputs={}){const mission=state.capabilities?.missions?.find(x=>x.id===id);if(!mission)throw Error('Unknown mission');if(!state.workflows.some(w=>w.path===`.github/workflows/${mission.workflow}`))throw Error(`Workflow is not active: ${mission.workflow}`);await api.dispatch(mission.workflow,{...mission.inputs,...inputs});await refresh();return mission}
export async function syncMT12(inputs={}){const workflow='mt12-sync.yml';if(!state.workflows.some(w=>w.path===`.github/workflows/${workflow}`))throw Error('Jarvis MT12 Sync workflow is not active.');await api.dispatch(workflow,{include_radio_logs:'true',include_blackbox:'true',backup_first:'true',start_learning:'true',...inputs});await refresh();return true}
export function latestGeneration(){return state.generations[0]||null}
export function selectedGeneration(){return state.generations.find(g=>g.mission===state.selectedGeneration)||latestGeneration()}
export function producerState(){const active=state.rewriteRuns.find(r=>['queued','in_progress','waiting','pending'].includes(r.status)),latest=state.rewriteRuns[0];return active?{state:'RUNNING',run:active}:{state:latest?.conclusion==='success'?'READY':'ATTENTION',run:latest||null}}
export function metrics(){const d=state.data,graph=d['public/jarvis-data/knowledge-graph.json']||{},summary=d['public/jarvis-data/summary.json']||{},episodes=d['factory/memory/episodes.json']||{},logs=d['factory/memory/historical-log-index.json']||{},builds=d['public/builds/index.json']||{},latest=latestGeneration(),winner=latest?.winner;return{facts:summary.evidenceFacts??summary.facts??0,nodes:graph.nodes?.length??graph.nodeCount??0,edges:graph.edges?.length??graph.edgeCount??0,episodes:episodes.episodes?.length??episodes.count??0,logs:logs.logs?.length??logs.uniqueLogs??0,uniqueBuilds:builds.uniqueBuilds??builds.builds?.length??0,duplicates:builds.duplicatesRejected??0,recommended:builds.recommended??null,canonical:state.canonical?.name||'—',latestRun:latest?.runNumber||null,winner:winner?.candidate||latest?.tournament?.winner||'—',winnerBytes:winner?.normalizedBytes||null,generations:state.generations.length}}
export function health(){const p=producerState(),catalog=state.data['public/device-data/releases.json'],index=state.data['public/builds/index.json'],sync=state.data['public/evidence-data/sync.json'];return{github:state.connected?'connected':'public-read',producer:p.state,scheduler:state.runs.some(r=>r.name==='Jarvis Always-On Orchestrator'&&['queued','in_progress'].includes(r.status))?'running':'ready',firmware:catalog?.edgeTx?.stable&&catalog?.expressLrs?.stable?'ready':'unknown',evolution:index?'ready':'unknown',sync:sync?.state||'unknown'}}
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(state.capabilities?.workspaces?.some(x=>x.id===id)){state.workspace=id;emit()}});
