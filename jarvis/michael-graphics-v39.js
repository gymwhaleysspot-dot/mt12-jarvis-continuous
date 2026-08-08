// MICHAEL V56 — visual-foundation renderer: fitted optics, panel-following livery and safe staging.
// stable mobile frame pacing, scene-aware lighting and calibrated camera composition.
import {JarvisXRRenderer as Physical38} from './jarvis-ai-graphics-v38.js?v=michael69-core';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class MichaelDirector{
  constructor(r){this.r=r;this.mode='garage';this.mobile=Math.min(innerWidth||720,innerHeight||1280)<900;this.ema=16.7;this.jitter=0;this.pressure=0;this.badFrames=0;this.goodFrames=0;this.cooldown=0;this.q=this.mobile?.96:1.18;this.still=0;this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.tier='MICHAEL BALANCED';this.exposure=.98;this.maxQuality=this.mobile?1.10:1.38}
  limits(m){const g=m==='garage';return this.mobile?(g?[.78,1.10,18.4]:[.66,1.00,16.8]):(g?[.92,1.38,21.5]:[.74,1.12,16.8])}
  setMode(m){this.mode=m;const [lo,hi]=this.limits(m);this.maxQuality=hi;this.q=clamp(this.q,lo,hi);this.r.quality=this.q}
  tick(){const r=this.r,ms=clamp(r.avgMs||16.7,4,80),e=ms-this.ema;this.ema+=e*.05;this.jitter=this.jitter*.94+Math.abs(e)*.06;const motion=Math.abs((r.yaw||0)-this.lastYaw)+Math.abs((r.pitch||0)-this.lastPitch);this.lastYaw=r.yaw||0;this.lastPitch=r.pitch||0;this.still=motion<.00035?Math.min(900,this.still+1):0;const g=this.mode==='garage',[lo,hi,target]=this.limits(this.mode),raw=Math.max(this.ema/target-1,this.jitter/(target*.28)-1,0);this.pressure=this.pressure*.91+raw*.09;if(this.pressure>.055){this.badFrames++;this.goodFrames=0}else if(this.ema<target*.86&&this.jitter<target*.12){this.goodFrames++;this.badFrames=0}else{this.badFrames=Math.max(0,this.badFrames-1);this.goodFrames=Math.max(0,this.goodFrames-1)}if(this.cooldown>0)this.cooldown--;if(this.badFrames>=8){this.q-=g?.055:.042;this.badFrames=0;this.cooldown=80}else if(!this.cooldown&&this.goodFrames>=75){this.q+=g?.025:.016;this.goodFrames=0;this.cooldown=45}if(g&&this.still>180&&!this.cooldown&&this.ema<target*.9)this.q+=.0008;this.q=clamp(this.q,lo,hi);r.quality=r.quality*.88+this.q*.12;this.tier=r.quality>1.24?'MICHAEL MAX':r.quality>1.06?'MICHAEL LICENSED':r.quality>.86?'MICHAEL ULTRA':'MICHAEL HIGH';const y=r.yaw||0;r.lightDir[0]=Math.sin(y+.54)*.53;r.lightDir[1]=-.805;r.lightDir[2]=Math.cos(y+.54)*.53;r.lightColor[0]=g?2.65:2.35;r.lightColor[1]=g?2.54:2.25;r.lightColor[2]=g?2.43:2.16;r.ambient[0]=g?.34:.25;r.ambient[1]=g?.38:.28;r.ambient[2]=g?.46:.34;this.exposure=g?1.02:.97;r.exposure=this.exposure;r.postLift=g?.013:.010;r.performancePressure=this.pressure}
}

