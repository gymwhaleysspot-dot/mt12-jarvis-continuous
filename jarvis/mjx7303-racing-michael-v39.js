// MICHAEL V57 Racing — owner-photo body authority, camera-safe studio, guarded simulation and Jarvis Dynamics.
import {JarvisXRRenderer} from './michael-graphics-v40.js?v=michael83';
import {JarvisDynamics} from './jarvis-dynamics-v30.js?v=michael83';
import {MichaelEngine} from './michael-engine-v45.js?v=michael83';
import {bootMichaelPolyglot} from './generated/michael-polyglot.js?v=michael83';
import p0 from './michael-v40-payload-00.js?v=michael71';
import p1 from './michael-v40-payload-01.js?v=michael71';
import p2 from './michael-v40-payload-02.js?v=michael71';
import p3 from './michael-v40-payload-03.js?v=michael71';
import p4 from './michael-v40-payload-04.js?v=michael71';
import p5 from './michael-v40-payload-05.js?v=michael71';
import p6 from './michael-v40-payload-06.js?v=michael71';
import p7 from './michael-v40-payload-07.js?v=michael71';
import p8 from './michael-v40-payload-08.js?v=michael71';
import p9 from './michael-v40-payload-09.js?v=michael71';
import p10 from './michael-v40-payload-10.js?v=michael71';
import p11 from './michael-v40-payload-11.js?v=michael71';
import p12 from './michael-v40-payload-12.js?v=michael71';
import p13 from './michael-v40-payload-13.js?v=michael71';
const michaelPayload=p0+p1+p2+p3+p4+p5+p6+p7+p8+p9+p10+p11+p12+p13;
let polyglot=null;bootMichaelPolyglot('./generated/','michael83').then(api=>{polyglot=api;globalThis.__MICHAEL_POLYGLOT=api}).catch(error=>console.warn('MICHAEL V57 optional module fallback',error));
const $=s=>document.querySelector(s),canvas=$('#raceCanvas'),status=$('#assetState');
let xr,dyn,engine,mode='garage',drag=false,lx=0,ly=0,yaw=-.72,pitch=.11,dist=10.2,targetY=.82,last=performance.now();
const input={steer:0,throttle:0,brake:0,surface:'asphalt'},keys=new Set(),tune={motor:1,grip:1,brake:1,aero:1};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const trackCenter=z=>Math.sin(z*.0042)*6.0+Math.sin(z*.011)*2.2;
function roadPose(p,r){const station=clamp((p?.z||0)*1.9,-1540,1540),e=2,c=trackCenter(station),slope=(trackCenter(station+e)-trackCenter(station-e))/(e*2),trackYaw=Math.atan(slope),lat=clamp((p?.x||0)*1.55,-2.35,2.35),nx=Math.cos(trackYaw),nz=-Math.sin(trackYaw);return{x:c+nx*lat,y:(p?.y||0)*.5,z:station+nz*lat,yaw:trackYaw+clamp(r?.yaw||0,-.52,.52),trackYaw,lat}}
function chaseRoad(rp){xr.chase(rp.x,rp.y,rp.z,rp.yaw);const nx=Math.cos(rp.trackYaw),nz=-Math.sin(rp.trackYaw),centerPull=-rp.lat*.72,fx=Math.sin(rp.yaw),fz=Math.cos(rp.yaw);xr.eye[0]+=nx*centerPull+fx*1.35;xr.eye[2]+=nz*centerPull+fz*1.35;xr.at[0]+=nx*centerPull*.18;xr.at[2]+=nz*centerPull*.18;xr.eye[1]+=.48}
function refineVehicle(){
  const ds=xr?.drawables||[],same=(m,v,t=.002)=>!!m?.base&&Math.abs(m.base[0]-v[0])<t&&Math.abs(m.base[1]-v[1])<t&&Math.abs(m.base[2]-v[2])<t,legacy=(m,v,metal,rough)=>same(m,v)&&Math.abs((m.metal??0)-metal)<.015&&Math.abs((m.rough??0)-rough)<.02;
  let hidden=0,projectors=0,wheels=0;
  for(const d of ds){const m=d.mat;
    if(legacy(m,[.56,.58,.61],.01,.58)||legacy(m,[.040,.13,.40],.01,.47)||legacy(m,[.72,.39,.035],.01,.45)||legacy(m,[.010,.013,.017],.28,.34)||legacy(m,[.055,.065,.078],.62,.24)){d.hidden=true;hidden++}
    if(same(m,[.14,.20,.27])){m.base=new Float32Array([.018,.025,.031]);m.em=new Float32Array([.004,.007,.010]);m.metal=.03;m.rough=.28;projectors++}
    if(same(m,[.43,.50,.59],.018)||same(m,[.10,.13,.17],.018)){m.base=new Float32Array([.86,.87,.86]);m.metal=.34;m.rough=.26;wheels++}
  }
  globalThis.__MICHAEL_REFINEMENT={legacyOverlayHidden:hidden,projectorsDarkened:projectors,whiteRallyWheelBatches:wheels,trackPose:true,cabinPreserved:true,carbonPreserved:true,steeringSign:'DIRECT_X',bodyAuthority:'OWNER_7303_PHOTOS'};
}
class BodyBatch{
  constructor(){this.p=[];this.n=[];this.i=[]}
  q(a,b,c,d,n){const o=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let k=0;k<4;k++)this.n.push(...n);this.i.push(o,o+1,o+2,o,o+2,o+3)}
  box(x,y,z,sx,sy,sz){const a=x-sx/2,b=x+sx/2,c=y-sy/2,d=y+sy/2,e=z-sz/2,f=z+sz/2;this.q([a,c,f],[b,c,f],[b,d,f],[a,d,f],[0,0,1]);this.q([b,c,e],[a,c,e],[a,d,e],[b,d,e],[0,0,-1]);this.q([a,d,f],[b,d,f],[b,d,e],[a,d,e],[0,1,0]);this.q([a,c,e],[b,c,e],[b,c,f],[a,c,f],[0,-1,0]);this.q([b,c,f],[b,c,e],[b,d,e],[b,d,f],[1,0,0]);this.q([a,c,e],[a,c,f],[a,d,f],[a,d,e],[-1,0,0])}
}
function pushBody(b,base,metal=.02,rough=.48){if(!b.p.length)return 0;xr._mesh(new Float32Array(b.p),new Float32Array(b.n),new Uint32Array(b.i),{base:new Float32Array(base),metal,rough,em:new Float32Array([0,0,0])},new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));return 1}
function ring(b,x,cy,z,rx,ry,ix,iy,seg=20){for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2,c=(k+1)/seg*Math.PI*2,oa=[x+Math.cos(a)*rx,cy+Math.sin(a)*ry,z],ob=[x+Math.cos(c)*rx,cy+Math.sin(c)*ry,z],ib=[x+Math.cos(c)*ix,cy+Math.sin(c)*iy,z+.003],ia=[x+Math.cos(a)*ix,cy+Math.sin(a)*iy,z+.003];b.q(oa,ob,ib,ia,[0,0,1])}}
// MICHAEL_VISUAL_GENOME_BEGIN -- Nickelle generated; automatic edits stay inside this authority block.
globalThis.__MICHAEL_NATIVE_VISUAL={wheelRadius:0.512,wheelTrackX:1.37,wheelWidth:0.43,wheelY:0.56,paintRoughnessScale:1,darkRoughnessScale:1,exposureScale:1,keyLightScale:1,ambientScale:1,headlampTopology:'C3WRC_SPLIT_OPTICS_V58',grilleTopology:'C3WRC_DEEP_MOUTH_V58',generation:5};
function addBodyAuthority(){
  if(!xr?._mesh)return;
  const dark=new BodyBatch(),red=new BodyBatch(),white=new BodyBatch(),yellow=new BodyBatch(),blue=new BodyBatch(),lens=new BodyBatch(),tail=new BodyBatch(),mesh=new BodyBatch();
  const rrPts=(cx,cy,w,h,r,steps=5)=>{const hw=w/2,hh=h/2,rad=Math.max(.004,Math.min(r,hw-.002,hh-.002)),out=[];for(const [ox,oy,a0] of [[hw-rad,hh-rad,0],[-hw+rad,hh-rad,Math.PI/2],[-hw+rad,-hh+rad,Math.PI],[hw-rad,-hh+rad,Math.PI*1.5]])for(let j=0;j<=steps;j++){const a=a0+j/steps*Math.PI/2;out.push([cx+ox+Math.cos(a)*rad,cy+oy+Math.sin(a)*rad])}return out};
  const rrRing=(b,cx,cy,z,w,h,r,iw,ih,ir,nz=1)=>{const o=rrPts(cx,cy,w,h,r),n=rrPts(cx,cy,iw,ih,ir);for(let k=0;k<o.length;k++){const j=(k+1)%o.length;if(nz>0)b.q([o[k][0],o[k][1],z],[o[j][0],o[j][1],z],[n[j][0],n[j][1],z+.003],[n[k][0],n[k][1],z+.003],[0,0,1]);else b.q([o[j][0],o[j][1],z],[o[k][0],o[k][1],z],[n[k][0],n[k][1],z-.003],[n[j][0],n[j][1],z-.003],[0,0,-1])}};
  // C3 WRC front: one dominant black intake, visible depth, fine diagonal mesh and a separate lower splitter.
  const gw=1.88,gy=.49,gh=.62,gr=.17,gf=.055;
  rrRing(dark,0,gy,3.084,gw,gh,gr,gw-gf*2,gh-gf*2,gr-gf);
  dark.box(0,gy,3.050,gw-gf*2.1,gh-gf*2.1,.055);
  for(let x=-.78;x<=.78;x+=.14){mesh.q([x-.010,gy-gh*.38,3.091],[x+.010,gy-gh*.38,3.091],[x+.22,gy+gh*.38,3.091],[x+.20,gy+gh*.38,3.091],[0,0,1]);mesh.q([x-.20,gy+gh*.38,3.090],[x-.18,gy+gh*.38,3.090],[x+.02,gy-gh*.38,3.090],[x,gy-gh*.38,3.090],[0,0,1])}
  dark.q([-1.10,.165,3.025],[1.10,.165,3.025],[1.29,.235,2.67],[-1.29,.235,2.67],[0,1,0]);
  // Split optics: slim upper DRL/light blade plus recessed lower projector chambers with real surround thickness.
  for(const s of [-1,1]){const cx=s*.91,w=.54,h=.31,cr=.12,rw=w-.10,rh=h-.09;rrRing(red,cx,.61,3.085,w,h,cr,rw,rh,.075);rrRing(dark,cx,.61,3.091,rw,rh,.075,w*.48,h*.52,.035);dark.box(cx,.61,3.058,w*.48,h*.52,.060);lens.box(cx-s*.025,.61,3.104,.145,.090,.026);white.q([s*.47,.925,3.098],[s*1.24,.895,3.098],[s*1.18,.965,3.098],[s*.52,.995,3.098],[0,0,1]);dark.q([s*.48,.899,3.093],[s*1.24,.869,3.093],[s*1.20,.891,3.093],[s*.50,.922,3.093],[0,0,1])}
  // Side wide-body authority, deep lower aero and the recognizable white/yellow/blue rally identity bands.
  for(const s of [-1,1]){const n=[s,0,0],x=s*1.255;dark.q([x,.39,2.62],[x,.39,2.02],[x,.99,1.78],[x,1.08,2.33],n);dark.q([x,.42,-1.43],[x,.42,-1.93],[x,.82,-2.05],[x,.91,-1.58],n);red.q([x+s*.006,.64,-1.02],[x+s*.006,.64,.98],[x+s*.006,1.15,.88],[x+s*.006,1.18,-.94],n);dark.q([x+s*.011,.57,-.82],[x+s*.011,.57,.76],[x+s*.011,.88,.70],[x+s*.011,.91,-.76],n);dark.q([x+s*.016,.50,-1.24],[x+s*.016,.50,1.17],[x+s*.016,.59,1.09],[x+s*.016,.59,-1.17],n);yellow.q([x+s*.020,.585,-.66],[x+s*.020,.585,-.44],[x+s*.020,1.08,-.13],[x+s*.020,1.08,-.35],n);white.q([x+s*.021,.59,-.39],[x+s*.021,.59,-.13],[x+s*.021,1.10,.20],[x+s*.021,1.10,-.06],n);blue.q([x+s*.022,.595,-.91],[x+s*.022,.595,-.70],[x+s*.022,1.07,-.41],[x+s*.022,1.07,-.62],n);dark.box(s*1.17,1.39,.48,.17,.10,.25)}
  // Greenhouse breakup and roof identity retained above the licensed shell.
  dark.q([-.76,1.30,2.02],[.76,1.30,2.02],[.66,1.68,1.02],[-.66,1.68,1.02],[0,.55,.84]);white.q([-.94,1.795,-1.40],[.94,1.795,-1.40],[.84,1.835,.92],[-.84,1.835,.92],[0,1,0]);white.q([-.72,1.205,2.065],[.72,1.205,2.065],[.62,1.46,1.12],[-.62,1.46,1.12],[0,.55,.84]);
  white.box(0,1.92,.34,.42,.13,.48);red.box(0,1.995,.21,.39,.025,.20);
  // Rear: larger integrated lamps, proper black lower bumper/diffuser, exhaust and cleaner wing hardware.
  for(const s of [-1,1]){const cx=s*.79;rrRing(tail,cx,.89,-3.070,.50,.20,.075,.39,.105,.045,-1);tail.box(cx,.89,-3.083,.30,.075,.028);dark.q([s*.98,1.57,-2.47],[s*.98,1.57,-2.74],[s*1.18,1.88,-2.82],[s*1.18,1.84,-2.49],[s,0,0]);dark.box(s*.88,1.62,-2.57,.055,.35,.16)}
  dark.q([-.98,1.59,-2.49],[.98,1.59,-2.49],[.93,1.66,-2.70],[-.93,1.66,-2.70],[0,1,0]);dark.box(0,1.62,-2.62,1.92,.085,.34);
  dark.q([-1.10,.17,-3.055],[1.10,.17,-3.055],[.92,.56,-3.055],[-.92,.56,-3.055],[0,0,-1]);for(const x of [-.70,-.35,0,.35,.70])dark.q([x-.030,.17,-3.058],[x+.030,.17,-3.058],[x+.020,.53,-2.84],[x-.020,.53,-2.84],[0,0,-1]);dark.box(0,.37,-3.100,.34,.13,.12);
  const draws=pushBody(dark,[.006,.008,.010],.12,.42)+pushBody(red,[.64,.018,.020],.02,.30)+pushBody(white,[.88,.88,.85],.02,.30)+pushBody(yellow,[.93,.61,.012],.01,.34)+pushBody(blue,[.035,.19,.58],.03,.30)+pushBody(lens,[.72,.82,.90],.18,.16)+pushBody(tail,[.95,.018,.014],.05,.20)+pushBody(mesh,[.10,.11,.12],.04,.56);
  globalThis.__MICHAEL_BODY_AUTHORITY={source:'OWNER_7303_PHOTOS_C3WRC_RECONSTRUCTION',generation:5,frontGrille:true,grilleTopology:'C3WRC_DEEP_MOUTH_V58',recessedGrilleCavity:true,grillePerimeter:true,grilleMesh:true,splitOptics:true,headlampTopology:'C3WRC_SPLIT_OPTICS_V58',redProjectorSurrounds:true,recessedBlackLampCavities:true,projectorLensDepth:true,thinUpperDRL:true,legacyEllipseProjectors:false,blackFrontArches:true,redDoorAuthority:true,blackLowerDoorInsert:true,blueYellowWhiteLivery:true,whiteRoof:true,whiteHoodGraphic:true,rectangularRoofScoop:true,licensedMainWing:true,reinforcedWingHardware:true,rearLampVolume:true,rearDiffuser:true,centralExhaust:true,whiteRallyWheels:true,nickelleNativeVisual:true,batchedDraws:draws};
}
// MICHAEL_VISUAL_GENOME_END
class TruthTelemetry{
  constructor(){this.ready=false;this.filtered={truthMph:0,truthRpm:900,batteryV:16.7}}
  update(raw,dt){const valid=(v,fallback,lo,hi)=>Number.isFinite(v)?clamp(v,lo,hi):fallback,f=this.filtered,speed=valid(raw.truthMph,f.truthMph,0,80),rpm=valid(raw.truthRpm,f.truthRpm,900,37000),battery=valid(raw.batteryV,f.batteryV,8,18);if(!this.ready){f.truthMph=speed;f.truthRpm=rpm;f.batteryV=battery;this.ready=true}else{const sa=clamp(dt*8,.08,.38),ra=clamp(dt*10,.10,.45),ba=clamp(dt*.9,.008,.04),rpmStep=9000*dt;f.truthMph+=(speed-f.truthMph)*sa;f.truthRpm+=clamp((rpm-f.truthRpm)*ra,-rpmStep,rpmStep);f.batteryV+=(battery-f.batteryV)*ba}globalThis.__MICHAEL_TELEMETRY={raw:{truthMph:speed,truthRpm:rpm,batteryV:battery},filtered:{...f}};return f}
  reset(){this.ready=false}
}
const telemetry=new TruthTelemetry;
const payloadURL=()=>{const raw=atob(michaelPayload),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}))},scan=payloadURL();
const fallback='https://gymwhaleysspot-dot.github.io/mt12-jarvis-continuous/assets/mjx7303/mjx7303-v33.glb?v=michael83-fallback';
async function loadVehicle(){xr=new JarvisXRRenderer(canvas);xr.setMode('garage');xr.addGround();dyn=new JarvisDynamics();engine=new MichaelEngine({renderer:xr,dynamics:dyn,canvas}).bootstrap();globalThis.__MICHAEL_ENGINE=engine.report();status.textContent='MICHAEL V57 · OWNER 7303 PHOTO AUTHORITY · LOADING…';try{const info=await xr.loadGLB(scan);refineVehicle();addBodyAuthority();status.textContent=`MICHAEL V57 · ${info.drawables+8} GPU DRAWS · OWNER 7303 PHOTO BODY AUTHORITY`;window.__MICHAEL_SYSTEMS=info.completeTwin;status.className='asset-state ok';clearTimeout(window.__MICHAEL_STATUS_TIMER);window.__MICHAEL_STATUS_TIMER=setTimeout(()=>status.classList.add('settled'),2200);window.__MICHAEL_MODEL=true;return info}catch(e){const primary=String(e?.message||e);console.error('MICHAEL V57 PRIMARY MODEL ERROR',scan,primary);window.__MICHAEL_ERROR={primary,url:scan};status.textContent=`MICHAEL V57 PRIMARY ${primary} · V33 CONTINUITY ACTIVE`;status.className='asset-state warn';status.classList.remove('settled');const info=await xr.loadGLB(fallback);window.__MICHAEL_MODEL=false;return{...info,primaryError:primary}}}
try{await loadVehicle()}catch(e){console.error(e);status.textContent='MICHAEL V57 MODEL LOAD FAILED · '+e.message;status.className='asset-state warn';status.classList.remove('settled')}
function orbit(){xr?.orbit(yaw,pitch,dist,targetY)}orbit();
const fallbackViews={front:[0,.050,9.80,.50],three:[-.72,.105,11.10,.55],side:[-Math.PI/2,.050,12.30,.53],rear:[Math.PI,.050,9.80,.50],top:[-.42,.895,17.20,.40]};
function setView(name){const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight),p=polyglot?.cameraPreset?.(name,aspect);if(p){yaw=p.yaw;pitch=p.pitch;dist=p.distance;targetY=p.targetY}else [yaw,pitch,dist,targetY]=fallbackViews[name]||fallbackViews.three;orbit()}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));setView(b.dataset.view)}));
setView(document.querySelector('[data-view].active')?.dataset.view||'three');
canvas.addEventListener('pointerdown',e=>{engine?.noteInput(e.timeStamp);if(mode!=='garage')return;drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag||mode!=='garage')return;yaw-=(e.clientX-lx)*.0055;pitch=Math.max(-.04,Math.min(.96,pitch+(e.clientY-ly)*.0038));lx=e.clientX;ly=e.clientY;orbit()});
canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
canvas.addEventListener('wheel',e=>{if(mode!=='garage')return;e.preventDefault();dist=Math.max(9.3,Math.min(15.5,dist+Math.sign(e.deltaY)*.32));orbit()},{passive:false});
addEventListener('keydown',e=>{engine?.noteInput(e.timeStamp);keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()},{passive:false});addEventListener('keyup',e=>keys.delete(e.code));
function hold(sel,on,off){const b=$(sel);if(!b)return;const d=e=>{e.preventDefault();engine?.noteInput(e.timeStamp);on();b.setPointerCapture?.(e.pointerId)},u=e=>{e.preventDefault();off()};b.addEventListener('pointerdown',d,{passive:false});b.addEventListener('pointerup',u,{passive:false});b.addEventListener('pointercancel',u,{passive:false})}
hold('#left',()=>input.steer=-1,()=>input.steer=0);hold('#right',()=>input.steer=1,()=>input.steer=0);hold('#throttle',()=>input.throttle=1,()=>input.throttle=0);hold('#brake',()=>input.brake=1,()=>input.brake=0);
function clearControls(){keys.clear();input.steer=0;input.throttle=0;input.brake=0;drag=false}
function setMode(m){mode=m;clearControls();telemetry.reset();xr?.setMode(m);engine?.setMode(m);document.body.dataset.mode=m;$('#garageBtn')?.classList.toggle('active',m==='garage');$('#driveBtn')?.classList.toggle('active',m==='drive');if(m==='garage'){dyn?.reset();xr?.setRoot(0,0,0,0);setView('three')}}
$('#garageBtn')?.addEventListener('click',()=>setMode('garage'));$('#driveBtn')?.addEventListener('click',()=>setMode('drive'));
document.querySelectorAll('[data-upgrade]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.upgrade;tune[k]=Math.min(1.30,(tune[k]||1)+.05);b.textContent=Math.round(tune[k]*100)+'%';dyn?.setTune(tune)}));
function frame(now){engine?.beginFrame(now);let elapsed=(now-last)/1000;const interrupted=!Number.isFinite(elapsed)||elapsed<=0||elapsed>.25;if(interrupted){elapsed=.016;clearControls()}const dt=clamp(elapsed,.004,.04);last=now;if(xr){xr.resize();if(mode==='drive'&&dyn){const steerKey=(keys.has('ArrowLeft')||keys.has('KeyA'))?-1:(keys.has('ArrowRight')||keys.has('KeyD'))?1:null,thKey=keys.has('ArrowUp')||keys.has('KeyW'),brKey=keys.has('ArrowDown')||keys.has('KeyS')||keys.has('Space');dyn.setInput({steer:steerKey??input.steer,throttle:thKey?1:input.throttle,brake:brKey?1:input.brake,surface:input.surface});dyn.setTune(tune);let s=dyn.step(dt)||{},p=s.position,r=s.rotation,valid=p&&r&&[p.x,p.y,p.z,r.yaw].every(Number.isFinite);if(!valid){clearControls();dyn.reset();engine?.recoverIntegrity();s=dyn.step(.004)||{};p=s.position||{x:0,y:0,z:0};r=s.rotation||{yaw:0}}const t=telemetry.update(s,dt),rp=roadPose(p,r);xr.setRoot(rp.x,rp.y,rp.z,rp.yaw);engine?.setVehiclePose(rp.x,rp.y,rp.z,rp.yaw);chaseRoad(rp);globalThis.__MICHAEL_TRACK_POSE=rp;$('#mph').textContent=Math.round(t.truthMph);$('#rpm').textContent=Math.round(t.truthRpm);$('#battery').textContent=t.batteryV.toFixed(1)+'V';$('#tc').textContent=s.tc?'TC':'—';$('#abs').textContent=s.abs?'ABS':'—';$('#damage').textContent=Math.round(clamp(s.damage||0,0,1)*100)+'%';$('#reason').textContent=String(s.reason||'—')}const requested=polyglot?.exposure(mode==='drive',xr.avgMs||16.7,dt)??(mode==='drive'?1.04:1.08),pressure=clamp(xr.performancePressure||0,0,1);xr.postExposure=clamp(requested-pressure*.04,.96,1.14);const particleBudget=polyglot?.particleBudget(xr.avgMs||16.7,xr.quality||1)??120;const polyQuality=polyglot?.quality(xr.avgMs||16.7,xr.quality||1)??1;globalThis.__MICHAEL_POLYGLOT_FRAME={postExposure:xr.postExposure,particleBudget,quality:polyQuality,performancePressure:pressure};if(engine)engine.render();else xr.render();engine?.endFrame();const ai=xr.getAIStats?.()||{};window.__MICHAEL_GRAPHICS=ai;$('#frame').textContent=(xr.avgMs||0).toFixed(1)+' ms';$('#scale').textContent=Math.round((xr.quality||1)*100)+'%';const tier=$('#tier');if(tier)tier.textContent=ai.qualityTier||'MICHAEL LICENSED'}requestAnimationFrame(frame)}
requestAnimationFrame(frame);window.__V39_READY=true;window.__MICHAEL_READY=true;addEventListener('resize',()=>xr?.resize());addEventListener('blur',clearControls);document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden)clearControls()});