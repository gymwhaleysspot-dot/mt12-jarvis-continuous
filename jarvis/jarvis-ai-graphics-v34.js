// JARVIS AI GRAPHICS ENGINE V34
// Adaptive automotive visual director layered on the proven Jarvis XR WebGL2 core.
// This is not a cloud/LLM dependency: it is an on-device online controller that learns
// the current GPU/frame budget and continuously tunes resolution, exposure and lighting.
import {JarvisXRRenderer as BaseXR} from './jarvis-xr-engine-v29.js?v=core34';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;

class NeuralVisualDirector{
  constructor(renderer){
    this.r=renderer;
    this.mode='garage';
    this.target=16.7;
    this.ema=16.7;
    this.var=0;
    this.q=1;
    this.learn=0;
    this.cooldown=0;
    this.last=performance.now();
    this.deviceScore=1;
    this.sceneScore=1;
  }
  setMode(m){this.mode=m;this.target=m==='drive'?17.2:16.7}
  sample(ms){
    if(!Number.isFinite(ms)||ms<=0)return;
    const e=ms-this.ema;
    this.ema+=e*.055;
    this.var=this.var*.94+Math.abs(e)*.06;
    this.learn++;
    if(this.cooldown>0){this.cooldown--;return}
    const pressure=(this.ema-this.target)/this.target;
    const jitter=this.var/this.target;
    let goal=this.q;
    if(pressure>.12||jitter>.28)goal-=.055;
    else if(pressure<-.18&&jitter<.12)goal+=.025;
    const minQ=this.mode==='drive'?.56:.68;
    goal=clamp(goal,minQ,1.12);
    if(Math.abs(goal-this.q)>.008){this.q=mix(this.q,goal,.5);this.r.quality=this.q;this.cooldown=18}
    this.deviceScore=clamp(this.target/Math.max(this.ema,1),.45,1.35);
  }
  lighting(){
    const r=this.r,t=performance.now()*.001;
    const y=r.yaw||0,p=r.pitch||0;
    // A moving virtual softbox key follows the camera enough to reveal body curvature.
    r.lightDir[0]=Math.sin(y+.72)*.52;
    r.lightDir[1]=-.82;
    r.lightDir[2]=Math.cos(y+.72)*.52;
    const garage=this.mode==='garage';
    const perf=clamp(this.deviceScore,.65,1.2);
    r.exposure=garage?1.34:1.22;
    r.lightColor[0]=(garage?5.45:4.7)*perf;
    r.lightColor[1]=(garage?5.20:4.55)*perf;
    r.lightColor[2]=(garage?4.92:4.35)*perf;
    // Cool skylight + warmer key gives paint, glass and metal stronger material separation.
    r.ambient[0]=garage?.28:.21;
    r.ambient[1]=garage?.34:.27;
    r.ambient[2]=garage?.46:.36;
    const bg=garage?.030:.012;
    r.gl.clearColor(bg*.72,bg*.92,bg*1.12,1);
    this.sceneScore=clamp(1-(this.var/40),.2,1);
  }
}

export class JarvisXRRenderer extends BaseXR{
  constructor(canvas){
    super(canvas);
    this.ai=new NeuralVisualDirector(this);
    this.aiVersion='JARVIS_NEURAL_VISUAL_DIRECTOR_1';
    this.visualProfile='AUTOMOTIVE_STUDIO';
    this._groundReady=false;
    this._lastRender=performance.now();
    this._materialStats={paint:0,metal:0,rubber:0,glass:0,other:0};
  }
  setMode(mode){this.ai.setMode(mode)}
  addGround(){
    super.addGround();
    this._groundReady=true;
    const d=this.drawables[this.drawables.length-1];
    if(d?.mat){d.mat.base.set([.055,.063,.071]);d.mat.metal=.08;d.mat.rough=.34}
  }
  async loadGLB(url){
    const info=await super.loadGLB(url);
    // Material intelligence: infer automotive roles from PBR values and color, then
    // tighten the physically-based response without requiring the Blender asset to
    // carry engine-specific metadata.
    for(const d of this.drawables){
      const m=d.mat;if(!m?.base)continue;
      const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114,sat=Math.max(r,g,b)-Math.min(r,g,b);
      if(lum<.07){m.rough=clamp(Math.max(m.rough,.58),.58,.88);m.metal=0;this._materialStats.rubber++;continue}
      if(r>g*1.45&&r>b*1.35&&r>.18){m.rough=Math.min(m.rough,.22);m.metal=Math.max(m.metal,.10);this._materialStats.paint++;continue}
      if(lum>.48&&sat<.16){m.rough=Math.min(m.rough,.24);m.metal=Math.max(m.metal,.55);this._materialStats.metal++;continue}
      if(b>r*1.1&&lum<.28){m.rough=Math.min(m.rough,.10);m.metal=Math.min(m.metal,.05);this._materialStats.glass++;continue}
      this._materialStats.other++;
    }
    return {...info,ai:this.aiVersion,profile:this.visualProfile,materialsClassified:this._materialStats};
  }
  render(){
    const now=performance.now(),dt=now-this._lastRender;this._lastRender=now;
    this.ai.sample(this.avgMs||dt||16.7);
    this.ai.lighting();
    super.render();
  }
  getAIStats(){return{version:this.aiVersion,profile:this.visualProfile,frameMs:this.ai.ema,jitter:this.ai.var,quality:this.quality,deviceScore:this.ai.deviceScore,sceneScore:this.ai.sceneScore,materials:{...this._materialStats}}}
}
