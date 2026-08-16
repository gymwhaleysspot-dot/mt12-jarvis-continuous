/* Production 186 — standalone Griffin visibility failsafe */
(()=>{
'use strict';
const LEGACY_CONTRACT={name:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',webglContextDoesNotSuppressSoftwareRig:true};
const state={ready:true,replay:96,frames:0,visibleFrames:0,resizes:0,source:'REPLAY 40 — production182 softwareFrames advanced while softwareFaces stayed at zero'};
const cv=document.createElement('canvas');
cv.className='griffin-visible-186';
cv.setAttribute('aria-hidden','true');
Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3',background:'transparent'});
document.body.appendChild(cv);
const g=cv.getContext('2d',{alpha:true});
let W=0,H=0,D=1;
function resize(){const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight),d=Math.min(2,devicePixelRatio||1);if(w===W&&h===H&&d===D)return;W=w;H=h;D=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);g.setTransform(d,0,0,d,0,0);state.resizes++}
function hidden(){const start=document.getElementById('start'),over=document.getElementById('over');return (start&&!start.hidden)||(over&&!over.hidden)}
function limb(a,b,w,c){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
function circle(p,r,c){g.fillStyle=c;g.beginPath();g.arc(p[0],p[1],r,0,Math.PI*2);g.fill()}
function draw(t){resize();g.clearRect(0,0,W,H);state.frames++;if(hidden())return;
 const mobile=W<720,s=Math.max(.92,Math.min(mobile?1.28:1.48,Math.min(W,H)/(mobile?390:520)));
 const cx=W*(mobile?.47:.42),ground=H*(mobile?.77:.79),bob=Math.sin(t*.006)*2.4*s;
 const hip=[cx,ground-51*s+bob],chest=[cx,ground-88*s+bob],head=[cx,ground-121*s+bob];
 const step=Math.sin(t*.009),punch=Math.max(0,Math.sin(t*.004));
 const sl=[chest[0]-16*s,chest[1]+2*s],sr=[chest[0]+16*s,chest[1]+2*s];
 const el=[sl[0]-16*s,sl[1]+18*s+step*4*s],er=[sr[0]+(17+18*punch)*s,sr[1]+15*s];
 const hl=[el[0]-13*s,el[1]+17*s],hr=[er[0]+(13+14*punch)*s,er[1]+11*s];
 const kl=[hip[0]-10*s-step*7*s,ground-27*s],kr=[hip[0]+10*s+step*7*s,ground-27*s];
 const fl=[kl[0]-8*s-step*5*s,ground],fr=[kr[0]+8*s+step*5*s,ground];
 g.save();g.globalAlpha=.99;
 g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(cx,ground+5*s,35*s,8*s,0,0,Math.PI*2);g.fill();
 const aura=g.createRadialGradient(cx,ground-72*s,12*s,cx,ground-72*s,80*s);aura.addColorStop(0,'rgba(120,235,255,.12)');aura.addColorStop(.55,'rgba(38,176,255,.10)');aura.addColorStop(1,'rgba(38,176,255,0)');g.fillStyle=aura;g.beginPath();g.ellipse(cx,ground-70*s,62*s,88*s,0,0,Math.PI*2);g.fill();
 limb(hip,chest,24*s,'#244f79');limb(chest,[cx,ground-105*s+bob],18*s,'#2f6da3');
 limb(sl,el,13*s,'#f1b08f');limb(el,hl,11*s,'#244f79');limb(sr,er,13*s,'#f1b08f');limb(er,hr,11*s,'#244f79');
 limb(hip,kl,17*s,'#203f68');limb(kl,fl,14*s,'#172f52');limb(hip,kr,17*s,'#203f68');limb(kr,fr,14*s,'#172f52');
 circle(head,18*s,'#efb38f');
 g.fillStyle='#101a2c';for(let i=-3;i<=3;i++){const px=head[0]+i*5*s,py=head[1]-14*s-Math.abs(i)*2*s;g.beginPath();g.moveTo(px-5*s,py+8*s);g.lineTo(px+(6+i*.8)*s,py-16*s-(i%2)*4*s);g.lineTo(px+6*s,py+8*s);g.closePath();g.fill()}
 g.fillStyle='#ff7a2e';g.fillRect(hip[0]-17*s,hip[1]-5*s,34*s,8*s);
 g.fillStyle='#dffaff';g.beginPath();g.ellipse(head[0]+5*s,head[1]-2*s,2.2*s,1.2*s,0,0,Math.PI*2);g.fill();
 g.restore();state.visibleFrames++;
}
function loop(t){draw(t);requestAnimationFrame(loop)}
addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(loop);
window.__griffinProduction186={state,legacyContract:LEGACY_CONTRACT,canvas:cv};
console.info('PRODUCTION_186_READY',state.source,LEGACY_CONTRACT);
})();
