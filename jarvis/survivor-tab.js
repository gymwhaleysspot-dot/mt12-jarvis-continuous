(()=>{'use strict';
const H='survivor',SRC='survivor.html?v=20260819scratch300';let observer,timer;
if(!document.querySelector('link[data-survivor-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='jarvis/survivor-tab.css?v=20260819scratch300';link.dataset.survivorStyle='1';document.head.append(link)}
const active=()=>location.hash.slice(1)===H;
function mount(){
 document.body.classList.toggle('survivor-active',active());if(!active())return;
 const body=document.getElementById('workspaceBody');if(!body)return;
 document.getElementById('workspaceTitle').textContent='JARVIS // CORE SURVIVOR';
 document.getElementById('workspaceDescription').textContent='Griffin climbs a nine-round ascension tournament through one canonical Survivor runtime.';
 document.getElementById('workspaceKicker').textContent='ARCADE PROTOCOL // FIGHT · ADAPT · ASCEND';
 document.getElementById('heroFacts').innerHTML='';
 const frame=body.querySelector('.survivor-frame');if(frame?.src.includes('20260819scratch300'))return;
 body.innerHTML=`<section class="survivor-card"><div class="survivor-load">Initializing Core Survivor…</div><iframe class="survivor-frame" src="${SRC}" title="Jarvis Core Survivor" allow="autoplay; fullscreen" loading="eager"></iframe></section>`;
 const load=body.querySelector('.survivor-load'),f=body.querySelector('iframe');f.addEventListener('load',()=>load.hidden=true,{once:true});clearTimeout(timer);timer=setTimeout(()=>{if(load)load.textContent='Still loading game systems…'},8000);
}
function watch(){observer?.disconnect();const body=document.getElementById('workspaceBody');if(body){observer=new MutationObserver(()=>active()&&!body.querySelector('.survivor-frame')&&queueMicrotask(mount));observer.observe(body,{childList:true})}}
addEventListener('hashchange',()=>queueMicrotask(mount));addEventListener('pageshow',()=>{watch();mount()});if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>{watch();mount()},{once:true});else{watch();mount()}
})();
