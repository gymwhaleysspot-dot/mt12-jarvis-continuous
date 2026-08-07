import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const RED=0xb31422,RED2=0x7b0712,WHITE=0xf3f4f6,BLACK=0x090b0d,GLASS=0x102432;
const paint=(c)=>new THREE.MeshPhysicalMaterial({color:c,metalness:.18,roughness:.23,clearcoat:1,clearcoatRoughness:.08,sheen:.08});
const bodyMat=paint(RED),bodyDark=paint(RED2),whiteMat=paint(WHITE),blackMat=new THREE.MeshPhysicalMaterial({color:BLACK,metalness:.45,roughness:.3,clearcoat:.55,clearcoatRoughness:.16});
const glassMat=new THREE.MeshPhysicalMaterial({color:GLASS,metalness:.05,roughness:.08,transmission:.22,transparent:true,opacity:.82,ior:1.45,thickness:.035,clearcoat:1});
const tireMat=new THREE.MeshStandardMaterial({color:0x050607,roughness:.9,metalness:.02});
const rimMat=new THREE.MeshPhysicalMaterial({color:0xf6f7f8,metalness:.72,roughness:.19,clearcoat:.55});
const discMat=new THREE.MeshStandardMaterial({color:0x7d858a,metalness:.86,roughness:.3});
const caliperMat=new THREE.MeshPhysicalMaterial({color:0xd41422,metalness:.35,roughness:.25,clearcoat:.8});
const lightMat=new THREE.MeshPhysicalMaterial({color:0xe9fbff,emissive:0xa9edff,emissiveIntensity:7,roughness:.08,metalness:.02});
const tailMat=new THREE.MeshPhysicalMaterial({color:0xff2436,emissive:0xff1028,emissiveIntensity:5,roughness:.18});

