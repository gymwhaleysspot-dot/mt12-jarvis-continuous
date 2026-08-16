/* Production 191 — premium Griffin character replacement.
   Original high-detail cel-shaded fighter designed to visually outrank the rival sprite while
   remaining independent from copyrighted character likenesses. */
(()=>{'use strict';
const STATE={version:191,ready:true,mode:'PREMIUM_CEL_FIGHTER',design:'original Griffin',qualityTarget:'hero character',features:['three-quarter fighting stance','anatomical silhouette','layered hair masses','facial planes','cloth and armor breakup','cel light/shadow','rim light','impact pose','power aura']};
const old=document.getElementById('griffin190');if(old)old.remove();
const css=document.createElement('style');css.textContent=`
#griffin191{position:fixed;left:35%;bottom:8.5%;width:clamp(250px,34vw,410px);height:auto;z-index:5;pointer-events:none;overflow:visible;transform-origin:52% 91%;filter:drop-shadow(0 28px 18px #000c);will-change:transform,filter,opacity}
#griffin191 .auraOuter{transform-origin:210px 245px;animation:g191Aura .58s ease-in-out infinite alternate}
#griffin191 .auraCore{transform-origin:210px 245px;animation:g191Core .32s ease-in-out infinite alternate}
#griffin191 .fighter{transform-origin:208px 492px;animation:g191Idle 1.12s cubic-bezier(.4,0,.6,1) infinite alternate}
#griffin191 .hairRim{animation:g191Hair .28s ease-in-out infinite alternate}
#griffin191 .guardHand{transform-origin:295px 226px;animation:g191Guard 1.35s ease-in-out infinite alternate}
#griffin191.attack .fighter{animation:g191Strike .34s cubic-bezier(.14,.78,.2,1)}
#griffin191.power .auraOuter{animation-duration:.13s;filter:brightness(1.55) saturate(1.2)}
#griffin191.power .auraCore{animation-duration:.08s;opacity:.9}
@keyframes g191Aura{from{opacity:.22;transform:scale(.94)}to{opacity:.6;transform:scale(1.06)}}
@keyframes g191Core{from{opacity:.14;transform:scale(.97)}to{opacity:.42;transform:scale(1.03)}}
@keyframes g191Idle{from{transform:translateY(2px) rotate(-.2deg)}to{transform:translateY(-6px) rotate(.35deg)}}
@keyframes g191Hair{from{opacity:.22}to{opacity:.7}}
@keyframes g191Guard{from{transform:rotate(0) translate(0,0)}to{transform:rotate(-4deg) translate(-3px,-4px)}}
@keyframes g191Strike{0%{transform:translate(0,0) rotate(0)}28%{transform:translate(-18px,3px) rotate(-4deg)}62%{transform:translate(52px,-9px) rotate(8deg) scale(1.035)}100%{transform:translate(0,0) rotate(0)}}
@media(max-width:720px){#griffin191{left:24%;bottom:9.5%;width:clamp(260px,70vw,360px)}}`;document.head.appendChild(css);
const NS='http://www.w3.org/2000/svg',v=document.createElementNS(NS,'svg');v.id='griffin191';v.setAttribute('viewBox','0 0 420 540');v.setAttribute('aria-label','Griffin premium original fighter');
v.innerHTML=`<defs>
<radialGradient id="a191"><stop stop-color="#f7ffff" stop-opacity=".66"/><stop offset=".17" stop-color="#8cf5ff" stop-opacity=".52"/><stop offset=".42" stop-color="#17d7ff" stop-opacity=".22"/><stop offset=".7" stop-color="#3a5dff" stop-opacity=".11"/><stop offset="1" stop-color="#101b6f" stop-opacity="0"/></radialGradient>
<radialGradient id="c191"><stop stop-color="#fff" stop-opacity=".58"/><stop offset=".32" stop-color="#59e9ff" stop-opacity=".24"/><stop offset="1" stop-color="#2f5cff" stop-opacity="0"/></radialGradient>
<linearGradient id="skin191" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4c211d"/><stop offset=".17" stop-color="#9c4f3d"/><stop offset=".42" stop-color="#e4936d"/><stop offset=".63" stop-color="#ffc09a"/><stop offset=".82" stop-color="#ca7359"/><stop offset="1" stop-color="#5a2924"/></linearGradient>
<linearGradient id="skinLit191" x1="0" x2="1"><stop stop-color="#9a5141"/><stop offset=".45" stop-color="#ffd1aa"/><stop offset="1" stop-color="#b45c48"/></linearGradient>
<linearGradient id="armor191" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#01040d"/><stop offset=".18" stop-color="#06172e"/><stop offset=".38" stop-color="#0b436f"/><stop offset=".58" stop-color="#0c8fbd"/><stop offset=".76" stop-color="#07395e"/><stop offset="1" stop-color="#01040d"/></linearGradient>
<linearGradient id="cloth191" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050914"/><stop offset=".3" stop-color="#142540"/><stop offset=".58" stop-color="#1d507b"/><stop offset=".8" stop-color="#0a1d34"/><stop offset="1" stop-color="#02050b"/></linearGradient>
<linearGradient id="hair191" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#010207"/><stop offset=".32" stop-color="#081323"/><stop offset=".54" stop-color="#17314a"/><stop offset=".72" stop-color="#35647f"/><stop offset=".86" stop-color="#70b7ca"/><stop offset="1" stop-color="#06080d"/></linearGradient>
<linearGradient id="accent191" x1="0" x2="1"><stop stop-color="#79250b"/><stop offset=".42" stop-color="#ff6a17"/><stop offset=".72" stop-color="#ffb04f"/><stop offset="1" stop-color="#6f2109"/></linearGradient>
<linearGradient id="boot191" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#000207"/><stop offset=".5" stop-color="#0b213b"/><stop offset=".72" stop-color="#1f4e72"/><stop offset="1" stop-color="#010309"/></linearGradient>
<filter id="blur191"><feGaussianBlur stdDeviation="10"/></filter><filter id="glow191"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
<ellipse class="auraOuter" cx="210" cy="255" rx="190" ry="250" fill="url(#a191)"/><ellipse class="auraCore" cx="210" cy="258" rx="132" ry="210" fill="url(#c191)"/><path class="hairRim" d="M115 142L67 79l58 31-9-74 51 55 25-91 22 88 66-70-34 90 70-42-53 103z" fill="#7eefff" opacity=".24" filter="url(#glow191)"/><ellipse cx="210" cy="506" rx="112" ry="19" fill="#000" opacity=".58" filter="url(#blur191)"/>
<g class="fighter">
<!-- rear leg, compressed for a fighting stance -->
<path d="M189 352 C157 372 141 413 134 458" stroke="url(#cloth191)" stroke-width="46" stroke-linecap="round"/>
<path d="M137 457 C117 474 92 486 70 491" stroke="url(#boot191)" stroke-width="31" stroke-linecap="round"/>
<path d="M152 390 C143 419 140 440 140 459" stroke="#020713" stroke-opacity=".48" stroke-width="12" stroke-linecap="round"/>
<!-- front leg, bent and foreshortened -->
<path d="M227 352 C266 378 286 411 302 449" stroke="url(#cloth191)" stroke-width="50" stroke-linecap="round"/>
<path d="M300 447 C322 459 341 467 365 468" stroke="url(#boot191)" stroke-width="34" stroke-linecap="round"/>
<path d="M257 384 C279 408 292 430 302 449" stroke="#020713" stroke-opacity=".42" stroke-width="13" stroke-linecap="round"/>
<!-- hips / sash -->
<path d="M157 329 C185 343 231 344 260 327 L274 354 C235 374 177 373 141 351Z" fill="url(#accent191)" stroke="#ffd07b" stroke-opacity=".2" stroke-width="2"/>
<path d="M252 346 C278 353 293 366 304 382 C286 376 268 374 250 378Z" fill="#b34217" opacity=".72"/>
<!-- torso: tapered, layered armor, visible rib/shoulder planes -->
<path d="M132 210 C141 170 169 151 208 149 C253 147 283 171 291 218 L268 323 C250 343 177 342 153 320Z" fill="url(#armor191)" stroke="#8eefff" stroke-opacity=".32" stroke-width="2.5"/>
<path d="M143 212 Q208 252 283 206 L278 245 Q208 273 139 239Z" fill="#010713" opacity=".77"/>
<path d="M156 226 L205 260 L258 218 L248 302 L171 301Z" fill="#0f6990" opacity=".53"/>
<path d="M163 231 L204 262 M255 231 L212 262" stroke="#9befff" stroke-opacity=".34" stroke-width="3"/>
<path d="M169 295 Q211 310 253 292" stroke="#7beeff" stroke-opacity=".26" stroke-width="2.2"/>
<path d="M139 226 C148 264 153 289 155 320 L139 313Z" fill="#010713" opacity=".46"/>
<path d="M272 217 C266 254 261 284 262 319 L279 297Z" fill="#22a8cf" opacity=".11"/>
<!-- rear arm, elbow bent -->
<path d="M142 207 C104 215 80 247 72 281" stroke="url(#skin191)" stroke-width="31" stroke-linecap="round"/>
<path d="M74 279 C66 305 69 328 81 346" stroke="url(#armor191)" stroke-width="27" stroke-linecap="round"/>
<path d="M80 342 C73 352 78 367 91 370 C107 374 119 358 108 345Z" fill="url(#skinLit191)"/>
<path d="M79 350 l21 -5 M80 356 l20 -4" stroke="#7d4035" stroke-width="2" opacity=".55"/>
<!-- forward shoulder / upper arm -->
<path d="M282 210 C319 219 338 245 343 272" stroke="url(#skin191)" stroke-width="33" stroke-linecap="round"/>
<path d="M297 221 C318 228 333 246 340 268" stroke="#ffd3b0" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>
<!-- guard forearm and hand in front of face -->
<g class="guardHand"><path d="M342 269 C345 242 336 218 321 198" stroke="url(#armor191)" stroke-width="28" stroke-linecap="round"/><path d="M321 198 C310 181 312 162 326 155 C343 146 359 158 357 174 C356 190 342 199 321 198Z" fill="url(#skinLit191)"/><path d="M324 164 Q339 158 348 169" stroke="#744036" stroke-width="2.4" fill="none"/><path d="M320 172 Q338 165 352 176" stroke="#744036" stroke-width="2" fill="none"/></g>
<!-- neck -->
<path d="M180 167 L183 132 L227 132 L234 170Z" fill="url(#skin191)"/><path d="M185 141 Q207 156 230 141 L232 162 Q208 178 181 160Z" fill="#7a3e35" opacity=".24"/>
<!-- head in 3/4 view: narrower jaw, cheek plane, stern expression -->
<path d="M151 103 C149 59 174 34 209 34 C250 34 278 65 266 111 C257 145 232 163 203 162 C174 160 153 138 151 103Z" fill="url(#skin191)" stroke="#3a1b19" stroke-width="2.3"/>
<path d="M153 95 C161 124 177 145 202 160 C174 157 155 138 151 113Z" fill="#64302d" opacity=".27"/>
<path d="M238 48 C260 65 271 90 267 115 C259 96 249 83 236 76Z" fill="#ffd6b4" opacity=".1"/>
<ellipse cx="151" cy="102" rx="9" ry="15" fill="#a35a48"/><ellipse cx="267" cy="103" rx="9" ry="15" fill="#935040"/>
<!-- layered original hair masses rather than crown spikes -->
<path d="M143 75 L94 30 L148 44 L137 -16 L183 34 L206 -31 L222 34 L282 -16 L252 50 L318 18 L270 91 C249 58 176 52 143 75Z" fill="url(#hair191)" stroke="#5b8da7" stroke-width="2.5"/>
<path d="M119 52 L89 2 L152 35 L139 -30 L184 24 L203 -46 L223 25 L282 -28 L251 38 L320 0 L276 73" fill="none" stroke="#8aefff" stroke-opacity=".19" stroke-width="5"/>
<path d="M157 66 Q205 36 257 69" stroke="#b7f4ff" stroke-opacity=".26" stroke-width="4" fill="none"/>
<path d="M144 81 C163 55 237 50 266 82 C250 71 231 69 211 73 C187 77 166 83 153 92Z" fill="#02050a" opacity=".35"/>
<!-- brows / eyes / nose / mouth: no smile -->
<path d="M168 91 Q183 80 198 87" stroke="#1f1012" stroke-width="5" fill="none"/>
<path d="M216 84 Q234 78 249 91" stroke="#1f1012" stroke-width="5" fill="none"/>
<path d="M169 97 Q183 91 197 97" stroke="#111827" stroke-width="3.2"/>
<path d="M217 94 Q232 89 247 95" stroke="#111827" stroke-width="3.2"/>
<ellipse cx="189" cy="95" rx="4.3" ry="2.8" fill="#dffcff"/><ellipse cx="235" cy="93" rx="4.3" ry="2.8" fill="#dffcff"/>
<circle cx="190" cy="95" r="1.5" fill="#35e9ff"/><circle cx="236" cy="93" r="1.5" fill="#35e9ff"/>
<path d="M211 97 L202 119 L214 122" stroke="#814638" stroke-width="2.4" fill="none"/>
<path d="M184 136 Q208 143 235 131" stroke="#512321" stroke-width="3.4" fill="none"/>
<path d="M194 135 Q210 137 226 132" stroke="#f3c9b5" stroke-width="1.5" fill="none" opacity=".7"/>
<!-- cheek and jaw accent -->
<path d="M164 117 Q180 142 201 151" stroke="#6d3731" stroke-width="2" fill="none" opacity=".6"/>
<path d="M245 117 Q232 141 211 153" stroke="#ffd1af" stroke-width="2" fill="none" opacity=".15"/>
<!-- collar and shoulder armor breakup -->
<path d="M161 181 L196 214 L207 177 L219 214 L258 179 L243 239 L207 256 L171 236Z" fill="#07182a" stroke="#39c9e8" stroke-opacity=".3" stroke-width="2"/>
<path d="M134 207 Q151 177 177 166 L168 205 Q150 211 138 223Z" fill="#0e5c83" opacity=".6"/>
<path d="M238 169 Q270 177 288 208 L282 224 Q265 207 246 203Z" fill="#1184ad" opacity=".48"/>
<!-- armor scratches / fabric seams -->
<path d="M182 283 l-18 16 M233 276 l20 13 M186 318 l14 -9 M224 318 l18 -11" stroke="#8befff" stroke-opacity=".18" stroke-width="2"/>
<path d="M179 369 Q158 405 151 449 M245 371 Q276 408 292 445" stroke="#6fa1c4" stroke-opacity=".17" stroke-width="2" fill="none"/>
<!-- hard rim-light accents -->
<path d="M149 84 Q143 124 174 153" stroke="#92f6ff" stroke-opacity=".42" stroke-width="3" fill="none"/>
<path d="M286 209 Q322 219 341 259" stroke="#8cf3ff" stroke-opacity=".39" stroke-width="3" fill="none"/>
<path d="M137 355 Q109 393 102 438" stroke="#5edfff" stroke-opacity=".22" stroke-width="2.5" fill="none"/>
<path d="M247 360 Q285 397 302 442" stroke="#6ee7ff" stroke-opacity=".2" stroke-width="2.5" fill="none"/>
</g>`;document.body.appendChild(v);
function playing(){const a=document.getElementById('start'),o=document.getElementById('over');return(!a||a.hidden||getComputedStyle(a).display==='none')&&(!o||o.hidden||getComputedStyle(o).display==='none')}
let lastAttack=0;function frame(t){const on=playing();v.style.opacity=on?'1':'0';if(on){const sway=Math.sin(t*.00115)*2.3,lean=Math.sin(t*.00072)*.8;v.style.transform=`translateX(${sway}px) perspective(980px) rotateY(${-10+lean}deg) rotateX(1.5deg)`;const combat=window.__survivorState||window.gameState||{};const attacking=!!(combat.attacking||combat.attack||combat.combo||combat.striking);if(attacking&&t-lastAttack>350){lastAttack=t;v.classList.remove('attack');void v.offsetWidth;v.classList.add('attack')}v.classList.toggle('power',!!(combat.transforming||combat.powerUp||combat.ultimate||combat.superMove))}requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.__griffinProduction191={state:STATE,element:v};console.info('PRODUCTION_191_GRIFFIN_PREMIUM_READY',STATE);
})();