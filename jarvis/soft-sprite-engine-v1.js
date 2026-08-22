(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ACTIVE=/STEP|DASH|VANISH|JAB|CROSS|BODY|KICK|ROUNDHOUSE|UPPERCUT|SMASH|BEAM|SUPER|ULTIMATE|FINISHER|HIT|TUMBLE|KNOCKDOWN|TRANSFORM/;
const FIGHTER_PROFILES=Object.freeze({
  GRIFFIN:{slices:9,rigidity:.82,bend:1,stretch:1,impact:1,secondary:.35,contactY:.52},
  LIRA:{slices:11,rigidity:.7,bend:1.18,stretch:1.08,impact:.88,secondary:.72,contactY:.5},
  KAIROX:{slices:8,rigidity:1.18,bend:.72,stretch:.86,impact:.72,secondary:.18,contactY:.54},
  SOLENNE:{slices:11,rigidity:.74,bend:1.12,stretch:1.02,impact:.82,secondary:.66,contactY:.49},
  MIREYA:{slices:10,rigidity:.78,bend:1.08,stretch:.98,impact:.9,secondary:.7,contactY:.51},
  ZEPHYRA:{slices:12,rigidity:.62,bend:1.28,stretch:1.22,impact:.76,secondary:.82,contactY:.48},
  ORUN:{slices:7,rigidity:1.3,bend:.58,stretch:.72,impact:.62,secondary:.12,contactY:.57},
  MORDREN:{slices:7,rigidity:1.38,bend:.52,stretch:.68,impact:.58,secondary:.2,contactY:.58},
  SABLE:{slices:12,rigidity:.66,bend:1.24,stretch:1.16,impact:.84,secondary:.78,contactY:.48},
  KRAKEN:{slices:7,rigidity:1.46,bend:.46,stretch:.62,impact:.52,secondary:.28,contactY:.6}
});
const engine={
  name:'JARVIS_CHARACTER_MESH_ENGINE',version:4,ready:true,slices:9,impactWarp:true,contactOcclusion:true,energyEmbedding:true,continuousSurface:true,sliceRenderer:false,perFighterProfiles:true,fallback:'JARVIS_SOFTSPRITE_FUSION_ENGINE_V3',legacyFallback:'GRIFFIN_SPRITE_AUTHORITY_V1',fighterProfiles:FIGHTER_PROFILES,
  fighterProfile(name){return FIGHTER_PROFILES[name]||FIGHTER_PROFILES.GRIFFIN},
  profile(name,pose,impact=0,vx=0,time=0){
    const fighter=this.fighterProfile(name);
    const speed=clamp(Math.abs(vx)*4,0,.16),attacking=/JAB|CROSS|BODY|KICK|ROUNDHOUSE|UPPERCUT|SMASH|BEAM|SUPER|ULTIMATE|FINISHER/.test(pose),hurt=/HIT|TUMBLE|KNOCKDOWN/.test(pose);
    const compliance=1/fighter.rigidity,secondary=Math.sin(time*11)*fighter.secondary*.008;
    return{...fighter,bend:((attacking?.055:hurt?-.07:0)+Math.sign(vx)*speed)*fighter.bend*compliance+secondary,squash:1-impact*.1*fighter.impact*compliance,stretch:1+(attacking?speed*.7*fighter.stretch:0)+impact*.045*fighter.impact,twist:(attacking?.035:0)*fighter.bend*compliance};
  },
  drawSliced(o){
    const{ctx,img,sx,sy,sw,sh,dx,dy,dw,dh,name='GRIFFIN',pose,impact=0,impactSide=1,vx=0,time=0}=o;if(!img?.complete||!img.naturalWidth)return false;
    const p=this.profile(name,pose,impact,vx,time),n=p.slices,slice=sw/n,destSlice=dw/n,warpAt=i=>{const u=(i+.5)/n,arch=Math.sin(u*Math.PI);return(p.bend*arch+p.twist*(u-.5))*dw-impact*impactSide*arch*(u>.36&&u<.78?dw*.065:0)};
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(dx+dw/2,dy+dh);ctx.scale(p.stretch,p.squash);for(let i=0;i<n;i++){const u=(i+.5)/n,arch=Math.sin(u*Math.PI),warp=warpAt(i),lift=impact*arch*(u>.42?dh*.026:0),prev=i?warpAt(i-1):warp,next=i<n-1?warpAt(i+1):warp,leftGuard=Math.max(1.5,Math.abs(warp-prev)+1),rightGuard=Math.max(1.5,Math.abs(next-warp)+1),sourceBleed=Math.min(1.5,slice*.08),sourceX=Math.max(sx,sx+i*slice-sourceBleed),sourceRight=Math.min(sx+sw,sx+(i+1)*slice+sourceBleed),destX=Math.floor((-dw/2+i*destSlice+warp-leftGuard)*2)/2,destRight=Math.ceil((-dw/2+(i+1)*destSlice+warp+rightGuard)*2)/2;ctx.drawImage(img,sourceX,sy,sourceRight-sourceX,sh,destX,-dh-lift,destRight-destX,dh+.5)}ctx.restore();return true;
  },
  draw(o){
    const{ctx,img,sx,sy,sw,sh,dx,dy,dw,dh,name='GRIFFIN',pose,impact=0,impactSide=1,vx=0,time=0,accent='#72ecff'}=o;if(!img?.complete||!img.naturalWidth)return false;
    const p=this.profile(name,pose,impact,vx,time),lean=clamp(p.bend+p.twist,-.16,.16),hitShift=-impact*impactSide*dw*.035;
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(dx+dw/2+hitShift,dy+dh);ctx.scale(p.stretch,p.squash);ctx.transform(1,0,lean,1,-lean*dh*.48,0);
    ctx.drawImage(img,sx,sy,sw,sh,-dw/2,-dh,dw,dh);
    if(impact>0){const contactX=impactSide*dw*.24,contactY=-dh*p.contactY;ctx.save();ctx.beginPath();ctx.ellipse(contactX,contactY,dw*.18,dh*.22,0,0,Math.PI*2);ctx.clip();ctx.globalAlpha=.82;ctx.translate(-impactSide*dw*.028*impact,dh*.012*impact);ctx.scale(1-impact*.035,1+impact*.025);ctx.drawImage(img,sx,sy,sw,sh,-dw/2,-dh,dw,dh);ctx.restore()}
    if(impact>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.12*impact;ctx.filter='blur(2px)';ctx.strokeStyle=accent;ctx.lineWidth=3+impact*4;ctx.beginPath();ctx.ellipse(impactSide*dw*.34,-dh*.52,dw*.13*(1-impact*.35),dh*.18,0,0,Math.PI*2);ctx.stroke()}
    ctx.restore();return true;
  },
  redrawContact(o){
    const{ctx,img,sx,sy,sw,sh,x,y,w,h,name='GRIFFIN',facing=1,impact=0,accent='#72ecff'}=o;if(!impact||!img?.complete||!img.naturalWidth)return false;const p=this.fighterProfile(name),cy=p.contactY;
    ctx.save();ctx.beginPath();ctx.ellipse(x-facing*w*.24,y-h*cy,w*.19,h*.3,0,0,Math.PI*2);ctx.clip();ctx.translate(x,y);ctx.scale(facing,1);ctx.globalAlpha=.92;ctx.filter='drop-shadow(0 0 5px '+accent+')';ctx.drawImage(img,sx,sy,sw,sh,-w/2,-h,w,h);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.34*impact;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(-facing*w*.24,-h*cy,8+impact*16,0,Math.PI*2);ctx.fill();ctx.restore();return true;
  },
  active(pose){return ACTIVE.test(pose)},
  snapshot(){return{name:this.name,version:this.version,ready:this.ready,continuousSurface:this.continuousSurface,sliceRenderer:this.sliceRenderer,impactWarp:this.impactWarp,contactOcclusion:this.contactOcclusion,energyEmbedding:this.energyEmbedding,perFighterProfiles:this.perFighterProfiles,profileCount:Object.keys(this.fighterProfiles).length,profiles:Object.keys(this.fighterProfiles),fallback:this.fallback,legacyFallback:this.legacyFallback}}
};
globalThis.JarvisSoftSpriteEngine=Object.freeze(engine);
})();
