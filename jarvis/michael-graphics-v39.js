// MICHAEL V41 — endgame mobile automotive presentation layer for the licensed C3 WRC authority mesh.
// Keeps V38's proven multi-lobe GGX/clearcoat/5x5 PCF shader and adds a licensed-body material pass,
// higher stationary convergence budget, photographic exposure control and GPU-adaptive quality.
import {JarvisXRRenderer as Physical38} from './jarvis-ai-graphics-v38.js?v=michael40-core';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class MichaelDirector{
  constructor(r){this.r=r;this.mode='garage';this.ema=16.7;this.jitter=0;this.q=1.78;this.still=0;this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.tier='MICHAEL LICENSED';this.exposure=1.30}
  setMode(m){this.mode=m;this.q=clamp(this.q,m==='garage'?1.35:.76,m==='garage'?2.25:1.24);this.r.quality=this.q}
  tick(){const r=this.r,ms=r.avgMs||16.7,e=ms-this.ema;this.ema+=e*.045;this.jitter=this.jitter*.945+Math.abs(e)*.055;const motion=Math.abs((r.yaw||0)-this.lastYaw)+Math.abs((r.pitch||0)-this.lastPitch);this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.still=motion<.00035?Math.min(900,this.still+1):0;const g=this.mode==='garage',target=g?34.0:16.8,lo=g?1.35:.76,hi=g?2.25:1.24;if(this.ema>target*1.08||this.jitter>target*.26)this.q-=g?.030:.022;else if(this.ema<target*.77&&this.jitter<target*.14)this.q+=g?.020:.010;if(g&&this.still>90)this.q+=.0035;if(g&&this.still>300)this.q+=.0025;this.q=clamp(this.q,lo,hi);r.quality=r.quality*.84+this.q*.16;this.tier=r.quality>2.08?'MICHAEL MAX':r.quality>1.82?'MICHAEL LICENSED':r.quality>1.55?'MICHAEL ULTRA':'MICHAEL HIGH';const y=r.yaw||0;r.lightDir[0]=Math.sin(y+.54)*.53;r.lightDir[1]=-.805;r.lightDir[2]=Math.cos(y+.54)*.53;r.lightColor[0]=g?6.55:4.85;r.lightColor[1]=g?6.15:4.56;r.lightColor[2]=g?5.68:4.25;r.ambient[0]=g?.205:.155;r.ambient[1]=g?.245:.188;r.ambient[2]=g?.305:.238;this.exposure=g?(this.still>120?1.39:1.33):1.19;r.exposure=this.exposure}
}

