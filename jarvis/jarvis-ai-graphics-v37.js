// JARVIS DIGITAL TWIN GRAPHICS V37 — beyond-CAD automotive presentation
// Extends V35 Cinematic Ultra with a quality ladder, camera-aware optical exposure,
// material micro-response and an idle convergence mode that spends spare GPU in Garage.
import {JarvisXRRenderer as UltraXR} from './jarvis-ai-graphics-v35.js?v=michael61-core';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class JarvisXRRenderer extends UltraXR{
  constructor(canvas){
    super(canvas);this.twinVersion='JARVIS_DIGITAL_TWIN_V37';this.visualProfile='DIGITAL_TWIN_CINEMATIC';
    this._still=0;this._lastYaw=this.yaw||0;this._lastPitch=this.pitch||0;this._optics={convergence:0,qualityTier:'ULTRA',reflectionBudget:1,contactBudget:1};
    this.quality=1.58;this.ai.q=1.58;this.ai.target=33.0;
  }
  setMode(mode){super.setMode(mode);if(mode==='garage'){this.ai.target=33.0;this.ai.q=clamp(this.ai.q,1.25,1.82);this.quality=this.ai.q}else{this.ai.target=16.9;this.ai.q=clamp(this.ai.q,.72,1.20);this.quality=this.ai.q}this._still=0}
  async loadGLB(url){
    const info=await super.loadGLB(url);
    // V37 remap: make dark trim genuinely non-metallic, sharpen glass, and preserve bright aluminum.
    for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114;
      if(lum<.035){m.metal=0;m.rough=Math.max(m.rough,.50)}
      if(b>r*1.08&&lum<.30){m.metal=0;m.rough=Math.min(m.rough,.045)}
      if(r>g*1.45&&r>b*1.35&&r>.18){m.rough=Math.min(m.rough,.12);m.metal=Math.max(m.metal,.20)}
      if(lum>.58&&Math.max(r,g,b)-Math.min(r,g,b)<.15){m.metal=Math.max(m.metal,.82);m.rough=Math.min(m.rough,.13)}
    }
    return {...info,ai:this.twinVersion,profile:this.visualProfile,shadowSize:this.shadowSize};
  }
  render(){
    const y=this.yaw||0,p=this.pitch||0,motion=Math.abs(y-this._lastYaw)+Math.abs(p-this._lastPitch);this._lastYaw=y;this._lastPitch=p;
    this._still=motion<.0006?Math.min(240,this._still+1):0;
    if(this.ai.mode==='garage'){
      // Progressive idle convergence: when the user stops orbiting, raise supersampling toward 182%.
      const bonus=clamp((this._still-18)/150,0,1)*.12,base=clamp(this.ai.q,1.25,1.70);this.quality=clamp(base+bonus,1.25,1.82);
      this._optics.convergence=clamp(this._still/180,0,1);this._optics.qualityTier=this.quality>1.70?'REFERENCE':this.quality>1.48?'ULTRA':'HIGH';
      this._optics.reflectionBudget=.75+.25*this._optics.convergence;this._optics.contactBudget=.82+.18*this._optics.convergence;
      // Camera-like highlight rolloff: slightly lower exposure at top view, richer grazing highlights at 3/4.
      const top=clamp((p-.55)/.55,0,1);this.exposure=1.38-top*.10;
    }
    super.render();
  }
  getAIStats(){return{...super.getAIStats(),version:this.twinVersion,profile:this.visualProfile,convergence:this._optics.convergence,qualityTier:this._optics.qualityTier,reflectionBudget:this._optics.reflectionBudget,contactBudget:this._optics.contactBudget}}
}
