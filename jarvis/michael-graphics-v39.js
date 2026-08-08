// MICHAEL V42 — mobile WRC world engine: licensed authority mesh, procedural livery,
// sorted transparent glass, fitted light lenses, batched garage/forest worlds and adaptive quality.
import {JarvisXRRenderer as Physical38} from './jarvis-ai-graphics-v38.js?v=michael54-core';
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
  quad(a,b,c,d,n){const o=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let k=0;k<4;k++)this.n.push(...n);this.i.push(o,o+1,o+2,o,o+2,o+3)}
  coneY(x,y,z,h,r,s=10){const o=this.p.length/3,V=[x,y+h/2,z],N=[0,1,0],I=[];for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,px=Math.cos(a)*r,pz=Math.sin(a)*r;V.push(x+px,y-h/2,z+pz);const l=Math.hypot(px,h*.35,pz)||1;N.push(px/l,r*.35/l,pz/l)}for(let k=0;k<s;k++)I.push(0,k+1,k+2);this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  cylY(x,y,z,h,r,s=14){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),d=Math.sin(a);V.push(x+c*r,y-h/2,z+d*r,x+c*r,y+h/2,z+d*r);N.push(c,0,d,c,0,d)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
}
function pushBatch(r,b,mat,env=null){
  if(!b.p.length)return null;
  const before=r.drawables.length;
  r._mesh(new Float32Array(b.p),new Float32Array(b.n),new Uint32Array(b.i),mat,I4());
  const d=r.drawables[r.drawables.length-1];
  if(env&&r.drawables.length>before){d.world=true;d.env=env}
  return d
}
function addCompletedTwin(r){
  const B={rubber:new TwinBatch(),alloy:new TwinBatch(),brake:new TwinBatch(),chassis:new TwinBatch(),cabin:new TwinBatch(),susp:new TwinBatch(),glass:new TwinBatch(),lights:new TwinBatch()};
  const axles=[-1.875,1.875],sides=[-1.37,1.37];
  B.chassis.box(0,.28,0,2.28,.20,4.72);B.chassis.box(0,.43,-.10,1.92,.16,3.92);B.chassis.box(0,.30,-2.42,2.42,.18,.28);B.chassis.box(0,.30,2.42,2.42,.18,.28);
  B.cabin.box(0,.66,.12,1.54,.16,2.04);B.cabin.box(-.45,.98,.10,.40,.44,.56);B.cabin.box(.45,.98,.10,.40,.44,.56);
  for(const z of axles){B.susp.box(0,.51,z,2.45,.085,.12);B.susp.box(0,.73,z,2.22,.065,.10);for(const x of sides){B.rubber.cylX(x,.56,z,.42,.51,22);B.alloy.cylX(x,.56,z,.432,.315,18);B.brake.cylX(x,.56,z,.445,.205,16);B.chassis.cylX(x,.56,z,.46,.075,14);B.susp.cylY(x*.83,.72,z,.62,.055,12)}}
  B.susp.box(-.88,.48,-1.875,.62,.055,.55);B.susp.box(.88,.48,-1.875,.62,.055,.55);B.susp.box(-.88,.48,1.875,.62,.055,.55);B.susp.box(.88,.48,1.875,.62,.055,.55);
  // Glass is fitted as sloped transparent quads; pillars and openings remain visible.
  B.glass.quad([-.91,1.18,.93],[.91,1.18,.93],[.76,1.76,.52],[-.76,1.76,.52],[0,.55,.84]);
  B.glass.quad([.86,1.18,-.97],[-.86,1.18,-.97],[-.72,1.70,-.62],[.72,1.70,-.62],[0,.55,-.84]);
  for(const x of [-1.015,1.015]){const n=[Math.sign(x),0,0];B.glass.quad([x,1.18,.78],[x,1.18,.02],[x,1.70,.08],[x,1.70,.47],n);B.glass.quad([x,1.18,-.08],[x,1.18,-.78],[x,1.68,-.46],[x,1.68,-.07],n)}
  // Compact lens quads sit inside the scanned lamp recesses instead of floating boxes.
  B.lights.quad([-.99,.78,2.91],[-.40,.79,3.02],[-.43,.98,3.00],[-.96,.99,2.90],[0,0,1]);
  B.lights.quad([.40,.79,3.02],[.99,.78,2.91],[.96,.99,2.90],[.43,.98,3.00],[0,0,1]);
  B.lights.quad([.42,.82,-3.00],[.99,.82,-2.91],[.96,1.00,-2.90],[.44,1.00,-3.00],[0,0,-1]);
  B.lights.quad([-.99,.82,-2.91],[-.42,.82,-3.00],[-.44,1.00,-3.00],[-.96,1.00,-2.90],[0,0,-1]);
  const mats={rubber:M([.009,.011,.014],0,.88),alloy:M([.42,.47,.54],.88,.18),brake:M([.22,.25,.29],.82,.24),chassis:M([.018,.022,.028],.12,.68),cabin:M([.010,.012,.016],0,.84),susp:M([.24,.28,.33],.70,.30),glass:{...M([.025,.11,.18],0,.035),alpha:.36},lights:{...M([.92,.98,1],.04,.08,[2.8,3.1,3.4]),alpha:.88}};
  for(const k of Object.keys(B))pushBatch(r,B[k],mats[k]);
  r._michaelSystems={wheelbase:3.75,wheels:4,chassis:true,suspension:true,glass:true,transparentGlass:true,lighting:true,fittedLights:true,wrcLivery:true,cockpit:true,batches:Object.keys(B).length}
}
function addMichaelWorld(r){
  const road=new TwinBatch(),shoulder=new TwinBatch(),trunk=new TwinBatch(),trees=new TwinBatch(),garage=new TwinBatch(),garageLight=new TwinBatch();
  road.box(0,-.08,0,7.4,.14,128);shoulder.box(-5.2,-.12,0,3.0,.12,128);shoulder.box(5.2,-.12,0,3.0,.12,128);
  for(let k=0;k<40;k++){const z=-58+k*3.1+(k%3)*.37;for(const side of [-1,1]){const x=side*(5.3+(k%5)*.58+Math.sin(k*1.7)*.35),h=3.8+(k%7)*.32;trunk.cylY(x,h*.22,z,h*.44,.14+(k%3)*.025,7);trees.coneY(x,h*.70,z,h*1.08,1.05+(k%4)*.15,9)}}
  garage.box(0,-.10,0,10.8,.16,13.5);garage.box(-5.05,2.15,-5.55,.18,4.3,.18);garage.box(5.05,2.15,-5.55,.18,4.3,.18);garage.box(0,4.28,-5.55,10.2,.18,.18);
  for(const x of [-3.7,3.7])garageLight.box(x,.03,0,.075,.028,9.4);
  const created=[
    pushBatch(r,road,M([.035,.042,.046],0,.92),'road'),
    pushBatch(r,shoulder,M([.12,.075,.036],0,.98),'road'),
    pushBatch(r,trunk,M([.12,.055,.022],0,.92),'road'),
    pushBatch(r,trees,M([.025,.19,.065],0,.90),'road'),
    pushBatch(r,garage,M([.075,.09,.105],.08,.63),'garage'),
    pushBatch(r,garageLight,M([.72,.89,1],.04,.16,[2.2,2.8,3.5]),'garage')
  ].filter(Boolean);
  r._michaelWorld={worldTrees:80,roadEnvironment:true,garageEnvironment:true,garageSmoke:true,batchedDraws:created.length,fog:true};
}

