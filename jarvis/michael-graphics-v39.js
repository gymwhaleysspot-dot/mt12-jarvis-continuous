// MICHAEL V49 — calibrated mobile WRC presentation: licensed authority mesh, energy-aware paint,
// dark fitted glass, rounded rally tires, camera-safe studio lighting and a neutral forest world.
import {JarvisXRRenderer as Physical38} from './jarvis-ai-graphics-v38.js?v=michael62-core';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class MichaelDirector{
  constructor(r){this.r=r;this.mode='garage';this.ema=16.7;this.jitter=0;this.q=1.48;this.still=0;this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.tier='MICHAEL LICENSED';this.exposure=.92}
  setMode(m){this.mode=m;this.q=clamp(this.q,m==='garage'?1.18:.74,m==='garage'?1.75:1.16);this.r.quality=this.q}
  tick(){const r=this.r,ms=r.avgMs||16.7,e=ms-this.ema;this.ema+=e*.045;this.jitter=this.jitter*.945+Math.abs(e)*.055;const motion=Math.abs((r.yaw||0)-this.lastYaw)+Math.abs((r.pitch||0)-this.lastPitch);this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.still=motion<.00035?Math.min(900,this.still+1):0;const g=this.mode==='garage',target=g?24.0:16.8,lo=g?1.18:.74,hi=g?1.75:1.16;if(this.ema>target*1.08||this.jitter>target*.26)this.q-=g?.030:.022;else if(this.ema<target*.77&&this.jitter<target*.14)this.q+=g?.020:.010;if(g&&this.still>90)this.q+=.0035;if(g&&this.still>300)this.q+=.0025;this.q=clamp(this.q,lo,hi);r.quality=r.quality*.84+this.q*.16;this.tier=r.quality>1.66?'MICHAEL MAX':r.quality>1.48?'MICHAEL LICENSED':r.quality>1.26?'MICHAEL ULTRA':'MICHAEL HIGH';const y=r.yaw||0;r.lightDir[0]=Math.sin(y+.54)*.53;r.lightDir[1]=-.805;r.lightDir[2]=Math.cos(y+.54)*.53;r.lightColor[0]=g?2.72:2.34;r.lightColor[1]=g?2.58:2.25;r.lightColor[2]=g?2.46:2.18;r.ambient[0]=g?.17:.13;r.ambient[1]=g?.20:.16;r.ambient[2]=g?.25:.21;this.exposure=g?.94:.88;r.exposure=this.exposure;r.postLift=g?.003:.002}
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
  const B={contact:new TwinBatch(),rubber:new TwinBatch(),alloy:new TwinBatch(),brake:new TwinBatch(),chassis:new TwinBatch(),cabin:new TwinBatch(),susp:new TwinBatch(),mud:new TwinBatch(),glass:new TwinBatch(),lights:new TwinBatch(),beams:new TwinBatch()};
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
  // Compact lens quads sit inside the scanned lamp recesses instead of floating boxes.
  B.lights.quad([-.99,.78,2.91],[-.40,.79,3.02],[-.43,.98,3.00],[-.96,.99,2.90],[0,0,1]);
  B.lights.quad([.40,.79,3.02],[.99,.78,2.91],[.96,.99,2.90],[.43,.98,3.00],[0,0,1]);
  B.lights.quad([.42,.82,-3.00],[.99,.82,-2.91],[.96,1.00,-2.90],[.44,1.00,-3.00],[0,0,-1]);
  B.lights.quad([-.99,.82,-2.91],[-.42,.82,-3.00],[-.44,1.00,-3.00],[-.96,1.00,-2.90],[0,0,-1]);B.beams.quad([-.96,.035,2.86],[-.25,.035,2.86],[-.55,.035,12.0],[-3.45,.035,12.0],[0,1,0]);B.beams.quad([.25,.035,2.86],[.96,.035,2.86],[3.45,.035,12.0],[.55,.035,12.0],[0,1,0]);
  const mats={contact:M([.002,.003,.004],0,1),rubber:M([.007,.008,.010],0,.80),alloy:M([.31,.36,.43],.78,.24),brake:M([.19,.21,.24],.72,.31),chassis:M([.014,.017,.021],.10,.72),cabin:M([.008,.010,.013],0,.88),susp:M([.21,.24,.28],.62,.36),mud:M([.006,.007,.009],0,.94),glass:{...M([.008,.025,.060],0,.075),alpha:.52},lights:{...M([.58,.68,.80],.02,.21,[.58,.72,.94]),alpha:.90},beams:{...M([.15,.24,.38],0,.55,[.08,.14,.24]),alpha:.045}};
  for(const k of Object.keys(B))pushBatch(r,B[k],mats[k]);
  r._michaelSystems={wheelbase:3.75,wheels:4,chassis:true,suspension:true,glass:true,transparentGlass:true,lighting:true,fittedLights:true,wrcLivery:true,cockpit:true,batches:Object.keys(B).length}
}
function addMichaelWorld(r){
  const road=new TwinBatch(),shoulder=new TwinBatch(),roadMark=new TwinBatch(),reflector=new TwinBatch(),guardrail=new TwinBatch(),trunk=new TwinBatch(),treesNear=new TwinBatch(),treesFar=new TwinBatch(),garage=new TwinBatch(),turntable=new TwinBatch(),garageLights=new TwinBatch();
  road.box(0,-.08,0,7.4,.14,128);shoulder.box(-5.2,-.12,0,3.0,.12,128);shoulder.box(5.2,-.12,0,3.0,.12,128);for(let z=-60;z<64;z+=5){roadMark.box(-3.25,.018,z,.10,.025,2.8);roadMark.box(3.25,.018,z,.10,.025,2.8);reflector.box(-3.62,.18,z,.09,.36,.12);reflector.box(3.62,.18,z,.09,.36,.12)}
  for(let k=0;k<40;k++){const z=-58+k*3.1+(k%3)*.37;for(const side of [-1,1]){const x=side*(5.3+(k%5)*.58+Math.sin(k*1.7)*.35),h=3.8+(k%7)*.32;trunk.cylY(x,h*.22,z,h*.44,.14+(k%3)*.025,7);const crown=k%2?treesNear:treesFar;crown.coneY(x,h*.55,z,h*.72,1.18+(k%4)*.14,9);crown.coneY(x,h*.78,z,h*.66,.92+(k%3)*.12,9);crown.coneY(x,h*.99,z,h*.54,.66+(k%2)*.10,9)}}
  for(const side of [-1,1]){guardrail.box(side*4.42,.46,0,.10,.12,128);for(let z=-60;z<=60;z+=4)guardrail.box(side*4.42,.24,z,.12,.52,.12)}
  garage.box(0,-.11,0,9.4,.12,9.4);turntable.cylY(0,-.035,0,.075,3.25,48);for(const [x,z] of [[-4.30,-4.30],[4.30,-4.30],[-4.30,4.30],[4.30,4.30]])garageLights.box(x,2.05,z,.075,3.35,.075);
  const created=[
    pushBatch(r,road,M([.035,.042,.046],0,.92),'road'),
    pushBatch(r,shoulder,M([.085,.060,.036],0,.98),'road'),
    pushBatch(r,roadMark,M([.56,.60,.62],0,.68),'road'),
    pushBatch(r,reflector,M([.60,.68,.72],.05,.24,[.12,.16,.20]),'road'),
    pushBatch(r,guardrail,M([.27,.31,.34],.72,.32),'road'),
    pushBatch(r,trunk,M([.085,.040,.020],0,.94),'road'),
    pushBatch(r,treesNear,M([.015,.090,.040],0,.96),'road'),
    pushBatch(r,treesFar,M([.008,.045,.028],0,.98),'road'),
    pushBatch(r,garage,M([.006,.008,.012],.02,.86),'garage'),
    pushBatch(r,turntable,M([.038,.045,.056],.26,.40),'garage'),pushBatch(r,garageLights,M([.34,.42,.50],0,.30,[.36,.48,.64]),'garage')
  ].filter(Boolean);
  r._michaelWorld={worldTrees:80,roadEnvironment:true,roadEdgeMarkers:true,reflectorPosts:50,garageEnvironment:true,garageTurntable:true,garageSmoke:true,batchedDraws:created.length,fog:true};
}

