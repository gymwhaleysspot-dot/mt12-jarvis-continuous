import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const RED=0xb91522,WHITE=0xf4f5f7,BLACK=0x090b0e,GLASS=0x142533;
const mat=(color,rough=.42,metal=.12)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:.55,clearcoatRoughness:.18});
const bodyMat=mat(RED,.3,.08),whiteMat=mat(WHITE,.26,.1),blackMat=mat(BLACK,.3,.25),glassMat=new THREE.MeshPhysicalMaterial({color:GLASS,roughness:.15,metalness:.05,transmission:.18,transparent:true,opacity:.88});
const tireMat=mat(0x050607,.72,.02),rimMat=mat(0xf4f4f4,.24,.45),lightMat=new THREE.MeshPhysicalMaterial({color:0xd9fbff,emissive:0x9eeeff,emissiveIntensity:4,roughness:.15});
function roundedBox(w,h,d,r=.08,material=bodyMat){const g=new THREE.BoxGeometry(w,h,d,4,2,6);const p=g.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const sx=Math.sign(x),sy=Math.sign(y),sz=Math.sign(z);x=sx*Math.max(0,Math.abs(x)-r)+sx*r*.85;y=sy*Math.max(0,Math.abs(y)-r)+sy*r*.8;z=sz*Math.max(0,Math.abs(z)-r)+sz*r*.9;p.setXYZ(i,x,y,z)}g.computeVertexNormals();return new THREE.Mesh(g,material)}
function wheel(){const g=new THREE.Group();const tire=new THREE.Mesh(new THREE.CylinderGeometry(.315,.315,.155,36),tireMat);tire.rotation.z=Math.PI/2;tire.castShadow=true;g.add(tire);const rim=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.162,24),rimMat);rim.rotation.z=Math.PI/2;g.add(rim);for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.025,.012,.17),rimMat);s.rotation.x=i*Math.PI/5;s.position.x=.082*Math.cos(i*Math.PI/5);s.position.y=.082*Math.sin(i*Math.PI/5);g.add(s)}return g}
function addBox(parent,w,h,d,x,y,z,material,rot={}){const m=roundedBox(w,h,d,.06,material);m.position.set(x,y,z);m.rotation.set(rot.x||0,rot.y||0,rot.z||0);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function makeLiveryTexture(){const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');x.fillStyle='#b91522';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.beginPath();x.moveTo(0,40);x.lineTo(650,0);x.lineTo(430,256);x.lineTo(0,256);x.fill();x.fillStyle='#15191d';x.beginPath();x.moveTo(580,0);x.lineTo(850,0);x.lineTo(660,256);x.lineTo(440,256);x.fill();x.fillStyle='#fff';x.font='900 76px system-ui';x.fillText('7303',735,110);x.font='700 30px system-ui';x.fillText('C3 WRC',745,154);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
export function build7303(){const car=new THREE.Group();car.name='MJX7303';
 const floorBody=addBox(car,1.92,.42,3.48,0,.64,0,bodyMat);floorBody.scale.set(1,1,1);
 addBox(car,2.03,.3,1.25,0,.72,-1.33,bodyMat,{x:-.02});addBox(car,2.0,.34,1.08,0,.72,1.32,bodyMat,{x:.02});
 addBox(car,1.62,.65,1.62,0,1.02,.22,whiteMat,{x:-.03});addBox(car,1.54,.16,1.44,0,1.37,.22,whiteMat);
 const windshield=addBox(car,1.44,.42,.08,0,1.18,-.62,glassMat,{x:-.58});
 const rearGlass=addBox(car,1.4,.36,.08,0,1.18,1.0,glassMat,{x:.58});
 addBox(car,.6,.13,.5,0,1.55,-.06,blackMat,{x:.08});
 for(const sx of[-1,1]){addBox(car,.26,.28,1.1,sx*.97,.7,-.73,bodyMat);addBox(car,.27,.27,1.08,sx*.97,.7,.95,bodyMat)}
 const sideTex=makeLiveryTexture();for(const sx of[-1,1]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.78),new THREE.MeshBasicMaterial({map:sideTex,transparent:true}));panel.position.set(sx*1.015,.82,.15);panel.rotation.y=sx>0?-Math.PI/2:Math.PI/2;car.add(panel)}
 const bumper=addBox(car,1.76,.22,.22,0,.52,-1.84,blackMat);addBox(car,1.2,.12,.08,0,.61,-1.97,blackMat);
 for(const sx of[-1,1]){const hl=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.08),lightMat);hl.position.set(sx*.62,.79,-1.91);hl.rotation.y=sx*.08;car.add(hl);const spot=new THREE.SpotLight(0xd9fbff,24,8,.5,.7,1.7);spot.position.set(sx*.62,.79,-1.9);spot.target.position.set(sx*.6,.4,-7);car.add(spot,spot.target)}
 const chevronMat=new THREE.MeshBasicMaterial({color:0xe8ebed});for(const y of[.69,.77]){for(const sx of[-1,1]){const c=addBox(car,.27,.035,.035,sx*.15,y,-1.99,chevronMat,{z:sx*.42})}}
 addBox(car,2.02,.11,.47,0,1.42,1.72,blackMat,{x:-.04});addBox(car,.11,.5,.11,-.83,1.21,1.56,blackMat);addBox(car,.11,.5,.11,.83,1.21,1.56,blackMat);
 const positions=[[-1.02,.42,-1.12],[1.02,.42,-1.12],[-1.02,.42,1.15],[1.02,.42,1.15]];car.userData.wheels=[];for(const p of positions){const w=wheel();w.position.set(...p);w.castShadow=true;car.add(w);car.userData.wheels.push(w)}
 car.scale.set(.94,.94,.94);return car}
