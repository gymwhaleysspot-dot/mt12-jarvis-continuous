// JARVIS AI GRAPHICS ENGINE V35 — CINEMATIC ULTRA
// Uses the full practical mobile GPU budget in Garage, while retaining a 60 Hz Drive target.
// Layered on Jarvis XR WebGL2 core: adaptive supersampling, 4K shadows, camera-aware studio lighting,
// automotive material remapping, aggressive temporal GPU budget learning, and cinematic exposure.
import {JarvisXRRenderer as BaseXR} from './jarvis-xr-engine-v29.js?v=michael62-core';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;

class UltraVisualDirector{
  constructor(renderer){
    this.r=renderer;this.mode='garage';this.target=30.5;this.ema=16.7;this.jitter=0;this.samples=0;
    this.q=1.45;this.cool=0;this.deviceScore=1;this.sceneScore=1;this.gpuPressure=0;
  }
  setMode(mode){
    this.mode=mode;
    // Garage spends the frame budget on image quality. Drive preserves responsiveness.
    this.target=mode==='garage'?30.5:16.9;
    const floor=mode==='garage'?1.05:.70,ceil=mode==='garage'?1.65:1.18;
    this.q=clamp(this.q,floor,ceil);this.r.quality=this.q;
  }
  sample(ms){
    if(!Number.isFinite(ms)||ms<=0)return;
    const e=ms-this.ema;this.ema+=e*.06;this.jitter=this.jitter*.94+Math.abs(e)*.06;this.samples++;
    this.gpuPressure=clamp(this.ema/this.target,.35,2.2);this.deviceScore=clamp(this.target/Math.max(this.ema,1),.4,1.5);
    if(this.cool>0){this.cool--;return}
    const garage=this.mode==='garage',floor=garage?1.05:.70,ceil=garage?1.65:1.18;
    let goal=this.q;
    if(this.gpuPressure>1.12||this.jitter>this.target*.30)goal-=garage?.06:.055;
    else if(this.gpuPressure<.80&&this.jitter<this.target*.14)goal+=garage?.045:.025;
    goal=clamp(goal,floor,ceil);
    if(Math.abs(goal-this.q)>.008){this.q=mix(this.q,goal,.62);this.r.quality=this.q;this.cool=14}
  }
  lighting(){
    const r=this.r,y=r.yaw||0,garage=this.mode==='garage';
    // Broad camera-following key: stronger grazing light reveals fender/hood curvature.
    r.lightDir[0]=Math.sin(y+.68)*.61;r.lightDir[1]=-.74;r.lightDir[2]=Math.cos(y+.68)*.61;
    const perf=clamp(this.deviceScore,.72,1.12);
    r.exposure=garage?1.42:1.24;
    r.lightColor[0]=(garage?6.7:5.0)*perf;r.lightColor[1]=(garage?6.35:4.78)*perf;r.lightColor[2]=(garage?5.90:4.48)*perf;
    // Strong cool skylight gives dark glass/rubber readable separation without flattening paint.
    r.ambient[0]=garage?.34:.23;r.ambient[1]=garage?.41:.30;r.ambient[2]=garage?.56:.42;
    const bg=garage?.042:.014;r.gl.clearColor(bg*.72,bg*.88,bg*1.06,1);
    this.sceneScore=clamp(1-this.jitter/55,.2,1);
  }
}

export class JarvisXRRenderer extends BaseXR{
  constructor(canvas){
    super(canvas);
    this.ai=new UltraVisualDirector(this);
    this.aiVersion='JARVIS_ULTRA_VISUAL_DIRECTOR_2';
    this.visualProfile='AUTOMOTIVE_CINEMATIC_ULTRA';
    this.quality=1.45;
    this._lastRender=performance.now();
    this._materialStats={paint:0,metal:0,rubber:0,glass:0,light:0,other:0};
    // Spend more GPU on shadow definition. 4096 is intentionally aggressive for Garage-quality rendering.
    try{
      const gl=this.gl;
      if(this.shadowTex)gl.deleteTexture(this.shadowTex);if(this.shadowFbo)gl.deleteFramebuffer(this.shadowFbo);
      this.shadowSize=4096;this._shadow();
    }catch(e){console.warn('V35 4K shadow fallback',e);this.shadowSize=2048}
  }
  setMode(mode){this.ai.setMode(mode)}
  addGround(){
    super.addGround();
    const d=this.drawables[this.drawables.length-1];
    if(d?.mat){d.mat.base.set([.075,.082,.090]);d.mat.metal=.16;d.mat.rough=.22}
  }
  async loadGLB(url){
    const info=await super.loadGLB(url);
    for(const d of this.drawables){
      const m=d.mat;if(!m?.base)continue;
      const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,sat=Math.max(r,g,b)-Math.min(r,g,b);
      const em=(m.em?.[0]||0)+(m.em?.[1]||0)+(m.em?.[2]||0);
      if(em>.18){m.rough=Math.min(m.rough,.14);this._materialStats.light++;continue}
      if(lum<.065){m.rough=clamp(Math.max(m.rough,.62),.62,.92);m.metal=0;this._materialStats.rubber++;continue}
      if(r>g*1.34&&r>b*1.28&&r>.14){
        // Automotive clear-coated red: low base roughness and just enough metallic energy for body highlights.
        m.rough=Math.min(m.rough,.155);m.metal=Math.max(m.metal,.16);this._materialStats.paint++;continue
      }
      if(lum>.52&&sat<.18){m.rough=Math.min(m.rough,.16);m.metal=Math.max(m.metal,.72);this._materialStats.metal++;continue}
      if(b>r*1.04&&lum<.34){m.rough=Math.min(m.rough,.075);m.metal=0;this._materialStats.glass++;continue}
      this._materialStats.other++;
    }
    return {...info,ai:this.aiVersion,profile:this.visualProfile,shadowSize:this.shadowSize,materialsClassified:{...this._materialStats}};
  }
  render(){
    const now=performance.now(),dt=now-this._lastRender;this._lastRender=now;
    this.ai.sample(this.avgMs||dt||16.7);this.ai.lighting();super.render();
  }
  getAIStats(){return{version:this.aiVersion,profile:this.visualProfile,frameMs:this.ai.ema,jitter:this.ai.jitter,quality:this.quality,deviceScore:this.ai.deviceScore,sceneScore:this.ai.sceneScore,gpuPressure:this.ai.gpuPressure,shadowSize:this.shadowSize,materials:{...this._materialStats}}}
}
