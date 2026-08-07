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
  if(desc)desc.textContent='Need-for-Speed-style progression built around a full Jarvis node-beam vehicle dynamics core with soft-body crash damage.';
  if(kicker)kicker.textContent='JARVIS // STREET RACING V3';
  if(facts)facts.innerHTML='<div><span>Physics</span><b>NODE-BEAM V3</b></div><div><span>Vehicle</span><b>24 NODES + BREAKABLE BEAMS</b></div><div><span>Systems</span><b>TIRES / SUSPENSION / DRIVETRAIN</b></div><div><span>Input</span><b>TOUCH + KEYS</b></div>';
  if(!body.querySelector('.racing-frame'))body.innerHTML='<section class="racing-card"><iframe class="racing-frame" src="racing-v3.html" title="Jarvis Racing V3" allow="fullscreen" loading="eager"></iframe></section>';
}
addEventListener('hashchange',()=>setTimeout(apply));
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(apply);
})();
