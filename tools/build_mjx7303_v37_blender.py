#!/usr/bin/env python3
# JARVIS V37 DIGITAL TWIN — realism pass layered on the proven V36 reference reconstruction.
# V36 establishes proportions/body. V37 adds microgeometry, optical materials and photographic QA.
import bpy, math, os, runpy
from mathutils import Vector
OUT=os.environ.get('MJX_V37_OUT','assets/mjx7303/mjx7303-v37.glb')
PRE=os.environ.get('MJX_V37_PREVIEW_DIR','assets/mjx7303/v37-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
# Build the complete proven V36 scene first, but keep its intermediate outputs out of the repo.
os.environ['MJX_V36_OUT']='/tmp/mjx7303-v36-base.glb';os.environ['MJX_V36_PREVIEW_DIR']='/tmp/mjx7303-v36-previews'
runpy.run_path('tools/build_mjx7303_v36_blender.py',run_name='__v36base__')
S=bpy.context.scene
# Remove cameras/lights from the V36 QA stage; V37 supplies a photographic studio rig after GLB export.
for o in list(bpy.data.objects):
    if o.type in {'CAMERA','LIGHT'}: bpy.data.objects.remove(o,do_unlink=True)

def pinput(bsdf,names,val):
    for n in names:
        if n in bsdf.inputs: bsdf.inputs[n].default_value=val;return True
    return False

def material(name,color,metal=0,rough=.3,coat=.4,alpha=1):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,alpha)
    b=m.node_tree.nodes.get('Principled BSDF');pinput(b,['Base Color'],(*color,1));pinput(b,['Metallic'],metal);pinput(b,['Roughness'],rough);pinput(b,['Coat Weight','Clearcoat'],coat)
    if alpha<1:
        pinput(b,['Alpha'],alpha)
        if hasattr(m,'surface_render_method'):m.surface_render_method='DITHERED'
        elif hasattr(m,'blend_method'):m.blend_method='BLEND'
        if hasattr(m,'use_screen_refraction'):m.use_screen_refraction=True
    return m
BLACK=material('V37_Satin_Black',(.003,.004,.005),0,.42,.08);RUB=material('V37_Tire_Rubber',(.006,.006,.007),0,.66,.03)
AL=material('V37_Machined_Aluminum',(.58,.62,.67),.92,.15,.30);DARKAL=material('V37_Dark_Metal',(.045,.052,.060),.78,.24,.18)
GLASS=material('V37_Optical_Glass',(.008,.018,.030),0,.035,.95,.38);LENS=material('V37_Lamp_Lens',(.68,.80,.93),.02,.025,.98,.62)
CARBON=material('V37_Carbon',(.006,.007,.008),.18,.27,.20);RED=material('V37_Tow_Red',(.82,.008,.010),.35,.16,.55)
# Upgrade V36 paint and glass nodes with micro-normal response. This adds small highlight breakup that removes the CAD-perfect surface look.
for m in bpy.data.materials:
    if not m.use_nodes: continue
    b=m.node_tree.nodes.get('Principled BSDF')
    if not b: continue
    n=m.name.lower()
    if 'clearcoat_rally_red' in n or 'red_highlight' in n:
        pinput(b,['Metallic'],.20);pinput(b,['Roughness'],.115);pinput(b,['Coat Weight','Clearcoat'],1.0);pinput(b,['Coat Roughness','Clearcoat Roughness'],.055)
        noise=m.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=145;noise.inputs['Detail'].default_value=2.5;noise.inputs['Roughness'].default_value=.52
        bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.055;bump.inputs['Distance'].default_value=.012
        m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],b.inputs['Normal'])
    elif 'glass' in n:
        pinput(b,['Metallic'],0);pinput(b,['Roughness'],.032);pinput(b,['Coat Weight','Clearcoat'],.95);pinput(b,['IOR'],1.46)
