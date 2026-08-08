// JARVIS DYNAMICS V30 — V29 fixed-step dynamics with spawn-safe damage authority
export class JarvisDynamics{
 constructor(backend=window.MJX7303PHYSICS){if(!backend?.make||!backend?.step)throw Error('MT12 V4 physics backend unavailable');this.backend=backend;this.car=backend.make();this.fixed=1/120;this.acc=0;this.time=0;this.maxCatchup=8;this.contacts=[];this.events=[];this.impactDamage=0;this.input={steer:0,throttle:0,brake:0,surface:'asphalt'};this.tune={gyr:260,tcSlip:.25,pressure:32,motor:1,grip:1,brake:1,aero:1};this._healthySpawn()}
 _healthySpawn(){const h=this.car.health;if(!h)return;h.structure=1;h.motor=1;h.esc=1;h.steering=1;h.diff=1;h.suspension=1;h.battery=Math.max(h.battery??1,.99)}
 setInput(p={}){Object.assign(this.input,p)}
 setTune(p={}){Object.assign(this.tune,p)}
 impact(side='front',energy=.1,point=null){energy=Math.max(0,Math.min(1,Number(energy)||0));this.impactDamage=Math.min(1,this.impactDamage+energy*.55);if(this.backend.impact)this.backend.impact(this.car,side,energy);this.contacts.push({side,energy,point,time:this.time});this.events.push({type:'impact',side,energy,time:this.time})}
 _substep(){const i=this.input,t=this.tune;this.backend.step(this.car,this.fixed,{steer:i.steer||0,throttle:Math.min(1,(i.throttle||0)*t.motor),brake:Math.min(1,(i.brake||0)*t.brake),surface:i.surface||'asphalt'},{gyr:t.gyr,tcSlip:t.tcSlip/Math.max(.4,t.grip),pressure:t.pressure,aero:t.aero});
   // The deformable backend can accumulate solver strain while merely settling at spawn.
   // V30 separates visual/driver damage from passive constraint settling: only real impacts authorize damage.
   if(this.impactDamage===0){const h=this.car.health;if(h){h.structure=Math.max(h.structure??1,.98);h.motor=Math.max(h.motor??1,.99);h.esc=Math.max(h.esc??1,.99);h.steering=Math.max(h.steering??1,.99);h.diff=Math.max(h.diff??1,.99);h.suspension=Math.max(h.suspension??1,.98)}}
   this.time+=this.fixed}
 step(dt){this.acc+=Math.min(.05,Math.max(0,dt));let n=0;while(this.acc>=this.fixed&&n<this.maxCatchup){this._substep();this.acc-=this.fixed;n++}if(n===this.maxCatchup)this.acc=0;return this.snapshot()}
 snapshot(){const c=this.car,d=c.dyn,t=c.telemetry,h=c.health,ch=c.channels;const structural=Math.max(0,1-(h.structure??1)),damage=Math.max(this.impactDamage,structural*(this.impactDamage>0?1:.08));return{time:this.time,position:{x:d.x,y:d.z||.04,z:d.y},rotation:{yaw:-d.yaw,pitch:d.pitch||0,roll:d.roll||0},velocity:{x:d.vx,y:d.vz||0,z:d.vy},truthMph:t.truthMph||0,truthRpm:t.truthRpm||0,batteryV:d.batteryV||16.8,tc:!!ch.TC,abs:!!ch.ABS,gyro:ch.GYR||0,tct:ch.TCT||1024,slip:t.slip||0,state:t.state||'GROUND',reason:damage>.22?'DAMAGE':(t.reason||'READY'),damage:Math.min(1,damage),health:{...h},wheels:c.wheels.map(w=>({name:w.name,loadN:w.loadN,slipRatio:w.slipRatio,slipAngle:w.slipAngle,tempC:w.tempC,wear:w.wear,punctured:w.punctured})),contacts:this.contacts.splice(0),events:this.events.splice(0)}}
 reset(){this.car=this.backend.make();this.acc=0;this.time=0;this.impactDamage=0;this.contacts.length=0;this.events.length=0;this._healthySpawn()}
}
