// JARVIS Racing V25 - Blender CAD asset + PlayCanvas PBR renderer
import * as pc from 'https://cdn.jsdelivr.net/npm/playcanvas@2.21.3/+esm';
const $=s=>document.querySelector(s),canvas=$('#pc3d'),status=$('#assetState');
const app=new pc.Application(canvas,{graphicsDeviceOptions:{alpha:false,antialias:true,powerPreference:'high-performance'}});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);app.setCanvasResolution(pc.RESOLUTION_AUTO);
if(app.scene){
  if('toneMapping'in app.scene&&pc.TONEMAP_ACES!==undefined)app.scene.toneMapping=pc.TONEMAP_ACES;
  if('exposure'in app.scene)app.scene.exposure=1.08;
  app.scene.ambientLight=new pc.Color(.055,.065,.085);
}
const root=new pc.Entity('V25 CAD Garage');app.root.addChild(root);
const camera=new pc.Entity('Automotive Camera');camera.addComponent('camera',{clearColor:new pc.Color(.003,.006,.011),fov:41,nearClip:.025,farClip:250});root.addChild(camera);
function light(name,type,pos,c,intensity,range=16,shadow=false){const e=new pc.Entity(name);e.addComponent('light',{type,color:new pc.Color(...c),intensity,range,castShadows:shadow,shadowResolution:2048,shadowBias:.18,normalOffsetBias:.08});if(pos)e.setPosition(...pos);root.addChild(e);return e}
const sun=light('Key','directional',null,[1,.95,.88],2.6,18,true);sun.setEulerAngles(48,-32,0);
light('Cool rim','omni',[-4,3,-2],[.16,.48,1],9,13,false);light('Warm fill','omni',[4,2,1],[1,.13,.05],5.5,12,false);light('Front softbox','omni',[0,2,-4],[.82,.9,1],6.5,10,false);light('Roof softbox','omni',[0,5,.2],[.84,.92,1],8.5,12,false);
function mat(c,m=.05,g=.75,emissive=null){const x=new pc.StandardMaterial();x.diffuse=new pc.Color(...c);x.metalness=m;x.gloss=g;x.useMetalness=true;if(emissive){x.emissive=new pc.Color(...emissive);x.emissiveIntensity=2.3}x.update();return x}
const floorMat=mat([.012,.016,.022],.5,.91),wallMat=mat([.014,.019,.026],.18,.62),panelMat=mat([.30,.38,.44],.02,.55,[.70,.82,1]);
function add(type,name,p,s,m,parent=root){const e=new pc.Entity(name);e.addComponent('render',{type});e.setPosition(...p);e.setLocalScale(...s);e.render.material=m;parent.addChild(e);return e}
add('plane','Garage floor',[0,0,0],[14,1,14],floorMat);add('box','Rear wall',[0,3,5.8],[7,.08,3],wallMat);add('box','Left wall',[-6,3,0],[.08,6,3],wallMat);add('box','Right wall',[6,3,0],[.08,6,3],wallMat);add('box','Ceiling',[0,6,0],[6,.08,6],wallMat);
for(const x of[-3,0,3])add('box','Ceiling panel',[x,5.88,0],[1.05,.03,2.1],panelMat);
for(const x of[-4,4])add('box','Wall strip',[x,2.4,5.68],[.45,.025,1.75],panelMat);
const turn=add('cylinder','Turntable',[0,.045,0],[3.45,.065,3.45],mat([.035,.043,.052],.72,.93));
const carRoot=new pc.Entity('MJX7303 Blender CAD');root.addChild(carRoot);
let mode='garage',yaw=-35,pitch=10,dist=7.5,targetY=.85,drag=false,lastX=0,lastY=0,sim=window.MJX7303PHYSICS?.make?.(),loaded=false;
function cam(){const y=yaw*Math.PI/180,p=pitch*Math.PI/180,cp=Math.cos(p);camera.setPosition(Math.sin(y)*cp*dist,targetY+Math.sin(p)*dist,Math.cos(y)*cp*dist);camera.lookAt(0,targetY,0)}
cam();
function boundsOf(entity){let box=null;for(const r of entity.findComponents('render')){for(const mi of(r.meshInstances||[])){const a=mi.aabb;if(!a)continue;if(!box)box=a.clone();else box.add(a)}}return box}
status.textContent='BUILDING BLENDER CAD ASSET…';status.className='asset-state';
app.assets.loadFromUrl('assets/mjx7303/mjx7303-v25.glb?v=20260807cad25','container',(err,asset)=>{
  if(err||!asset?.resource){status.textContent='V25 CAD GLB FAILED · FALLBACK AVAILABLE';status.className='asset-state warn';console.error(err);return}
  const car=asset.resource.instantiateRenderEntity();car.name='MJX 7303 V25 CAD';carRoot.addChild(car);
  for(const r of car.findComponents('render')){r.castShadows=true;r.receiveShadows=true}
  // Blender export is dimensioned close to the target already. Normalize only if wildly off.
  const box=boundsOf(car);if(box){const d=box.halfExtents.clone().mulScalar(2),largest=Math.max(d.x,d.y,d.z);if(largest>7||largest<2){const s=4.5/largest;car.setLocalScale(s,s,s)}targetY=Math.max(.72,box.center.y)}
  loaded=true;window.__V25_READY=true;status.textContent='MJX 7303 · BLENDER CAD V25 · PBR GAME ASSET';status.className='asset-state ok';cam();
});
canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag||mode!=='garage')return;yaw-=(e.clientX-lastX)*.27;pitch=Math.max(-4,Math.min(54,pitch+(e.clientY-lastY)*.17));lastX=e.clientX;lastY=e.clientY;cam()});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
const views={front:[180,7,7.2],three:[-35,10,7.5],side:[-90,6,7.7],rear:[0,8,7.4],top:[-25,53,8.6]};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));[yaw,pitch,dist]=views[b.dataset.view];cam()});
const parts=[['MOTOR','$3,200'],['ESC','$4,200'],['RALLY TIRES','$2,500'],['BRAKES','$2,200'],['WEIGHT','$3,600'],['AERO','$3,000']];if($('#parts'))$('#parts').innerHTML=parts.map(x=>`<div class="part"><div><b>${x[0]}</b><small>STAGE 0/5</small></div><button class="buy">${x[1]}</button></div>`).join('');
function setMode(m){mode=m;$('#garageBtn')?.classList.toggle('active',m==='garage');$('#driveBtn')?.classList.toggle('active',m==='drive');if($('#driveHud'))$('#driveHud').style.display=m==='drive'?'block':'none';if(m==='drive'){yaw=0;pitch=14;dist=9.0}else{yaw=-35;pitch=10;dist=7.5}cam()}$('#garageBtn').onclick=()=>setMode('garage');$('#driveBtn').onclick=()=>setMode('drive');
app.on('update',dt=>{if(mode==='drive'&&sim&&window.MJX7303PHYSICS){window.MJX7303PHYSICS.step(sim,dt,{steer:0,throttle:.45,brake:0,surface:'asphalt'},{gyr:260,tcSlip:.25,pressure:32});const mph=sim.telemetry?.truthMph||0;if($('#mph'))$('#mph').textContent=Math.round(mph);if($('#battery'))$('#battery').textContent=(sim.dyn?.batteryV||16.8).toFixed(1)+'V';if($('#damage'))$('#damage').textContent=Math.round((1-(sim.health?.structure??1))*100)+'%'}else if(mode==='garage'&&loaded)carRoot.rotateLocal(0,dt*1.3,0)});
app.start();addEventListener('resize',()=>app.resizeCanvas());