# helpers
def box(n,loc,sc,ma,bev=.01,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=n;o.scale=sc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
    if bev:md=o.modifiers.new('MicroBevel','BEVEL');md.width=bev;md.segments=3
    return o
def cyl(n,loc,r,d,ma,rot=(0,0,0),verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=d,location=loc,rotation=rot);o=bpy.context.object;o.name=n;o.data.materials.append(ma)
    for p in o.data.polygons:p.use_smooth=True
    return o
def tor(n,loc,maj,minr,ma,rot=(0,math.pi/2,0),majseg=64,minseg=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=maj,minor_radius=minr,major_segments=majseg,minor_segments=minseg,location=loc,rotation=rot);o=bpy.context.object;o.name=n;o.data.materials.append(ma)
    for p in o.data.polygons:p.use_smooth=True
    return o
FY=-1.875;RY=1.875;TX=1.325
# Real tire tread blocks: visible in 3/4 and top views, intentionally real geometry rather than painted circles.
for side in (-1,1):
  for wy in (FY,RY):
    for i in range(28):
      a=2*math.pi*i/28; y=wy+math.sin(a)*.497; z=.515+math.cos(a)*.497
      x=side*(TX+.108);rot=(a,0,0)
      box('TireTread_V37',(x,y,z),(.025,.047,.020),RUB,.006,rot)
    # Wheel center cap, five physical lug nuts and valve stem.
    cyl('CenterCap_V37',(side*(TX+.135),wy,.515),.072,.022,DARKAL,(0,math.pi/2,0),48)
    for i in range(5):
      a=2*math.pi*i/5;y=wy+math.sin(a)*.078;z=.515+math.cos(a)*.078
      cyl('WheelLug_V37',(side*(TX+.151),y,z),.014,.018,AL,(0,math.pi/2,0),24)
    box('ValveStem_V37',(side*(TX+.145),wy+.205,.60),(.011,.012,.040),DARKAL,.004,(0,0,math.radians(-18)))
# Grille depth/mesh, splitter supports, tow hook, hood pins, wipers and door handles.
for i in range(-8,9):box('FrontGrilleSlat_V37',(i*.075,-3.118,.58),(.010,.018,.205),BLACK,.003)
for i in range(-10,11):box('LowerGrilleSlat_V37',(i*.072,-3.142,.34),(.012,.016,.085),BLACK,.003)
tor('FrontTowHook_V37',(-.76,-3.18,.36),.060,.012,RED,(math.pi/2,0,0),48,12)
for x in (-.78,.78):cyl('HoodPin_V37',(x,-2.02,1.36),.027,.012,AL,(0,0,0),32)
for side in (-1,1):
    box('DoorHandle_V37',(side*1.165,.05,1.45),(.055,.16,.022),AL,.018)
    box('MudFlapFront_V37',(side*1.42,FY+.48,.34),(.035,.11,.26),RUB,.012)
    box('MudFlapRear_V37',(side*1.42,RY+.48,.34),(.035,.11,.27),RUB,.012)
# Wipers rest at windshield base.
for side in (-1,1):box('WiperBlade_V37',(side*.36,-1.49,1.53),(.012,.33,.014),BLACK,.004,(0,0,math.radians(side*18)))
# Functional-looking roof antenna and rear camera pod.
cyl('RoofAntennaBase_V37',(0,.58,2.335),.045,.025,BLACK,(0,0,0),36)
box('RoofAntennaMast_V37',(0,.58,2.50),(.010,.010,.17),BLACK,.006)
box('RearCameraPod_V37',(0,1.73,1.69),(.055,.025,.030),BLACK,.012)
# Lamp internals: several reflectors behind existing lenses make them read as assemblies rather than white/red paint.
for side in (-1,1):
    for dx in (-.10,0,.10):cyl('HeadlampProjector_V37',(side*(.92+dx*.35),-2.952,1.00+dx*.18),.031,.025,LENS,(math.pi/2,0,0),36)
    for z in (.84,.91,1.00):cyl('TailLEDCell_V37',(side*.99,2.997,z),.026,.022,RED,(math.pi/2,0,0),28)
# Interior cues visible through optical glass: steering wheel, harness bars and metallic cage junctions.
tor('SteeringWheel_V37',(-.42,-.42,1.50),.145,.018,BLACK,(math.pi/2,0,0),64,12)
for side in (-1,1):
    box('HarnessBar_V37'+str(side),(side*.44,.30,1.56),(.018,.58,.018),DARKAL,.005,(0,0,math.radians(side*4)))
# Explicit identity node guarantees CI checks stable regardless of Blender exporter material/object deduplication.
box('DIGITAL_TWIN_V37_ID',(0,0,-.15),(.01,.01,.01),BLACK,0)
# Export before adding photographic studio geometry.
for o in bpy.context.selected_objects:o.select_set(False)
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.select_set(True)
bpy.context.view_layer.objects.active=next((o for o in S.objects if o.type=='MESH'),None)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
# Photographic QA environment: neutral cyclorama, large softboxes, rim light and long-lens perspective.
STUDIO=material('V37_StudioFloor',(.055,.062,.070),.04,.20,.18)
box('StudioFloor_V37',(0,0,-.10),(5.6,6.0,.06),STUDIO,.02)
# Backdrop wall only for QA previews.
box('StudioBackdrop_V37',(0,4.7,2.4),(5.6,.05,2.5),STUDIO,.05)
def area(n,loc,energy,size,color):
    d=bpy.data.lights.new(n,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(n,d);S.collection.objects.link(o);o.location=loc;return o
def pointat(o,target=(0,0,1.05)):
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for o in [area('KeySoftbox_V37',(-4.5,-4.2,6.5),1200,5.0,(1.0,.92,.82)),area('FillSoftbox_V37',(4.8,-1.0,4.2),900,4.0,(.76,.86,1.0)),area('RimSoftbox_V37',(0,4.0,5.3),1100,3.2,(1.0,.70,.58))]:pointat(o)
S.world.color=(.018,.022,.028);try:S.render.engine='BLENDER_EEVEE_NEXT'
except TypeError:S.render.engine='BLENDER_EEVEE'S.render.resolution_x=1200;S.render.resolution_y=900;S.render.resolution_percentage=100;S.render.image_settings.file_format='PNG'
camd=bpy.data.cameras.new('V37_PhysicalCamera');cam=bpy.data.objects.new('V37_PhysicalCamera',camd);S.collection.objects.link(cam);S.camera=cam;camd.lens=72
views={'front':((0,-10.5,1.65),(0,-.2,1.05)),'three':((6.5,-8.3,3.2),(0,0,1.00)),'side':((10.7,0,1.65),(0,0,1.00)),'rear':((0,10.6,1.65),(0,.2,1.00)),'top':((5.1,-4.0,11.4),(0,0,.75))}
for name,(loc,target) in views.items():
    cam.location=loc;pointat(cam,target);S.render.filepath=os.path.join(PRE,name+'.png');bpy.ops.render.render(write_still=True)
print({'asset':'MJX7303_V37_DIGITAL_TWIN','out':OUT,'previews':PRE,'microgeometry':'TREAD_LUGS_LAMPS_GRILLES_WIPERS','camera':'72MM_PHOTOGRAPHIC'})