const I4=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const M=(base,metal,rough,em=[0,0,0])=>({base:new Float32Array(base),metal,rough,em:new Float32Array(em)});
class TwinBatch{
  constructor(){this.p=[];this.n=[];this.i=[]}
  q(v,n,ix){const o=this.p.length/3;this.p.push(...v);this.n.push(...n);this.i.push(...ix.map(x=>x+o))}
  box(x,y,z,sx,sy,sz){const a=x-sx/2,b=x+sx/2,c=y-sy/2,d=y+sy/2,e=z-sz/2,f=z+sz/2,V=[a,c,f,b,c,f,b,d,f,a,d,f,b,c,e,a,c,e,a,d,e,b,d,e,a,d,f,b,d,f,b,d,e,a,d,e,a,c,e,b,c,e,b,c,f,a,c,f,b,c,f,b,c,e,b,d,e,b,d,f,a,c,e,a,c,f,a,d,f,a,d,e],N=[];for(const q of [[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]])for(let k=0;k<4;k++)N.push(...q);this.q(V,N,[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23])}
  cylX(x,y,z,w,r,s=18){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,cy=Math.cos(a),sz=Math.sin(a);V.push(x-w/2,y+cy*r,z+sz*r,x+w/2,y+cy*r,z+sz*r);N.push(0,cy,sz,0,cy,sz)}for(let k=0;k<s;k++){const a=k*2,b=a+1,c=a+2,d=a+3;I.push(a,b,d,a,d,c)}const left=V.length/3;V.push(x-w/2,y,z,x+w/2,y,z);N.push(-1,0,0,1,0,0);for(let k=0;k<s;k++){const a=k/s*Math.PI*2,b=(k+1)/s*Math.PI*2,l=V.length/3;V.push(x-w/2,y+Math.cos(a)*r,z+Math.sin(a)*r,x-w/2,y+Math.cos(b)*r,z+Math.sin(b)*r,x+w/2,y+Math.cos(a)*r,z+Math.sin(a)*r,x+w/2,y+Math.cos(b)*r,z+Math.sin(b)*r);N.push(-1,0,0,-1,0,0,1,0,0,1,0,0);I.push(left,l+1,l,left+1,l+2,l+3)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  cylZ(x,y,z,d,r,s=18){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),q=Math.sin(a);V.push(x+c*r,y+q*r,z-d/2,x+c*r,y+q*r,z+d/2);N.push(c,q,0,c,q,0)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}const f=V.length/3;V.push(x,y,z+d/2);N.push(0,0,1);for(let k=0;k<=s;k++){const a=k/s*Math.PI*2;V.push(x+Math.cos(a)*r,y+Math.sin(a)*r,z+d/2);N.push(0,0,1)}for(let k=0;k<s;k++)I.push(f,f+k+1,f+k+2);this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  quad(a,b,c,d,n){const o=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let k=0;k<4;k++)this.n.push(...n);this.i.push(o,o+1,o+2,o,o+2,o+3)}
  coneY(x,y,z,h,r,s=10){const o=this.p.length/3,V=[x,y+h/2,z],N=[0,1,0],I=[];for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,px=Math.cos(a)*r,pz=Math.sin(a)*r;V.push(x+px,y-h/2,z+pz);const l=Math.hypot(px,h*.35,pz)||1;N.push(px/l,r*.35/l,pz/l)}for(let k=0;k<s;k++)I.push(0,k+1,k+2);this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  cylY(x,y,z,h,r,s=14){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),d=Math.sin(a);V.push(x+c*r,y-h/2,z+d*r,x+c*r,y+h/2,z+d*r);N.push(c,0,d,c,0,d)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  ellipseY(x,y,z,h,rx,rz,s=36){const V=[],N=[],I=[],o=this.p.length/3;for(let k=0;k<=s;k++){const a=k/s*Math.PI*2,c=Math.cos(a),d=Math.sin(a),nx=c/rx,nz=d/rz,nl=Math.hypot(nx,nz)||1;V.push(x+c*rx,y-h/2,z+d*rz,x+c*rx,y+h/2,z+d*rz);N.push(nx/nl,0,nz/nl,nx/nl,0,nz/nl)}for(let k=0;k<s;k++){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2)}const top=V.length/3;V.push(x,y+h/2,z,x,y-h/2,z);N.push(0,1,0,0,-1,0);for(let k=0;k<s;k++){const a=k/s*Math.PI*2,b=(k+1)/s*Math.PI*2,l=V.length/3;V.push(x+Math.cos(a)*rx,y+h/2,z+Math.sin(a)*rz,x+Math.cos(b)*rx,y+h/2,z+Math.sin(b)*rz,x+Math.cos(a)*rx,y-h/2,z+Math.sin(a)*rz,x+Math.cos(b)*rx,y-h/2,z+Math.sin(b)*rz);N.push(0,1,0,0,1,0,0,-1,0,0,-1,0);I.push(top,l,l+1,top+1,l+3,l+2)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  torusX(x,y,z,major,tube,width=.40,su=28,sv=9){const V=[],N=[],I=[],o=this.p.length/3;for(let u=0;u<=su;u++){const a=u/su*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);for(let v=0;v<=sv;v++){const b=v/sv*Math.PI*2,cb=Math.cos(b),sb=Math.sin(b),nx=sb/(width*.5),nr=cb/tube,nl=Math.hypot(nx,nr)||1;V.push(x+sb*width*.5,y+ca*(major+cb*tube),z+sa*(major+cb*tube));N.push(nx/nl,ca*nr/nl,sa*nr/nl)}}for(let u=0;u<su;u++)for(let v=0;v<sv;v++){const a=u*(sv+1)+v,b=a+sv+1;I.push(a,b,a+1,b,b+1,a+1)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
  torusZ(x,y,z,major,tube,depth=.08,su=28,sv=8){const V=[],N=[],I=[],o=this.p.length/3;for(let u=0;u<=su;u++){const a=u/su*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);for(let v=0;v<=sv;v++){const b=v/sv*Math.PI*2,cb=Math.cos(b),sb=Math.sin(b),rr=major+cb*tube;V.push(x+ca*rr,y+sa*rr,z+sb*depth);N.push(ca*cb,sa*cb,sb)}}for(let u=0;u<su;u++)for(let v=0;v<sv;v++){const a=u*(sv+1)+v,b=a+sv+1;I.push(a,b,a+1,b,b+1,a+1)}this.p.push(...V);this.n.push(...N);this.i.push(...I.map(v=>v+o))}
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
  const B={contact:new TwinBatch(),rubber:new TwinBatch(),tread:new TwinBatch(),alloy:new TwinBatch(),rimAccent:new TwinBatch(),brake:new TwinBatch(),chassis:new TwinBatch(),cabin:new TwinBatch(),cockpit:new TwinBatch(),carbon:new TwinBatch(),harness:new TwinBatch(),susp:new TwinBatch(),mud:new TwinBatch(),glass:new TwinBatch(),liveryWhite:new TwinBatch(),liveryBlue:new TwinBatch(),liveryGold:new TwinBatch(),lampHousing:new TwinBatch(),projector:new TwinBatch(),frontLens:new TwinBatch(),frontDrl:new TwinBatch(),rearLens:new TwinBatch(),rearLamp:new TwinBatch(),beams:new TwinBatch()};
  const axles=[-1.875,1.875],sides=[-1.37,1.37];
  B.contact.ellipseY(0,.014,0,.026,1.24,2.72,48);
  B.chassis.box(0,.28,0,2.28,.20,4.72);B.chassis.box(0,.43,-.10,1.92,.16,3.92);B.chassis.box(0,.30,-2.42,2.42,.18,.28);B.chassis.box(0,.30,2.42,2.42,.18,.28);
  B.cabin.box(0,.66,.12,1.54,.16,2.04);B.cabin.box(-.45,.98,.10,.40,.44,.56);B.cabin.box(.45,.98,.10,.40,.44,.56);
  // Cockpit depth: dashboard, wheel, console, roll cage and harnesses remain visible through real glass.
  B.cockpit.box(0,1.12,.77,1.74,.16,.42);B.cockpit.box(0,.78,.42,.28,.30,1.18);B.cockpit.box(0,.84,-.76,1.46,.10,.12);
  B.cockpit.torusZ(-.48,1.20,.56,.21,.026,.035,26,7);B.cockpit.box(-.48,1.20,.56,.035,.34,.035);B.cockpit.box(-.48,1.20,.56,.34,.035,.035);
  for(const x of [-.78,.78]){B.carbon.box(x,1.32,.02,.055,1.02,.055);B.carbon.box(x,1.64,-.04,.055,.055,1.36)}B.carbon.box(0,1.73,-.58,1.56,.052,.052);B.carbon.box(0,1.73,.50,1.48,.052,.052);
  for(const x of [-.46,.46]){B.harness.box(x-.09,1.26,.02,.045,.68,.038);B.harness.box(x+.09,1.26,.02,.045,.68,.038);B.harness.box(x,1.03,.16,.26,.055,.038)}
  for(const z of axles){B.susp.box(0,.51,z,2.45,.085,.12);B.susp.box(0,.73,z,2.22,.065,.10);for(const x of sides){B.rubber.torusX(x,.56,z,.375,.137,.43,32,11);for(const rr of [.318,.357,.397,.438])B.tread.torusX(x,.56,z,rr,.011,.438,28,6);B.alloy.torusX(x,.56,z,.238,.048,.438,28,8);B.rimAccent.torusX(x,.56,z,.182,.018,.442,24,6);for(let s=0;s<10;s++)B.alloy.spokeX(x,.56,z,.442,.070,.254,s*Math.PI/5,.025);B.rimAccent.cylX(x,.56,z,.452,.070,20);B.brake.cylX(x,.56,z,.423,.192,28);B.chassis.cylX(x,.56,z,.46,.052,14);B.susp.cylY(x*.83,.72,z,.62,.055,12)}}
  B.susp.box(-.88,.48,-1.875,.62,.055,.55);B.susp.box(.88,.48,-1.875,.62,.055,.55);B.susp.box(-.88,.48,1.875,.62,.055,.55);B.susp.box(.88,.48,1.875,.62,.055,.55);for(const x of [-1.24,1.24]){B.mud.box(x,.39,-2.26,.36,.62,.055);B.mud.box(x,.39,2.26,.36,.62,.055)}
  // Glass is fitted as sloped transparent quads; pillars and openings remain visible.
  B.glass.quad([-.91,1.18,.93],[.91,1.18,.93],[.76,1.76,.52],[-.76,1.76,.52],[0,.55,.84]);
  B.glass.quad([.86,1.18,-.97],[-.86,1.18,-.97],[-.72,1.70,-.62],[.72,1.70,-.62],[0,.55,-.84]);
  for(const x of [-1.015,1.015]){const n=[Math.sign(x),0,0];B.glass.quad([x,1.18,.78],[x,1.18,.02],[x,1.70,.08],[x,1.70,.47],n);B.glass.quad([x,1.18,-.08],[x,1.18,-.78],[x,1.68,-.46],[x,1.68,-.07],n)}
  // The works panel follows the door envelope instead of hovering as a full-height rectangle.
  for(const x of [-1.226,1.226]){const s=Math.sign(x),n=[s,0,0],q=x+s*.004;B.liveryWhite.quad([q,.62,-1.08],[q,.62,.92],[q,1.11,.98],[q,1.14,-.96],n);B.liveryBlue.quad([q+s*.003,.62,-.14],[q+s*.003,.62,.015],[q+s*.003,1.12,.13],[q+s*.003,1.12,-.025],n);B.liveryGold.quad([q+s*.006,.62,.035],[q+s*.006,.62,.17],[q+s*.006,1.12,.29],[q+s*.006,1.12,.155],n)}
  // Fascia-matched lens and ribbon geometry replaces the former floating circular projectors.
  B.frontLens.quad([-.98,.82,2.936],[-.39,.84,3.034],[-.43,1.02,3.026],[-.96,1.00,2.930],[0,0,1]);
  B.frontLens.quad([.39,.84,3.034],[.98,.82,2.936],[.96,1.00,2.930],[.43,1.02,3.026],[0,0,1]);
  B.rearLens.quad([.45,.82,-3.022],[.99,.82,-2.920],[.96,1.02,-2.916],[.48,1.03,-3.018],[0,0,-1]);
  B.rearLens.quad([-.99,.82,-2.920],[-.45,.82,-3.022],[-.48,1.03,-3.018],[-.96,1.02,-2.916],[0,0,-1]);
  // Flush segmented ribbons sit inside those housings instead of floating as white boxes.
  B.frontDrl.quad([-.91,.885,2.925],[-.57,.895,3.005],[-.58,.942,3.002],[-.90,.935,2.922],[0,0,1]);
  B.frontDrl.quad([-.57,.895,3.005],[-.43,.900,3.016],[-.45,.956,3.010],[-.58,.942,3.002],[0,0,1]);
  B.frontDrl.quad([.43,.900,3.016],[.57,.895,3.005],[.58,.942,3.002],[.45,.956,3.010],[0,0,1]);
  B.frontDrl.quad([.57,.895,3.005],[.91,.885,2.925],[.90,.935,2.922],[.58,.942,3.002],[0,0,1]);
  B.rearLamp.quad([.53,.875,-3.012],[.91,.875,-2.928],[.90,.925,-2.925],[.54,.930,-3.010],[0,0,-1]);
  B.rearLamp.quad([.54,.930,-3.010],[.90,.925,-2.925],[.88,.970,-2.922],[.56,.970,-3.006],[0,0,-1]);
  B.rearLamp.quad([-.91,.875,-2.928],[-.53,.875,-3.012],[-.54,.930,-3.010],[-.90,.925,-2.925],[0,0,-1]);
  B.rearLamp.quad([-.90,.925,-2.925],[-.54,.930,-3.010],[-.56,.970,-3.006],[-.88,.970,-2.922],[0,0,-1]);
  B.beams.quad([-.92,.035,2.86],[-.36,.035,2.86],[-.72,.035,9.4],[-2.40,.035,9.4],[0,1,0]);B.beams.quad([.36,.035,2.86],[.92,.035,2.86],[2.40,.035,9.4],[.72,.035,9.4],[0,1,0]);
  const mats={contact:M([.002,.003,.004],0,1),rubber:M([.006,.007,.009],0,.88),tread:M([.018,.020,.024],0,.74),alloy:M([.43,.50,.59],.82,.18),rimAccent:M([.10,.13,.17],.72,.25),brake:M([.24,.26,.29],.76,.28),chassis:M([.014,.017,.021],.10,.72),cabin:M([.010,.013,.017],0,.84),cockpit:M([.018,.022,.028],0,.68),carbon:M([.012,.014,.017],.18,.42),harness:M([.62,.018,.022],0,.62),susp:M([.23,.27,.32],.60,.34),mud:M([.006,.007,.009],0,.94),glass:{...M([.012,.030,.052],0,.065),alpha:.27},liveryWhite:M([.76,.79,.82],.02,.28),liveryBlue:M([.045,.18,.52],.03,.24),liveryGold:M([.94,.58,.045],.04,.23),lampHousing:M([.003,.004,.006],.10,.22),projector:{...M([.20,.27,.35],.18,.06,[.16,.22,.30]),alpha:.82},frontLens:{...M([.20,.28,.36],0,.045),alpha:.16},frontDrl:{...M([.78,.87,.96],.01,.10,[1.00,1.18,1.40]),alpha:.98},rearLens:{...M([.42,.006,.010],0,.07),alpha:.20},rearLamp:{...M([.72,.004,.008],.01,.12,[1.05,.008,.012]),alpha:.96},beams:{...M([.10,.16,.25],0,.64,[.035,.060,.10]),alpha:.020}};
  for(const k of Object.keys(B)){const d=pushBatch(r,B[k],mats[k]);if(d&&k==='beams'){d.driveOnly=true;d.hidden=true}}
  r._michaelSystems={wheelbase:3.75,wheels:4,chassis:true,suspension:true,glass:true,transparentGlass:true,layeredOptics:true,flushLensGeometry:true,projectorLenses:false,lighting:true,fittedLights:true,wrcLivery:true,panelFollowingLivery:true,geometryLivery:true,tireTread:true,twoToneRims:true,cockpit:true,rollCage:true,harnesses:true,materialSeparation:true,batches:Object.keys(B).length}
}
function addMichaelWorld(r){
  const road=new TwinBatch(),shoulder=new TwinBatch(),roadMark=new TwinBatch(),reflector=new TwinBatch(),guardrail=new TwinBatch(),trunk=new TwinBatch(),treesNear=new TwinBatch(),treesFar=new TwinBatch(),garage=new TwinBatch(),garageMark=new TwinBatch(),servicePad=new TwinBatch(),turntable=new TwinBatch(),garageCurb=new TwinBatch(),garageEquipment=new TwinBatch();
  road.box(0,-.08,0,7.4,.14,128);shoulder.box(-5.2,-.12,0,3.0,.12,128);shoulder.box(5.2,-.12,0,3.0,.12,128);for(let z=-60;z<64;z+=5){roadMark.box(-3.25,.018,z,.10,.025,2.8);roadMark.box(3.25,.018,z,.10,.025,2.8);reflector.box(-3.62,.18,z,.09,.36,.12);reflector.box(3.62,.18,z,.09,.36,.12)}
  for(let k=0;k<40;k++){const z=-58+k*3.1+(k%3)*.37;for(const side of [-1,1]){const x=side*(5.3+(k%5)*.58+Math.sin(k*1.7)*.35),h=3.8+(k%7)*.32;trunk.cylY(x,h*.22,z,h*.44,.14+(k%3)*.025,7);const crown=k%2?treesNear:treesFar;crown.coneY(x,h*.55,z,h*.72,1.18+(k%4)*.14,9);crown.coneY(x,h*.78,z,h*.66,.92+(k%3)*.12,9);crown.coneY(x,h*.99,z,h*.54,.66+(k%2)*.10,9)}}
  for(const side of [-1,1]){guardrail.box(side*4.42,.46,0,.10,.12,128);for(let z=-60;z<=60;z+=4)guardrail.box(side*4.42,.24,z,.12,.52,.12)}
  // A broad floor and image-based key avoid camera-crossing physical light bars at every orbit angle.
  garage.box(0,-.11,0,24,.12,24);servicePad.box(0,-.035,0,7.7,.035,9.4);turntable.cylY(0,-.012,0,.052,3.25,48);
  for(const x of [-5.4,5.4])garageMark.box(x,.005,0,.055,.018,18.5);for(const z of [-6.2,6.2])garageMark.box(0,.006,z,10.8,.020,.055);
  for(const x of [-5.65,5.65]){garageCurb.box(x,.09,0,.13,.09,12.4);garageEquipment.box(x,.48,-6.1,.42,.48,.42);garageEquipment.box(x,.48,6.1,.42,.48,.42)}
  for(const z of [-6.65,6.65])garageCurb.box(0,.09,z,11.5,.09,.13);
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
    pushBatch(r,garageMark,M([.36,.46,.56],.22,.40,[.025,.038,.052]),'garage'),
    pushBatch(r,servicePad,M([.030,.036,.046],.14,.48),'garage'),
    pushBatch(r,turntable,M([.052,.062,.078],.20,.46),'garage'),
    pushBatch(r,garageCurb,M([.10,.14,.18],.28,.38,[.015,.045,.070]),'garage'),
    pushBatch(r,garageEquipment,M([.035,.055,.072],.38,.30,[.025,.085,.12]),'garage')
  ].filter(Boolean);
  r._michaelWorld={worldTrees:80,roadEnvironment:true,roadEdgeMarkers:true,reflectorPosts:50,garageEnvironment:true,garageTurntable:true,garageServiceBay:true,garageGuideLighting:true,garagePitCurbs:true,garageEquipment:true,garageSmoke:true,cameraSafeLighting:true,physicalLightBars:false,batchedDraws:created.length,fog:true};
}

