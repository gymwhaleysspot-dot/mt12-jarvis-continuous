import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const RED=0xc41224,RED2=0x760914,WHITE=0xf5f6f7,BLACK=0x07090b,GLASS=0x0c1d28;
const paint=c=>new THREE.MeshPhysicalMaterial({color:c,metalness:.22,roughness:.19,clearcoat:1,clearcoatRoughness:.055,envMapIntensity:1.6});
const bodyMat=paint(RED),darkPaint=paint(RED2),whiteMat=paint(WHITE);
const blackMat=new THREE.MeshPhysicalMaterial({color:BLACK,metalness:.5,roughness:.28,clearcoat:.6,clearcoatRoughness:.12});
const glassMat=new THREE.MeshPhysicalMaterial({color:GLASS,metalness:.02,roughness:.055,transmission:.28,transparent:true,opacity:.78,ior:1.46,thickness:.055,clearcoat:1,envMapIntensity:1.8});
const tireMat=new THREE.MeshStandardMaterial({color:0x050506,roughness:.96,metalness:0});
const rimMat=new THREE.MeshPhysicalMaterial({color:0xf7f7f7,metalness:.82,roughness:.16,clearcoat:.55});
const discMat=new THREE.MeshStandardMaterial({color:0x7e858a,metalness:.9,roughness:.27});
const caliperMat=new THREE.MeshPhysicalMaterial({color:0xd20f21,metalness:.35,roughness:.22,clearcoat:.8});
const headMat=new THREE.MeshPhysicalMaterial({color:0xeafbff,emissive:0xb7efff,emissiveIntensity:8,roughness:.05});
const tailMat=new THREE.MeshPhysicalMaterial({color:0xff2535,emissive:0xff1128,emissiveIntensity:6,roughness:.12});

