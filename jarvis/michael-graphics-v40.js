// MICHAEL GRAPHICS V40 — Nickelle native visual authority layer.
// Intercepts generated twin meshes before GPU upload so stance changes are native geometry, not overlays.
// V57/V44 identity preservation: generated topology may add depth, but may not erase photographed livery/glass/lamp identity.
import {JarvisXRRenderer as V39} from './michael-graphics-v39.js?v=nickelle-v40-core';
const near=(m,v,t=.00045)=>!!m?.base&&Math.abs(m.base[0]-v[0])<t&&Math.abs(m.base[1]-v[1])<t&&Math.abs(m.base[2]-v[2])<t;
const rough=(m,v,t=.025)=>Number.isFinite(m?.rough)&&Math.abs(m.rough-v)<t;
const cfg=()=>globalThis.__MICHAEL_NATIVE_VISUAL||{};
const wheelMat=m=>(near(m,[.006,.007,.009])&&rough(m,.88))||(near(m,[.018,.020,.024])&&rough(m,.74))||(near(m,[.43,.50,.59])&&rough(m,.18))||(near(m,[.10,.13,.17])&&rough(m,.25))||(near(m,[.24,.26,.29])&&rough(m,.28));
const shadowMat=m=>near(m,[.001,.001,.002])&&rough(m,1,.03);
const authorityRed=m=>near(m,[.64,.018,.020],.003);
const authorityDark=m=>near(m,[.006,.008,.010],.003)&&rough(m,.44,.035);
const authorityYellow=m=>near(m,[.92,.63,.015],.004);
const identityMaterial=m=>
  (near(m,[.56,.58,.61],.002)&&rough(m,.58,.025))||
  (near(m,[.040,.13,.40],.002)&&rough(m,.47,.025))||
  (near(m,[.72,.39,.035],.002)&&rough(m,.45,.025))||
  (near(m,[.010,.013,.017],.002)&&rough(m,.34,.025))||
  (near(m,[.055,.065,.078],.002)&&rough(m,.24,.025));
function transformWheel(pos,shadow=false){const c=cfg(),radius=Number(c.wheelRadius||.512),track=Number(c.wheelTrackX||1.37),width=Number(c.wheelWidth||.43),wy=Number(c.wheelY||.56),rs=radius/.512,ws=width/.43,out=new Float32Array(pos.length);for(let i=0;i<pos.length;i+=3){const x=pos[i],y=pos[i+1],z=pos[i+2],sx=x<0?-1:1,sz=z<0?-1:1,cx=sx*1.37,cz=sz*1.875,cy=shadow?.018:.56;out[i]=sx*track+(x-cx)*ws;out[i+1]=(shadow?.018:wy)+(y-cy)*rs;out[i+2]=cz+(z-cz)*rs}return out}
function preserveLicensedSkin(pos,idx,mat){
  if(!idx?.length)return idx;
  // V44: the generated yellow batch produced the visible hooks below the projector pods and a false grille outline.
  // The photographed shell supplies its own yellow livery accents, so generated yellow authority is removed completely.
  if(authorityYellow(mat))return new Uint32Array(0);
  if(!(authorityRed(mat)||authorityDark(mat)))return idx;
  const keep=[];
  for(let i=0;i<idx.length;i+=3){
    const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;
    const x=(pos[a]+pos[b]+pos[c])/3,y=(pos[a+1]+pos[b+1]+pos[c+1])/3,z=(pos[a+2]+pos[b+2]+pos[c+2])/3;
    const side=Math.abs(x)>1.20,door=side&&z>-1.14&&z<1.05&&y>.50&&y<1.22;
    if(!door)keep.push(idx[i],idx[i+1],idx[i+2]);
  }
  return keep.length===idx.length?idx:new Uint32Array(keep);
}
export class JarvisXRRenderer extends V39{
  _mesh(pos,nor,idx,mat,model){
    if(wheelMat(mat))pos=transformWheel(pos,false);else if(shadowMat(mat))pos=transformWheel(pos,true);
    idx=preserveLicensedSkin(pos,idx,mat);
    if(!idx.length)return null;
    return super._mesh(pos,nor,idx,mat,model)
  }
  async loadGLB(url){const info=await super.loadGLB(url),c=cfg(),paint=Number(c.paintRoughnessScale||1),dark=Number(c.darkRoughnessScale||1);for(const d of this.drawables){const m=d.mat;if(!m?.base)continue;const [r,g,b]=m.base,lum=r*.299+g*.587+b*.114;if(r>g*1.32&&r>b*1.25&&r>.11)m.rough=Math.max(.055,Math.min(.42,m.rough*paint));else if(lum<.055)m.rough=Math.max(.18,Math.min(1,m.rough*dark))}this._michaelSystems={...(this._michaelSystems||{}),nickelleNativeAuthority:true,nativeWheelRadius:Number(c.wheelRadius||.512),nativeWheelTrackX:Number(c.wheelTrackX||1.37),nativeWheelWidth:Number(c.wheelWidth||.43),nativeWheelY:Number(c.wheelY||.56),mudflapsProtected:true,licensedIdentityProtected:true,v44StrayYellowRemoved:true};return{...info,nickelleNative:true}}
  beginOwnedFrame(){let restored=0;for(const d of this.drawables||[]){if(d?.hidden&&identityMaterial(d.mat)){d.hidden=false;restored++}}const c=super.beginOwnedFrame(),n=cfg(),key=Number(n.keyLightScale||1),amb=Number(n.ambientScale||1),exp=Number(n.exposureScale||1);this.lightColor[0]*=key;this.lightColor[1]*=key;this.lightColor[2]*=key;this.ambient[0]*=amb;this.ambient[1]*=amb;this.ambient[2]*=amb;this.exposure*=exp;this._identityRestored=restored;return c}
  getAIStats(){return{...super.getAIStats(),nickelleNativeVisual:cfg(),licensedIdentityProtected:true,v44StrayYellowRemoved:true,identityBatchesRestored:this._identityRestored||0}}
}
