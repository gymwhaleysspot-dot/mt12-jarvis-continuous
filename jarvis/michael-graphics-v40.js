// MICHAEL GRAPHICS V40 — Nickelle native visual authority layer.
// Intercepts generated twin meshes before GPU upload so stance changes are native geometry, not overlays.
import {JarvisXRRenderer as V39} from './michael-graphics-v39.js?v=nickelle-v40-core';
const near=(m,v,t=.00045)=>!!m?.base&&Math.abs(m.base[0]-v[0])<t&&Math.abs(m.base[1]-v[1])<t&&Math.abs(m.base[2]-v[2])<t;
const rough=(m,v,t=.025)=>Number.isFinite(m?.rough)&&Math.abs(m.rough-v)<t;
const cfg=()=>globalThis.__MICHAEL_NATIVE_VISUAL||{};
// Rubber and mudflaps intentionally share a dark base in V39; roughness is part of the native-wheel identity so mud cannot be deformed by stance fitting.
const wheelMat=m=>(near(m,[.006,.007,.009])&&rough(m,.88))||(near(m,[.018,.020,.024])&&rough(m,.74))||(near(m,[.43,.50,.59])&&rough(m,.18))||(near(m,[.10,.13,.17])&&rough(m,.25))||(near(m,[.24,.26,.29])&&rough(m,.28));
const shadowMat=m=>near(m,[.001,.001,.002])&&rough(m,1,.03);
function transformWheel(pos,shadow=false){const c=cfg(),radius=Number(c.wheelRadius||.512),track=Number(c.wheelTrackX||1.37),width=Number(c.wheelWidth||.43),wy=Number(c.wheelY||.56),rs=radius/.512,ws=width/.43,out=new Float32Array(pos.length);for(let i=0;i<pos.length;i+=3){const x=pos[i],y=pos[i+1],z=pos[i+2],sx=x<0?-1:1,sz=z<0?-1:1,cx=sx*1.37,cz=sz*1.875,cy=shadow?.018:.56;out[i]=sx*track+(x-cx)*ws;out[i+1]=(shadow?.018:wy)+(y-cy)*rs;out[i+2]=cz+(z-cz)*rs}return out}
export class JarvisXRRenderer extends V39{
  _mesh(pos,nor,idx,mat,model){if(wheelMat(mat))pos=transformWheel(pos,false);else if(shadowMat(mat))pos=transformWheel(pos,true);return super._mesh(pos,nor,idx,mat,model)}
  async loadGLB(url){const info=await super.loadGLB(url),c=cfg(),paint=Number(c.paintRoughnessScale||1),dark=Number(c.darkRoughnessScale||1);for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114;if(r>g*1.32&&r>b*1.25&&r>.11)m.rough=Math.max(.055,Math.min(.42,m.rough*paint));else if(lum<.055)m.rough=Math.max(.18,Math.min(1,m.rough*dark))}this._michaelSystems={...(this._michaelSystems||{}),nickelleNativeAuthority:true,nativeWheelRadius:Number(c.wheelRadius||.512),nativeWheelTrackX:Number(c.wheelTrackX||1.37),nativeWheelWidth:Number(c.wheelWidth||.43),nativeWheelY:Number(c.wheelY||.56),mudflapsProtected:true};return{...info,nickelleNative:true}}
  beginOwnedFrame(){const c=super.beginOwnedFrame(),n=cfg(),key=Number(n.keyLightScale||1),amb=Number(n.ambientScale||1),exp=Number(n.exposureScale||1);this.lightColor[0]*=key;this.lightColor[1]*=key;this.lightColor[2]*=key;this.ambient[0]*=amb;this.ambient[1]*=amb;this.ambient[2]*=amb;this.exposure*=exp;return c}
  getAIStats(){return{...super.getAIStats(),nickelleNativeVisual:cfg()}}
}
