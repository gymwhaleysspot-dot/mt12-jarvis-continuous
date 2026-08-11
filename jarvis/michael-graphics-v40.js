// MICHAEL GRAPHICS V58 — simple owner-photo convergence layer.
// One licensed shell, one surgical detail layer, one authoritative rally stage.
import {JarvisXRRenderer as BaseV40} from './michael-graphics-v40-base.js?v=michael-v58-base';
const I4=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const mat=(base,metal,rough,em=[0,0,0])=>({base:new Float32Array(base),metal,rough,em:new Float32Array(em)});
class Batch{
  constructor(){this.p=[];this.n=[];this.i=[]}
  q(a,b,c,d,n=[0,1,0]){const o=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let k=0;k<4;k++)this.n.push(...n);this.i.push(o,o+1,o+2,o,o+2,o+3)}
  box(x,y,z,sx,sy,sz){const a=x-sx/2,b=x+sx/2,c=y-sy/2,d=y+sy/2,e=z-sz/2,f=z+sz/2;this.q([a,c,f],[b,c,f],[b,d,f],[a,d,f],[0,0,1]);this.q([b,c,e],[a,c,e],[a,d,e],[b,d,e],[0,0,-1]);this.q([a,d,f],[b,d,f],[b,d,e],[a,d,e],[0,1,0]);this.q([a,c,e],[b,c,e],[b,c,f],[a,c,f],[0,-1,0]);this.q([b,c,f],[b,c,e],[b,d,e],[b,d,f],[1,0,0]);this.q([a,c,e],[a,c,f],[a,d,f],[a,d,e],[-1,0,0])}
  discZ(x,y,z,rx,ry,seg=22,n=[0,0,1]){const o=this.p.length/3;this.p.push(x,y,z);this.n.push(...n);for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2;this.p.push(x+Math.cos(a)*rx,y+Math.sin(a)*ry,z);this.n.push(...n)}for(let k=0;k<seg;k++)this.i.push(o,o+k+1,o+k+2)}
}
function upload(r,b,m,{env=null,tier='core',tag=''}={}){if(!b.i.length)return null;r._mesh(new Float32Array(b.p),new Float32Array(b.n),new Uint32Array(b.i),m,I4());const d=r.drawables[r.drawables.length-1];if(d){if(env){d.world=true;d.env=env}d._michaelV58Tier=tier;d._michaelV58Tag=tag}return d}
function addSurgicalDetail(r){
  const carbon=new Batch(),dark=new Batch(),metal=new Batch(),lens=new Batch(),lamp=new Batch(),drl=new Batch();
  // Front splitter: real projection and small outer fences only.
  carbon.box(0,.145,3.17,2.48,.045,.24);carbon.box(-1.17,.205,3.12,.08,.15,.20);carbon.box(1.17,.205,3.12,.08,.15,.20);
  // Paired recessed hood/fender shoulder vents.
  for(const s of [-1,1]){const x=s*.72;dark.q([x-.24,1.235,2.20],[x+.24,1.235,2.20],[x+.20,1.35,2.27],[x-.20,1.35,2.27],[0,.55,.84]);for(let k=-2;k<=2;k++){const lx=x+k*.07;metal.q([lx-.008,1.247,2.215],[lx+.008,1.247,2.215],[lx+.045,1.333,2.265],[lx+.029,1.333,2.265],[0,.55,.84])}}
  // Lower lamp internals only. Base V40 owns the pod perimeter and cavity.
  for(const s of [-1,1]){const cx=s*.96,px=cx+s*.015;metal.discZ(px,.61,3.135,.092,.062);dark.discZ(px,.61,3.140,.069,.046);lens.discZ(px,.61,3.146,.052,.034);const ix=cx-s*.13;lens.box(ix,.608,3.145,.082,.047,.010)}
  // Very thin upper DRL; no second body-shaped lamp housing.
  drl.q([-1.17,.923,3.130],[-.44,.941,3.130],[-.48,.955,3.130],[-1.14,.943,3.130],[0,0,1]);drl.q([.44,.941,3.130],[1.17,.923,3.130],[1.14,.943,3.130],[.48,.955,3.130],[0,0,1]);
  // Rear lamp segmentation, secondary wing plane, diffuser fins and center exhaust.
  for(const s of [-1,1]){for(const dy of [-.075,0,.075])lamp.box(s*1.10,.95+dy,-3.165,.18,.040,.010)}
  carbon.box(0,1.49,-2.62,1.86,.040,.16);for(const x of [-.78,-.39,0,.39,.78])carbon.q([x-.026,.16,-3.165],[x+.026,.16,-3.165],[x+.020,.53,-2.94],[x-.020,.53,-2.94],[0,0,-1]);dark.box(0,.36,-3.155,.31,.14,.08);metal.discZ(0,.36,-3.205,.105,.068,22,[0,0,-1]);
  upload(r,carbon,mat([.006,.009,.012],.10,.33),{tag:'surgical-carbon'});upload(r,dark,mat([.004,.006,.008],.03,.27),{tag:'surgical-dark'});upload(r,metal,mat([.36,.39,.42],.58,.22),{tag:'surgical-metal'});upload(r,lens,mat([.68,.74,.80],.14,.11,[.022,.027,.034]),{tag:'projector-lens'});upload(r,lamp,mat([.56,.008,.014],.03,.17,[.075,.002,.002]),{tag:'rear-segments'});upload(r,drl,mat([.82,.87,.92],.02,.12,[.10,.12,.15]),{tag:'thin-drl'});
}
const center=z=>Math.sin(z*.0042)*6+Math.sin(z*.011)*2.2;
const edge=(z,o)=>{const e=.5,c=center(z),s=(center(z+e)-center(z-e))/(e*2),a=Math.atan(s),nx=Math.cos(a),nz=-Math.sin(a);return[c+nx*o,z+nz*o]};
function strip(b,z0,z1,l,r,y){const a=edge(z0,l),d=edge(z0,r),c=edge(z1,r),q=edge(z1,l);b.q([a[0],y,a[1]],[d[0],y,d[1]],[c[0],y,c[1]],[q[0],y,q[1]],[0,1,0])}
function addStage(r){
  const mobile=Math.min(globalThis.innerWidth||720,globalThis.innerHeight||1280)<900,step=mobile?12:8,start=-1560,end=1560;
  const road=new Batch(),shoulder=new Batch(),terrain=new Batch(),line=new Batch(),rail=new Batch(),post=new Batch();
  for(let z=start;z<end;z+=step){const n=Math.min(end,z+step);strip(terrain,z,n,-20,-4.25,-.050);strip(terrain,z,n,4.25,20,-.050);strip(shoulder,z,n,-4.25,-3.18,-.018);strip(shoulder,z,n,3.18,4.25,-.018);strip(road,z,n,-3.18,3.18,0);strip(line,z,n,-3.18,-3.10,.006);strip(line,z,n,3.10,3.18,.006)}
  const rs=mobile?54:40;for(let z=-1480;z<1480;z+=rs){if(Math.sin(z*.0075)<-.35)continue;for(const s of [-1,1]){const a=edge(z,s*5.1),b=edge(z+rs*.72,s*5.1);rail.q([a[0],.47,a[1]],[a[0],.60,a[1]],[b[0],.60,b[1]],[b[0],.47,b[1]],[0,0,s]);post.box(a[0],.25,a[1],.065,.50,.065)}}
  upload(r,terrain,mat([.075,.115,.060],0,.95),{env:'road',tier:'scenery',tag:'terrain'});upload(r,shoulder,mat([.20,.17,.12],0,.94),{env:'road',tag:'shoulder'});upload(r,road,mat([.080,.084,.088],.01,.90),{env:'road',tag:'road'});upload(r,line,mat([.69,.68,.62],0,.76),{env:'road',tier:'detail',tag:'edge-lines'});upload(r,rail,mat([.33,.35,.36],.50,.40),{env:'road',tier:'detail',tag:'guardrail'});upload(r,post,mat([.16,.17,.18],.26,.50),{env:'road',tier:'scenery',tag:'posts'});
  r._michaelV58Stage={range:[start,end],step,roadHalfWidth:3.18,centerline:'EXACT_RUNTIME_EQUATION',singleRoadAuthority:true};
}
class Governor{
  constructor(r){this.r=r;this.level='FULL';this.bad=0;this.good=0}
  tick(){const ms=Number(this.r.avgMs||16.7),p=Number(this.r.performancePressure||0);if(ms>20.5||p>.18){this.bad++;this.good=0}else if(ms<16.5&&p<.05){this.good++;this.bad=Math.max(0,this.bad-1)}else{this.bad=Math.max(0,this.bad-1);this.good=Math.max(0,this.good-1)}const next=this.bad>18?'ROAD_PRIORITY':this.good>180?'FULL':this.level;if(next!==this.level){this.level=next;for(const d of this.r.drawables||[])if(d?._michaelV58Tier)d.hidden=next==='ROAD_PRIORITY'&&(d._michaelV58Tier==='detail'||d._michaelV58Tier==='scenery')}this.r._michaelV58Governor={level:this.level,frameMs:ms,pressure:p,roadProtected:true,carProtected:true}}
}
export class JarvisXRRenderer extends BaseV40{
  async loadGLB(url){const info=await super.loadGLB(url);
    // Retire the old V57 road environment. V58 owns DRIVE world geometry.
    for(const d of this.drawables||[])if(d?.env==='road'){d.env='road-legacy';d.hidden=true;d._michaelV58LegacyRoad=true}
    addSurgicalDetail(this);addStage(this);
    // Anything appended after this point is the old runtime addBodyAuthority overlay.
    this._michaelV58OwnedEnd=this.drawables.length;this._michaelV58Gov=new Governor(this);this.setMode(this.michael?.mode||'garage');
    this._michaelSystems={...(this._michaelSystems||{}),v58SimpleAuthority:true,v58SurgicalDetail:true,v58ContinuousTrack:true};
    return{...info,v58SimpleAuthority:true,v58SurgicalDetail:true,v58ContinuousTrack:true}}
  beginOwnedFrame(){const out=super.beginOwnedFrame();
    // Hide the duplicate runtime body-authority batches while leaving the licensed shell/base V40 intact.
    if(Number.isInteger(this._michaelV58OwnedEnd))for(let i=this._michaelV58OwnedEnd;i<(this.drawables?.length||0);i++){const d=this.drawables[i];if(d){d.hidden=true;d._michaelV58DuplicateAuthority=true}}
    this._michaelV58Gov?.tick();return out}
  getAIStats(){return{...super.getAIStats(),version:'MICHAEL_V58',v58SimpleAuthority:true,v58Stage:this._michaelV58Stage||null,v58Governor:this._michaelV58Governor||null,bodyAuthority:'LICENSED_SHELL_PLUS_SURGICAL_DETAIL',duplicateBodyAuthority:false,roadAuthority:'ONE_CENTERLINE_ONE_MESH'}}
}
