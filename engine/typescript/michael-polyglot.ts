type MichaelModuleState = {name:string;ready:boolean;reason?:string};
export type MichaelCameraPreset = {yaw:number;pitch:number;distance:number;targetY:number};
export type MichaelPolyglot = {abi:number;states:MichaelModuleState[];exposure:(drive:boolean,frameMs:number,dt:number)=>number;particleBudget:(frameMs:number,scale:number)=>number;quality:(frameMs:number,scale:number)=>number;cameraPreset:(view:string,aspect:number)=>MichaelCameraPreset};
const instantiate = async (url:string, imports:WebAssembly.Imports={}) => {
  const response=await fetch(url,{cache:'force-cache'}); if(!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes=await response.arrayBuffer(); return WebAssembly.instantiate(bytes,imports);
};
export async function bootMichaelPolyglot(base='./generated/',cache='michael74'):Promise<MichaelPolyglot>{
  const states:MichaelModuleState[]=[]; let cpp:any=null,rust:any=null,assembly:any=null,zig:any=null; let fallbackExposure=1.18;
  try{const factory=(await import(`${base}michael-core.js?v=${cache}`)).default;cpp=await factory({locateFile:(n:string)=>`${base}${n}?v=${cache}`});cpp._michael_boot(0x7303);states.push({name:'C/C++ Wasm',ready:cpp._michael_abi()===1});}catch(error){states.push({name:'C/C++ Wasm',ready:false,reason:String(error)});}
  for(const [name,file,set] of [['Rust Wasm','michael-rust.wasm',(v:any)=>rust=v],['AssemblyScript Wasm','michael-assembly.wasm',(v:any)=>assembly=v],['Zig Wasm','michael-zig.wasm',(v:any)=>zig=v]] as const){try{const v=(await instantiate(`${base}${file}?v=${cache}`)).instance.exports;set(v);states.push({name,ready:true});}catch(error){states.push({name,ready:false,reason:String(error)});}}
  const exposure=(drive:boolean,frameMs:number,dt:number)=>{if(cpp)return cpp._michael_visual_tick(drive?1:0,frameMs,dt);const target=(drive?1.10:1.22)-Math.max(0,Math.min(1,(frameMs-16.7)/24))*.06;fallbackExposure+=(target-fallbackExposure)*(1-Math.exp(-4.5*Math.min(.1,dt)));return fallbackExposure;};
  const particleBudget=(frameMs:number,scale:number)=>rust?.michael_particle_budget?Number(rust.michael_particle_budget(frameMs,scale)):Math.max(48,Math.min(640,320*(1-Math.max(0,Math.min(1,(frameMs-16.7)/24))*.72)*Math.max(.5,Math.min(2,scale))));
  const quality=(frameMs:number,scale:number)=>assembly?.michaelQualityScore?Number(assembly.michaelQualityScore(frameMs,scale)):Math.max(0,1-Math.max(0,frameMs-16.7)/33.3)*.72+Math.min(1,scale/1.5)*.28;
  // One composition model keeps the licensed body at a stable screen size on phones,
  // regardless of which renderer-facing language supplied the frame budget.
  const cameraPreset=(view:string,aspect:number):MichaelCameraPreset=>{const portrait=Math.max(0,Math.min(1,(1-Math.max(.45,Math.min(1.8,aspect)))/.55)),fit=1+portrait*.055,presets:Record<string,[number,number,number,number]>={front:[0,.055,11.78,.80],three:[-.72,.115,12.02,.81],side:[-Math.PI/2,.055,12.92,.77],rear:[Math.PI,.055,11.78,.80],top:[-.42,.895,15.35,.73]},p=presets[view]||presets.three;return{yaw:p[0],pitch:p[1],distance:p[2]*fit,targetY:p[3]}};
  void zig; const api={abi:1,states,exposure,particleBudget,quality,cameraPreset};(globalThis as any).__MICHAEL_POLYGLOT=api;return api;
}
