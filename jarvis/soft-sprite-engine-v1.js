(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ACTIVE=/STEP|DASH|VANISH|JAB|CROSS|BODY|KICK|ROUNDHOUSE|UPPERCUT|SMASH|BEAM|SUPER|ULTIMATE|FINISHER|HIT|TUMBLE|KNOCKDOWN|TRANSFORM/;
const engine={
  name:'JARVIS_SOFTSPRITE_FUSION_ENGINE',version:1,ready:true,slices:9,impactWarp:true,contactOcclusion:true,energyEmbedding:true,fallback:'GRIFFIN_SPRITE_AUTHORITY_V1',
  profile(pose,impact=0,vx=0){
    const speed=clamp(Math.abs(vx)*4,0,.16),attacking=/JAB|CROSS|BODY|KICK|ROUNDHOUSE|UPPERCUT|SMASH|BEAM|SUPER|ULTIMATE|FINISHER/.test(pose),hurt=/HIT|TUMBLE|KNOCKDOWN/.test(pose);
    return{bend:(attacking?.055:hurt?-.07:0)+Math.sign(vx)*speed,squash:1-impact*.1,stretch:1+(attacking?speed*.7:0)+impact*.045,twist:attacking?.035:0};
  },
  draw(o){
    const{ctx,img,sx,sy,sw,sh,dx,dy,dw,dh,pose,impact=0,impactSide=1,vx=0,accent='#72ecff'}=o;if(!img?.complete||!img.naturalWidth)return false;
    const p=this.profile(pose,impact,vx),n=this.slices,slice=sw/n;
    ctx.save();ctx.translate(dx+dw/2,dy+dh);ctx.scale(p.stretch,p.squash);
    for(let i=0;i<n;i++){
      const u=(i+.5)/n,arch=Math.sin(u*Math.PI),warp=(p.bend*arch+p.twist*(u-.5))*dw-impact*impactSide*arch*(u>.36&&u<.78?dw*.065:0),lift=impact*arch*(u>.42?dh*.026:0);
      ctx.drawImage(img,sx+i*slice,sy,slice+.8,sh,-dw/2+i*dw/n+warp,-dh-lift,dw/n+1.25,dh);
    }
    if(impact>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.12*impact;ctx.filter='blur(2px)';ctx.strokeStyle=accent;ctx.lineWidth=3+impact*4;ctx.beginPath();ctx.ellipse(impactSide*dw*.34,-dh*.52,dw*.13*(1-impact*.35),dh*.18,0,0,Math.PI*2);ctx.stroke()}
    ctx.restore();return true;
  },
  redrawContact(o){
    const{ctx,img,sx,sy,sw,sh,x,y,w,h,facing=1,impact=0,accent='#72ecff'}=o;if(!impact||!img?.complete||!img.naturalWidth)return false;
    ctx.save();ctx.beginPath();ctx.ellipse(x-facing*w*.24,y-h*.5,w*.19,h*.3,0,0,Math.PI*2);ctx.clip();ctx.translate(x,y);ctx.scale(facing,1);ctx.globalAlpha=.92;ctx.filter='drop-shadow(0 0 5px '+accent+')';ctx.drawImage(img,sx,sy,sw,sh,-w/2,-h,w,h);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.34*impact;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(-facing*w*.24,-h*.52,8+impact*16,0,Math.PI*2);ctx.fill();ctx.restore();return true;
  },
  active(pose){return ACTIVE.test(pose)},
  snapshot(){return{name:this.name,version:this.version,ready:this.ready,slices:this.slices,impactWarp:this.impactWarp,contactOcclusion:this.contactOcclusion,energyEmbedding:this.energyEmbedding,fallback:this.fallback}}
};
globalThis.JarvisSoftSpriteEngine=Object.freeze(engine);
})();
