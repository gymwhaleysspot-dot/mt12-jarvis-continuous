// Michael V57 vehicle dynamics contract.
// Browser-native, deterministic and deliberately fail-safe for mobile tab interruptions.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;

export class JarvisDynamics{
  constructor(){
    this.tune={motor:1,grip:1,brake:1,aero:1};
    this.input={steer:0,throttle:0,brake:0,surface:'asphalt'};
    this.reset();
  }

  reset(){
    this.position={x:0,y:0,z:0};
    this.rotation={yaw:0};
    this.speed=0;
    this.steerAngle=0;
    this.engineRpm=900;
    this.batteryV=16.7;
    this.damage=0;
    this.elapsed=0;
    this.lastReason='—';
    return this.snapshot(false,false);
  }

  setInput(next={}){
    this.input={
      steer:clamp(finite(next.steer),-1,1),
      throttle:clamp(finite(next.throttle),0,1),
      brake:clamp(finite(next.brake),0,1),
      surface:typeof next.surface==='string'?next.surface:'asphalt'
    };
  }

  setTune(next={}){
    for(const key of Object.keys(this.tune)){
      if(Number.isFinite(next[key]))this.tune[key]=clamp(next[key],.75,1.3);
    }
  }

  surfaceGrip(){
    return ({asphalt:1,gravel:.72,mud:.48,snow:.38,ice:.22})[this.input.surface]??.82;
  }

  step(deltaSeconds){
    const dt=clamp(finite(deltaSeconds,.016),.001,.04);
    this.elapsed+=dt;
    const grip=this.surfaceGrip()*this.tune.grip;
    const throttle=this.input.throttle;
    const brake=this.input.brake;
    const direction=this.speed<-.05?-1:1;
    const speedAbs=Math.abs(this.speed);

    // A compact longitudinal model: electric launch torque, rolling resistance,
    // quadratic aero drag and a brake curve that remains stable at zero speed.
    const motorForce=11.8*this.tune.motor*throttle;
    const rolling=(speedAbs>.01?.34:.08)*direction;
    const aero=.014*this.tune.aero*this.speed*speedAbs;
    const brakeForce=brake*(16.5*this.tune.brake)*direction;
    const requested=motorForce-rolling-aero-brakeForce;
    const tractionLimit=9.81*grip;
    const acceleration=clamp(requested,-tractionLimit,tractionLimit);
    const tc=motorForce>tractionLimit+.15;
    const abs=brake>0&&Math.abs(brakeForce)>tractionLimit+.15&&speedAbs>1.2;
    const previousSpeed=this.speed;
    this.speed=clamp(this.speed+acceleration*dt,-3.5,35.75);
    if(brake>0&&previousSpeed*this.speed<0)this.speed=0;
    if(throttle===0&&brake===0&&Math.abs(this.speed)<.035)this.speed=0;

    const targetSteer=this.input.steer*(.56-clamp(speedAbs/110,0,.22));
    const steeringResponse=1-Math.exp(-dt*(8.5+grip*3));
    this.steerAngle+=(targetSteer-this.steerAngle)*steeringResponse;
    const wheelbase=2.56;
    const yawRate=(this.speed/wheelbase)*Math.tan(this.steerAngle)*clamp(grip,.2,1.25);
    this.rotation.yaw+=yawRate*dt;
    this.position.x+=Math.sin(this.rotation.yaw)*this.speed*dt;
    this.position.z+=Math.cos(this.rotation.yaw)*this.speed*dt;

    const wheelRpm=speedAbs*60/(2*Math.PI*.335);
    this.engineRpm=clamp(900+wheelRpm*7.8+throttle*5200,900,37000);
    const electricalLoad=throttle*.78+brake*.08+clamp(speedAbs/36,0,1)*.14;
    const targetVoltage=16.72-electricalLoad*1.12;
    this.batteryV+=(targetVoltage-this.batteryV)*(1-Math.exp(-dt*3.2));
    this.batteryV=clamp(this.batteryV,13.8,16.8);

    if(![this.speed,this.rotation.yaw,this.position.x,this.position.z,this.engineRpm,this.batteryV].every(Number.isFinite)){
      this.reset();
      this.lastReason='INTEGRITY RESET';
    }
    return this.snapshot(tc,abs);
  }

  snapshot(tc=false,abs=false){
    return {
      position:{...this.position},rotation:{...this.rotation},
      velocity:this.speed,steerAngle:this.steerAngle,
      truthMph:Math.abs(this.speed)*2.236936,
      truthRpm:this.engineRpm,batteryV:this.batteryV,
      tc:Boolean(tc),abs:Boolean(abs),damage:clamp(this.damage,0,1),
      reason:this.lastReason
    };
  }
}

export default JarvisDynamics;