export function createGarage(canvas){const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x05080d);scene.fog=new THREE.FogExp2(0x06090d,.055);
 const camera=new THREE.PerspectiveCamera(42,1,.05,80);camera.position.set(5.8,2.8,6.8);const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,.8,0);controls.minDistance=3.2;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.53;
 const floor=new THREE.Mesh(new THREE.CircleGeometry(9,96),new THREE.MeshPhysicalMaterial({color:0x0b1016,metalness:.62,roughness:.2,clearcoat:.9,clearcoatRoughness:.1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const ring=new THREE.Mesh(new THREE.RingGeometry(2.2,2.28,96),new THREE.MeshBasicMaterial({color:0x4ddfff,transparent:true,opacity:.72,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.006;scene.add(ring);
 const hemi=new THREE.HemisphereLight(0xbfe8ff,0x0b0d12,2.1);scene.add(hemi);const key=new THREE.SpotLight(0xffffff,130,18,.72,.55,1.2);key.position.set(-4,7,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);scene.add(key);const fill=new THREE.SpotLight(0x65dfff,70,16,.8,.65,1.3);fill.position.set(5,4,-2);scene.add(fill);const rimL=new THREE.RectAreaLight(0xff2c46,30,4,1.2);rimL.position.set(-4,2,-1);rimL.lookAt(0,.8,0);scene.add(rimL);const rimR=new THREE.RectAreaLight(0x67eaff,34,4,1.2);rimR.position.set(4,2,1);rimR.lookAt(0,.8,0);scene.add(rimR);
 for(let i=0;i<8;i++){const strip=new THREE.Mesh(new THREE.BoxGeometry(.05,2.6,.04),new THREE.MeshBasicMaterial({color:i%2?0x203744:0x12242f}));strip.position.set(-6+i*1.7,1.5,-4.2);scene.add(strip)}
 const car=build7303();scene.add(car);let auto=true,last=performance.now();
 function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
 const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
 function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(auto)car.rotation.y+=dt*.22;controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
 return{renderer,scene,camera,controls,car,setAuto:v=>auto=!!v,setAngle:a=>{auto=false;car.rotation.y=a},dispose(){ro.disconnect();renderer.dispose()}}}
export {THREE};
