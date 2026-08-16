/* Production 187 — Griffin DOM/SVG visibility renderer; independent of WebGL/canvas engine */
(()=>{
'use strict';
const LEGACY_CONTRACT={name:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',webglContextDoesNotSuppressSoftwareRig:true};
const state={ready:true,replay:97,frames:0,visibleFrames:0,mode:'DOM_SVG_2_5D',source:'LIVE REPORT: 3D ENGINE PATH STILL INVISIBLE; MOVE GRIFFIN OUTSIDE GPU/CANVAS STACK'};
const style=document.createElement('style');
style.textContent=`
#griffin-dom-187{position:fixed;left:42%;bottom:15%;width:clamp(128px,18vw,210px);height:auto;z-index:4;pointer-events:none;overflow:visible;filter:drop-shadow(0 15px 10px #0009);transform-origin:50% 100%;will-change:transform,opacity}
#griffin-dom-187 .aura{transform-origin:75px 118px;animation:g187aura 1.25s ease-in-out infinite alternate}
#griffin-dom-187 .body{transform-origin:75px 188px;animation:g187bob .82s ease-in-out infinite alternate}
#griffin-dom-187 .arm-r{transform-origin:91px 83px;animation:g187punch 1.65s ease-in-out infinite}
#griffin-dom-187 .arm-l{transform-origin:58px 84px;animation:g187guard 1.65s ease-in-out infinite}
#griffin-dom-187 .leg-l{transform-origin:68px 139px;animation:g187step .82s ease-in-out infinite alternate}
#griffin-dom-187 .leg-r{transform-origin:82px 139px;animation:g187step .82s ease-in-out infinite alternate-reverse}
body .hud{z-index:6!important}
@keyframes g187aura{from{opacity:.36;transform:scale(.94)}to{opacity:.72;transform:scale(1.06)}}
@keyframes g187bob{from{transform:translateY(0)}to{transform:translateY(-3px)}}
@keyframes g187punch{0%,55%,100%{transform:rotate(3deg)}72%{transform:rotate(-24deg) translate(16px,-4px)}}
@keyframes g187guard{0%,55%,100%{transform:rotate(-4deg)}72%{transform:rotate(14deg) translate(3px,-5px)}}
@keyframes g187step{from{transform:rotate(-2deg)}to{transform:rotate(3deg)}}
@media(max-width:720px){#griffin-dom-187{left:43%;bottom:17%;width:clamp(145px,34vw,190px)}}`;
document.head.appendChild(style);
const NS='http://www.w3.org/2000/svg';
const svg=document.createElementNS(NS,'svg');
svg.id='griffin-dom-187';svg.setAttribute('viewBox','0 0 150 220');svg.setAttribute('aria-label','Griffin fighter');
svg.innerHTML=`<defs>
<radialGradient id="g187Aura"><stop offset="0" stop-color="#e9fbff" stop-opacity=".36"/><stop offset=".42" stop-color="#59dfff" stop-opacity=".28"/><stop offset="1" stop-color="#159bff" stop-opacity="0"/></radialGradient>
<linearGradient id="g187Skin" x1="0" x2="1"><stop stop-color="#8b4f39"/><stop offset=".42" stop-color="#f1b08f"/><stop offset=".72" stop-color="#ffd4b7"/><stop offset="1" stop-color="#6f382b"/></linearGradient>
<linearGradient id="g187Blue" x1="0" x2="1"><stop stop-color="#102746"/><stop offset=".45" stop-color="#317bb5"/><stop offset=".72" stop-color="#4aa2dc"/><stop offset="1" stop-color="#0c1d36"/></linearGradient>
<linearGradient id="g187Dark" x1="0" x2="1"><stop stop-color="#09162a"/><stop offset=".5" stop-color="#244d7d"/><stop offset="1" stop-color="#07101f"/></linearGradient>
<linearGradient id="g187Orange" x1="0" x2="1"><stop stop-color="#8d2f13"/><stop offset=".5" stop-color="#ff8a35"/><stop offset="1" stop-color="#7d260e"/></linearGradient>
</defs>
<ellipse class="aura" cx="75" cy="116" rx="69" ry="101" fill="url(#g187Aura)"/>
<ellipse cx="75" cy="206" rx="42" ry="9" fill="#000" opacity=".42"/>
<g class="body">
<g class="leg-l"><path d="M70 137 C61 151 57 172 52 194" stroke="url(#g187Dark)" stroke-width="18" stroke-linecap="round"/><path d="M52 193 L40 204" stroke="#0b172b" stroke-width="13" stroke-linecap="round"/></g>
<g class="leg-r"><path d="M80 137 C90 153 94 173 99 194" stroke="url(#g187Dark)" stroke-width="18" stroke-linecap="round"/><path d="M99 193 L112 204" stroke="#0b172b" stroke-width="13" stroke-linecap="round"/></g>
<path d="M61 95 C58 112 61 132 68 145 L82 145 C90 129 92 109 88 94 Z" fill="url(#g187Blue)" stroke="#75c9f5" stroke-opacity=".18"/>
<path d="M57 82 C59 64 91 62 94 83 L88 112 C82 120 67 120 61 112 Z" fill="url(#g187Blue)"/>
<path d="M62 106 L88 106 L94 115 L56 115 Z" fill="url(#g187Orange)"/>
<g class="arm-l"><path d="M61 82 C46 87 41 100 37 117" stroke="url(#g187Skin)" stroke-width="13" stroke-linecap="round"/><path d="M37 117 L33 136" stroke="url(#g187Blue)" stroke-width="11" stroke-linecap="round"/><circle cx="32" cy="141" r="7" fill="url(#g187Skin)"/></g>
<g class="arm-r"><path d="M91 83 C106 89 111 101 116 115" stroke="url(#g187Skin)" stroke-width="13" stroke-linecap="round"/><path d="M116 115 L124 132" stroke="url(#g187Blue)" stroke-width="11" stroke-linecap="round"/><circle cx="127" cy="137" r="7" fill="url(#g187Skin)"/></g>
<path d="M61 60 C61 43 70 34 83 35 C98 37 103 51 97 66 C91 78 67 77 61 60Z" fill="url(#g187Skin)"/>
<path d="M58 45 L52 22 L67 34 L68 13 L80 32 L91 8 L93 35 L109 20 L101 50 C92 42 70 40 58 45Z" fill="#101827" stroke="#426084" stroke-width="1"/>
<path d="M70 58 Q75 54 80 58" stroke="#2b1a18" stroke-width="2" fill="none"/><path d="M84 57 Q89 53 94 57" stroke="#2b1a18" stroke-width="2" fill="none"/>
<ellipse cx="77" cy="59" rx="2.4" ry="1.2" fill="#dffaff"/><ellipse cx="91" cy="58" rx="2.4" ry="1.2" fill="#dffaff"/>
<path d="M80 69 Q86 72 92 68" stroke="#6b3026" stroke-width="2" fill="none"/>
<path d="M67 80 Q75 89 83 80" fill="#f1b08f" opacity=".55"/>
</g>`;
document.body.appendChild(svg);
function active(){
 const start=document.getElementById('start'),over=document.getElementById('over');
 const startOff=!start||start.hidden||getComputedStyle(start).display==='none';
 const overOff=!over||over.hidden||getComputedStyle(over).display==='none';
 return startOff&&overOff;
}
function frame(t){state.frames++;const on=active();svg.style.opacity=on?'1':'0';if(on){state.visibleFrames++;const mobile=innerWidth<720;const sway=Math.sin(t*.0013)*3;svg.style.transform=`translateX(${sway}px) perspective(600px) rotateY(${mobile?-7:-10}deg) rotateX(2deg)`;}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__griffinProduction187={state,legacyContract:LEGACY_CONTRACT,element:svg};
console.info('PRODUCTION_187_READY',state.mode,state.source,LEGACY_CONTRACT);
})();
