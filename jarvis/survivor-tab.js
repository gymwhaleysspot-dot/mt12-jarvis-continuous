(()=>{'use strict';
const H='survivor',GRAPHICS_VERSION=3,CACHE='20260819scratch300graphics3fix1',SRC=`survivor.html?v=${CACHE}`;let observer,timer;
if(!document.querySelector('link[data-survivor-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href=`jarvis/survivor-tab.css?v=${CACHE}`;link.dataset.survivorStyle='1';document.head.append(link)}
const active=()=>location.hash.slice(1)===H;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`};
const FORM_COLORS=['#70eaff','#ffe35f','#ffcc45','#ffae38','#71fff0','#8cffb5','#d06fff','#83b5ff','#f4f7ff','#dce9ff','#ffffff'];
const RIVAL_COLORS={LIRA:'#ff58d0',KAIROX:'#ff784d',SOLENNE:'#ffd65e',MIREYA:'#bb7cff',ZEPHYRA:'#72d8ff',ORUN:'#76fff0',MORDREN:'#8f75ff',SABLE:'#ff82ac',KRAKEN:'#54a9ff'};
function stopGraphics(){const f=document.querySelector('.survivor-frame');if(f?.__survivorGraphicsTimer){clearInterval(f.__survivorGraphicsTimer);f.__survivorGraphicsTimer=0}}
function applyGraphics(frame){
 try{
  const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w)return;
  d.documentElement.dataset.survivorGraphics=GRAPHICS_VERSION;
  let style=d.getElementById('survivor-cinematic-graphics-v3');
  if(!style){style=d.createElement('style');style.id='survivor-cinematic-graphics-v3';style.textContent=`
:root{--heroAura:rgba(112,234,255,.2);--rivalAura:rgba(255,88,208,.18);--stageAccent:#65eaff;--glass:rgba(3,10,22,.72)}
html,body{background:#01030a!important}body{isolation:isolate}canvas{position:relative;z-index:0;filter:saturate(1.34) contrast(1.12) brightness(1.04);transform:scale(1.014);transform-origin:50% 52%;image-rendering:auto}
body:before{content:"";position:fixed;inset:-8%;z-index:1;pointer-events:none;background:radial-gradient(circle at 27% 68%,var(--heroAura) 0,transparent 24%),radial-gradient(circle at 73% 68%,var(--rivalAura) 0,transparent 24%),linear-gradient(180deg,rgba(120,205,255,.05),transparent 34%,rgba(0,0,0,.08) 72%,rgba(0,0,0,.34));mix-blend-mode:screen;animation:survivorAuraPulse 2.8s ease-in-out infinite alternate}
body:after{content:"";position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at center,transparent 43%,rgba(0,3,12,.24) 72%,rgba(0,0,0,.58) 100%),linear-gradient(90deg,rgba(88,225,255,.05),transparent 18%,transparent 82%,rgba(255,84,205,.05));box-shadow:inset 0 0 95px rgba(0,0,0,.48)}
.hud{z-index:3}.top b{font-weight:950!important;text-shadow:0 0 10px currentColor,0 2px 5px #000}.top small,.line{letter-spacing:.08em}.clock,.status,.caption{background:linear-gradient(180deg,rgba(9,25,40,.82),rgba(2,8,18,.76))!important;backdrop-filter:blur(12px) saturate(1.25);-webkit-backdrop-filter:blur(12px) saturate(1.25);box-shadow:0 8px 26px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.07)}
.clock{border-color:rgba(101,234,255,.58)!important;box-shadow:0 0 22px rgba(101,234,255,.18),inset 0 1px rgba(255,255,255,.08);border-color:color-mix(in srgb,var(--stageAccent) 58%,transparent)!important;box-shadow:0 0 22px color-mix(in srgb,var(--stageAccent) 18%,transparent),inset 0 1px rgba(255,255,255,.08)}
.bars{gap:12px!important}.bar{height:9px!important;border-color:rgba(255,255,255,.19)!important;background:rgba(0,0,0,.58)!important;box-shadow:inset 0 1px 4px #000,0 1px rgba(255,255,255,.05)}.bar i{box-shadow:0 0 12px currentColor;transition:width .12s linear}.meter{height:5px!important;margin-top:4px!important}.caption{border-color:rgba(101,234,255,.55)!important;border-left-color:var(--stageAccent)!important;border-color:color-mix(in srgb,var(--stageAccent) 55%,transparent)!important}.caption.show{transform:translateX(-50%) translateY(-3px);box-shadow:0 12px 34px #0009,0 0 24px rgba(101,234,255,.18);box-shadow:0 12px 34px #0009,0 0 24px color-mix(in srgb,var(--stageAccent) 18%,transparent)}
.screen{background:radial-gradient(circle at 50% 32%,rgba(37,94,137,.76),rgba(2,5,14,.96) 65%)!important;backdrop-filter:blur(5px)}.panel{padding:clamp(20px,5vw,44px);border:1px solid rgba(113,235,255,.22);border-radius:24px;background:linear-gradient(160deg,rgba(7,22,39,.76),rgba(3,8,18,.62));box-shadow:0 28px 90px #000b,inset 0 1px rgba(255,255,255,.08)}.panel h1{letter-spacing:-.045em;text-shadow:0 0 34px rgba(101,234,255,.18)}
.buttons button,.screen button{box-shadow:0 7px 20px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.09)!important}.buttons button:active,.screen button:active{transform:translateY(1px)}
html[data-form="6"] body:before,html[data-form="7"] body:before,html[data-form="8"] body:before,html[data-form="9"] body:before,html[data-form="10"] body:before{animation-duration:1.45s;filter:saturate(1.25) brightness(1.1)}
@keyframes survivorAuraPulse{from{opacity:.68;transform:scale(.99)}to{opacity:1;transform:scale(1.025)}}
@media(max-width:600px){canvas{transform:scale(1.01)}.bar{height:8px!important}.panel{border-radius:18px;padding:20px 14px}.status{font-size:7px!important}}
`;d.head.append(style)}
  const sync=()=>{if(!frame.isConnected||!active()){clearInterval(frame.__survivorGraphicsTimer);frame.__survivorGraphicsTimer=0;return}try{const s=w.JarvisSurvivor?.getState?.();if(!s)return;const hc=FORM_COLORS[s.form]||FORM_COLORS[0],rc=RIVAL_COLORS[s.opponent]||'#ff58d0';d.documentElement.dataset.form=String(s.form);d.documentElement.dataset.stage=String(s.stage);d.documentElement.style.setProperty('--heroAura',rgba(hc,s.form>=6?.29:.2));d.documentElement.style.setProperty('--rivalAura',rgba(rc,.19));d.documentElement.style.setProperty('--stageAccent',rc)}catch{}};
  sync();clearInterval(frame.__survivorGraphicsTimer);frame.__survivorGraphicsTimer=setInterval(sync,180);
 }catch{}
}
function mount(){
 document.body.classList.toggle('survivor-active',active());if(!active()){stopGraphics();return}
 const body=document.getElementById('workspaceBody');if(!body)return;
 document.getElementById('workspaceTitle').textContent='JARVIS // CORE SURVIVOR';
 document.getElementById('workspaceDescription').textContent='Cinematic sprite combat with adaptive AI, enhanced arena depth, aura lighting, impact grading and tournament-scale presentation.';
 document.getElementById('workspaceKicker').textContent='CINEMATIC PROTOCOL // FIGHT · ADAPT · ASCEND';
 document.getElementById('heroFacts').innerHTML='';
 const frame=body.querySelector('.survivor-frame');if(frame?.src.includes(CACHE)){applyGraphics(frame);return}
 body.innerHTML=`<section class="survivor-card graphics-v3"><div class="survivor-load">Initializing cinematic Survivor graphics…</div><iframe class="survivor-frame" src="${SRC}" title="Jarvis Core Survivor" allow="autoplay; fullscreen" loading="eager"></iframe></section>`;
 const load=body.querySelector('.survivor-load'),f=body.querySelector('iframe');f.addEventListener('load',()=>{load.hidden=true;applyGraphics(f)},{once:true});clearTimeout(timer);timer=setTimeout(()=>{if(load)load.textContent='Still loading high-detail fighter atlases…'},8000);
}
function watch(){observer?.disconnect();const body=document.getElementById('workspaceBody');if(body){observer=new MutationObserver(()=>active()&&!body.querySelector('.survivor-frame')&&queueMicrotask(mount));observer.observe(body,{childList:true})}}
addEventListener('hashchange',()=>queueMicrotask(mount));addEventListener('pageshow',()=>{watch();mount()});if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>{watch();mount()},{once:true});else{watch();mount()}
})();
