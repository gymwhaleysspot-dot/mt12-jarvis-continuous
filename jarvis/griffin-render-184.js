/* Production 184 — Griffin guaranteed-visible compositor */
(()=>{
'use strict';
const production184={ready:true,replay:94,frames:0,softwareFrames:0,forcedSoftwareFrames:0,emptyQueueFrames:0,gpuContextsSeen:0,canvasRepairs:0,lastX:0,lastY:0,lastScale:0,source:'LIVE IPHONE SAFARI 09:31 CAPTURE + PRODUCTION 183 RENDER AUDIT'};
const style=document.createElement('style');
style.textContent='body .vector-113{display:block!important;visibility:visible!important;opacity:1!important;z-index:3!important;background:transparent!important}body .iyla-3d{display:block!important;visibility:visible!important;z-index:2!important;background:transparent!important;pointer-events:none!important}body .hud{z-index:4!important}';
document.head.appendChild(style);
function repairCanvas184(){
 const cv=vector113?.cv;
 if(!cv)return;
 const cs=getComputedStyle(cv);
 if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0){cv.style.setProperty('display','block','important');cv.style.setProperty('visibility','visible','important');cv.style.setProperty('opacity','1','important');production184.canvasRepairs++}
}
function drawGriffin184(g){
 if(!g||!iyla3d)return;
 production184.frames++;repairCanvas184();
 const liveGl=iyla3d.gl;
 if(liveGl)production184.gpuContextsSeen++;
 iyla3d.queue.length=0;
 try{
  // Queue the articulated fallback even when Safari reports a WebGL context.
  // A context is capability, not proof that a visible Griffin frame reached the screen.
  iyla3d.gl=null;
  const evo=clamp(griffin.evolution||0,0,saiyanForms.length-1),spec=saiyanForms[evo]||saiyanForms[0],hex=String(spec.color||'#68f5ff').replace('#','');
  const color=[parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255];
  const yaw=peytenYaw(griffin.heading||0);
  owenGriffin(yaw,color,evo);peytenGriffin(yaw,evo);
 }finally{iyla3d.gl=liveGl}
 if(!iyla3d.queue.length){production184.emptyQueueFrames++;return}
 const srcX=W*.5,srcY=H*.575;
 const rawX=Number.isFinite(stage128?.heroX)?stage128.heroX:(Number.isFinite(player?.x)?player.x:W*.42);
 const rawY=Number.isFinite(player?.y)?player.y:H*.72;
 const dstX=clamp(rawX,W*.16,W*.84),dstY=clamp(rawY,H*.50,H*.80);
 const scale=clamp(Math.min(W,H)/(W<720?285:360),1.18,W<720?1.72:1.92);
 production184.lastX=dstX;production184.lastY=dstY;production184.lastScale=scale;
 for(const f of iyla3d.queue){
  if(f.round){f.p.x=dstX+(f.p.x-srcX)*scale;f.p.y=dstY+(f.p.y-srcY)*scale;f.rx*=scale;f.ry*=scale}
  else for(const p of f.pts){p.x=dstX+(p.x-srcX)*scale;p.y=dstY+(p.y-srcY)*scale}
 }
 flushGriffin182(g);production184.softwareFrames++;if(liveGl)production184.forcedSoftwareFrames++;
}
softwareGriffin182=drawGriffin184;
const replay184=rememberReplayFrame;
rememberReplayFrame=function(frame){
 replay184(frame);
 frame.production184={system:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',source:production184.source,frames:production184.frames,softwareFrames:production184.softwareFrames,forcedSoftwareFrames:production184.forcedSoftwareFrames,emptyQueueFrames:production184.emptyQueueFrames,gpuContextsSeen:production184.gpuContextsSeen,canvasRepairs:production184.canvasRepairs,anchor:{x:+production184.lastX.toFixed(1),y:+production184.lastY.toFixed(1),scale:+production184.lastScale.toFixed(2)},invariants:{webglContextDoesNotSuppressSoftwareRig:true,griffinIsDrawnAfterArena:true,griffinAnchorIsViewportBounded:true,vectorCanvasForcedVisible:true,webglLayerRemainsAvailable:true}};
};
if(typeof p132CombatEvent==='function')p132CombatEvent('PRODUCTION_184_READY',{replay:94,fixes:['REMOVE GL-CONTEXT EARLY RETURN','FORCE ARTICULATED SOFTWARE QUEUE ON WEBGL SAFARI','BOUND GRIFFIN TO LIVE PLAYER/STAGE ANCHOR','REPAIR VECTOR CANVAS VISIBILITY','KEEP WEBGL AVAILABLE WITHOUT MAKING IT VISIBILITY AUTHORITY']});
})();
