/* Production 194 — authored Griffin sprite-atlas authority.
   Uses the repository's existing high-detail Griffin art as the sole visible Griffin renderer.
   Experimental 3D remains in the repository but is not loaded into live combat. */
(()=>{'use strict';
const S={version:194,ready:false,mode:'AUTHORED_SPRITE_ONLY',frames:0,asset:'jarvis/assets/survivor/griffin-ascended-atlas-v3.webp',legacyPurges:0};
function purgeLegacy(){for(const id of ['griffin-skeletal-189','griffin191','griffin190','griffin-dom-188']){const e=document.getElementById(id);if(e){e.remove();S.legacyPurges++}}document.querySelectorAll('canvas[id^="griffin-"]:not(#griffin-sprite-193),svg[id^="griffin"]:not(#griffin-sprite-193)').forEach(e=>{e.remove();S.legacyPurges++})}
purgeLegacy();
const cv=document.createElement('canvas');cv.id='griffin-sprite-193';cv.setAttribute('aria-label','Griffin authored fighter sprite');Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'6',pointerEvents:'none',background:'transparent'});document.body.appendChild(cv);const x=cv.getContext('2d',{alpha:true});
const img=new Image();img.decoding='async';img.src=S.asset;img.onload=()=>S.ready=true;img.onerror=()=>{S.asset='jarvis/assets/survivor/griffin-atlas-v3.webp';img.src=S.asset};
function active(){const a=document.getElementById('start'),o=document.getElementById('over');return(!a||a.hidden||getComputedStyle(a).display==='none')&&(!o||o.hidden||getComputedStyle(o).display==='none')}
function frame(t){requestAnimationFrame(frame);S.frames++;if((S.frames&31)===0)purgeLegacy();const d=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);if(!active()||!S.ready)return;
 const cols=4,rows=4,fw=img.naturalWidth/cols,fh=img.naturalHeight/rows;const combat=window.__survivorState||window.gameState||{};let row=0;if(combat.transforming||combat.powerUp||combat.ultimate)row=3;else if(combat.attacking||combat.attack||combat.combo)row=2;else if(combat.guarding||combat.guard)row=1;const col=Math.floor(t/125)%cols;
 const h=Math.min(H*.50,450),w=h*(fw/fh),px=W*.42-w*.5,py=H*.86-h;x.save();x.shadowColor='rgba(40,210,255,.55)';x.shadowBlur=(row===3?30:12);x.drawImage(img,col*fw,row*fh,fw,fh,px,py,w,h);x.restore();}
requestAnimationFrame(frame);window.__griffinProduction194={state:S,canvas:cv};window.__griffinProduction193={state:S,canvas:cv};console.info('PRODUCTION_194_GRIFFIN_SPRITE_ONLY',S.asset);
})();