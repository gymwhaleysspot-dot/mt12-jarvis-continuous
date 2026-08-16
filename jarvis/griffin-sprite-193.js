/* Production 193 — authored Griffin sprite-atlas authority.
   Uses the repository's existing high-detail Griffin art instead of procedural primitive geometry.
   The 3D skeletal layer may run underneath, but never replaces authored art unless it reaches parity. */
(()=>{'use strict';
const S={version:193,ready:false,mode:'AUTHORED_SPRITE_ATLAS',frames:0,asset:'jarvis/assets/survivor/griffin-ascended-atlas-v3.webp'};
const old=['griffin191','griffin190','griffin-dom-188'];for(const id of old){const e=document.getElementById(id);if(e)e.remove()}
const cv=document.createElement('canvas');cv.id='griffin-sprite-193';cv.setAttribute('aria-label','Griffin authored fighter sprite');Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'5',pointerEvents:'none',background:'transparent'});document.body.appendChild(cv);const x=cv.getContext('2d',{alpha:true});
const img=new Image();img.decoding='async';img.src=S.asset;img.onload=()=>S.ready=true;img.onerror=()=>{S.asset='jarvis/assets/survivor/griffin-atlas-v3.webp';img.src=S.asset};
function active(){const a=document.getElementById('start'),o=document.getElementById('over');return(!a||a.hidden||getComputedStyle(a).display==='none')&&(!o||o.hidden||getComputedStyle(o).display==='none')}
function frame(t){requestAnimationFrame(frame);S.frames++;const d=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);if(!active()||!S.ready)return;
 const cols=4,rows=4,fw=img.naturalWidth/cols,fh=img.naturalHeight/rows;const combat=window.__survivorState||window.gameState||{};let row=0;if(combat.transforming||combat.powerUp||combat.ultimate)row=3;else if(combat.attacking||combat.attack||combat.combo)row=2;else if(combat.guarding||combat.guard)row=1;const col=Math.floor(t/125)%cols;
 const h=Math.min(H*.48,430),w=h*(fw/fh),px=W*.42-w*.5,py=H*.86-h;x.save();x.shadowColor='rgba(40,210,255,.55)';x.shadowBlur=(row===3?30:12);x.drawImage(img,col*fw,row*fh,fw,fh,px,py,w,h);x.restore();}
requestAnimationFrame(frame);window.__griffinProduction193={state:S,canvas:cv};console.info('PRODUCTION_193_GRIFFIN_SPRITE_AUTHORITY',S.asset);
})();