function loftShell(){
 const sections=[
  [-1.98,.64,.82,.46,.96,.78],[-1.78,.93,.93,.49,1.02,.86],[-1.52,1.03,.98,.52,1.08,.93],[-1.18,1.06,1.00,.53,1.10,1.02],[-.78,1.04,.98,.55,1.17,1.21],[-.35,1.01,.94,.58,1.34,1.40],[.10,1.00,.92,.59,1.43,1.46],[.50,1.00,.91,.58,1.40,1.42],[.90,1.02,.94,.55,1.28,1.29],[1.28,1.05,.99,.51,1.12,1.07],[1.58,1.02,.96,.49,1.00,.94],[1.82,.92,.88,.47,.91,.86],[1.98,.72,.78,.45,.83,.76]
 ];
 const ring=(z,w,shoulder,roofW,roofY,midY)=>[
  [-w,.44,z],[-w*1.025,.66,z],[-shoulder,.91,z],[-roofW,midY,z],[-roofW*.74,roofY,z],[roofW*.74,roofY,z],[roofW,midY,z],[shoulder,.91,z],[w*1.025,.66,z],[w,.44,z]
 ];
 const pts=[];for(const s of sections)pts.push(...ring(...s));
 const idx=[],n=10;for(let s=0;s<sections.length-1;s++)for(let i=0;i<n;i++){const a=s*n+i,b=s*n+(i+1)%n,c=(s+1)*n+(i+1)%n,d=(s+1)*n+i;idx.push(a,b,d,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,bodyMat);m.castShadow=true;m.receiveShadow=true;return m;
}
function box(parent,w,h,d,x,y,z,mat=blackMat,rx=0,ry=0,rz=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d,3,2,4),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function wheel(){
 const g=new THREE.Group();
 const tire=new THREE.Mesh(new THREE.CylinderGeometry(.325,.325,.18,56,2),tireMat);tire.rotation.z=Math.PI/2;tire.castShadow=true;g.add(tire);
 const side1=new THREE.Mesh(new THREE.TorusGeometry(.25,.035,10,48),tireMat);side1.rotation.y=Math.PI/2;side1.position.x=.092;g.add(side1);const side2=side1.clone();side2.position.x=-.092;g.add(side2);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.218,.218,.188,48),rimMat);rim.rotation.z=Math.PI/2;g.add(rim);
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(.157,.157,.025,48),discMat);disc.rotation.z=Math.PI/2;disc.position.x=.102;g.add(disc);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,s=new THREE.Mesh(new THREE.BoxGeometry(.03,.025,.175),rimMat);s.position.set(.11,Math.sin(a)*.086,Math.cos(a)*.086);s.rotation.x=a;g.add(s)}
 const cal=box(g,.05,.10,.07,.125,.11,0,caliperMat);cal.rotation.x=.15;
 g.userData.tire=tire;return g;
}
function planePanel(parent,w,h,x,y,z,ry,mat){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,1),mat);p.position.set(x,y,z);p.rotation.y=ry;p.castShadow=true;parent.add(p);return p}
function liveryTexture(){const c=document.createElement('canvas');c.width=1600;c.height=400;const x=c.getContext('2d');x.fillStyle='#b31422';x.fillRect(0,0,1600,400);x.fillStyle='#f5f5f5';x.beginPath();x.moveTo(0,50);x.lineTo(850,0);x.lineTo(570,400);x.lineTo(0,400);x.fill();x.fillStyle='#11161a';x.beginPath();x.moveTo(740,0);x.lineTo(1220,0);x.lineTo(880,400);x.lineTo(540,400);x.fill();x.fillStyle='#e21d2e';x.beginPath();x.moveTo(1110,0);x.lineTo(1600,0);x.lineTo(1600,400);x.lineTo(900,400);x.fill();x.fillStyle='#fff';x.font='900 128px system-ui';x.fillText('7303',1190,165);x.font='800 48px system-ui';x.fillText('RALLY',1210,225);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
function arch(parent,sx,z){const mat=bodyDark;const arch=new THREE.Mesh(new THREE.TorusGeometry(.39,.09,14,48,Math.PI),mat);arch.rotation.y=Math.PI/2;arch.rotation.z=Math.PI/2;arch.position.set(sx*1.02,.64,z);arch.castShadow=true;parent.add(arch)}
export function build7303(){
 const car=new THREE.Group();car.name='MJX7303_HIGH_DETAIL_V8';
 const shell=loftShell();car.add(shell);
 box(car,1.86,.16,3.52,0,.42,0,blackMat);box(car,1.72,.10,1.10,0,.48,-1.43,bodyDark);box(car,1.76,.10,.90,0,.48,1.50,bodyDark);
 for(const z of[-1.14,1.14])for(const sx of[-1,1])arch(car,sx,z);
 const sideTex=liveryTexture();for(const sx of[-1,1]){const panel=planePanel(car,2.35,.76,sx*1.038,.78,.12,sx>0?-Math.PI/2:Math.PI/2,new THREE.MeshPhysicalMaterial({map:sideTex,transparent:true,roughness:.26,metalness:.06,clearcoat:.8}));panel.renderOrder=3}
 // glass greenhouse
 const windshield=planePanel(car,1.22,.54,0,1.22,-.74,0,glassMat);windshield.rotation.x=-.68;
 const rearGlass=planePanel(car,1.20,.45,0,1.18,1.06,Math.PI,glassMat);rearGlass.rotation.x=.62;
 for(const sx of[-1,1]){const sg=planePanel(car,1.02,.42,sx*.60,1.24,.08,sx>0?-Math.PI/2:Math.PI/2,glassMat);sg.position.x=sx*.80}
 // hood vents + scoop
 box(car,.75,.035,.34,0,1.02,-1.12,blackMat,-.12);box(car,.54,.13,.52,0,1.53,-.05,blackMat,-.03);box(car,.34,.08,.34,0,1.62,-.08,blackMat);
 // splitters / skirts / diffuser
 box(car,1.82,.06,.22,0,.36,-1.91,blackMat);box(car,1.83,.06,.24,0,.36,1.91,blackMat);for(const sx of[-1,1])box(car,.07,.08,2.55,sx*1.06,.39,.12,blackMat);
 // lights
 for(const sx of[-1,1]){box(car,.43,.12,.055,sx*.59,.82,-1.94,lightMat,0,sx*.05,0);const beam=new THREE.SpotLight(0xcdf5ff,24,10,.42,.65,1.6);beam.position.set(sx*.57,.82,-1.9);beam.target.position.set(sx*.5,.4,-8);car.add(beam,beam.target);box(car,.38,.10,.05,sx*.58,.79,1.94,tailMat)}
 // grille details
 box(car,1.10,.18,.05,0,.59,-1.985,blackMat);for(let i=-4;i<=4;i++)box(car,.025,.16,.025,i*.11,.59,-2.015,new THREE.MeshStandardMaterial({color:0x31383d,metalness:.65,roughness:.3}));
 // chevrons
 const cm=new THREE.MeshBasicMaterial({color:0xf0f1f2});for(const y of[.70,.78])for(const sx of[-1,1])box(car,.28,.028,.025,sx*.14,y,-2.025,cm,0,0,sx*.48);
 // mirrors
 for(const sx of[-1,1]){box(car,.22,.12,.17,sx*1.08,1.12,-.38,bodyDark);box(car,.045,.12,.09,sx*.98,1.07,-.38,blackMat)}
 // rear wing
 box(car,2.06,.08,.48,0,1.49,1.73,blackMat,-.06);for(const sx of[-1,1])box(car,.08,.48,.12,sx*.82,1.25,1.62,blackMat);
 // wheels
 const positions=[[-1.08,.48,-1.14],[1.08,.48,-1.14],[-1.08,.48,1.14],[1.08,.48,1.14]];car.userData.wheels=[];for(const p of positions){const w=wheel();w.position.set(...p);car.add(w);car.userData.wheels.push(w)}
 // suspension hints
 const armMat=new THREE.MeshStandardMaterial({color:0x39434b,metalness:.65,roughness:.35});for(const sx of[-1,1])for(const z of[-1.14,1.14]){const arm=box(car,.48,.035,.055,sx*.78,.45,z,armMat,0,0,sx*.18);arm.position.x=sx*.80}
 car.scale.set(1.12,1.12,1.12);return car;
}

function configureRenderer(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.physicallyCorrectLights=true}
export function createGarage(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});configureRenderer(renderer);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x05080c);scene.fog=new THREE.FogExp2(0x05080c,.035);
 const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment();scene.environment=pmrem.fromScene(env,.04).texture;env.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(37,1,.05,80);camera.position.set(4.25,2.05,4.9);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.055;controls.target.set(0,.88,0);controls.minDistance=2.7;controls.maxDistance=7.2;controls.maxPolarAngle=Math.PI*.54;
 const floor=new THREE.Mesh(new THREE.CircleGeometry(10,128),new THREE.MeshPhysicalMaterial({color:0x0b0f14,metalness:.62,roughness:.16,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.4}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const podium=new THREE.Mesh(new THREE.CylinderGeometry(2.52,2.58,.10,96),new THREE.MeshPhysicalMaterial({color:0x101820,metalness:.58,roughness:.2,clearcoat:.9}));podium.position.y=.04;podium.receiveShadow=true;scene.add(podium);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.48,.018,8,120),new THREE.MeshBasicMaterial({color:0x55d9ff}));ring.rotation.x=Math.PI/2;ring.position.y=.105;scene.add(ring);
 scene.add(new THREE.HemisphereLight(0xcceeff,0x10141a,1.65));
 const key=new THREE.SpotLight(0xffffff,170,20,.58,.52,1.25);key.position.set(-4.5,7,4.3);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0003;scene.add(key);key.target.position.set(0,.7,0);scene.add(key.target);
 const fill=new THREE.SpotLight(0x7edfff,95,18,.74,.64,1.3);fill.position.set(5,4,-3);fill.target.position.set(0,.8,0);scene.add(fill,fill.target);
 const warm=new THREE.SpotLight(0xff5b47,55,14,.72,.7,1.5);warm.position.set(-4,2,-4);warm.target.position.set(0,.7,0);scene.add(warm,warm.target);
 for(let i=0;i<10;i++){const strip=new THREE.Mesh(new THREE.BoxGeometry(.035,3.2,.035),new THREE.MeshBasicMaterial({color:i%2?0x17445c:0x17303e}));strip.position.set(-7.5+i*1.65,1.7,-5.1);scene.add(strip)}
 const car=build7303();car.position.y=.09;scene.add(car);
 const contact=new THREE.Mesh(new THREE.CircleGeometry(1.55,64),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.112;contact.scale.set(1,2.0,1);scene.add(contact);
 let auto=true,last=performance.now();
 function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=Math.max(.1,r.width/r.height);camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
 function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(auto)car.rotation.y+=dt*.18;controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
 return{renderer,scene,camera,controls,car,setAuto:v=>auto=!!v,setAngle:a=>{auto=false;car.rotation.y=a},dispose(){ro.disconnect();renderer.dispose()}};
}
export {THREE};
