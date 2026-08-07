(()=>{
'use strict';
const RACING_HASH='racing';
const FRAME_SRC='racing-v2.html?v=20260807b';
let bodyObserver=null,loadTimer=0;
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function setHTML(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html}
function racingActive(){return location.hash.replace(/^#/,'')===RACING_HASH}
function mount(){
  if(!racingActive())return;
  const body=document.getElementById('workspaceBody');
  if(!body)return;
  setText(document.getElementById('workspaceTitle'),'Racing');
  setText(document.getElementById('workspaceDescription'),'Need-for-Speed-style progression with Jarvis mobile node-beam deformation and mechanical damage.');
  setText(document.getElementById('workspaceKicker'),'JARVIS // STREET RACING V2');
  setHTML(document.getElementById('heroFacts'),'<div><span>Physics</span><b>NODE-BEAM V2</b></div><div><span>Racers</span><b>6</b></div><div><span>Progression</span><b>GARAGE + TUNING</b></div><div><span>Input</span><b>TOUCH + KEYS</b></div>');
  if(body.querySelector('.racing-frame'))return;
  body.innerHTML='<section class="racing-card"><div class="racing-load" role="status">Loading Jarvis Racing…</div><iframe class="racing-frame" src="'+FRAME_SRC+'" title="Jarvis Racing V2" allow="fullscreen" loading="eager"></iframe><div class="racing-error" hidden>Racing did not finish loading. <a href="racing-v2.html" target="_blank" rel="noopener">Open Racing directly</a></div></section>';
  const frame=body.querySelector('.racing-frame'),status=body.querySelector('.racing-load'),err=body.querySelector('.racing-error');
  clearTimeout(loadTimer);
  frame.addEventListener('load',()=>{clearTimeout(loadTimer);if(status)status.hidden=true;if(err)err.hidden=true},{once:true});
  frame.addEventListener('error',()=>{clearTimeout(loadTimer);if(status)status.hidden=true;if(err)err.hidden=false},{once:true});
  loadTimer=setTimeout(()=>{if(!frame.contentWindow){if(status)status.hidden=true;if(err)err.hidden=false}},9000);
}
function observeBody(){
  const body=document.getElementById('workspaceBody');
  if(!body)return;
  if(bodyObserver)bodyObserver.disconnect();
  bodyObserver=new MutationObserver(()=>{if(racingActive()&&!body.querySelector('.racing-frame'))queueMicrotask(mount)});
  bodyObserver.observe(body,{childList:true});
}
addEventListener('hashchange',()=>{queueMicrotask(mount)});
addEventListener('pageshow',()=>{observeBody();mount()});
if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>{observeBody();mount()},{once:true});else{observeBody();mount()}
})();