export class JarvisXRRenderer extends Physical38{
  constructor(canvas){super(canvas);this.externalQuality=true;this.michael=new MichaelDirector(this);this.aiVersion='MICHAEL_V56';this.visualProfile='FITTED_MOBILE_VISUAL_FOUNDATION';this.quality=this.michael.q;this.postBloom=.035;this.postExposure=1.10;this.postLift=.020;this.postVignette=.99;this.performancePressure=0;this.michael.setMode('garage');const gl=this.gl;this.capabilities={...this.capabilities,maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxRenderbuffer:gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),samples:gl.getParameter(gl.SAMPLES),renderer:gl.getParameter(gl.RENDERER)};gl.enable(gl.DITHER);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)}
  addGround(){const first=this.drawables.length;super.addGround();for(const d of this.drawables.slice(first))d.world=true;addMichaelWorld(this);this.setMode(this.michael.mode)}
  setMode(m){super.setMode(m);this.michael.setMode(m);const road=m==='drive';for(const d of this.drawables){if(d.env)d.hidden=d.env!==(road?'road':'garage');if(d.driveOnly)d.hidden=!road}this.fogDensity=road?.0022:.00045;this.fogColor=new Float32Array(road?[.042,.055,.062]:[.038,.047,.060]);this.postExposure=road?1.10:1.14;this.gl.clearColor(...(road?[.019,.029,.035,1]:[.026,.034,.045,1]))}
  chase(x,y,z,yaw){const fx=Math.sin(yaw),fz=Math.cos(yaw);this.at[0]=x;this.at[1]=y+.82;this.at[2]=z;this.eye[0]=x-fx*10.85;this.eye[1]=y+2.28;this.eye[2]=z-fz*10.85}
  async loadGLB(url){const first=this.drawables.length,licensed=url.startsWith('blob:')||/michael-v40\.bin(?:\?|$)/.test(url),info=await super.loadGLB(url),printerToMichael=new Float32Array([1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1]);if(licensed){for(const d of this.drawables.slice(first)){d.model=printerToMichael;d.mat.base=new Float32Array([.47,.010,.016]);d.mat.metal=.065;d.mat.rough=.165}addCompletedTwin(this)}for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,spread=Math.max(r,g,b)-Math.min(r,g,b);if(r>g*1.32&&r>b*1.25&&r>.11){m.rough=clamp(m.rough,.145,.22);m.metal=clamp(m.metal,.02,.10)}else if(lum<.025){m.rough=Math.max(m.rough,.72);m.metal=0}else if(spread<.09&&lum>.48){m.rough=Math.min(m.rough,.18);m.metal=Math.max(m.metal,.72)}else if(b>r*1.15&&lum<.22){m.rough=Math.min(m.rough,.10);m.metal=0}}this.setMode(this.michael.mode);return{...info,drawables:this.drawables.length,ai:this.aiVersion,profile:this.visualProfile,scanAware:true,completeTwin:this._michaelSystems||null,roadDressing:true,world:this._michaelWorld||null,capabilities:this.capabilities}}
  beginOwnedFrame(){this.michael.tick();return super.beginOwnedFrame()}
  render(){const c=this.beginOwnedFrame();this.renderShadowPass(c);this.beginColorPass(c);this.renderOpaquePass(c);this.renderTransmissionPass(c);this.endOwnedFrame(c)}
  getAIStats(){return{...super.getAIStats(),version:this.aiVersion,profile:this.visualProfile,qualityTier:this.michael.tier,michaelFrameMs:this.michael.ema,michaelJitter:this.michael.jitter,performancePressure:this.michael.pressure,adaptationCooldown:this.michael.cooldown,stillFrames:this.michael.still,stationaryConvergence:this.michael.still>180,qualityCeiling:this.michael.maxQuality,mobileBudget:this.michael.mobile,meshSource:'LICENSED_C3_WRC_AUTHORITY_MESH',completeTwin:this._michaelSystems||null,world:this._michaelWorld||null,capabilities:this.capabilities}}
}