const I4=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const M=(base,metal,rough,em=[0,0,0])=>({base:new Float32Array(base),metal,rough,em:new Float32Array(em)});
class TwinBatch{
  constructor(){this.p=[];this.n=[];this.i=[]}
  q(v,n,ix){const o=this.p.length/3;this.p.push(...v);this.n.push(...n);this.i.push(...ix.map(x=>x+o))}
  box(x,y,z,sx,sy,sz){const a=x-sx/2,b=x+sx/2,c=y-sy/2,d=y+sy/2,e=z-sz/2,f=z+sz/2,V=[a,c,f,b,c,f,b,d,f,a,d,f,b,c,e,a,c,e,a,d,e,b,d,e,a,d,f,b,d,f,b,d,e,a,d,e,a,c,e,b,c,e,b,c,f,a,c,f,b,c,f,b,c,e,b,d,e,b,d,f,a,c,e,a,c,f,a,d,f,a,d,e],N=[];for(const q of [[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]])for(let k=0;k<4;k++)N.push(...q);this.q(V,N,[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23])}
  cylX(x,y,z,w,r,s=18){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,cy=Math.cos(a),sz=Math.sin(a);V.push(x-w/2,y+cy*r,z+sz*r,x+w/2,y+cy*r,z+sz*r);N.push(0,cy,sz,0,cy,sz)}for(let k=0;k<s;k++){const a=k*2,b=a+1,c=a+2,d=a+3;I.push(a,b,d,a,d,c)}const left=V.length/3;V.push(x-w/2,y,z,x+w/2,y,z);N.push(-1,0,0,1,0,0);for(let k=0;k<s;k++){const a=k/s*Math.PI*2,b=(k+1)/s*Math.PI*2,l=V.length/3;V.push(x-w/2,y+Math.cos(a)*r,z+Math.sin(a)*r,x-w/2,y+Math.cos(b)*r,z+Math.sin(b)*r,x+w/2,y+Math.cos(a)*r,z+Math.sin(a)*r,x+w/2,y+Math.cos(b)*r,z+Math.sin(b)*r);N.push(-1,0,0,-1,0,0,1,0,0,1,0,0);I.push(left,l+1,l,left+1,l+2,l+3)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  cylY(x,y,z,h,r,s=14){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),d=Math.sin(a);V.push(x+c*r,y-h/2,z+d*r,x+c*r,y+h/2,z+d*r);N.push(c,0,d,c,0,d)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
}
function addCompletedTwin(r){
  const B={rubber:new TwinBatch(),alloy:new TwinBatch(),brake:new TwinBatch(),chassis:new TwinBatch(),glass:new TwinBatch(),lamp:new TwinBatch(),tail:new TwinBatch(),cabin:new TwinBatch(),susp:new TwinBatch()};
  const axles=[-1.875,1.875],sides=[-1.37,1.37];
  B.chassis.box(0,.28,0,2.28,.20,4.72);B.chassis.box(0,.43,-.10,1.92,.16,3.92);B.chassis.box(0,.30,-2.42,2.42,.18,.28);B.chassis.box(0,.30,2.42,2.42,.18,.28);
  B.cabin.box(0,.82,.18,1.70,.28,2.35);B.cabin.box(-.47,1.06,.25,.48,.58,.70);B.cabin.box(.47,1.06,.25,.48,.58,.70);B.cabin.box(0,1.12,-.72,1.48,.22,.38);
  B.glass.box(0,1.47,-.73,1.82,.70,.055);B.glass.box(0,1.48,1.05,1.72,.62,.055);B.glass.box(-1.055,1.43,.12,.045,.67,1.83);B.glass.box(1.055,1.43,.12,.045,.67,1.83);
  for(const z of axles){B.susp.box(0,.51,z,2.45,.085,.12);B.susp.box(0,.73,z,2.22,.065,.10);for(const x of sides){B.rubber.cylX(x,.56,z,.42,.51,22);B.alloy.cylX(x,.56,z,.432,.315,18);B.brake.cylX(x,.56,z,.445,.205,16);B.chassis.cylX(x,.56,z,.46,.075,14);B.susp.cylY(x*.83,.72,z,.62,.055,12)}} 
  B.susp.box(-.88,.48,-1.875,.62,.055,.55);B.susp.box(.88,.48,-1.875,.62,.055,.55);B.susp.box(-.88,.48,1.875,.62,.055,.55);B.susp.box(.88,.48,1.875,.62,.055,.55);
  B.lamp.box(-.90,.78,-3.02,.48,.23,.075);B.lamp.box(.90,.78,-3.02,.48,.23,.075);B.lamp.box(-1.17,.54,-2.94,.18,.28,.08);B.lamp.box(1.17,.54,-2.94,.18,.28,.08);
  B.tail.box(-1.08,.82,3.00,.39,.22,.075);B.tail.box(1.08,.82,3.00,.39,.22,.075);B.tail.box(0,1.83,2.53,.58,.065,.08);
  B.alloy.box(0,.27,-2.58,1.50,.055,.80);B.alloy.box(0,.25,2.57,1.64,.055,.70);
  const mats={rubber:M([.009,.011,.014],0,.88),alloy:M([.62,.68,.76],.94,.12),brake:M([.27,.30,.34],.88,.19),chassis:M([.028,.034,.041],.22,.58),glass:M([.012,.055,.095],0,.035),lamp:M([.78,.86,1],.05,.055,[2.4,2.65,3.1]),tail:M([.55,.006,.012],.05,.08,[2.3,.02,.01]),cabin:M([.018,.020,.024],0,.76),susp:M([.42,.47,.54],.83,.20)};
  for(const k of Object.keys(B)){const b=B[k];if(b.p.length)r._mesh(new Float32Array(b.p),new Float32Array(b.n),new Uint32Array(b.i),mats[k],I4())}
  r._michaelSystems={wheelbase:3.75,wheels:4,chassis:true,suspension:true,glass:true,lighting:true,cockpit:true,batches:Object.keys(B).length}
}

export class JarvisXRRenderer extends Physical38{
  constructor(canvas){super(canvas);this.michael=new MichaelDirector(this);this.aiVersion='MICHAEL_V41';this.visualProfile='COMPLETE_LICENSED_RALLY_TWIN';this.quality=1.78;this.michael.setMode('garage');const gl=this.gl;this.capabilities={...this.capabilities,maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxRenderbuffer:gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),samples:gl.getParameter(gl.SAMPLES),renderer:gl.getParameter(gl.RENDERER)};gl.enable(gl.DITHER);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)}
  setMode(m){super.setMode(m);this.michael.setMode(m)}
  async loadGLB(url){const first=this.drawables.length,licensed=url.startsWith('blob:')||/michael-v40\.bin(?:\?|$)/.test(url),info=await super.loadGLB(url),printerToMichael=new Float32Array([1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1]);if(licensed){for(const d of this.drawables.slice(first)){d.model=printerToMichael;d.mat.base=new Float32Array([.72,.012,.026]);d.mat.metal=.18;d.mat.rough=.10}addCompletedTwin(this)}for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,spread=Math.max(r,g,b)-Math.min(r,g,b);if(r>g*1.32&&r>b*1.25&&r>.11){m.rough=clamp(m.rough,.075,.115);m.metal=clamp(Math.max(m.metal,.16),0,.24)}else if(lum<.025){m.rough=Math.max(m.rough,.72);m.metal=0}else if(spread<.09&&lum>.48){m.rough=Math.min(m.rough,.105);m.metal=Math.max(m.metal,.90)}else if(b>r*1.15&&lum<.22){m.rough=Math.min(m.rough,.05);m.metal=0}}return{...info,drawables:this.drawables.length,ai:this.aiVersion,profile:this.visualProfile,scanAware:true,completeTwin:this._michaelSystems||null,capabilities:this.capabilities}}
  render(){this.michael.tick();super.render()}
  getAIStats(){return{...super.getAIStats(),version:this.aiVersion,profile:this.visualProfile,qualityTier:this.michael.tier,michaelFrameMs:this.michael.ema,michaelJitter:this.michael.jitter,stillFrames:this.michael.still,stationaryConvergence:this.michael.still>90,qualityCeiling:2.25,meshSource:'LICENSED_C3_WRC_AUTHORITY_MESH',completeTwin:this._michaelSystems||null,capabilities:this.capabilities}}
}
