// JARVIS AI3D Engine V11 - custom WebGL2 renderer, no Three.js
export const AI3D_VERSION='11.0.0';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
export const V3=(x=0,y=0,z=0)=>new Float32Array([x,y,z]);
export const M4={
 id(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m},
 mul(a,b){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 perspective(fov,aspect,n,f){const q=1/Math.tan(fov*.5),m=new Float32Array(16);m[0]=q/aspect;m[5]=q;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m},
 lookAt(e,t,u=V3(0,1,0)){let zx=e[0]-t[0],zy=e[1]-t[1],zz=e[2]-t[2],zl=Math.hypot(zx,zy,zz)||1;zx/=zl;zy/=zl;zz/=zl;let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx,xl=Math.hypot(xx,xy,xz)||1;xx/=xl;xy/=xl;xz/=xl;const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx,m=M4.id();m[0]=xx;m[1]=yx;m[2]=zx;m[4]=xy;m[5]=yy;m[6]=zy;m[8]=xz;m[9]=yz;m[10]=zz;m[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);m[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);m[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);return m},
 trs(p=V3(),r=V3(),s=V3(1,1,1)){const [sx,cx]=[Math.sin(r[0]),Math.cos(r[0])],[sy,cy]=[Math.sin(r[1]),Math.cos(r[1])],[sz,cz]=[Math.sin(r[2]),Math.cos(r[2])],m=new Float32Array(16);m[0]=(cy*cz)*s[0];m[1]=(sx*sy*cz+cx*sz)*s[0];m[2]=(-cx*sy*cz+sx*sz)*s[0];m[4]=(-cy*sz)*s[1];m[5]=(-sx*sy*sz+cx*cz)*s[1];m[6]=(cx*sy*sz+sx*cz)*s[1];m[8]=sy*s[2];m[9]=-sx*cy*s[2];m[10]=cx*cy*s[2];m[12]=p[0];m[13]=p[1];m[14]=p[2];m[15]=1;return m}
};
const VS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;layout(location=2)in vec3 aC;uniform mat4 uM,uV,uP;out vec3 vN,vW,vC;void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=normalize(mat3(uM)*aN);vC=aC;gl_Position=uP*uV*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vN,vW,vC;uniform vec3 uCam,uSun,uSunCol,uAmbient;uniform float uMetal,uRough,uEmissive;out vec4 O;void main(){vec3 N=normalize(vN),L=normalize(-uSun),V=normalize(uCam-vW),H=normalize(L+V);float ndl=max(dot(N,L),0.);float ndh=max(dot(N,H),0.);float spec=pow(ndh,mix(120.,10.,uRough))*mix(.18,1.,uMetal);float fres=pow(1.-max(dot(N,V),0.),5.);vec3 base=vC*(uAmbient+uSunCol*ndl);vec3 col=base+uSunCol*(spec+.18*fres)+vC*uEmissive;col=col/(col+vec3(1.));col=pow(col,vec3(.4545));O=vec4(col,1.);}`;
const LINEVS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;uniform mat4 uV,uP;void main(){gl_Position=uP*uV*vec4(aP,1.);}`;
const LINEFS=`#version 300 es
precision highp float;uniform vec3 uColor;out vec4 O;void main(){O=vec4(uColor,1.);}`;
function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'shader');return s}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||'link');return p}
export class Mesh{
 constructor(gl,{positions,normals,colors,indices,material={}}){this.gl=gl;this.count=indices.length;this.material={metal:.08,rough:.35,emissive:0,...material};this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);const add=(loc,data)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)};add(0,new Float32Array(positions));add(1,new Float32Array(normals));add(2,new Float32Array(colors));const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);gl.bindVertexArray(null)}
 draw(gl){gl.bindVertexArray(this.vao);gl.drawElements(gl.TRIANGLES,this.count,gl.UNSIGNED_INT,0)}
}
export class Node{
 constructor(mesh=null){this.mesh=mesh;this.children=[];this.position=V3();this.rotation=V3();this.scale=V3(1,1,1);this.visible=true;this.tag='';this.lod=0}
 add(n){this.children.push(n);return n}
 matrix(){return M4.trs(this.position,this.rotation,this.scale)}
}
export class Camera{
 constructor(){this.position=V3(4,2.1,5);this.target=V3(0,.8,0);this.fov=38*Math.PI/180;this.near=.03;this.far=160;this.aspect=1}
 view(){return M4.lookAt(this.position,this.target)}
 proj(){return M4.perspective(this.fov,this.aspect,this.near,this.far)}
 orbit(yaw,pitch,dist){const cp=Math.cos(pitch);this.position[0]=this.target[0]+Math.sin(yaw)*cp*dist;this.position[1]=this.target[1]+Math.sin(pitch)*dist;this.position[2]=this.target[2]+Math.cos(yaw)*cp*dist}
}
export class AIQualityGovernor{
 constructor(){this.level=3;this.avg=16.7;this.scale=1;this.frames=0;this.aiBias=0}
 sample(ms){this.avg=this.avg*.94+ms*.06;this.frames++;if(this.frames%60===0){if(this.avg>25){this.level=Math.max(1,this.level-1);this.scale=Math.max(.65,this.scale-.1)}else if(this.avg<17){this.level=Math.min(4,this.level+1);this.scale=Math.min(1,this.scale+.05)}this.aiBias=clamp((22-this.avg)/10,-1,1)}}
 chooseLOD(distance,focus=1){const d=distance/(focus*(1+.18*this.aiBias));if(this.level>=4&&d<5.5)return 0;if(this.level>=3&&d<8)return 1;if(d<13)return 2;return 3}
}
export class AI3DEngine{
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,depth:true,stencil:false,powerPreference:'high-performance'});if(!this.gl)throw Error('WebGL2 required');this.camera=new Camera();this.root=new Node();this.gov=new AIQualityGovernor();this.sun=V3(-.45,-1,-.3);this.sunColor=V3(3.2,3.05,2.85);this.ambient=V3(.17,.2,.24);this.clear=[.008,.014,.022,1];this.prog=program(this.gl,VS,FS);this.u={};for(const n of['uM','uV','uP','uCam','uSun','uSunCol','uAmbient','uMetal','uRough','uEmissive'])this.u[n]=this.gl.getUniformLocation(this.prog,n);this.lineProg=program(this.gl,LINEVS,LINEFS);this.lu={};for(const n of['uV','uP','uColor'])this.lu[n]=this.gl.getUniformLocation(this.lineProg,n);this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();this.last=performance.now();this.running=false;this.onFrame=null;this.debugLines=[];this.pointer={drag:false,x:0,y:0};this.orbit={yaw:.8,pitch:.28,dist:6};this.bindOrbit()}
 bindOrbit(){const c=this.canvas;c.addEventListener('pointerdown',e=>{this.pointer.drag=true;this.pointer.x=e.clientX;this.pointer.y=e.clientY;c.setPointerCapture?.(e.pointerId)});c.addEventListener('pointermove',e=>{if(!this.pointer.drag)return;const dx=e.clientX-this.pointer.x,dy=e.clientY-this.pointer.y;this.pointer.x=e.clientX;this.pointer.y=e.clientY;this.orbit.yaw-=dx*.008;this.orbit.pitch=clamp(this.orbit.pitch+dy*.006,-.05,.72)});c.addEventListener('pointerup',()=>this.pointer.drag=false);c.addEventListener('wheel',e=>{e.preventDefault();this.orbit.dist=clamp(this.orbit.dist+e.deltaY*.004,3,10)},{passive:false})}
 resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2)*this.gov.scale,w=Math.max(2,Math.floor(r.width*dpr)),h=Math.max(2,Math.floor(r.height*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.camera.aspect=w/h;this.gl.viewport(0,0,w,h)}
 start(){if(this.running)return;this.running=true;requestAnimationFrame(t=>this.frame(t))}
 stop(){this.running=false}
 frame(t){if(!this.running)return;const dt=Math.min(.04,(t-this.last)/1000||.016);this.last=t;const t0=performance.now();if(this.onFrame)this.onFrame(dt,t);this.render();this.gov.sample(performance.now()-t0);if((this.gov.frames%60)===0)this.resize();requestAnimationFrame(n=>this.frame(n))}
 render(){const gl=this.gl;gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.clearColor(...this.clear);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.prog);const V=this.camera.view(),P=this.camera.proj();gl.uniformMatrix4fv(this.u.uV,false,V);gl.uniformMatrix4fv(this.u.uP,false,P);gl.uniform3fv(this.u.uCam,this.camera.position);gl.uniform3fv(this.u.uSun,this.sun);gl.uniform3fv(this.u.uSunCol,this.sunColor);gl.uniform3fv(this.u.uAmbient,this.ambient);const draw=(n,parent=M4.id())=>{if(!n.visible)return;const M=M4.mul(parent,n.matrix());if(n.mesh){const m=n.mesh.material;gl.uniformMatrix4fv(this.u.uM,false,M);gl.uniform1f(this.u.uMetal,m.metal);gl.uniform1f(this.u.uRough,m.rough);gl.uniform1f(this.u.uEmissive,m.emissive);n.mesh.draw(gl)}for(const c of n.children)draw(c,M)};draw(this.root);this.renderLines(V,P)}
 renderLines(V,P){if(!this.debugLines.length)return;const gl=this.gl,p=this.lineProg;gl.useProgram(p);gl.uniformMatrix4fv(this.lu.uV,false,V);gl.uniformMatrix4fv(this.lu.uP,false,P);for(const l of this.debugLines){const vao=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(l.points),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);gl.uniform3fv(this.lu.uColor,l.color||V3(0,.8,1));gl.drawArrays(gl.LINES,0,l.points.length/3);gl.deleteBuffer(b);gl.deleteVertexArray(vao)}this.debugLines.length=0}
 dispose(){this.stop();this.resizeObserver.disconnect()}
}
export function normals(positions,indices){const n=new Float32Array(positions.length);for(let i=0;i<indices.length;i+=3){const ia=indices[i]*3,ib=indices[i+1]*3,ic=indices[i+2]*3,ax=positions[ib]-positions[ia],ay=positions[ib+1]-positions[ia+1],az=positions[ib+2]-positions[ia+2],bx=positions[ic]-positions[ia],by=positions[ic+1]-positions[ia+1],bz=positions[ic+2]-positions[ia+2],nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;for(const j of[ia,ib,ic]){n[j]+=nx;n[j+1]+=ny;n[j+2]+=nz}}for(let i=0;i<n.length;i+=3){const l=Math.hypot(n[i],n[i+1],n[i+2])||1;n[i]/=l;n[i+1]/=l;n[i+2]/=l}return n}
export function colorArray(count,c){const a=new Float32Array(count*3);for(let i=0;i<count;i++){a[i*3]=c[0];a[i*3+1]=c[1];a[i*3+2]=c[2]}return a}
export function boxMeshData(w,h,d,color=[.5,.5,.5]){const x=w/2,y=h/2,z=d/2,p=[-x,-y,-z,x,-y,-z,x,y,-z,-x,y,-z,-x,-y,z,x,-y,z,x,y,z,-x,y,z],idx=[0,1,2,0,2,3,5,4,7,5,7,6,4,0,3,4,3,7,1,5,6,1,6,2,3,2,6,3,6,7,4,5,1,4,1,0],n=normals(p,idx),c=colorArray(8,color);return{positions:p,normals:n,colors:c,indices:idx}}
export const util={clamp,lerp};