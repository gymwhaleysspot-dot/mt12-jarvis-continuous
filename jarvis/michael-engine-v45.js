// MICHAEL ENGINE V56 — fitted mobile visual-foundation kernel.
// Backend-neutral frame graph, ECS world, resource lifecycle, GPU timing and adaptive feature policy.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class MichaelFrameGraph{
  constructor(){this.nodes=new Map;this.order=[];this.compiled=false}
  add(name,{after=[],enabled=()=>true,run=()=>{}}={}){if(this.nodes.has(name))throw Error('Duplicate render pass '+name);this.nodes.set(name,{name,after:[...after],enabled,run});this.compiled=false;return this}
  compile(){const temp=new Set,done=new Set,out=[],visit=n=>{if(done.has(n))return;if(temp.has(n))throw Error('Render graph cycle at '+n);const p=this.nodes.get(n);if(!p)throw Error('Missing render pass '+n);temp.add(n);for(const d of p.after)visit(d);temp.delete(n);done.add(n);out.push(p)};for(const n of this.nodes.keys())visit(n);this.order=out;this.compiled=true;return this}
  execute(ctx){if(!this.compiled)this.compile();for(const p of this.order)if(p.enabled(ctx)!==false)p.run(ctx)}
  describe(){return this.order.map(p=>p.name)}
}
export class MichaelWorld{
  constructor(capacity=256){this.capacity=capacity;this.count=0;this.alive=new Uint8Array(capacity);this.flags=new Uint32Array(capacity);this.transform=new Float32Array(capacity*8);this.names=new Map}
  create(name,flags=0){if(this.count>=this.capacity)throw Error('MICHAEL ECS capacity');const id=this.count++;this.alive[id]=1;this.flags[id]=flags;this.transform[id*8+6]=1;this.names.set(name,id);return id}
  pose(id,x,y,z,yaw=0){const o=id*8,t=this.transform;t[o]=x;t[o+1]=y;t[o+2]=z;t[o+3]=yaw;return this}
  setFlag(id,mask,on=true){this.flags[id]=on?this.flags[id]|mask:this.flags[id]&~mask}
  query(mask,fn){for(let id=0;id<this.count;id++)if(this.alive[id]&&(this.flags[id]&mask)===mask)fn(id,this.transform.subarray(id*8,id*8+8))}
  snapshot(){return{entities:this.count,capacity:this.capacity,names:[...this.names.keys()]}}
}
export class MichaelResources{
  constructor(){this.items=new Map;this.bytes=0}
  keep(key,value,{bytes=0,dispose=null}={}){const old=this.items.get(key);if(old)this.release(key,true);this.items.set(key,{value,bytes,refs:1,dispose});this.bytes+=bytes;return value}
  retain(key){const r=this.items.get(key);if(r)r.refs++;return r?.value}
  release(key,force=false){const r=this.items.get(key);if(!r)return false;if(!force&&--r.refs>0)return false;try{r.dispose?.(r.value)}finally{this.bytes-=r.bytes;this.items.delete(key)}return true}
  report(){return{resources:this.items.size,bytes:this.bytes}}
}
class MichaelGPUProfiler{
  constructor(gl){this.gl=gl;this.ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');this.pending=[];this.active=null;this.gpuMs=0;this.supported=!!this.ext}
  begin(){if(!this.ext||this.active)return;const q=this.gl.createQuery();this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,q);this.active=q}
  end(){if(!this.active)return;this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=null}
  poll(){const gl=this.gl,e=this.ext;if(!e)return this.gpuMs;while(this.pending.length){const q=this.pending[0],ready=gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE),bad=gl.getParameter(e.GPU_DISJOINT_EXT);if(!ready)break;this.pending.shift();if(!bad)this.gpuMs=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6;gl.deleteQuery(q)}return this.gpuMs}
}
class MichaelFeaturePolicy{
  constructor(){this.tier='ULTRA';this.features={clearcoat:true,transmission:true,softShadows:true,layeredForest:true,reflections:true,particles:true,bloom:true,colorGrade:true};this.ema=16.7;this.pressure=0;this.bad=0;this.good=0;this.cooldown=0}
  update(cpuMs,gpuMs,mode,rendererPressure=0){const sample=gpuMs>0?Math.max(cpuMs,gpuMs):cpuMs;this.ema+=clamp(sample-this.ema,-8,8)*.05;const budget=mode==='garage'?25:17,targetPressure=Math.max(this.ema/budget-1,rendererPressure);this.pressure=this.pressure*.90+Math.max(0,targetPressure)*.10;if(this.pressure>.10){this.bad++;this.good=0}else if(this.ema<budget*.82&&rendererPressure<.025){this.good++;this.bad=0}else{this.bad=Math.max(0,this.bad-1);this.good=Math.max(0,this.good-1)}if(this.cooldown>0)this.cooldown--;if(this.bad>=12&&this.tier!=='BALANCED'){this.tier='BALANCED';this.bad=0;this.cooldown=120}else if(!this.cooldown&&this.good>=180&&this.tier!=='ULTRA'){this.tier='ULTRA';this.good=0;this.cooldown=90}const high=this.tier==='ULTRA';this.features.softShadows=high;this.features.reflections=high;this.features.particles=mode==='garage'&&high;this.features.bloom=true;return this.features}
}
class MichaelHealthSupervisor{
  constructor(canvas,renderer){this.canvas=canvas;this.renderer=renderer;this.state='HEALTHY';this.longFrames=0;this.longAnimationFrames=0;this.integrityRecoveries=0;this.inputLatencyMs=0;this.pendingInput=0;this.lastFrame=performance.now();this.gapMs=0;this.pixelBytes=0;this.observer=null;try{if(globalThis.PerformanceObserver?.supportedEntryTypes?.includes('long-animation-frame')){this.observer=new PerformanceObserver(list=>{this.longAnimationFrames+=list.getEntries().length});this.observer.observe({type:'long-animation-frame',buffered:true})}}catch{this.observer=null}}
  noteInput(stamp=performance.now()){this.pendingInput=Number.isFinite(stamp)?stamp:performance.now()}
  recoverIntegrity(){this.integrityRecoveries++;this.state='RECOVERING'}
  tick(now,cpuMs,pressure,paused){this.gapMs=clamp(now-this.lastFrame,0,5000);this.lastFrame=now;if(this.gapMs>50)this.longFrames++;if(this.pendingInput){const latency=clamp(now-this.pendingInput,0,500);this.inputLatencyMs=this.inputLatencyMs?this.inputLatencyMs*.86+latency*.14:latency;this.pendingInput=0}const w=this.canvas.width||0,h=this.canvas.height||0,targets=this.renderer.hdrFloat?20:12;this.pixelBytes=w*h*targets;const loaded=pressure>.12||cpuMs>28||this.gapMs>50;this.state=paused?'PAUSED':loaded?'PRESSURED':this.state==='RECOVERING'?'RECOVERING':'HEALTHY';if(this.state==='RECOVERING'&&cpuMs<22&&pressure<.05)this.state='HEALTHY'}
  report(){return{state:this.state,longFrames:this.longFrames,longAnimationFrames:this.longAnimationFrames,inputLatencyMs:+this.inputLatencyMs.toFixed(1),integrityRecoveries:this.integrityRecoveries,estimatedRenderBytes:this.pixelBytes,longAnimationFrameObserver:!!this.observer}}
}
export class MichaelEngine{
  constructor({renderer,dynamics,canvas}){this.version='MICHAEL_ENGINE_V56';this.backend='WEBGL2_JS_OPTIONAL_WASM';this.renderer=renderer;this.dynamics=dynamics;this.canvas=canvas;this.world=new MichaelWorld;this.resources=new MichaelResources;this.graph=new MichaelFrameGraph;this.profiler=new MichaelGPUProfiler(renderer.gl);this.policy=new MichaelFeaturePolicy;this.health=new MichaelHealthSupervisor(canvas,renderer);this.mode='garage';this.frame=0;this.started=performance.now();this.last=this.started;this.cpuMs=0;this.vehicle=-1;this.camera=-1;this.scene=-1;this.paused=false;this.contextLosses=0;this._buildGraph();const gl=renderer.gl;this.capabilities={parallelShaderCompile:!!gl.getExtension('KHR_parallel_shader_compile'),astc:!!gl.getExtension('WEBGL_compressed_texture_astc'),etc:!!gl.getExtension('WEBGL_compressed_texture_etc'),s3tc:!!gl.getExtension('WEBGL_compressed_texture_s3tc'),floatColorBuffer:!!gl.getExtension('EXT_color_buffer_float'),timerQuery:this.profiler.supported,webgpu:!!navigator.gpu};canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.paused=true;this.contextLosses++});canvas.addEventListener('webglcontextrestored',()=>{this.paused=true;try{sessionStorage.setItem('michael-context-recovery',String(Date.now()))}catch{}location.reload()})}
  _buildGraph(){const r=this.renderer;this.graph.add('visibility').add('shadow-atlas',{after:['visibility'],enabled:c=>c.features.softShadows,run:c=>r.renderShadowPass(c.frameState)}).add('opaque-pbr',{after:['shadow-atlas'],run:c=>{r.beginColorPass(c.frameState);r.renderOpaquePass(c.frameState)}}).add('transmission',{after:['opaque-pbr'],enabled:c=>c.features.transmission,run:c=>r.renderTransmissionPass(c.frameState)}).add('atmosphere',{after:['transmission']}).add('post-process',{after:['atmosphere'],run:c=>{r.postBloom=c.features.bloom?.10:0;r.endOwnedFrame(c.frameState)}}).add('telemetry',{after:['post-process']}).compile()}
  bootstrap(){this.scene=this.world.create('rally-world',4);this.vehicle=this.world.create('mjx-7303',1|2);this.camera=this.world.create('chase-camera',8);this.resources.keep('licensed-c3-wrc',{authority:true},{bytes:0});return this}
  setMode(mode){this.mode=mode}
  noteInput(stamp){this.health.noteInput(stamp)}
  recoverIntegrity(){this.health.recoverIntegrity()}
  setVehiclePose(x,y,z,yaw){this.world.pose(this.vehicle,x,y,z,yaw)}
  beginFrame(now=performance.now()){this._cpuStart=performance.now();this.frame++;this.last=now;this.profiler.poll();this.frameContext={engine:this,mode:this.mode,features:this.policy.features,frame:this.frame,frameState:null}}
  render(){if(this.paused)return;this.profiler.begin();this.frameContext.frameState=this.renderer.beginOwnedFrame();this.graph.execute(this.frameContext);this.profiler.end()}
  endFrame(){const now=performance.now();this.cpuMs=now-this._cpuStart;this.policy.update(this.cpuMs,this.profiler.gpuMs,this.mode,this.renderer.performancePressure||0);this.health.tick(now,this.cpuMs,this.policy.pressure,this.paused);if((this.frame&31)===0)globalThis.__MICHAEL_ENGINE=this.report()}
  report(){return{version:this.version,backend:this.backend,webgpuAvailable:!!navigator.gpu,frame:this.frame,cpuMs:+this.cpuMs.toFixed(2),gpuMs:+this.profiler.gpuMs.toFixed(2),gpuTiming:this.profiler.supported,ownedRenderPasses:true,hdrTarget:this.renderer.hdrFloat?'RGBA16F':'RGBA8_FALLBACK',postProcess:true,polyglot:globalThis.__MICHAEL_POLYGLOT?.states||[],tier:this.policy.tier,performancePressure:+this.policy.pressure.toFixed(3),adaptationCooldown:this.policy.cooldown,paused:this.paused,contextLosses:this.contextLosses,capabilities:{...this.capabilities},health:this.health.report(),features:{...this.policy.features},renderGraph:this.graph.describe(),world:this.world.snapshot(),resources:this.resources.report(),uptimeMs:Math.round(performance.now()-this.started)}}
}