export class JarvisXRRenderer extends Physical38{
  constructor(canvas){super(canvas);this.michael=new MichaelDirector(this);this.aiVersion='MICHAEL_V42';this.visualProfile='WRC_WORLD_ENGINE';this.quality=1.78;this.michael.setMode('garage');const gl=this.gl;this.capabilities={...this.capabilities,maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxRenderbuffer:gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),samples:gl.getParameter(gl.SAMPLES),renderer:gl.getParameter(gl.RENDERER)};gl.enable(gl.DITHER);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)}
  addGround(){const first=this.drawables.length;super.addGround();for(const d of this.drawables.slice(first))d.world=true;addMichaelWorld(this);this.setMode(this.michael.mode)}
  setMode(m){super.setMode(m);this.michael.setMode(m);const road=m==='drive';for(const d of this.drawables){if(d.env)d.hidden=d.env!==(road?'road':'garage')}this.fogDensity=road?.021:.006;this.fogColor=new Float32Array(road?[.045,.105,.075]:[.012,.018,.026])}
  async loadGLB(url){const first=this.drawables.length,licensed=url.startsWith('blob:')||/michael-v40\.bin(?:\?|$)/.test(url),info=await super.loadGLB(url),printerToMichael=new Float32Array([1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1]);if(licensed){for(const d of this.drawables.slice(first)){d.model=printerToMichael;d.mat.base=new Float32Array([.72,.012,.026]);d.mat.metal=.18;d.mat.rough=.10}addCompletedTwin(this)}for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,spread=Math.max(r,g,b)-Math.min(r,g,b);if(r>g*1.32&&r>b*1.25&&r>.11){m.rough=clamp(m.rough,.075,.115);m.metal=clamp(Math.max(m.metal,.16),0,.24)}else if(lum<.025){m.rough=Math.max(m.rough,.72);m.metal=0}else if(spread<.09&&lum>.48){m.rough=Math.min(m.rough,.105);m.metal=Math.max(m.metal,.90)}else if(b>r*1.15&&lum<.22){m.rough=Math.min(m.rough,.05);m.metal=0}}return{...info,drawables:this.drawables.length,ai:this.aiVersion,profile:this.visualProfile,scanAware:true,completeTwin:this._michaelSystems||null,world:this._michaelWorld||null,capabilities:this.capabilities}}
  render(){this.michael.tick();super.render()}
  getAIStats(){return{...super.getAIStats(),version:this.aiVersion,profile:this.visualProfile,qualityTier:this.michael.tier,michaelFrameMs:this.michael.ema,michaelJitter:this.michael.jitter,stillFrames:this.michael.still,stationaryConvergence:this.michael.still>90,qualityCeiling:2.25,meshSource:'LICENSED_C3_WRC_AUTHORITY_MESH',completeTwin:this._michaelSystems||null,world:this._michaelWorld||null,capabilities:this.capabilities}}
}
