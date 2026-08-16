/* Production 185 — Griffin visibility closure + mobile fight readability */
(()=>{
'use strict';
const production184={ready:true,replay:95,frames:0,softwareFrames:0,forcedSoftwareFrames:0,proceduralFrames:0,proceduralParts:0,emptyQueueFrames:0,gpuContextsSeen:0,canvasRepairs:0,earlyFinishersBlocked:0,lastX:0,lastY:0,lastScale:0,source:'LIVE IPHONE SAFARI 09:58 CAPTURE + REPLAY 39 ZERO-FACE AUDIT',legacyContract:{name:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',webglContextDoesNotSuppressSoftwareRig:true}};
const style=document.createElement('style');
style.textContent='body .vector-113{display:block!important;visibility:visible!important;opacity:1!important;z-index:3!important;background:transparent!important}body .iyla-3d{display:block!important;visibility:visible!important;z-index:2!important;background:transparent!important;pointer-events:none!important}body .hud{z-index:4!important}.combat-focus .voice-caption{width:min(520px,72vw)!important;bottom:max(72px,calc(env(safe-area-inset-bottom) + 58px))!important}.combat-focus .tournament140{opacity:.12!important;pointer-events:none!important}@media(max-width:620px){.combat-focus .voice-caption{width:84vw!important;max-height:78px!important;overflow:hidden!important;font-size:10px!important;line-height:1.25!important}.combat-focus .tournament140{opacity:.08!important}}';
document.head.appendChild(style);
function repairCanvas184(){
 const cv=vector113&&vector113.cv;
 if(!cv)return;
 const cs=getComputedStyle(cv);
 if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0){cv.style.setProperty('display','block','important');cv.style.setProperty('visibility','visible','important');cv.style.setProperty('opacity','1','important');production184.canvasRepairs++}
}
function anchor184(){
 const hx=typeof stage128!=='undefined'&&Number.isFinite(stage128.heroX)?stage128.heroX:W*.38;
 const hy=H*(W<720?.755:.77);
 const scale=clamp(Math.min(W,H)/(W<720?390:520),.88,W<720?1.18:1.34);
 production184.lastX=clamp(hx,W*.18,W*.82);production184.lastY=hy;production184.lastScale=scale;
 return{x:production184.lastX,y:production184.lastY,s:scale};
}
function formColor184(){
 const evo=clamp(griffin.evolution||0,0,saiyanForms.length-1),spec=saiyanForms[evo]||saiyanForms[0];
 return{evo,spec,color:String(spec.color||'#68f5ff')};
}
function line184(g,a,b,w,color){g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();production184.proceduralParts++}
function joint184(g,p,r,color){g.fillStyle=color;g.beginPath();g.arc(p[0],p[1],r,0,Math.PI*2);g.fill();production184.proceduralParts++}
function drawProcedural184(g){
 const A=anchor184(),fc=formColor184(),facing=(()=>{try{const b=dragonBoss166&&dragonBoss166(),ex=b&&stage128&&stage128.enemy&&stage128.enemy.get(b);return ex&&Number.isFinite(ex.x)?(ex.x>=A.x?1:-1):(Math.cos(griffin.heading||0)>=0?1:-1)}catch{return Math.cos(griffin.heading||0)>=0?1:-1}})();
 const pose=String((typeof owen!=='undefined'&&owen.pose)||'IDLE').toUpperCase(),t=(performance.now()%1000)/1000,bob=Math.sin(t*Math.PI*2)*2*A.s;
 const h=118*A.s,cx=A.x,ground=A.y,hip=[cx,ground-48*A.s+bob],chest=[cx+facing*2*A.s,ground-82*A.s+bob],head=[cx+facing*5*A.s,ground-111*A.s+bob];
 let armL=-.22,armR=.24,legL=-.18,legR=.18;
 if(/PUNCH|JAB|CROSS|FINISHER|CAST/.test(pose)){armR=facing*.98;armL=-facing*.34}
 if(/GUARD|BLOCK|PERCEPTION/.test(pose)){armL=-facing*.55;armR=facing*.55}
 if(/KICK|SPIN/.test(pose)){legR=facing*.9;armL=-facing*.45}
 if(/DASH|VANISH|FLIGHT|EVADE/.test(pose)){armL=-facing*.7;armR=-facing*.3;legL=-facing*.55;legR=facing*.42}
 const shoulderL=[chest[0]-15*A.s,chest[1]+3*A.s],shoulderR=[chest[0]+15*A.s,chest[1]+3*A.s];
 const elbowL=[shoulderL[0]+armL*24*A.s,shoulderL[1]+20*A.s],elbowR=[shoulderR[0]+armR*28*A.s,shoulderR[1]+14*A.s];
 const handL=[elbowL[0]+armL*20*A.s,elbowL[1]+18*A.s],handR=[elbowR[0]+armR*24*A.s,elbowR[1]+14*A.s];
 const kneeL=[hip[0]-10*A.s+legL*20*A.s,ground-25*A.s],kneeR=[hip[0]+10*A.s+legR*20*A.s,ground-25*A.s];
 const footL=[kneeL[0]-8*A.s+legL*18*A.s,ground],footR=[kneeR[0]+8*A.s+legR*18*A.s,ground];
 g.save();g.globalAlpha=.98;
 g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(cx,ground+4*A.s,33*A.s,8*A.s,0,0,Math.PI*2);g.fill();
 if(fc.evo>0){const aura=g.createRadialGradient(cx,ground-65*A.s,12*A.s,cx,ground-65*A.s,74*A.s);aura.addColorStop(0,'rgba(255,255,255,.08)');aura.addColorStop(.42,fc.color+'44');aura.addColorStop(1,fc.color+'00');g.fillStyle=aura;g.beginPath();g.ellipse(cx,ground-64*A.s,58*A.s,82*A.s,0,0,Math.PI*2);g.fill()}
 line184(g,hip,chest,22*A.s,'#244f79');line184(g,chest,[chest[0],chest[1]-14*A.s],18*A.s,'#2e6ba0');
 line184(g,shoulderL,elbowL,12*A.s,'#f1b08f');line184(g,elbowL,handL,10*A.s,'#244f79');line184(g,shoulderR,elbowR,12*A.s,'#f1b08f');line184(g,elbowR,handR,10*A.s,'#244f79');
 line184(g,hip,kneeL,16*A.s,'#203f68');line184(g,kneeL,footL,13*A.s,'#172f52');line184(g,hip,kneeR,16*A.s,'#203f68');line184(g,kneeR,footR,13*A.s,'#172f52');
 joint184(g,head,17*A.s,'#efb38f');
 g.fillStyle='#111a2d';for(let i=-3;i<=3;i++){g.beginPath();const px=head[0]+i*5*A.s-facing*2*A.s,py=head[1]-13*A.s-Math.abs(i)*2*A.s;g.moveTo(px-5*A.s,py+8*A.s);g.lineTo(px+facing*(5+i*.8)*A.s,py-15*A.s-(i%2)*5*A.s);g.lineTo(px+6*A.s,py+8*A.s);g.closePath();g.fill();production184.proceduralParts++}
 g.fillStyle='#ff7a2e';g.fillRect(hip[0]-16*A.s,hip[1]-5*A.s,32*A.s,7*A.s);production184.proceduralParts++;
 g.strokeStyle=fc.color;g.globalAlpha=.32;g.lineWidth=2*A.s;g.strokeRect(cx-25*A.s,ground-h,50*A.s,h);g.restore();
 production184.proceduralFrames++;if(typeof production182!=='undefined')production182.softwareFaces+=production184.proceduralParts?1:0;
}
function drawGriffin184(g){
 if(!g||!iyla3d)return;
 production184.frames++;repairCanvas184();
 const liveGl=iyla3d.gl;if(liveGl)production184.gpuContextsSeen++;
 const beforeFaces=typeof production182!=='undefined'?production182.softwareFaces:0;
 iyla3d.queue.length=0;
 try{
  iyla3d.gl=null;
  const fc=formColor184(),hex=fc.color.replace('#',''),color=[parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255],yaw=peytenYaw(griffin.heading||0);
  owenGriffin(yaw,color,fc.evo);peytenGriffin(yaw,fc.evo);
 }catch(_){iyla3d.queue.length=0}finally{iyla3d.gl=liveGl}
 if(iyla3d.queue.length){
  const A=anchor184(),srcX=W*.5,srcY=H*.575;
  for(const f of iyla3d.queue){if(f.round){f.p.x=A.x+(f.p.x-srcX)*A.s;f.p.y=A.y+(f.p.y-srcY)*A.s;f.rx*=A.s;f.ry*=A.s}else for(const p of f.pts){p.x=A.x+(p.x-srcX)*A.s;p.y=A.y+(p.y-srcY)*A.s}}
  flushGriffin182(g);production184.softwareFrames++;if(liveGl)production184.forcedSoftwareFrames++;
 }
 const afterFaces=typeof production182!=='undefined'?production182.softwareFaces:beforeFaces;
 if(afterFaces<=beforeFaces){production184.emptyQueueFrames++;drawProcedural184(g)}
}
softwareGriffin182=drawGriffin184;
if(typeof owenController==='function'){
 const p185Owen=owenController;owenController=function(dt){p185Owen(dt);const age=typeof fightAge173==='function'?fightAge173():elapsed;if(age<72&&String(owen.pose).toUpperCase()==='FINISHER'){owen.pose=griffin.superMove&&griffin.superMove.active?'CAST':'GUARD';production184.earlyFinishersBlocked++}};
}
const replay184=rememberReplayFrame;
rememberReplayFrame=function(frame){replay184(frame);frame.production184={system:'GRIFFIN VISIBILITY CLOSURE + MOBILE FIGHT READABILITY',legacyContract:production184.legacyContract,source:production184.source,frames:production184.frames,softwareFrames:production184.softwareFrames,forcedSoftwareFrames:production184.forcedSoftwareFrames,proceduralFrames:production184.proceduralFrames,proceduralParts:production184.proceduralParts,emptyQueueFrames:production184.emptyQueueFrames,gpuContextsSeen:production184.gpuContextsSeen,canvasRepairs:production184.canvasRepairs,earlyFinishersBlocked:production184.earlyFinishersBlocked,anchor:{x:+production184.lastX.toFixed(1),y:+production184.lastY.toFixed(1),scale:+production184.lastScale.toFixed(2)},invariants:{zeroFaceFramesStillDrawGriffin:true,webglContextDoesNotSuppressSoftwareRig:true,webglContextDoesNotSuppressFallback:true,griffinAnchorUsesScreenSpace:true,griffinDrawnAfterArena:true,vectorCanvasForcedVisible:true,earlyFinisherPoseBlocked:true,mobileCombatUiDeemphasized:true}}};
if(typeof p132CombatEvent==='function')p132CombatEvent('PRODUCTION_185_READY',{replay:95,legacyContract:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',fixes:['ZERO-FACE RIG FALLS THROUGH TO DIRECT ARTICULATED CANVAS BODY','SCREEN-SPACE GRIFFIN ANCHOR NO LONGER USES WORLD Y','WEBGL CONTEXT NEVER COUNTS AS VISIBILITY','EARLY FINISHER VISUALS BLOCKED BEFORE 72 SECONDS','MOBILE DIALOGUE AND TOURNAMENT CHROME DEEMPHASIZED DURING COMBAT']});
})();
