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
  if(desc)desc.textContent='Need-for-Speed-style progression with Jarvis mobile node-beam deformation and mechanical damage.';
  if(kicker)kicker.textContent='JARVIS // STREET RACING V2';
  if(facts)facts.innerHTML='<div><span>Physics</span><b>NODE-BEAM V2</b></div><div><span>Racers</span><b>6</b></div><div><span>Progression</span><b>GARAGE + TUNING</b></div><div><span>Input</span><b>TOUCH + KEYS</b></div>';
  if(!body.querySelector('.racing-frame'))body.innerHTML='<section class="racing-card"><iframe class="racing-frame" src="racing-v2.html" title="Jarvis Racing V2" allow="fullscreen" loading="eager"></iframe></section>';
}
addEventListener('hashchange',()=>setTimeout(apply));
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(apply);
})();
