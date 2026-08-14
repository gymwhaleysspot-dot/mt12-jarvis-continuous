#!/usr/bin/env python3
import bpy, json, os, math
from mathutils import Vector

STATE=json.load(open('keleb/state.json'))
P=STATE['parameters']
OUT=os.environ.get('KELEB_INTERIOR_OUT','assets/mjx7303/keleb-interior.glb')
BLEND=os.environ.get('KELEB_INTERIOR_BLEND','/tmp/keleb-interior.blend')
os.makedirs(os.path.dirname(OUT),exist_ok=True)

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.world.color=(0.012,0.014,0.018)
C=bpy.data.collections.new('KELEB_INTERIOR');scene.collection.children.link(C)

def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    C.objects.link(o); return o

def mat(name,c,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    return m
BLACK=mat('Keleb_Alcantara',(0.012,.014,.016),0,.62)
CARBON=mat('Keleb_Carbon',(.008,.010,.012),.18,.24)
METAL=mat('Keleb_CageMetal',(.34,.37,.40),.78,.22)
RED=mat('Keleb_Harness',(.72,.015,.02),.05,.42)
WHITE=mat('Keleb_Label',(.78,.80,.82),.03,.45)

def box(name,loc,scale,ma,bev=.02,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
    if bev:
        b=o.modifiers.new('Bevel','BEVEL');b.width=bev;b.segments=3
    return o

def cyl(name,a,b,r,ma):
    a=Vector(a);b=Vector(b);d=b-a;L=d.length
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=L,location=(a+b)/2)
    o=own(bpy.context.object);o.name=name;o.data.materials.append(ma)
    o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
    return o

def seat(name,x):
    w=P['seatWidth'];d=P['seatDepth'];h=P['seatHeight']
    box(name+'_Base',(x,.18,.88),(w,d,.08),CARBON,.05)
    box(name+'_Back',(x,.37,1.18),(w,.08,h),BLACK,.06,(-.18,0,0))
    box(name+'_Head',(x,.48,1.50),(w*.82,.07,.12),BLACK,.05,(-.14,0,0))
    for sx in (-1,1): box(name+'_Bolster',(x+sx*w*.92,.18,1.06),(.045,d*.82,.22),BLACK,.025)
    for sx in (-1,1): box(name+'_Harness',(x+sx*.075,.19,1.18),(P['harnessWidth'],.018,.34),RED,.006)

box('Keleb_Floor',(0,.15,.60),(1.02,1.25,.035),BLACK,.02)
box('Keleb_CenterTunnel',(0,.22,.78),(P['centerTunnelWidth'],.72,.18),CARBON,.025)
box('Keleb_Dashboard',(0,-1.02,1.31),(.86,P['dashboardDepth'],P['dashboardHeight']),CARBON,.05)
box('Keleb_Cluster',(-.46,-1.20,1.46),(.22,.045,.095),BLACK,.025)
box('Keleb_CenterPanel',(0,-1.20,1.34),(.20,.045,.16),BLACK,.02)
for i in range(5): box(f'Keleb_Switch_{i}',(-.12+i*.06,-1.255,1.34),(.012,.012,.018),RED if i==2 else WHITE,.004)
seat('Keleb_DriverSeat',-P['seatSeparation']);seat('Keleb_CodriverSeat',P['seatSeparation'])
bpy.ops.mesh.primitive_torus_add(major_radius=P['steeringRadius'],minor_radius=.018,major_segments=64,minor_segments=16,location=(-.46,-.91,P['steeringZ']),rotation=(math.pi/2,0,0))
wheel=own(bpy.context.object);wheel.name='Keleb_SteeringWheel';wheel.data.materials.append(BLACK)
cyl('Keleb_SteeringColumn',(-.46,-1.00,1.36),(-.46,-.91,P['steeringZ']),.018,METAL)
box('Keleb_ShifterBase',(-.05,-.10,.96),(.05,.07,.05),CARBON,.02)
cyl('Keleb_SequentialShifter',(-.05,-.10,.99),(-.05,-.10,.99+P['shifterHeight']),.018,METAL)
box('Keleb_ShifterKnob',(-.05,-.10,1.24),(.035,.035,.045),BLACK,.025)
cyl('Keleb_Handbrake',(0.09,.02,.98),(0.09,-P['handbrakeLength'],1.10),.016,METAL)
r=P['cageTubeRadius'];rz=P['cageRoofZ']
pts={'fl':(-.88,-.92,.68),'fr':(.88,-.92,.68),'fla':(-.80,-.82,rz),'fra':(.80,-.82,rz),'rl':(-.90,.94,.68),'rr':(.90,.94,.68),'rla':(-.82,.86,rz),'rra':(.82,.86,rz)}
for a,b,n in [('fl','fla','A_L'),('fr','fra','A_R'),('rl','rla','B_L'),('rr','rra','B_R'),('fla','fra','RoofFront'),('rla','rra','RoofRear'),('fla','rla','RoofL'),('fra','rra','RoofR'),('fl','rl','SillL'),('fr','rr','SillR'),('fl','rla','DoorX1L'),('rl','fla','DoorX2L'),('fr','rra','DoorX1R'),('rr','fra','DoorX2R'),('rla','rr','RearX1'),('rra','rl','RearX2')]: cyl('Keleb_Cage_'+n,pts[a],pts[b],r,METAL)
box('Keleb_DoorCard_L',(-1.03,.05,1.08),(.025,.72,.32),CARBON,.015)
box('Keleb_DoorCard_R',(1.03,.05,1.08),(.025,.72,.32),CARBON,.015)
bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=.075,depth=.42,location=(.68,.78,.76),rotation=(0,math.pi/2,0));ext=own(bpy.context.object);ext.name='Keleb_FireExtinguisher';ext.data.materials.append(RED)

scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100
bpy.ops.object.camera_add(location=(0,-4.3,1.55));cam=own(bpy.context.object);cam.name='Keleb_AuditCamera';scene.camera=cam
def aim(o,pt): o.rotation_euler=(Vector(pt)-o.location).to_track_quat('-Z','Y').to_euler()
aim(cam,(0,0,1.2));cam.data.lens=52

# Native .blend is the authoritative audit/render intermediate. Save it before any exporter addon runs.
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
# GLB remains the deployable Michael interior asset. NumPy is installed by the workflow for Blender's glTF addon.
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=False,export_draco_mesh_compression_enable=False)
print(json.dumps({'generation':STATE['generation'],'out':OUT,'blend':BLEND,'objects':len(C.objects),'authority':'interior_only'}))
