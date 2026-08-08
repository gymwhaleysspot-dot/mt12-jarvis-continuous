// MICHAEL V50 — camera-safe mobile WRC presentation: licensed authority mesh, energy-aware paint,
// fitted optical lenses, bounded mobile GPU budgets and a readable neutral forest world.
import {JarvisXRRenderer as Physical38} from './jarvis-ai-graphics-v38.js?v=michael63-core';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class MichaelDirector{
  constructor(r){this.r=r;this.mode='garage';this.mobile=Math.min(innerWidth||720,innerHeight||1280)<900;this.ema=16.7;this.jitter=0;this.q=this.mobile?.96:1.18;this.still=0;this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.tier='MICHAEL BALANCED';this.exposure=.98;this.maxQuality=this.mobile?1.10:1.38}
  limits(m){const g=m==='garage';return this.mobile?(g?[.78,1.10,18.4]:[.66,1.00,16.8]):(g?[.92,1.38,21.5]:[.74,1.12,16.8])}
  setMode(m){this.mode=m;const [lo,hi]=this.limits(m);this.maxQuality=hi;this.q=clamp(this.q,lo,hi);this.r.quality=this.q}
  tick(){const r=this.r,ms=r.avgMs||16.7,e=ms-this.ema;this.ema+=e*.055;this.jitter=this.jitter*.94+Math.abs(e)*.06;const motion=Math.abs((r.yaw||0)-this.lastYaw)+Math.abs((r.pitch||0)-this.lastPitch);this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.still=motion<.00035?Math.min(900,this.still+1):0;const g=this.mode==='garage',[lo,hi,target]=this.limits(this.mode);if(this.ema>target*1.06||this.jitter>target*.23)this.q-=g?.032:.024;else if(this.ema<target*.78&&this.jitter<target*.13)this.q+=g?.016:.010;if(g&&this.still>140)this.q+=.0015;this.q=clamp(this.q,lo,hi);r.quality=r.quality*.82+this.q*.18;this.tier=r.quality>1.24?'MICHAEL MAX':r.quality>1.06?'MICHAEL LICENSED':r.quality>.86?'MICHAEL ULTRA':'MICHAEL HIGH';const y=r.yaw||0;r.lightDir[0]=Math.sin(y+.54)*.53;r.lightDir[1]=-.805;r.lightDir[2]=Math.cos(y+.54)*.53;r.lightColor[0]=g?2.48:2.22;r.lightColor[1]=g?2.38:2.14;r.lightColor[2]=g?2.30:2.08;r.ambient[0]=g?.28:.20;r.ambient[1]=g?.32:.24;r.ambient[2]=g?.39:.30;this.exposure=g?.98:.94;r.exposure=this.exposure;r.postLift=g?.011:.008}
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
  ellipseY(x,y,z,h,rx,rz,s=36){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),d=Math.sin(a),nx=c/rx,nz=d/rz,nl=Math.hypot(nx,nz)||1;V.push(x+c*rx,y-h/2,z+d*rz,x+c*rx,y+h/2,z+d*rz);N.push(nx/nl,0,nz/nl,nx/nl,0,nz/nl)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}const top=V.length/3;V.push(x,y+h/2,z,x,y-h/2,z);N.push(0,1,0,0,-1,0);for(let k=0;k<s;k++){const a=k/s*Math.PI*2,b=(k+1)/s*Math.PI*2,l=V.length/3;V.push(x+Math.cos(a)*rx,y+h/2,z+Math.sin(a)*rz,x+Math.cos(b)*rx,y+h/2,z+Math.sin(b)*rz,x+Math.cos(a)*rx,y-h/2,z+Math.sin(a)*rz,x+Math.cos(b)*rx,y-h/2,z+Math.sin(b)*rz);N.push(0,1,0,0,1,0,0,-1,0,0,-1,0);I.push(top,l,l+1,top+1,l+3,l+2)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  torusX(x,y,z,major,tube,width=.40,su=28,sv=9){const V=[],N=[],I=[],o=this.p.length/3;for(let u=0;u<=su;u++){const a=u/su*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);for(let v=0;v<=sv;v++){const b=v/sv*Math.PI*2,cb=Math.cos(b),sb=Math.sin(b),nx=sb/(width*.5),nr=cb/tube,nl=Math.hypot(nx,nr)||1;V.push(x+sb*width*.5,y+ca*(major+cb*tube),z+sa*(major+cb*tube));N.push(nx/nl,ca*nr/nl,sa*nr/nl)}}for(let u=0;u<su;u++)for(let v=0;v<sv;v++){const a=u*(sv+1)+v,b=a+sv+1;I.push(a,b,a+1,b,b+1,a+1)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  spokeX(x,y,z,w,r0,r1,a,half=.04){const r=[Math.cos(a),Math.sin(a)],t=[-r[1],r[0]],p=(xx,rr,tt)=>[xx,y+r[0]*rr+t[0]*tt,z+r[1]*rr+t[1]*tt],x0=x-w*.5,x1=x+w*.5,A=p(x0,r0,-half),B=p(x0,r1,-half),C=p(x0,r1,half),D=p(x0,r0,half),E=p(x1,r0,-half),F=p(x1,r1,-half),G=p(x1,r1,half),H=p(x1,r0,half);this.quad(A,D,C,B,[-1,0,0]);this.quad(E,F,G,H,[1,0,0]);this.quad(A,B,F,E,[0,t[0],t[1]]);this.quad(D,H,G,C,[0,-t[0],-t[1]]);this.quad(B,C,G,F,[0,r[0],r[1]]);this.quad(A,E,H,D,[0,-r[0],-r[1]])}
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
  const B={contact:new TwinBatch(),rubber:new TwinBatch(),alloy:new TwinBatch(),brake:new TwinBatch(),chassis:new TwinBatch(),cabin:new TwinBatch(),susp:new TwinBatch(),mud:new TwinBatch(),glass:new TwinBatch(),frontLens:new TwinBatch(),frontDrl:new TwinBatch(),rearLens:new TwinBatch(),rearLamp:new TwinBatch(),beams:new TwinBatch()};
  const axles=[-1.875,1.875],sides=[-1.37,1.37];
  B.contact.ellipseY(0,.014,0,.026,1.24,2.72,48);
  B.chassis.box(0,.28,0,2.28,.20,4.72);B.chassis.box(0,.43,-.10,1.92,.16,3.92);B.chassis.box(0,.30,-2.42,2.42,.18,.28);B.chassis.box(0,.30,2.42,2.42,.18,.28);
  B.cabin.box(0,.66,.12,1.54,.16,2.04);B.cabin.box(-.45,.98,.10,.40,.44,.56);B.cabin.box(.45,.98,.10,.40,.44,.56);
  for(const z of axles){B.susp.box(0,.51,z,2.45,.085,.12);B.susp.box(0,.73,z,2.22,.065,.10);for(const x of sides){B.rubber.torusX(x,.56,z,.375,.137,.43,30,10);B.alloy.torusX(x,.56,z,.238,.048,.438,24,7);for(let s=0;s<8;s++)B.alloy.spokeX(x,.56,z,.442,.072,.254,s*Math.PI/4,.032);B.alloy.cylX(x,.56,z,.447,.078,18);B.brake.cylX(x,.56,z,.423,.192,24);B.chassis.cylX(x,.56,z,.46,.052,14);B.susp.cylY(x*.83,.72,z,.62,.055,12)}}
  B.susp.box(-.88,.48,-1.875,.62,.055,.55);B.susp.box(.88,.48,-1.875,.62,.055,.55);B.susp.box(-.88,.48,1.875,.62,.055,.55);B.susp.box(.88,.48,1.875,.62,.055,.55);for(const x of [-1.24,1.24]){B.mud.box(x,.39,-2.26,.36,.62,.055);B.mud.box(x,.39,2.26,.36,.62,.055)}
  // Glass is fitted as sloped transparent quads; pillars and openings remain visible.
  B.glass.quad([-.91,1.18,.93],[.91,1.18,.93],[.76,1.76,.52],[-.76,1.76,.52],[0,.55,.84]);
  B.glass.quad([.86,1.18,-.97],[-.86,1.18,-.97],[-.72,1.70,-.62],[.72,1.70,-.62],[0,.55,-.84]);
  for(const x of [-1.015,1.015]){const n=[Math.sign(x),0,0];B.glass.quad([x,1.18,.78],[x,1.18,.02],[x,1.70,.08],[x,1.70,.47],n);B.glass.quad([x,1.18,-.08],[x,1.18,-.78],[x,1.68,-.46],[x,1.68,-.07],n)}
  // Optical housings carry shape; thin DRL/stop-light elements supply restrained emission.
  B.frontLens.quad([-.99,.78,2.91],[-.40,.79,3.02],[-.43,.98,3.00],[-.96,.99,2.90],[0,0,1]);
  B.frontLens.quad([.40,.79,3.02],[.99,.78,2.91],[.96,.99,2.90],[.43,.98,3.00],[0,0,1]);
  B.frontDrl.quad([-.91,.88,2.925],[-.48,.89,3.015],[-.49,.945,3.01],[-.90,.94,2.92],[0,0,1]);
  B.frontDrl.quad([.48,.89,3.015],[.91,.88,2.925],[.90,.94,2.92],[.49,.945,3.01],[0,0,1]);
  B.rearLens.quad([.42,.82,-3.00],[.99,.82,-2.91],[.96,1.00,-2.90],[.44,1.00,-3.00],[0,0,-1]);
  B.rearLens.quad([-.99,.82,-2.91],[-.42,.82,-3.00],[-.44,1.00,-3.00],[-.96,1.00,-2.90],[0,0,-1]);
  B.rearLamp.quad([.50,.87,-3.01],[.91,.87,-2.925],[.90,.94,-2.92],[.51,.94,-3.01],[0,0,-1]);
  B.rearLamp.quad([-.91,.87,-2.925],[-.50,.87,-3.01],[-.51,.94,-3.01],[-.90,.94,-2.92],[0,0,-1]);
  B.beams.quad([-.92,.035,2.86],[-.36,.035,2.86],[-.72,.035,9.4],[-2.40,.035,9.4],[0,1,0]);B.beams.quad([.36,.035,2.86],[.92,.035,2.86],[2.40,.035,9.4],[.72,.035,9.4],[0,1,0]);
  const mats={contact:M([.002,.003,.004],0,1),rubber:M([.007,.008,.010],0,.80),alloy:M([.31,.36,.43],.78,.24),brake:M([.19,.21,.24],.72,.31),chassis:M([.014,.017,.021],.10,.72),cabin:M([.008,.010,.013],0,.88),susp:M([.21,.24,.28],.62,.36),mud:M([.006,.007,.009],0,.94),glass:{...M([.010,.030,.068],0,.11),alpha:.47},frontLens:{...M([.025,.045,.072],.02,.29),alpha:.82},frontDrl:{...M([.18,.23,.29],.02,.27,[.16,.21,.28]),alpha:.78},rearLens:{...M([.10,.004,.006],.01,.34),alpha:.86},rearLamp:{...M([.26,.008,.010],.01,.30,[.17,.004,.006]),alpha:.82},beams:{...M([.10,.16,.25],0,.64,[.035,.060,.10]),alpha:.024}};
  for(const k of Object.keys(B)){const d=pushBatch(r,B[k],mats[k]);if(d&&k==='beams'){d.driveOnly=true;d.hidden=true}}
  r._michaelSystems={wheelbase:3.75,wheels:4,chassis:true,suspension:true,glass:true,transparentGlass:true,lighting:true,fittedLights:true,wrcLivery:true,cockpit:true,batches:Object.keys(B).length}
}
function addMichaelWorld(r){
  const road=new TwinBatch(),shoulder=new TwinBatch(),roadMark=new TwinBatch(),reflector=new TwinBatch(),guardrail=new TwinBatch(),trunk=new TwinBatch(),treesNear=new TwinBatch(),treesFar=new TwinBatch(),garage=new TwinBatch(),turntable=new TwinBatch();
  road.box(0,-.08,0,7.4,.14,128);shoulder.box(-5.2,-.12,0,3.0,.12,128);shoulder.box(5.2,-.12,0,3.0,.12,128);for(let z=-60;z<64;z+=5){roadMark.box(-3.25,.018,z,.10,.025,2.8);roadMark.box(3.25,.018,z,.10,.025,2.8);reflector.box(-3.62,.18,z,.09,.36,.12);reflector.box(3.62,.18,z,.09,.36,.12)}
  for(let k=0;k<40;k++){const z=-58+k*3.1+(k%3)*.37;for(const side of [-1,1]){const x=side*(5.3+(k%5)*.58+Math.sin(k*1.7)*.35),h=3.8+(k%7)*.32;trunk.cylY(x,h*.22,z,h*.44,.14+(k%3)*.025,7);const crown=k%2?treesNear:treesFar;crown.coneY(x,h*.55,z,h*.72,1.18+(k%4)*.14,9);crown.coneY(x,h*.78,z,h*.66,.92+(k%3)*.12,9);crown.coneY(x,h*.99,z,h*.54,.66+(k%2)*.10,9)}}
  for(const side of [-1,1]){guardrail.box(side*4.42,.46,0,.10,.12,128);for(let z=-60;z<=60;z+=4)guardrail.box(side*4.42,.24,z,.12,.52,.12)}
  // A broad floor and image-based key avoid camera-crossing physical light bars at every orbit angle.
  garage.box(0,-.11,0,24,.12,24);turntable.cylY(0,-.035,0,.075,3.25,48);
  const created=[
    pushBatch(r,road,M([.050,.058,.062],0,.90),'road'),
    pushBatch(r,shoulder,M([.105,.073,.042],0,.97),'road'),
    pushBatch(r,roadMark,M([.68,.72,.74],0,.62),'road'),
    pushBatch(r,reflector,M([.66,.73,.78],.05,.26,[.075,.10,.13]),'road'),
    pushBatch(r,guardrail,M([.34,.39,.44],.66,.35),'road'),
    pushBatch(r,trunk,M([.11,.055,.028],0,.92),'road'),
    pushBatch(r,treesNear,M([.022,.115,.052],0,.95),'road'),
    pushBatch(r,treesFar,M([.012,.066,.036],0,.97),'road'),
    pushBatch(r,garage,M([.018,.023,.032],.02,.82),'garage'),
    pushBatch(r,turntable,M([.052,.062,.078],.20,.46),'garage')
  ].filter(Boolean);
  r._michaelWorld={worldTrees:80,roadEnvironment:true,roadEdgeMarkers:true,reflectorPosts:50,garageEnvironment:true,garageTurntable:true,garageSmoke:true,cameraSafeLighting:true,physicalLightBars:false,batchedDraws:created.length,fog:true};
}

export class JarvisXRRenderer extends Physical38{
  constructor(canvas){super(canvas);this.michael=new MichaelDirector(this);this.aiVersion='MICHAEL_V50';this.visualProfile='CAMERA_SAFE_MOBILE_WRC_PRESENTATION_ENGINE';this.quality=this.michael.q;this.postBloom=.055;this.postExposure=1.08;this.postLift=.011;this.postVignette=.985;this.michael.setMode('garage');const gl=this.gl;this.capabilities={...this.capabilities,maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxRenderbuffer:gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),samples:gl.getParameter(gl.SAMPLES),renderer:gl.getParameter(gl.RENDERER)};gl.enable(gl.DITHER);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)}
  addGround(){const first=this.drawables.length;super.addGround();for(const d of this.drawables.slice(first))d.world=true;addMichaelWorld(this);this.setMode(this.michael.mode)}
  setMode(m){super.setMode(m);this.michael.setMode(m);const road=m==='drive';for(const d of this.drawables){if(d.env)d.hidden=d.env!==(road?'road':'garage');if(d.driveOnly)d.hidden=!road}this.fogDensity=road?.0032:.0007;this.fogColor=new Float32Array(road?[.033,.045,.050]:[.026,.033,.044]);this.postExposure=road?1.04:1.08;this.gl.clearColor(...(road?[.015,.023,.027,1]:[.018,.024,.034,1]))}
  async loadGLB(url){const first=this.drawables.length,licensed=url.startsWith('blob:')||/michael-v40\.bin(?:\?|$)/.test(url),info=await super.loadGLB(url),printerToMichael=new Float32Array([1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1]);if(licensed){for(const d of this.drawables.slice(first)){d.model=printerToMichael;d.mat.base=new Float32Array([.46,.010,.016]);d.mat.metal=.06;d.mat.rough=.24}addCompletedTwin(this)}for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,spread=Math.max(r,g,b)-Math.min(r,g,b);if(r>g*1.32&&r>b*1.25&&r>.11){m.rough=clamp(m.rough,.21,.29);m.metal=clamp(m.metal,0,.10)}else if(lum<.025){m.rough=Math.max(m.rough,.72);m.metal=0}else if(spread<.09&&lum>.48){m.rough=Math.min(m.rough,.20);m.metal=Math.max(m.metal,.72)}else if(b>r*1.15&&lum<.22){m.rough=Math.min(m.rough,.12);m.metal=0}}this.setMode(this.michael.mode);return{...info,drawables:this.drawables.length,ai:this.aiVersion,profile:this.visualProfile,scanAware:true,completeTwin:this._michaelSystems||null,roadDressing:true,world:this._michaelWorld||null,capabilities:this.capabilities}}
  beginOwnedFrame(){this.michael.tick();return super.beginOwnedFrame()}
  render(){const c=this.beginOwnedFrame();this.renderShadowPass(c);this.beginColorPass(c);this.renderOpaquePass(c);this.renderTransmissionPass(c);this.endOwnedFrame(c)}
  getAIStats(){return{...super.getAIStats(),version:this.aiVersion,profile:this.visualProfile,qualityTier:this.michael.tier,michaelFrameMs:this.michael.ema,michaelJitter:this.michael.jitter,stillFrames:this.michael.still,stationaryConvergence:this.michael.still>140,qualityCeiling:this.michael.maxQuality,mobileBudget:this.michael.mobile,meshSource:'LICENSED_C3_WRC_AUTHORITY_MESH',completeTwin:this._michaelSystems||null,world:this._michaelWorld||null,capabilities:this.capabilities}}
}
