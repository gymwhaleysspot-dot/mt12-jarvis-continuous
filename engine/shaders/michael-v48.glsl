// MICHAEL_V48 GLSL_REFERENCE — WebGL2 linear HDR contract
#version 300 es
precision highp float;
in vec3 vWorldNormal;
in vec3 vWorldPosition;
uniform vec3 uBaseColor;
uniform vec3 uCamera;
uniform vec3 uSunDirection;
uniform float uMetallic;
uniform float uRoughness;
out vec4 outColor;
const float PI=3.14159265359;
float saturate(float x){return clamp(x,0.0,1.0);}
vec3 fresnel(float c,vec3 f0){return f0+(1.0-f0)*pow(1.0-c,5.0);}
void main(){
  vec3 n=normalize(vWorldNormal),v=normalize(uCamera-vWorldPosition),l=normalize(-uSunDirection),h=normalize(v+l);
  float nv=saturate(dot(n,v)),nl=saturate(dot(n,l)),nh=saturate(dot(n,h)),vh=saturate(dot(v,h));
  float a=max(.035,uRoughness*uRoughness),a2=a*a,d=a2/(PI*pow(nh*nh*(a2-1.0)+1.0,2.0)+1e-5);
  vec3 f0=mix(vec3(.04),uBaseColor,uMetallic),f=fresnel(vh,f0),diff=(1.0-f)*(1.0-uMetallic)*uBaseColor/PI;
  vec3 key=(diff+d*f/max(4.0*nl*nv,1e-4))*nl*vec3(5.8,5.55,5.25);
  vec3 hemi=uBaseColor*mix(vec3(.30,.34,.40),vec3(.54,.61,.72),saturate(n.y*.5+.5));
  outColor=vec4(max(key+hemi,vec3(0.0)),1.0);
}
