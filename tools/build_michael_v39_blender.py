#!/usr/bin/env python3
# MICHAEL V39 — scanned visual-hull body finishing, detailed hardware, GLB export and photographic QA.
import bpy, math, os, runpy, json
from mathutils import Vector
OUT=os.environ.get('MICHAEL_V39_OUT','assets/mjx7303/michael-v39.glb')
PRE=os.environ.get('MICHAEL_V39_PREVIEW_DIR','assets/mjx7303/michael-v39-previews')
SCAN=os.environ.get('MICHAEL_V39_SCAN_OBJ','/tmp/michael-v39-scan.obj')
META=os.environ.get('MICHAEL_V39_SCAN_META','/tmp/michael-v39-scan.json')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
# Reuse V37's proven glass/interior/wheels/lamp hardware; replace its guessed body with the photo-carved scan.
os.environ['MJX_V37_OUT']='/tmp/michael-v39-v37-base.glb';os.environ['MJX_V37_PREVIEW_DIR']='/tmp/michael-v39-v37-previews'
runpy.run_path('tools/build_mjx7303_v37_blender.py',run_name='__michael_v39_base__')
S=bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in {'CAMERA','LIGHT'} or o.name.startswith('Studio'):bpy.data.objects.remove(o,do_unlink=True)
    elif 'BODY_SHELL_V36_REFERENCE' in o.name:bpy.data.objects.remove(o,do_unlink=True)

def pin(bsdf,names,val):
    for n in names:
        if n in bsdf.inputs:bsdf.inputs[n].default_value=val;return

def material(name,color,metal=0,rough=.2,coat=.8):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    b=m.node_tree.nodes.get('Principled BSDF');pin(b,['Base Color'],(*color,1));pin(b,['Metallic'],metal);pin(b,['Roughness'],rough);pin(b,['Coat Weight','Clearcoat'],coat);pin(b,['Coat Roughness','Clearcoat Roughness'],.032)
    return m
PAINT=material('MICHAEL_V39_Scanned_Multicoat_Red',(.61,.012,.018),.18,.095,1.0)
BLACK=material('MICHAEL_V39_Deep_Black',(.003,.004,.006),0,.58,.06)
METAL=material('MICHAEL_V39_Machined_Metal',(.64,.68,.74),.92,.12,.28)
# Import the actual photo-carved watertight mesh.
if not os.path.exists(SCAN):raise RuntimeError('MICHAEL V39 scan OBJ missing: '+SCAN)
before=set(bpy.data.objects)
if hasattr(bpy.ops.wm,'obj_import'):bpy.ops.wm.obj_import(filepath=SCAN,forward_axis='NEGATIVE_Z',up_axis='Y')
else:bpy.ops.import_scene.obj(filepath=SCAN,axis_forward='-Z',axis_up='Y')
new=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
if not new:raise RuntimeError('MICHAEL V39 scan import produced no mesh')
body=new[0];body.name='MICHAEL_SCAN_BODY_V39';body.data.materials.clear();body.data.materials.append(PAINT)
for p in body.data.polygons:p.use_smooth=True
# Scanner-like cleanup: preserve silhouette truth while smoothing voxel stair-stepping and keeping a printable watertight shell.
sm=body.modifiers.new('MICHAEL_SCAN_SMOOTH','SMOOTH');sm.factor=.42;sm.iterations=5
bev=body.modifiers.new('MICHAEL_MICRO_BEVEL','BEVEL');bev.width=.006;bev.segments=2;bev.limit_method='ANGLE';bev.angle_limit=math.radians(38)
# Paint microstructure. This is subtle surface breakup, not fake body geometry.
b=PAINT.node_tree.nodes.get('Principled BSDF');noise=PAINT.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=185;noise.inputs['Detail'].default_value=3.2;noise.inputs['Roughness'].default_value=.58
bump=PAINT.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.032;bump.inputs['Distance'].default_value=.008;PAINT.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);PAINT.node_tree.links.new(bump.outputs['Normal'],b.inputs['Normal'])
# Add physical wheel-well darkness behind the scan-carved openings so they read as cavities, not silhouette holes.
def box(n,loc,sc,ma,bev=.01,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=n;o.scale=sc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
    if bev:m=o.modifiers.new('EdgeRadius','BEVEL');m.width=bev;m.segments=3
    return o
for side in (-1,1):
    for wy in (-1.875,1.875):box('MICHAEL_WheelWell_V39',(side*1.05,wy,.52),(.16,.58,.54),BLACK,.08)
# Scan identity objects are intentionally tiny and hidden below floor; they make CI verify the correct generated asset.
box('MICHAEL_V39_SCAN_ID',(0,0,-.24),(.01,.01,.01),BLACK,0)
box('MICHAEL_VISUAL_HULL_V39',(0,.03,-.24),(.01,.01,.01),BLACK,0)
# Export vehicle only.
for o in S.objects:o.select_set(o.type=='MESH' and not o.name.startswith('Studio'))
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
# Photographic QA — no orthographic CAD views. Long-lens product camera and broad soft sources.
STUDIO=material('MICHAEL_V39_Studio',(.045,.052,.061),.04,.24,.14)
box('StudioFloorMichael',(0,0,-.12),(6.5,6.8,.06),STUDIO,.02);box('StudioCycloramaMichael',(0,5.8,2.8),(6.5,.06,3.0),STUDIO,.06)
def area(n,loc,energy,size,color):
    d=bpy.data.lights.new(n,'AREA');d.energy=energy;d.shape='RECTANGLE';d.size=size;d.size_y=size*.62;d.color=color;o=bpy.data.objects.new(n,d);S.collection.objects.link(o);o.location=loc;return o
def point(o,target=(0,0,1.05)):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
lights=[area('MichaelKey',(-5.0,-4.6,6.8),1750,5.8,(1.0,.91,.82)),area('MichaelFill',(5.4,-.5,4.8),1120,4.8,(.73,.84,1.0)),area('MichaelRim',(0,5.2,6.0),1450,4.2,(1.0,.72,.58)),area('MichaelRoof',(0,-.2,7.4),900,3.5,(.82,.90,1.0))]
for o in lights:point(o)
S.world.color=(.011,.014,.020);try:S.render.engine='BLENDER_EEVEE_NEXT'
except TypeError:S.render.engine='BLENDER_EEVEE'S.render.resolution_x=1400;S.render.resolution_y=1050;S.render.resolution_percentage=100;S.render.image_settings.file_format='PNG';S.render.film_transparent=False
camd=bpy.data.cameras.new('MICHAEL_PhysicalCamera');cam=bpy.data.objects.new('MICHAEL_PhysicalCamera',camd);S.collection.objects.link(cam);S.camera=cam;camd.lens=92
views={'front':((0,-12.0,1.55),(0,-.18,1.00)),'three':((7.3,-9.6,3.0),(0,0,1.02)),'side':((12.2,0,1.55),(0,0,1.02)),'rear':((0,12.0,1.55),(0,.20,1.00)),'top':((4.8,-3.9,13.0),(0,0,.75))}
for name,(loc,target) in views.items():cam.location=loc;point(cam,target);S.render.filepath=os.path.join(PRE,name+'.png');bpy.ops.render.render(write_still=True)
meta=json.loads(open(META).read()) if os.path.exists(META) else {}
print({'asset':'MICHAEL_V39_SCANNED_MJX7303','mesh':'MULTIVIEW_VISUAL_HULL','scanVertices':meta.get('vertices'),'scanFaces':meta.get('faces'),'out':OUT,'camera':'92MM_PHOTOGRAPHIC'})
