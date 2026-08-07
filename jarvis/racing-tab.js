(()=>{
'use strict';
function apply(){
  if(location.hash.replace(/^#/,'')!=='racing')return;
  const body=document.getElementById('workspaceBody');
  if(!body)return;
  const title=document.getElementById('workspaceTitle');
  const desc=document.getElementById('workspaceDescription');
  const kicker=document.getElementById('workspaceKicker');
  const facts=document.getElementById('heroFacts');
  if(title)title.textContent='Racing';
  if(desc)desc.textContent='A playable Jarvis arcade racing circuit built directly into the workstation.';
  if(kicker)kicker.textContent='JARVIS // RACING SIMULATION';
  if(facts)facts.innerHTML='<div><span>Mode</span><b>NIGHT RUN</b></div><div><span>Racers</span><b>6</b></div><div><span>Laps</span><b>3</b></div><div><span>Input</span><b>TOUCH + KEYS</b></div>';
  if(!body.querySelector('.racing-frame'))body.innerHTML='<section class="racing-card"><iframe class="racing-frame" src="racing.html" title="Jarvis Racing" allow="fullscreen" loading="eager"></iframe></section>';
}
addEventListener('hashchange',()=>setTimeout(apply));
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(apply);
})();
