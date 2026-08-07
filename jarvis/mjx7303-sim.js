(()=>{
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const SPEC={massKg:4.94,wheelbaseMm:375,trackMm:265,tireDiameterMm:103,motorKv:2500,batteryCells:4,escA:120,servoKg:35,radio:'RadioMaster MT12',link:'ELRS 1000Hz 1:2'};
function node(x,y,tag){return{x,y,px:x,py:y,homeX:x,homeY:y,tag,damage:0}}
function make(){
 const nodes=[node(-18,-36,'front'),node(18,-36,'front'),node(-24,-12,'rail'),node(24,-12,'rail'),node(-24,14,'rail'),node(24,14,'rail'),node(-18,36,'rear'),node(18,36,'rear'),node(-31,-18,'wheel'),node(31,-18,'wheel'),node(-31,22,'wheel'),node(31,22,'wheel')];
 const pairs=[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7],[0,3],[1,2],[2,5],[3,4],[4,7],[5,6],[2,8],[4,8],[3,9],[5,9],[4,10],[6,10],[5,11],[7,11]];
 const beams=pairs.map(([a,b],i)=>{const A=nodes[a],B=nodes[b];return{a,b,rest:Math.hypot(B.x-A.x,B.y-A.y),k:i<16?.48:.26,plastic:0,broken:false}});
 const wheels=[8,9,10,11].map((n,i)=>({node:n,front:i<2,left:i%2===0,rpm:0,slip:0,grip:1,temp:28,wear:0,puncture:false}));
 return{nodes,beams,wheels,dyn:{mph:0,rpm:900,gear:1,lateral:0,yaw:0,yawRate:0,heat:28,batteryV:16.8},channels:{steer:0,throttle:0,TCT:1024,GYR:260,TC:0,ABS:0},health:{structure:1,motor:1,steering:1,diff:1},telemetry:{truthMph:0,truthRpm:900,slip:0,reason:'READY'}};
}
function structure(car,dt,longLoad,latLoad){
 const h=Math.min(.004,dt/6);
 for(let s=0;s<6;s++){
  for(const p of car.nodes){const vx=(p.x-p.px)*.99,vy=(p.y-p.py)*.99;p.px=p.x;p.py=p.y;p.x+=vx+latLoad*h*h*.5;p.y+=vy-longLoad*h*h*.5}
  for(let it=0;it<5;it++)for(const b of car.beams){if(b.broken)continue;const A=car.nodes[b.a],B=car.nodes[b.b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1,strain=(d-b.rest)/b.rest,abs=Math.abs(strain);if(abs>.10){b.plastic=clamp(b.plastic+(abs-.10)*.015,0,.4);b.rest=lerp(b.rest,d,.015)}if(abs>.5)b.broken=true;const f=strain*b.k;A.x+=dx*f*.5;A.y+=dy*f*.5;B.x-=dx*f*.5;B.y-=dy*f*.5}
 }
 const live=car.beams.filter(b=>!b.broken).length;
 car.health.structure=clamp(live/car.beams.length-car.beams.reduce((a,b)=>a+b.plastic,0)/car.beams.length*.35,0,1);
}
function damageHealth(car){
 const front=(car.nodes[0].damage+car.nodes[1].damage)/2,rear=(car.nodes[6].damage+car.nodes[7].damage)/2;
 const left=(car.nodes[8].damage+car.nodes[10].damage)/2,right=(car.nodes[9].damage+car.nodes[11].damage)/2;
 car.health.motor=clamp(1-front*.72,.18,1);car.health.diff=clamp(1-rear*.58,.22,1);car.health.steering=clamp(1-(left+right)*.42,.22,1);
 for(const w of car.wheels)if(car.nodes[w.node].damage>.82||w.wear>.98)w.puncture=true;
}
function impact(car,side,energy){
 const map={front:[0,1,2,3],rear:[4,5,6,7],left:[0,2,4,6,8,10],right:[1,3,5,7,9,11]},ids=map[side]||map.front,e=clamp(energy,0,160);
 for(const i of ids){const p=car.nodes[i];p.damage=clamp(p.damage+e*.004,0,1);if(side==='front')p.y+=e*.018;else if(side==='rear')p.y-=e*.018;else p.x+=(side==='left'?1:-1)*e*.016}
 damageHealth(car);return car;
}
function tireState(car,tune,dt){
 let front=0,rear=0,maxSlip=0;
 for(const w of car.wheels){const speed=Math.max(1,car.dyn.mph),wheelMph=w.rpm*SPEC.tireDiameterMm*Math.PI/1000*60/1609.344;w.slip=clamp((wheelMph-speed)/Math.max(6,speed),-2,2);maxSlip=Math.max(maxSlip,Math.abs(w.slip));const pressure=clamp(1-Math.abs((tune.pressure||32)-32)*.015,.72,1),temp=clamp(1-Math.abs(w.temp-42)*.012,.58,1),wear=clamp(1-w.wear*.72,.2,1),puncture=w.puncture?.18:1,peak=Math.exp(-Math.pow(Math.abs(w.slip)-.10,2)*15);w.grip=clamp((.62+.38*peak)*pressure*temp*wear*puncture,.08,1.2);const heat=Math.abs(w.slip)*speed*.025;w.temp+=heat*dt-(w.temp-28)*.03*dt;w.wear=clamp(w.wear+heat*.000014*dt,0,1);if(w.front)front+=w.grip;else rear+=w.grip}
 return{front:front/2,rear:rear/2,maxSlip};
}
function step(car,dt,input={},tune={}){
 dt=clamp(dt,.001,.04);const d=car.dyn,ch=car.channels,t=tireState(car,tune,dt);ch.steer=clamp(input.steer||0,-1,1);ch.throttle=clamp(input.throttle||0,0,1);
 const tcLimit=tune.tcSlip||.25,tc=ch.throttle>.15&&t.maxSlip>tcLimit,abs=(input.brake||0)>.25&&car.wheels.some(w=>w.slip<-.18);ch.TC=tc?1:0;ch.ABS=abs?1:0;const cut=tc?clamp(1-(t.maxSlip-tcLimit)*.9,.48,1):1;ch.TCT=Math.round(1024*cut);ch.GYR=Math.round(clamp((tune.gyr||260)+Math.abs(ch.steer)*110+Math.abs(d.yawRate)*70,120,460));
 const ratios=[0,10.2,7.1,5.35,4.2,3.45,2.9],rear=car.wheels.slice(2),wheelRpm=(rear[0].rpm+rear[1].rpm)/2;d.rpm=lerp(d.rpm,Math.max(900,wheelRpm*ratios[d.gear]*.82),.24);if(d.rpm>36500&&d.gear<6)d.gear++;if(d.rpm<12500&&d.gear>1)d.gear--;
 const curve=clamp(1-Math.pow((d.rpm-25000)/27000,2)*.42,.35,1),boost=input.boost?1.2:1,drive=ch.throttle*cut*7.5*curve*boost*car.health.motor*car.health.diff,brake=(input.brake||0)*11*(abs?.62:1),drag=.011*d.mph+.00065*d.mph*d.mph*(1+(1-car.health.structure)),off=input.offroad?3.8:0,acc=drive*t.rear-brake-drag-off-.2;
 d.mph=clamp(d.mph+acc*dt*2.237,0,78);const steer=ch.steer*car.health.steering,gyro=ch.GYR/460,lat=steer*t.front*(5+d.mph*.03)-d.lateral*(1.7+t.rear+gyro);d.lateral+=lat*dt;d.lateral*=Math.max(0,1-dt*(1.2+t.rear));d.yawRate+=(steer*t.front*d.mph*.0018-d.yawRate*(1.6+gyro))*dt;d.yaw+=d.yawRate*dt;d.heat+=ch.throttle*3.5*dt-(d.heat-28)*.03*dt;d.batteryV=clamp(d.batteryV-ch.throttle*.002*dt,13.2,16.8);
 const target=d.mph*1609.344/3600/(SPEC.tireDiameterMm/1000*Math.PI)*60;for(const w of car.wheels){w.rpm=lerp(w.rpm,target,w.front?.34:.14);if(!w.front)w.rpm+=drive*dt*28;if(input.brake)w.rpm*=Math.max(0,1-input.brake*dt*4)}structure(car,dt,acc,lat);damageHealth(car);car.telemetry.truthMph=d.mph;car.telemetry.truthRpm=d.rpm;car.telemetry.slip=t.maxSlip;car.telemetry.reason=tc?'TC SLIP':abs?'ABS LOCK':input.offroad?'OFFROAD':car.health.structure<.7?'DAMAGE':'GRIP';return car;
}
window.MJX7303SIM={SPEC,make,step,impact};
})();