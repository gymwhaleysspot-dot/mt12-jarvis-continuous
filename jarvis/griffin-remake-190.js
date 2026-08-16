/* Production 190 — Griffin cinematic anime-fighter remake.
   Original character presentation informed by high-speed aerial martial-arts game principles;
   no Dragon Ball character assets are copied. */
(()=>{'use strict';
const S={version:190,ready:true,mode:'CINEMATIC_ANIME_SKELETAL',design:'original Griffin',principles:['strong silhouette','readable face','spiked transformation hair','layered cel rim','aura staging','anticipation-impact-recovery','vanish motion','camera-readable supers']};
const css=document.createElement('style');css.textContent=`
#griffin-dom-188{display:none!important}
#griffin190{position:fixed;left:41%;bottom:11%;width:clamp(190px,27vw,330px);height:auto;z-index:5;pointer-events:none;overflow:visible;transform-origin:50% 88%;filter:drop-shadow(0 24px 18px #000b);will-change:transform,filter}
#griffin190 .aura{transform-origin:160px 205px;animation:g190a .55s ease-in-out infinite alternate}
#griffin190 .fighter{transform-origin:160px 360px;animation:g190idle 1.05s cubic-bezier(.4,0,.6,1) infinite alternate}
#griffin190 .hair-rim{animation:g190hair .34s ease-in-out infinite alternate}
#griffin190 .fist{transform-origin:230px 190px;animation:g190guard 1.25s ease-in-out infinite alternate}
#griffin190.power .aura{animation-duration:.12s;filter:brightness(1.8)}
#griffin190.attack .fighter{animation:g190strike .32s cubic-bezier(.12,.75,.2,1)}
@keyframes g190a{from{opacity:.25;transform:scale(.91)}to{opacity:.74;transform:scale(1.08)}}
@keyframes g190idle{from{transform:translateY(2px) rotate(-.35deg)}to{transform:translateY(-5px) rotate(.35deg)}}
@keyframes g190hair{from{opacity:.25}to{opacity:.8}}
@keyframes g190guard{from{transform:rotate(0)}to{transform:rotate(-5deg) translate(-2px,-3px)}}
@keyframes g190strike{0%{transform:translateX(0) rotate(0)}35%{transform:translateX(-16px) rotate(-4deg)}65%{transform:translateX(40px) rotate(7deg) scale(1.035)}100%{transform:translateX(0) rotate(0)}}
@media(max-width:720px){#griffin190{left:35%;bottom:12%;width:clamp(205px,56vw,285px)}}`;document.head.appendChild(css);
const NS='http://www.w3.org/2000/svg',v=document.createElementNS(NS,'svg');v.id='griffin190';v.setAttribute('viewBox','0 0 320 420');v.setAttribute('aria-label','Griffin original cinematic fighter');
v.innerHTML=`<defs>
<radialGradient id="g190Aura"><stop stop-color="#fff" stop-opacity=".72"/><stop offset=".18" stop-color="#9df7ff" stop-opacity=".55"/><stop offset=".48" stop-color="#27cfff" stop-opacity=".24"/><stop offset=".78" stop-color="#3265ff" stop-opacity=".09"/><stop offset="1" stop-color="#1740ff" stop-opacity="0"/></radialGradient>
<linearGradient id="g190Skin" x1="0" x2="1"><stop stop-color="#6b352d"/><stop offset=".2" stop-color="#b96850"/><stop offset=".48" stop-color="#efae88"/><stop offset=".68" stop-color="#ffd0a7"/><stop offset="1" stop-color="#67322d"/></linearGradient>
<linearGradient id="g190Suit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020816"/><stop offset=".23" stop-color="#092c50"/><stop offset=".5" stop-color="#0c76a8"/><stop offset=".72" stop-color="#084064"/><stop offset="1" stop-color="#010510"/></linearGradient>
<linearGradient id="g190Hair" x1="0" x2="1"><stop stop-color="#02030a"/><stop offset=".42" stop-color="#0b1729"/><stop offset=".68" stop-color="#284c70"/><stop offset=".86" stop-color="#5aa5c7"/><stop offset="1" stop-color="#050711"/></linearGradient>
<linearGradient id="g190Boot"><stop stop-color="#01030a"/><stop offset=".6" stop-color="#112b49"/><stop offset="1" stop-color="#02050c"/></linearGradient>
<filter id="g190Blur"><feGaussianBlur stdDeviation="8"/></filter><filter id="g190Glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
<ellipse class="aura" cx="160" cy="208" rx="145" ry="198" fill="url(#g190Aura)"/><path class="hair-rim" d="M91 120L65 53l42 35L99 28l38 50 25-73 15 72 48-56-22 75 48-27-35 69z" fill="#63e9ff" opacity=".25" filter="url(#g190Glow)"/><ellipse cx="161" cy="389" rx="83" ry="15" fill="#000" opacity=".52" filter="url(#g190Blur)"/>
<g class="fighter">
<!-- back leg --> <path d="M143 278 C117 306 108 345 104 379" stroke="url(#g190Suit)" stroke-width="39" stroke-linecap="round"/><path d="M104 377 C88 386 72 392 56 394" stroke="url(#g190Boot)" stroke-width="27" stroke-linecap="round"/>
<!-- front leg --> <path d="M178 276 C205 307 215 344 224 375" stroke="url(#g190Suit)" stroke-width="41" stroke-linecap="round"/><path d="M224 374 C240 383 255 389 274 389" stroke="url(#g190Boot)" stroke-width="28" stroke-linecap="round"/>
<!-- torso broad shoulders narrow waist --> <path d="M103 169 C108 136 128 123 159 122 C194 122 217 141 222 174 L205 272 C195 291 126 291 112 270Z" fill="url(#g190Suit)" stroke="#72eaff" stroke-opacity=".34" stroke-width="2"/><path d="M108 171 Q160 200 216 166 L208 201 Q160 222 105 198Z" fill="#020a16" opacity=".72"/><path d="M111 258 Q160 274 207 257 L218 280 Q160 300 99 278Z" fill="#f27821"/><path d="M126 184 L159 207 197 180 190 243 133 243Z" fill="#0784ba" opacity=".62"/><path d="M133 188 L158 208 M196 187 L164 209" stroke="#a3f5ff" stroke-opacity=".4" stroke-width="3"/>
<!-- rear arm --> <path d="M109 165 C76 177 62 207 57 238" stroke="url(#g190Skin)" stroke-width="29" stroke-linecap="round"/><path d="M57 237 C53 258 56 278 65 295" stroke="url(#g190Suit)" stroke-width="24" stroke-linecap="round"/><path d="M64 293 C57 303 61 317 74 320 C88 322 97 307 87 296Z" fill="url(#g190Skin)"/>
<!-- forward arm/fist --> <path d="M213 164 C244 176 258 198 265 224" stroke="url(#g190Skin)" stroke-width="30" stroke-linecap="round"/><g class="fist"><path d="M263 220 C272 241 274 260 272 278" stroke="url(#g190Suit)" stroke-width="25" stroke-linecap="round"/><path d="M264 273 C259 287 268 300 282 299 C298 298 302 281 290 271Z" fill="url(#g190Skin)"/><path d="M270 282 l20 -5 M269 288 l19 -4" stroke="#754238" stroke-width="2" opacity=".6"/></g>
<!-- neck --> <path d="M140 139 L143 113 L180 113 L184 141Z" fill="url(#g190Skin)"/>
<!-- angular face --> <path d="M112 91 C108 48 130 28 161 29 C197 29 220 57 207 96 C199 123 177 139 158 139 C137 138 116 120 112 91Z" fill="url(#g190Skin)" stroke="#45231f" stroke-width="2"/>
<ellipse cx="111" cy="89" rx="9" ry="15" fill="#a65d4a"/><ellipse cx="208" cy="89" rx="9" ry="15" fill="#965142"/>
<!-- original transformation hair silhouette --> <path d="M105 66 L73 19 L116 43 L111 -7 L145 36 L165 -22 L179 37 L219 -10 L204 48 L252 20 L217 78 C199 50 132 43 105 66Z" fill="url(#g190Hair)" stroke="#5488a7" stroke-width="2.4"/><path d="M118 53 Q159 27 205 55" stroke="#8edcf3" stroke-opacity=".34" stroke-width="4" fill="none"/>
<!-- face planes --> <path d="M124 82 Q137 72 149 79" stroke="#241416" stroke-width="5" fill="none"/><path d="M170 78 Q185 70 198 81" stroke="#241416" stroke-width="5" fill="none"/><path d="M126 87 Q138 82 149 87" stroke="#101521" stroke-width="3"/><path d="M172 86 Q184 81 196 86" stroke="#101521" stroke-width="3"/><ellipse cx="141" cy="85" rx="3.3" ry="2.2" fill="#d9fbff"/><ellipse cx="183" cy="84" rx="3.3" ry="2.2" fill="#d9fbff"/><circle cx="141" cy="85" r="1.2" fill="#1fdfff"/><circle cx="183" cy="84" r="1.2" fill="#1fdfff"/><path d="M161 87 L154 105 L164 107" stroke="#85483b" stroke-width="2.2" fill="none"/><path d="M139 119 Q159 128 182 116" stroke="#572421" stroke-width="3.2" fill="none"/><path d="M145 119 Q160 123 176 117" stroke="#f7d4c3" stroke-width="1.8" fill="none"/>
<!-- cel shadows / muscle definition --> <path d="M113 91 Q125 120 148 134 Q124 132 115 112Z" fill="#5e3030" opacity=".27"/><path d="M105 170 Q128 196 130 270 L111 270Z" fill="#010713" opacity=".42"/><path d="M180 278 Q208 314 214 361" stroke="#010611" stroke-opacity=".5" stroke-width="13" stroke-linecap="round"/>
<!-- rim --> <path d="M108 69 Q102 105 130 133" stroke="#8ff4ff" stroke-opacity=".44" stroke-width="3" fill="none"/><path d="M216 163 Q251 176 266 220" stroke="#8ff4ff" stroke-opacity=".4" stroke-width="3" fill="none"/>
</g>`;document.body.appendChild(v);
function playing(){const a=document.getElementById('start'),o=document.getElementById('over');return(!a||a.hidden||getComputedStyle(a).display==='none')&&(!o||o.hidden||getComputedStyle(o).display==='none')}
let lastAttack=0;function frame(t){const on=playing();v.style.opacity=on?'1':'0';if(on){const sway=Math.sin(t*.0013)*3,lean=Math.sin(t*.0007)*1.1;v.style.transform=`translateX(${sway}px) perspective(850px) rotateY(${-7+lean}deg) rotateX(1deg)`;const combat=window.__survivorState||window.gameState||{};const attacking=!!(combat.attacking||combat.attack||combat.combo);if(attacking&&t-lastAttack>330){lastAttack=t;v.classList.remove('attack');void v.offsetWidth;v.classList.add('attack')}v.classList.toggle('power',!!(combat.transforming||combat.powerUp||combat.ultimate))}requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.__griffinProduction190={state:S,element:v};console.info('PRODUCTION_190_GRIFFIN_REMAKE_READY',S);
})();