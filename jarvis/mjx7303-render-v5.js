(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
function rotY(p,a){const c=Math.cos(a),s=Math.sin(a);return{x:p.x*c-p.z*s,y:p.y,z:p.x*s+p.z*c}}
function rotX(p,a){const c=Math.cos(a),s=Math.sin(a);return{x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c}}
function project(p,cx,cy,scale,persp=5.2){const z=persp+p.z,k=scale*persp/Math.max(1,z);return{x:cx+p.x*k,y:cy-p.y*k,k,z:p.z}}
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;return`rgb(${clamp(r*f,0,255)|0},${clamp(g*f,0,255)|0},${clamp(b*f,0,255)|0})`}
const P={
 noseL:{x:-1.02,y:.12,z:-2.12},noseR:{x:1.02,y:.12,z:-2.12},hoodL:{x:-1.14,y:.38,z:-1.42},hoodR:{x:1.14,y:.38,z:-1.42},
 aL:{x:-.98,y:.78,z:-.55},aR:{x:.98,y:.78,z:-.55},roofFL:{x:-.73,y:1.25,z:-.35},roofFR:{x:.73,y:1.25,z:-.35},
 roofRL:{x:-.76,y:1.24,z:.78},roofRR:{x:.76,y:1.24,z:.78},rearL:{x:-1.08,y:.47,z:1.42},rearR:{x:1.08,y:.47,z:1.42},tailL:{x:-1.0,y:.14,z:1.98},tailR:{x:1.0,y:.14,z:1.98}
};
const faces=[
 ['hood',['noseL','noseR','hoodR','hoodL'],'#efefef'],['roof',['roofFL','roofFR','roofRR','roofRL'],'#f4f4f4'],
 ['left',['noseL','hoodL','aL','roofFL','roofRL','rearL','tailL'],'#bd1823'],['right',['noseR','hoodR','aR','roofFR','roofRR','rearR','tailR'],'#bd1823'],
 ['front',['noseL','noseR','hoodR','hoodL'],'#20252b'],['rear',['rearL','rearR','tailR','tailL'],'#a90f1d'],
 ['windshield',['aL','aR','roofFR','roofFL'],'#13232e'],['sideWinL',['aL','roofFL','roofRL','rearL'],'#182a35'],['sideWinR',['aR','roofFR','roofRR','rearR'],'#182a35']
];
function transformPt(p,yaw,pitch){return rotX(rotY(p,yaw),pitch)}
function poly(ctx,pts,fill,stroke){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function wheel(ctx,cx,cy,scale,yaw,pitch,x,z,front,damage=0){const p=transformPt({x,y:-.08,z},yaw,pitch),s=project(p,cx,cy,scale),r=17*s.k/85,side=Math.abs(Math.cos(yaw));ctx.save();ctx.translate(s.x,s.y);ctx.scale(.55+.45*side,1);ctx.fillStyle='#050607';ctx.beginPath();ctx.ellipse(0,0,r*1.18,r,0,0,TAU);ctx.fill();ctx.strokeStyle='#30343a';ctx.lineWidth=Math.max(1,r*.12);ctx.stroke();ctx.fillStyle=damage>.7?'#5c1d24':'#e9ecef';ctx.beginPath();ctx.arc(0,0,r*.58,0,TAU);ctx.fill();ctx.strokeStyle='#858d95';ctx.lineWidth=Math.max(.7,r*.05);for(let i=0;i<12;i++){const a=i*TAU/12;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.52,Math.sin(a)*r*.52);ctx.stroke()}ctx.fillStyle='#25292d';ctx.beginPath();ctx.arc(0,0,r*.18,0,TAU);ctx.fill();ctx.restore()}
function car(ctx,opt={}){
 const cx=opt.x||0,cy=opt.y||0,scale=opt.scale||90,yaw=opt.yaw||0,pitch=opt.pitch??-.13,damage=opt.damage||{},lights=opt.lights!==false,wire=!!opt.wire;
 const pts={};for(const[k,p]of Object.entries(P)){const d=(damage.structure||0);let q={...p};if(d>.15&&/(nose|hood)/.test(k))q.z+=d*.22;if(d>.3&&/rear|tail/.test(k))q.z-=d*.15;pts[k]=transformPt(q,yaw,pitch)}
 const ordered=faces.map(f=>{const ps=f[1].map(k=>pts[k]),z=ps.reduce((a,p)=>a+p.z,0)/ps.length;return{...{name:f[0],base:f[2]},ps,z}}).sort((a,b)=>b.z-a.z);
 ctx.save();ctx.lineJoin='round';ctx.lineWidth=1.1;
 // shadow
 ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,cy+scale*.34,scale*1.15,scale*.28,0,0,TAU);ctx.fill();ctx.restore();
 // wheels first
 const wdam=damage.wheels||[0,0,0,0];wheel(ctx,cx,cy,scale,yaw,pitch,-1.13,-1.18,true,wdam[0]||0);wheel(ctx,cx,cy,scale,yaw,pitch,1.13,-1.18,true,wdam[1]||0);wheel(ctx,cx,cy,scale,yaw,pitch,-1.12,1.25,false,wdam[2]||0);wheel(ctx,cx,cy,scale,yaw,pitch,1.12,1.25,false,wdam[3]||0);
 for(const f of ordered){const sp=f.ps.map(p=>project(p,cx,cy,scale));const light=.72+.28*Math.max(0,.5+Math.sin(yaw+f.z)*.5);poly(ctx,sp,shade(f.base,light),'#101318')}
 // red hood graphic + grille + headlights
 const hood=[{x:-.78,y:.41,z:-1.55},{x:.78,y:.41,z:-1.55},{x:.62,y:.54,z:-.68},{x:-.62,y:.54,z:-.68}].map(p=>project(transformPt(p,yaw,pitch),cx,cy,scale));poly(ctx,hood,'#c91522','#721019');
 const grille=[{x:-.58,y:.16,z:-2.16},{x:.58,y:.16,z:-2.16},{x:.48,y:.03,z:-2.18},{x:-.48,y:.03,z:-2.18}].map(p=>project(transformPt(p,yaw,pitch),cx,cy,scale));poly(ctx,grille,'#050708','#555');
 if(lights){for(const sx of[-1,1]){const hp=project(transformPt({x:sx*.7,y:.24,z:-2.19},yaw,pitch),cx,cy,scale);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(hp.x,hp.y,0,hp.x,hp.y,22);g.addColorStop(0,'#ffffff');g.addColorStop(.18,'#a9efff');g.addColorStop(1,'#8bdfff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hp.x,hp.y,22,0,TAU);ctx.fill();ctx.restore()}}
 // roof scoop
 const scoop=[{x:-.27,y:1.27,z:-.12},{x:.27,y:1.27,z:-.12},{x:.22,y:1.38,z:.18},{x:-.22,y:1.38,z:.18}].map(p=>project(transformPt(p,yaw,pitch),cx,cy,scale));poly(ctx,scoop,'#e9edf0','#16191c');
 // rear wing
 const wing=[{x:-1.05,y:1.08,z:1.62},{x:1.05,y:1.08,z:1.62},{x:1.03,y:1.18,z:1.91},{x:-1.03,y:1.18,z:1.91}].map(p=>project(transformPt(p,yaw,pitch),cx,cy,scale));poly(ctx,wing,'#12161a','#555f67');
 // projected livery marks
 const side=Math.cos(yaw)>=0?1:-1;const door=project(transformPt({x:side*1.12,y:.54,z:.45},yaw,pitch),cx,cy,scale);ctx.save();ctx.translate(door.x,door.y);ctx.rotate(-yaw*.16);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(8,scale*.09)}px system-ui`;ctx.fillText('7303',0,0);ctx.font=`700 ${Math.max(6,scale*.045)}px system-ui`;ctx.fillText('C3 WRC',0,scale*.07);ctx.restore();
 // citroen-style chevrons
 const badge=project(transformPt({x:0,y:.34,z:-2.21},yaw,pitch),cx,cy,scale);ctx.strokeStyle='#e5e7e9';ctx.lineWidth=2;for(let j=0;j<2;j++){ctx.beginPath();ctx.moveTo(badge.x-8,badge.y+j*5);ctx.lineTo(badge.x,badge.y-4+j*5);ctx.lineTo(badge.x+8,badge.y+j*5);ctx.stroke()}
 if(wire){ctx.strokeStyle='#6de8ff66';ctx.lineWidth=1;for(const [a,b] of[['noseL','roofFL'],['noseR','roofFR'],['hoodL','rearL'],['hoodR','rearR'],['roofFL','tailL'],['roofFR','tailR']]){const pa=project(pts[a],cx,cy,scale),pb=project(pts[b],cx,cy,scale);ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke()}}
 ctx.restore();
}
function garage(ctx,w,h,opt={}){const t=opt.time||0;const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#101c27');g.addColorStop(.52,'#071019');g.addColorStop(1,'#020407');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);for(let i=0;i<5;i++){const x=w*(.1+i*.2),gg=ctx.createRadialGradient(x,0,0,x,h*.34,h*.45);gg.addColorStop(0,'#dff7ff30');gg.addColorStop(1,'#dff7ff00');ctx.fillStyle=gg;ctx.fillRect(0,0,w,h)}ctx.strokeStyle='#2b3f4d55';ctx.lineWidth=1;for(let y=h*.58;y<h;y+=26){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}for(let x=-w;x<w*2;x+=48){ctx.beginPath();ctx.moveTo(w/2,h*.55);ctx.lineTo(x,h);ctx.stroke()}ctx.fillStyle='#0b1116';ctx.beginPath();ctx.ellipse(w/2,h*.72,w*.28,h*.09,0,0,TAU);ctx.fill();ctx.strokeStyle='#5e788866';ctx.stroke();const ring=ctx.createRadialGradient(w/2,h*.72,0,w/2,h*.72,w*.3);ring.addColorStop(.7,'#54d9ff00');ring.addColorStop(1,'#54d9ff20');ctx.fillStyle=ring;ctx.fillRect(0,h*.46,w,h*.45)}
function road(ctx,w,h,opt={}){const speed=opt.speed||0,offset=opt.offset||0,time=opt.time||0,surface=opt.surface||'asphalt';const sky=ctx.createLinearGradient(0,0,0,h*.58);sky.addColorStop(0,'#07182b');sky.addColorStop(.65,'#14354a');sky.addColorStop(1,'#b36c55');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);ctx.fillStyle='#0d1b19';ctx.fillRect(0,h*.47,w,h*.53);const hz=h*.48;for(let i=0;i<18;i++){const x=(i*93+time*.006*(10+speed))%(w+180)-90,hh=18+(i%5)*9;ctx.fillStyle=i%2?'#111a20':'#18232a';ctx.fillRect(x,hz-hh,44,hh)}const center=w*.5-offset*w*.08;for(let i=0;i<70;i++){const a=i/70,b=(i+1)/70,y1=hz+(h-hz)*a*a,y2=hz+(h-hz)*b*b,hw1=lerp(w*.02,w*.47,a*a),hw2=lerp(w*.02,w*.47,b*b);ctx.fillStyle=surface==='gravel'?(i%2?'#655d51':'#70675a'):(i%2?'#252a2d':'#292f33');ctx.beginPath();ctx.moveTo(center-hw1,y1);ctx.lineTo(center+hw1,y1);ctx.lineTo(center+hw2,y2);ctx.lineTo(center-hw2,y2);ctx.closePath();ctx.fill();if(i%7===0){ctx.strokeStyle='#eef4f788';ctx.lineWidth=1+(i/70)*3;ctx.beginPath();ctx.moveTo(center,y1);ctx.lineTo(center,y2);ctx.stroke()}}
 // guard rails / posts
 for(let i=2;i<28;i++){const a=i/28,y=hz+(h-hz)*a*a,hw=lerp(w*.03,w*.5,a*a);ctx.strokeStyle='#c6d0d6aa';ctx.lineWidth=1+a*3;ctx.beginPath();ctx.moveTo(center-hw-6,y);ctx.lineTo(center-hw-18,y+8);ctx.moveTo(center+hw+6,y);ctx.lineTo(center+hw+18,y+8);ctx.stroke()}
 // speed streaks
 if(speed>32){ctx.save();ctx.globalAlpha=clamp((speed-32)/55,0,.45);ctx.strokeStyle='#bcefff';for(let i=0;i<18;i++){const x=Math.random()*w,y=hz+Math.random()*(h-hz),len=8+speed*.35;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-w/2)*.04,y+len);ctx.stroke()}ctx.restore()}}
window.MJX7303RENDER={car,garage,road};
})();