const KEYS=[
 [-2.04,.78,.42,.70],[-1.82,.94,.43,.84],[-1.58,1.01,.44,.94],[-1.28,1.055,.45,1.03],[-.96,1.06,.47,1.12],[-.70,1.02,.49,1.28],[-.38,.98,.51,1.43],[-.05,.96,.52,1.50],[.32,.96,.52,1.49],[.66,.98,.51,1.43],[.98,1.02,.49,1.30],[1.28,1.055,.46,1.13],[1.58,1.02,.44,.99],[1.84,.93,.43,.86],[2.02,.77,.42,.72]
];
function smooth(t){return t*t*(3-2*t)}
function profile(z){let a=KEYS[0],b=KEYS[KEYS.length-1];for(let i=0;i<KEYS.length-1;i++)if(z>=KEYS[i][0]&&z<=KEYS[i+1][0]){a=KEYS[i];b=KEYS[i+1];break}const t=smooth((z-a[0])/(b[0]-a[0]||1));return[a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t]}
function shellGeometry(){
 const zs=49,cs=21,pts=[],idx=[];
 for(let iz=0;iz<zs;iz++){
  const z=-2.04+4.08*iz/(zs-1),[w,base,top]=profile(z);
  for(let ix=0;ix<cs;ix++){
   const xn=-1+2*ix/(cs-1),c=Math.max(0,Math.cos(xn*Math.PI/2));
   const shoulder=.045*Math.exp(-Math.pow((Math.abs(xn)-.77)/.16,2));
   const x=xn*(w+shoulder), crown=Math.pow(c,.72), y=base+(top-base)*crown;
   const belt=.035*Math.exp(-Math.pow((Math.abs(xn)-.62)/.17,2));
   pts.push(x,y-belt,z);
  }
 }
 for(let z=0;z<zs-1;z++)for(let x=0;x<cs-1;x++){const a=z*cs+x,b=a+1,d=(z+1)*cs+x,c=d+1;idx.push(a,b,d,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function mesh(g,m,p=[0,0,0],r=[0,0,0]){const o=new THREE.Mesh(g,m);o.position.set(...p);o.rotation.set(...r);o.castShadow=true;o.receiveShadow=true;return o}
function box(w,h,d,m,p,r=[0,0,0]){return mesh(new THREE.BoxGeometry(w,h,d,4,3,5),m,p,r)}
function quad(points,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return mesh(g,mat)}
function wheel(){
 const g=new THREE.Group();
 const tire=mesh(new THREE.CylinderGeometry(.325,.325,.19,64,3),tireMat,[0,0,0],[0,0,Math.PI/2]);g.add(tire);
 const rim=mesh(new THREE.CylinderGeometry(.222,.222,.196,56,2),rimMat,[0,0,0],[0,0,Math.PI/2]);g.add(rim);
 const disc=mesh(new THREE.CylinderGeometry(.１６,.１６,.025,56),discMat,[.105,0,0],[0,0,Math.PI/2]);g.add(disc);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,s=box(.026,.028,.18,rimMat,[.11,Math.sin(a)*.088,Math.cos(a)*.088],[a,0,0]);g.add(s)}
 g.add(box(.05,.115,.075,caliperMat,[.125,.11,0]));g.userData.tire=tire;return g;
}
function sideWindow(car,sx){const m=glassMat;const x=sx*.972;car.add(quad([[x,.92,-.69],[x,1.34,-.48],[x,1.43,.28],[x,.93,.35]],m));car.add(quad([[x,.93,.42],[x,1.42,.34],[x,1.29,1.02],[x,.91,1.10]],m))}
function livery(car){
 const c=document.createElement('canvas');c.width=1536;c.height=384;const x=c.getContext('2d');x.fillStyle='#c41224';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.beginPath();x.moveTo(0,30);x.lineTo(830,0);x.lineTo(570,384);x.lineTo(0,384);x.fill();x.fillStyle='#11161b';x.beginPath();x.moveTo(710,0);x.lineTo(1160,0);x.lineTo(865,384);x.lineTo(530,384);x.fill();x.fillStyle='#e31c31';x.beginPath();x.moveTo(1080,0);x.lineTo(1536,0);x.lineTo(1536,384);x.lineTo(900,384);x.fill();x.fillStyle='#fff';x.font='900 120px system-ui';x.fillText('7303',1160,160);x.font='800 42px system-ui';x.fillText('RALLY',1190,215);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
 const mat=new THREE.MeshPhysicalMaterial({map:t,roughness:.22,metalness:.08,clearcoat:.9,transparent:true});for(const sx of[-1,1]){const p=mesh(new THREE.PlaneGeometry(2.38,.72),mat,[sx*1.071,.77,.12],[0,sx>0?-Math.PI/2:Math.PI/2,0]);car.add(p)}
}
export function build7303(){
 const car=new THREE.Group();car.name='MJX7303_SMOOTH_V9';
 car.add(mesh(shellGeometry(),bodyMat));
 // lower body / aero
 car.add(box(1.92,.12,3.52,blackMat,[0,.42,0]));car.add(box(1.88,.055,.24,blackMat,[0,.34,-1.98]));car.add(box(1.88,.055,.24,blackMat,[0,.34,1.97]));for(const sx of[-1,1])car.add(box(.055,.075,2.52,blackMat,[sx*1.06,.39,.12]));
 // glass greenhouse
 car.add(quad([[-.70,.94,-.80],[.70,.94,-.80],[.58,1.43,-.48],[-.58,1.43,-.48]],glassMat));
 car.add(quad([[.61,1.40,.43],[-.61,1.40,.43],[-.70,.93,1.08],[.70,.93,1.08]],glassMat));
 sideWindow(car,-1);sideWindow(car,1);
 // hood, scoop, vents
 car.add(box(.70,.035,.31,blackMat,[0,1.015,-1.20],[-.12,0,0]));car.add(mesh(new THREE.CapsuleGeometry(.16,.34,8,16),blackMat,[0,1.52,-.05],[Math.PI/2,0,0]));
 // fender arch lips
 for(const sx of[-1,1])for(const z of[-1.14,1.14]){const a=mesh(new THREE.TorusGeometry(.39,.055,14,64,Math.PI),darkPaint,[sx*1.025,.59,z],[0,Math.PI/2,Math.PI/2]);car.add(a)}
 // lighting + fascia
 for(const sx of[-1,1]){car.add(box(.43,.115,.055,headMat,[sx*.59,.78,-1.99],[0,sx*.05,0]));car.add(box(.38,.10,.05,tailMat,[sx*.58,.76,1.985]));const beam=new THREE.SpotLight(0xd4f6ff,22,10,.42,.6,1.6);beam.position.set(sx*.58,.79,-1.96);beam.target.position.set(sx*.48,.4,-8);car.add(beam,beam.target)}
 car.add(box(1.14,.18,.05,blackMat,[0,.58,-2.01]));for(let i=-5;i<=5;i++)car.add(box(.018,.15,.018,discMat,[i*.10,.58,-2.04]));
 const cm=new THREE.MeshBasicMaterial({color:0xf4f5f6});for(const y of[.69,.77])for(const sx of[-1,1])car.add(box(.26,.025,.025,cm,[sx*.14,y,-2.045],[0,0,sx*.46]));
 // mirrors, wing, underbody details
 for(const sx of[-1,1]){car.add(mesh(new THREE.SphereGeometry(.13,22,14),darkPaint,[sx*1.08,1.10,-.36]));car.add(box(.04,.12,.09,blackMat,[sx*.98,1.05,-.36]))}
 car.add(box(2.05,.075,.46,blackMat,[0,1.47,1.72],[-.055,0,0]));for(const sx of[-1,1])car.add(box(.075,.46,.11,blackMat,[sx*.82,1.24,1.61]));
 livery(car);
 const positions=[[-1.08,.48,-1.14],[1.08,.48,-1.14],[-1.08,.48,1.14],[1.08,.48,1.14]];car.userData.wheels=[];for(const p of positions){const w=wheel();w.position.set(...p);car.add(w);car.userData.wheels.push(w)}
 return car;
}
function config(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=THREE.SRGBColorSpace}
function fit(camera,controls,obj,margin=1.28){const box=new THREE.Box3().setFromObject(obj),s=new THREE.Sphere();box.getBoundingSphere(s);const aspect=Math.max(.25,camera.aspect),fy=THREE.MathUtils.degToRad(camera.fov),fx=2*Math.atan(Math.tan(fy/2)*aspect),f=Math.min(fy,fx),dist=s.radius/Math.sin(f/2)*margin;const dir=new THREE.Vector3(1.05,.48,1.2).normalize();camera.position.copy(s.center).addScaledVector(dir,dist);camera.near=Math.max(.03,dist-s.radius*2);camera.far=dist+s.radius*8;camera.updateProjectionMatrix();controls.target.copy(s.center);controls.minDistance=dist*.58;controls.maxDistance=dist*1.65;controls.update()}
export function createGarage(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});config(renderer);const scene=new THREE.Scene();scene.background=new THREE.Color(0x04070b);scene.fog=new THREE.FogExp2(0x04070b,.028);
 const pm=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.04).texture;room.dispose();pm.dispose();
 const camera=new THREE.PerspectiveCamera(38,1,.03,100),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.055;controls.maxPolarAngle=Math.PI*.55;
 const floor=mesh(new THREE.CircleGeometry(11,128),new THREE.MeshPhysicalMaterial({color:0x0a0f15,metalness:.65,roughness:.14,clearcoat:1,clearcoatRoughness:.04}),[0,0,0],[ -Math.PI/2,0,0]);scene.add(floor);
 const podium=mesh(new THREE.CylinderGeometry(2.62,2.70,.105,128),new THREE.MeshPhysicalMaterial({color:0x111923,metalness:.6,roughness:.18,clearcoat:.92}),[0,.052,0]);scene.add(podium);
 scene.add(new THREE.HemisphereLight(0xcdeeff,0x0e1217,1.7));const key=new THREE.SpotLight(0xffffff,180,22,.56,.5,1.2);key.position.set(-4.7,7.4,4.2);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.target.position.set(0,.75,0);scene.add(key,key.target);const fill=new THREE.SpotLight(0x70ddff,100,18,.72,.62,1.25);fill.position.set(5,4,-3);fill.target.position.set(0,.8,0);scene.add(fill,fill.target);const warm=new THREE.SpotLight(0xff594a,58,16,.7,.65,1.4);warm.position.set(-4,2,-4);warm.target.position.set(0,.7,0);scene.add(warm,warm.target);
 const car=build7303();car.position.y=.10;scene.add(car);const shadow=mesh(new THREE.CircleGeometry(1.6,64),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34,depthWrite:false}),[0,.112,0],[-Math.PI/2,0,0]);shadow.scale.set(1,2.05,1);scene.add(shadow);
 let auto=true,last=performance.now(),framed=false;function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=Math.max(.2,r.width/Math.max(1,r.height));camera.updateProjectionMatrix();if(!framed){fit(camera,controls,car);framed=true}}const ro=new ResizeObserver(()=>{framed=false;resize()});ro.observe(canvas);resize();function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(auto)car.rotation.y+=dt*.16;controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);return{renderer,scene,camera,controls,car,setAuto:v=>auto=!!v,setAngle:a=>{auto=false;car.rotation.y=a},dispose(){ro.disconnect();renderer.dispose()}}}
export {THREE};