export class JarvisXRRenderer extends Physical38{
  constructor(canvas){super(canvas);this.michael=new MichaelDirector(this);this.aiVersion='MICHAEL_V49';this.visualProfile='CALIBRATED_MOBILE_WRC_PRESENTATION_ENGINE';this.quality=1.48;this.postBloom=.10;this.postExposure=1.22;this.postVignette=.93;this.michael.setMode('garage');const gl=this.gl;this.capabilities={...this.capabilities,maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxRenderbuffer:gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),samples:gl.getParameter(gl.SAMPLES),renderer:gl.getParameter(gl.RENDERER)};gl.enable(gl.DITHER);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)}
  addGround(){const first=this.drawables.length;super.addGround();for(const d of this.drawables.slice(first))d.world=true;addMichaelWorld(this);this.setMode(this.michael.mode)}
  setMode(m){super.setMode(m);this.michael.setMode(m);const road=m==='drive';for(const d of this.drawables){if(d.env)d.hidden=d.env!==(road?'road':'garage')}this.fogDensity=road?.0042:.0012;this.fogColor=new Float32Array(road?[.022,.031,.034]:[.014,.018,.024]);this.postExposure=road?1.10:1.22;this.gl.clearColor(...(road?[.008,.014,.017,1]:[.006,.009,.014,1]))}
  async loadGLB(url){const first=this.drawables.length,licensed=url.startsWith('blob:')||/michael-v40\.bin(?:\?|$)/.test(url),info=await super.loadGLB(url),printerToMichael=new Float32Array([1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1]);if(licensed){for(const d of this.drawables.slice(first)){d.model=printerToMichael;d.mat.base=new Float32Array([.34,.008,.014]);d.mat.metal=.08;d.mat.rough=.21}addCompletedTwin(this)}for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,spread=Math.max(r,g,b)-Math.min(r,g,b);if(r>g*1.32&&r>b*1.25&&r>.11){m.rough=clamp(m.rough,.18,.25);m.metal=clamp(m.metal,0,.12)}else if(lum<.025){m.rough=Math.max(m.rough,.72);m.metal=0}else if(spread<.09&&lum>.48){m.rough=Math.min(m.rough,.18);m.metal=Math.max(m.metal,.76)}else if(b>r*1.15&&lum<.22){m.rough=Math.min(m.rough,.09);m.metal=0}}return{...info,drawables:this.drawables.length,ai:this.aiVersion,profile:this.visualProfile,scanAware:true,completeTwin:this._michaelSystems||null,roadDressing:true,world:this._michaelWorld||null,capabilities:this.capabilities}}
  beginOwnedFrame(){this.michael.tick();return super.beginOwnedFrame()}
  render(){const c=this.beginOwnedFrame();this.renderShadowPass(c);this.beginColorPass(c);this.renderOpaquePass(c);this.renderTransmissionPass(c);this.endOwnedFrame(c)}
  getAIStats(){return{...super.getAIStats(),version:this.aiVersion,profile:this.visualProfile,qualityTier:this.michael.tier,michaelFrameMs:this.michael.ema,michaelJitter:this.michael.jitter,stillFrames:this.michael.still,stationaryConvergence:this.michael.still>90,qualityCeiling:1.75,meshSource:'LICENSED_C3_WRC_AUTHORITY_MESH',completeTwin:this._michaelSystems||null,world:this._michaelWorld||null,capabilities:this.capabilities}}
}
