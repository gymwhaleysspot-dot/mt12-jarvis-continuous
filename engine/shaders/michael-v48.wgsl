// MICHAEL_V48 WGSL_REFERENCE — future WebGPU linear HDR contract
struct Camera { viewProjection: mat4x4<f32>, position: vec4<f32> };
@group(0) @binding(0) var<uniform> camera: Camera;
struct VertexIn { @location(0) position: vec3<f32>, @location(1) normal: vec3<f32> };
struct VertexOut { @builtin(position) clip: vec4<f32>, @location(0) world: vec3<f32>, @location(1) normal: vec3<f32> };
@vertex fn vertexMain(input: VertexIn) -> VertexOut { var out:VertexOut; out.world=input.position; out.normal=input.normal; out.clip=camera.viewProjection*vec4<f32>(input.position,1.0); return out; }
fn saturate(value:f32)->f32{return clamp(value,0.0,1.0);}
@fragment fn fragmentMain(input:VertexOut)->@location(0) vec4<f32>{
  let n=normalize(input.normal); let v=normalize(camera.position.xyz-input.world); let l=normalize(vec3<f32>(-0.35,0.82,0.44));
  let red=vec3<f32>(0.72,0.012,0.026); let diffuse=red*(0.34+0.66*saturate(dot(n,l)));
  let rim=pow(1.0-saturate(dot(n,v)),4.0)*vec3<f32>(0.20,0.32,0.48);
  return vec4<f32>(diffuse+rim,1.0);
}
