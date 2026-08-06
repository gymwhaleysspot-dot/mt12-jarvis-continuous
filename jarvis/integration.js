import{state,subscribe}from'./state.js';

const REPO='gymwhaleysspot-dot/mt12-jarvis-continuous';
let scheduled=false;

function workflowPath(name){return `.github/workflows/${name}`}
function activeWorkflows(){return new Set((state.workflows||[]).filter(w=>w.state==='active').map(w=>w.path))}
function missionMap(){return new Map((state.capabilities?.missions||[]).map(m=>[m.id,m]))}

function ensureEvidence(){
  if(location.hash!=='#evidence'&&state.workspace!=='evidence')return;
  const body=document.querySelector('#workspaceBody');
  if(!body||body.querySelector('#eosPick'))return;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function validateControls(){
  const active=activeWorkflows(),missions=missionMap();
  document.querySelectorAll('[data-run]').forEach(button=>{
    const mission=missions.get(button.dataset.run);
    const valid=mission&&active.has(workflowPath(mission.workflow));
    if(valid){
      button.disabled=false;
      button.removeAttribute('aria-disabled');
      button.title=`Run ${mission.label}`;
    }else{
      button.disabled=true;
      button.setAttribute('aria-disabled','true');
      button.title=mission?`Workflow unavailable: ${mission.workflow}`:'Mission is not registered';
      if(!button.textContent.includes('UNAVAILABLE'))button.textContent='UNAVAILABLE';
    }
  });
  document.querySelectorAll('[data-openwf]').forEach(button=>{
    const name=button.dataset.openwf;
    const valid=active.has(workflowPath(name));
    button.disabled=!valid;
    button.setAttribute('aria-disabled',String(!valid));
    button.title=valid?`Open ${name} workflow history`:`Workflow unavailable: ${name}`;
  });
}

function reportWiring(){
  const box=document.querySelector('#globalError');
  if(!box||state.loading)return;
  const active=activeWorkflows();
  const missingMissions=(state.capabilities?.missions||[]).filter(m=>!active.has(workflowPath(m.workflow)));
  const missingData=(state.capabilities?.dataSources||[]).filter(d=>state.data[d.path]==null);
  const critical=[];
  if(!state.capabilities)critical.push('capabilities unavailable');
  if(missingMissions.length)critical.push(`${missingMissions.length} operation${missingMissions.length===1?'':'s'} unavailable`);
  if(missingData.length)critical.push(`${missingData.length} data source${missingData.length===1?'':'s'} unavailable`);
  if(critical.length&&!state.error){
    box.textContent=`Wiring status: ${critical.join(' · ')}. Dead controls are disabled instead of failing silently.`;
  }
}

function installHistoryLinks(){
  document.querySelectorAll('[data-openwf]:not([data-integration-wired])').forEach(button=>{
    button.dataset.integrationWired='1';
    button.addEventListener('click',event=>{
      if(button.disabled)return;
      event.preventDefault();
      const workflow=encodeURIComponent(button.dataset.openwf);
      window.open(`https://github.com/${REPO}/actions/workflows/${workflow}`,'_blank','noopener');
    },true);
  });
}

function reconcile(){
  scheduled=false;
  ensureEvidence();
  validateControls();
  installHistoryLinks();
  reportWiring();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(reconcile)}

subscribe(schedule);
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
new MutationObserver(mutations=>{
  if(mutations.some(m=>m.target.closest?.('#workspaceBody,#sideNav,#mobileNav')||m.target.id==='workspaceBody'))schedule();
}).observe(document.body,{childList:true,subtree:true});
schedule();
