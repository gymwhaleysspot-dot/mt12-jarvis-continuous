// MICHAEL GRAPHICS V58 — whole-car detail, continuous rally stage and adaptive scene intelligence.
// Owner photographs remain primary body authority. This layer adds depth/detail and a road mesh that
// uses the exact same centerline/range as MICHAEL V57 roadPose without touching dynamics or cameras.
import {JarvisXRRenderer as BaseV40} from './michael-graphics-v40-base.js?v=michael-v58-base';
const I4=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const mat=(base,metal,rough,em=[0,0,0])=>({base:new Float32Array(base),metal,rough,em:new Float32Array(em)});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class MeshBatch{
  constructor(){this.p=[];this.n=[];this.i=[]}
  q(a,b,c,d,n=[0,1,0]){const o=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let k=0;k<4;k++)this.n.push(...n);this.i.push(o,o+1,o+2,o,o+2,o+3)}
  box(x,y,z,sx,sy,sz){const a=x-sx/2,b=x+sx/2,c=y-sy/2,d=y+sy/2,e=z-sz/2,f=z+sz/2;this.q([a,c,f],[b,c,f],[b,d,f],[a,d,f],[0,0,1]);this.q([b,c,e],[a,c,e],[a,d,e],[b,d,e],[0,0,-1]);this.q([a,d,f],[b,d,f],[b,d,e],[a,d,e],[0,1,0]);this.q([a,c,e],[b,c,e],[b,c,f],[a,c,f],[0,-1,0]);this.q([b,c,f],[b,c,e],[b,d,e],[b,d,f],[1,0,0]);this.q([a,c,e],[a,c,f],[a,d,f],[a,d,e],[-1,0,0])}
  ellipseZ(x,y,z,depth,rx,ry,seg=24){const o=this.p.length/3;for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),nx=c/rx,ny=s/ry,nl=Math.hypot(nx,ny)||1;this.p.push(x+c*rx,y+s*ry,z-depth/2,x+c*rx,y+s*ry,z+depth/2);this.n.push(nx/nl,ny/nl,0,nx/nl,ny/nl,0)}for(let k=0;k<seg;k++){const a=o+k*2;this.i.push(a,a+1,a+3,a,a+3,a+2)}const fc=this.p.length/3;this.p.push(x,y,z+depth/2);this.n.push(0,0,1);for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2;this.p.push(x+Math.cos(a)*rx,y+Math.sin(a)*ry,z+depth/2);this.n.push(0,0,1)}for(let k=0;k<seg;k++)this.i.push(fc,fc+k+1,fc+k+2)}
}
function upload(r,b,m,{world=false,tier='core',tag='',env=null}={}){if(!b.i.length)return null;r._mesh(new Float32Array(b.p),new Float32Array(b.n),new Uint32Array(b.i),m,I4());const d=r.drawables[r.drawables.length-1];if(d){d.world=world;if(env)d.env=env;d._michaelV58Tier=tier;d._michaelV58Tag=tag}return d}
const rr=(cx,cy,w,h,r,steps=8)=>{const hw=w/2,hh=h/2,rad=Math.max(.004,Math.min(r,hw-.002,hh-.002)),out=[];for(const [ox,oy,a0] of [[hw-rad,hh-rad,0],[-hw+rad,hh-rad,Math.PI/2],[-hw+rad,-hh+rad,Math.PI],[hw-rad,-hh+rad,Math.PI*1.5]])for(let j=0;j<=steps;j++){const a=a0+j/steps*Math.PI/2;out.push([cx+ox+Math.cos(a)*rad,cy+oy+Math.sin(a)*rad])}return out};
function poly(b,pts,z,n=[0,0,1]){if(pts.length<3)return;const c=pts.reduce((a,p)=>[a[0]+p[0],a[1]+p[1]],[0,0]).map(v=>v/pts.length),o=b.p.length/3;b.p.push(c[0],c[1],z);b.n.push(...n);for(const p of pts){b.p.push(p[0],p[1],z);b.n.push(...n)}for(let k=0;k<pts.length;k++)b.i.push(o,o+1+k,o+1+((k+1)%pts.length))}
function ring(b,cx,cy,z,w,h,r,iw,ih,ir,n=[0,0,1],dz=.002){const a=rr(cx,cy,w,h,r),q=rr(cx,cy,iw,ih,ir);for(let k=0;k<a.length;k++){const j=(k+1)%a.length;b.q([a[k][0],a[k][1],z],[a[j][0],a[j][1],z],[q[j][0],q[j][1],z+dz],[q[k][0],q[k][1],z+dz],n)}}
function addV58CarDetail(r){
  const dark=new MeshBatch(),carbon=new MeshBatch(),metal=new MeshBatch(),red=new MeshBatch(),clear=new MeshBatch(),emissive=new MeshBatch();
  carbon.box(0,.155,3.205,2.56,.055,.30);carbon.box(-1.19,.205,3.145,.11,.16,.28);carbon.box(1.19,.205,3.145,.11,.16,.28);
  for(const s of [-1,1]){const x=s*1.235;carbon.q([x,.28,2.92],[x+s*.10,.31,2.82],[x+s*.12,.50,2.66],[x,.47,2.72],[s,0,0]);carbon.q([x,.45,2.52],[x+s*.11,.48,2.44],[x+s*.09,.68,2.31],[x,.65,2.36],[s,0,0])}
  for(const s of [-1,1]){const cx=s*.74,vent=rr(cx,1.29,.54,.205,.055,6);poly(dark,vent,2.23,[0,.58,.81]);for(let k=-2;k<=2;k++){const x=cx+k*.075;metal.q([x-.010,1.225,2.238],[x+.010,1.225,2.238],[x+.060,1.355,2.238],[x+.040,1.355,2.238],[0,.58,.81])}}
  for(const s of [-1,1]){const cx=s*.96,px=cx+s*.020;ring(dark,cx,.61,3.127,.405,.178,.068,.335,.124,.044,[0,0,1],.004);red.ellipseZ(px,.61,3.139,.032,.132,.092,26);dark.ellipseZ(px,.61,3.158,.030,.098,.067,26);metal.ellipseZ(px,.61,3.176,.014,.071,.047,24);clear.ellipseZ(px,.61,3.186,.010,.057,.037,24);const ix=cx-s*.135;clear.box(ix,.608,3.177,.090,.054,.018)}
  emissive.q([-1.19,.922,3.132],[-.43,.940,3.132],[-.47,.962,3.132],[-1.15,.947,3.132],[0,0,1]);emissive.q([.43,.940,3.132],[1.19,.922,3.132],[1.15,.947,3.132],[.47,.962,3.132],[0,0,1]);
  carbon.box(0,1.49,-2.62,1.94,.045,.20);for(const x of [-.78,-.39,0,.39,.78])carbon.q([x-.032,.16,-3.155],[x+.032,.16,-3.155],[x+.024,.55,-2.91],[x-.024,.55,-2.91],[0,0,-1]);dark.box(0,.36,-3.145,.34,.15,.10);metal.ellipseZ(0,.36,-3.205,.10,.115,.072,24);
  for(const s of [-1,1])for(const dy of [-.065,.035])red.box(s*1.10,.95+dy,-3.158,.20,.035,.012);
  upload(r,carbon,mat([.006,.009,.012],.10,.31),{tag:'body-depth'});upload(r,dark,mat([.004,.006,.008],.03,.25),{tag:'body-dark'});upload(r,metal,mat([.34,.38,.42],.62,.21),{tag:'metal-detail'});upload(r,red,mat([.57,.010,.016],.05,.18,[.055,.001,.001]),{tag:'lamp-red'});upload(r,clear,mat([.68,.74,.80],.15,.10,[.026,.031,.038]),{tag:'lamp-clear'});upload(r,emissive,mat([.82,.87,.92],.04,.12,[.12,.14,.17]),{tag:'drl'});
}
const trackCenter=z=>Math.sin(z*.0042)*6.0+Math.sin(z*.011)*2.2;
const edge=(z,o)=>{const e=.5,c=trackCenter(z),s=(trackCenter(z+e)-trackCenter(z-e))/(e*2),yaw=Math.atan(s),nx=Math.cos(yaw),nz=-Math.sin(yaw);return[c+nx*o,nz*o+z]};
function stripQuad(b,z0,z1,l,r,y=0){const a=edge(z0,l),d=edge(z0,r),c=edge(z1,r),q=edge(z1,l);b.q([a[0],y,a[1]],[d[0],y,d[1]],[c[0],y,c[1]],[q[0],y,q[1]],[0,1,0])}
function addV58Stage(r){
  const mobile=Math.min(globalThis.innerWidth||720,globalThis.innerHeight||1280)<900,step=mobile?10:7.5,start=-1560,end=1560;
  const terrain=new MeshBatch(),shoulder=new MeshBatch(),road=new MeshBatch(),edgeLine=new MeshBatch(),guard=new MeshBatch(),posts=new MeshBatch();
  for(let z=start;z<end;z+=step){const n=Math.min(end,z+step);stripQuad(terrain,z,n,-28,-4.15,-.045);stripQuad(terrain,z,n,4.15,28,-.045);stripQuad(shoulder,z,n,-4.15,-3.15,-.018);stripQuad(shoulder,z,n,3.15,4.15,-.018);stripQuad(road,z,n,-3.15,3.15,0);stripQuad(edgeLine,z,n,-3.15,-3.08,.007);stripQuad(edgeLine,z,n,3.08,3.15,.007)}
  const railStep=mobile?40:30;for(let z=-1500;z<=1500;z+=railStep){if(Math.sin(z*.009)<-.15)continue;for(const side of [-1,1]){const a=edge(z,side*5.25),b=edge(z+railStep*.72,side*5.25),w=.055;guard.q([a[0]-w,.54,a[1]],[a[0]+w,.54,a[1]],[b[0]+w,.54,b[1]],[b[0]-w,.54,b[1]],[0,0,side]);const p=edge(z,side*5.25);posts.box(p[0],.26,p[1],.075,.52,.075)}}
  upload(r,terrain,mat([.10,.14,.085],.01,.93),{world:true,tier:'scenery',tag:'terrain',env:'road'});upload(r,shoulder,mat([.24,.20,.145],.00,.92),{world:true,tier:'core',tag:'shoulder',env:'road'});upload(r,road,mat([.095,.100,.105],.02,.88),{world:true,tier:'core',tag:'continuous-road',env:'road'});upload(r,edgeLine,mat([.72,.70,.62],.00,.72),{world:true,tier:'detail',tag:'road-edge',env:'road'});upload(r,guard,mat([.34,.36,.37],.55,.37),{world:true,tier:'detail',tag:'guardrail',env:'road'});upload(r,posts,mat([.16,.18,.19],.35,.46),{world:true,tier:'scenery',tag:'guard-posts',env:'road'});
  r._michaelV58Stage={range:[start,end],step,roadHalfWidth:3.15,shoulderOuter:4.15,guardrailOffset:5.25,centerline:'MATCHES_RUNTIME_V57',continuous:true};
}
class SceneGovernor{
  constructor(r){this.r=r;this.level='FULL';this.bad=0;this.good=0;this.last=0}
  tick(){const r=this.r,ms=Number(r.avgMs||16.7),pressure=Number(r.performancePressure||0);if(ms>20.5||pressure>.18){this.bad++;this.good=0}else if(ms<16.5&&pressure<.05){this.good++;this.bad=Math.max(0,this.bad-1)}else{this.bad=Math.max(0,this.bad-1);this.good=Math.max(0,this.good-1)}let level=this.level;if(this.bad>18)level='ROAD_PRIORITY';else if(this.good>180)level='FULL';if(level!==this.level){this.level=level;for(const d of r.drawables||[]){if(!d?._michaelV58Tier)continue;d.hidden=level==='ROAD_PRIORITY'&&(d._michaelV58Tier==='scenery'||d._michaelV58Tier==='detail')}this.last=performance.now()}r._michaelV58Governor={level:this.level,frameMs:ms,pressure,roadProtected:true,carProtected:true,lastChange:this.last}}
}
export class JarvisXRRenderer extends BaseV40{
  async loadGLB(url){const info=await super.loadGLB(url);for(const d of this.drawables||[]){if(d?.env==='road'){d.env='road-legacy';d.hidden=true;d._michaelV58LegacyRoad=true}}addV58CarDetail(this);addV58Stage(this);this.setMode(this.michael?.mode||'garage');this._michaelV58Gov=new SceneGovernor(this);this._michaelSystems={...(this._michaelSystems||{}),v58WholeCarDetail:true,v58ContinuousTrack:true,v58AdaptiveScene:true,headlampProjectorDepth:true,hoodVentDepth:true,splitterDepth:true,secondaryRearWing:true,fiveFinDiffuser:true};return{...info,v58WholeCarDetail:true,v58ContinuousTrack:true,v58AdaptiveScene:true}}
  beginOwnedFrame(){const out=super.beginOwnedFrame();this._michaelV58Gov?.tick();return out}
  getAIStats(){return{...super.getAIStats(),v58WholeCarDetail:true,v58ContinuousTrack:this._michaelV58Stage||null,v58Governor:this._michaelV58Governor||null,visualAuthority:'OWNER_PHOTOS_FIRST',roadAuthority:'RUNTIME_CENTERLINE_MATCH'}}
}
