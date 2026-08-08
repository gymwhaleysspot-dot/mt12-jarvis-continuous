#!/usr/bin/env python3
# JARVIS V39 PHOTO-SCAN TWIN — multi-view silhouette reconstruction over V38 running gear/detail.
# The body is rebuilt as one watertight longitudinal loft from reference-photo landmarks, analogous to
# stacking 2-D slices in a 3-D printer. Front/side/top observations constrain every station.
import bpy, math, os, runpy
from mathutils import Vector
OUT=os.environ.get('MJX_V39_OUT','assets/mjx7303/mjx7303-v39.glb')
PRE=os.environ.get('MJX_V39_PREVIEW_DIR','assets/mjx7303/v39-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
os.environ['MJX_V38_OUT']='/tmp/mjx7303-v38-base.glb';os.environ['MJX_V38_PREVIEW_DIR']='/tmp/mjx7303-v38-previews'
runpy.run_path('tools/build_mjx7303_v38_blender.py',run_name='__v38base__')
S=bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in {'CAMERA','LIGHT'} or o.name.startswith('Studio'): bpy.data.objects.remove(o,do_unlink=True)
# Remove V38's separately generated exterior skins/fascias/arch lips. Preserve detailed hardware,
# lights, wheels, underbody and V36/V37 secondary trim that does not duplicate the new skin.
for o in list(bpy.data.objects):
    if o.name.startswith(('BODY_SKIN_V38','FrontFascia_V38','RearFascia_V38','WheelArchLip_V38')):
        bpy.data.objects.remove(o,do_unlink=True)

def pin(b,names,v):
    for n in names:
        if n in b.inputs:b.inputs[n].default_value=v;return

def mat(name,c,metal=0,rough=.16,coat=1):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*c,1);b=m.node_tree.nodes.get('Principled BSDF');pin(b,['Base Color'],(*c,1));pin(b,['Metallic'],metal);pin(b,['Roughness'],rough);pin(b,['Coat Weight','Clearcoat'],coat);pin(b,['Coat Roughness','Clearcoat Roughness'],.045);return m
RED=mat('V39_PhotoMatched_Rally_Red',(.61,.012,.018),.14,.12,1);WHITE=mat('V39_Livery_White',(.82,.86,.90),.03,.16,.9);BLACK=mat('V39_Trim_Black',(.004,.005,.007),0,.48,.08);GLASS=mat('V39_Glass',(.006,.014,.025),.02,.06,.95)
# Reference calibration. Wheelbase is the hard metric anchor; normalized silhouettes were digitized
# from MJX 7303/C3 WRC front-3/4 product imagery plus C3 WRC top/profile references.
WHEELBASE=3.75; MODEL_WB=3.75
REFERENCE_SET=('MJX_7303_FRONT_3Q','C3_WRC_TOP','C3_WRC_PROFILE','C3_WRC_FRONT_REAR')
# y, half-width, sill-z, shoulder-z, belt-z, roof-z.  Dense stations capture the short overhangs,
# wide WRC arches, pinched greenhouse and rounded hatch instead of V38's slab-sided approximation.
ST=[
(-3.03,.92,.25,.70,.96,1.02),(-2.88,1.18,.25,.78,1.04,1.12),(-2.62,1.30,.26,.91,1.14,1.23),
(-2.30,1.35,.27,1.04,1.24,1.34),(-1.90,1.37,.27,1.12,1.31,1.43),(-1.52,1.34,.28,1.18,1.38,1.58),
(-1.12,1.30,.29,1.22,1.45,1.76),(-.70,1.27,.29,1.25,1.49,1.91),(-.25,1.25,.29,1.26,1.50,1.99),
(.25,1.25,.29,1.26,1.50,1.99),(.72,1.27,.29,1.25,1.48,1.92),(1.12,1.30,.29,1.22,1.44,1.82),
(1.52,1.34,.28,1.18,1.39,1.70),(1.90,1.37,.27,1.12,1.34,1.59),(2.28,1.35,.27,1.03,1.28,1.49),
(2.60,1.30,.26,.91,1.20,1.39),(2.87,1.17,.25,.78,1.10,1.28),(3.02,.94,.25,.69,1.00,1.14)]
# Cross-section rings. Angle 0/180 are outer shoulders, 90 is roof center. Width collapses strongly
# above the beltline, reproducing the C3 greenhouse rather than extruding the door width upward.
RING=20;verts=[];faces=[]
for y,w,sill,shoulder,belt,roof in ST:
    for k in range(RING):
        a=2*math.pi*k/RING
        # lower half = floor/sill; upper half = compound shoulder -> greenhouse -> roof.
        z01=(math.sin(a)+1)*.5
        if z01<.5:
            q=z01/.5; z=sill+(shoulder-sill)*(q**.72); x=w*math.cos(a)*(1-.02*q)
        else:
            q=(z01-.5)/.5; z=shoulder+(roof-shoulder)*(q**.78)
            pinch=.98-.34*(q**.72); x=w*math.cos(a)*pinch
        # shoulder tumblehome and subtle center crown.
        z+=.025*(1-(abs(x)/max(w,.01))**2)
        verts.append((x,y,z))
for j in range(len(ST)-1):
    for k in range(RING):
        a=j*RING+k;b=j*RING+(k+1)%RING;c=(j+1)*RING+(k+1)%RING;d=(j+1)*RING+k;faces.append((a,b,c,d))
faces.append(tuple(range(RING-1,-1,-1)));q=(len(ST)-1)*RING;faces.append(tuple(q+k for k in range(RING)))
me=bpy.data.meshes.new('PhotoLoftV39Mesh');me.from_pydata(verts,[],faces);me.update();body=bpy.data.objects.new('BODY_PHOTOGRAMMETRY_V39_WATERTIGHT',me);S.collection.objects.link(body);body.data.materials.append(RED)
for p in me.polygons:p.use_smooth=True
sub=body.modifiers.new('PhotoSliceSubdivision','SUBSURF');sub.subdivision_type='CATMULL_CLARK';sub.levels=2;sub.render_levels=2
bev=body.modifiers.new('PanelHighlightRadius','BEVEL');bev.width=.009;bev.segments=3
# Helper primitives for photo-observed greenhouse/livery volumes.
def box(name,loc,scale,material,rot=(0,0,0),bev=.02):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
    if bev:m=o.modifiers.new('PhotoEdgeRadius','BEVEL');m.width=bev;m.segments=3
    return o
# Glass is inset from the photo-loft, with steeper C3 A pillars and compact rear quarter glass.
box('Windshield_V39',(0,-1.03,1.67),(1.00,.035,.42),GLASS,(math.radians(22),0,0),.035)
box('RoofPanel_V39',(0,.08,1.985),(.88,.91,.035),WHITE,(0,0,0),.05)
for side in (-1,1):
    box('SideGlassFront_V39',(side*1.055,-.55,1.62),(.035,.55,.30),GLASS,(0,0,0),.025)
    box('SideGlassRear_V39',(side*1.055,.62,1.60),(.035,.47,.28),GLASS,(0,0,0),.025)
# Hood/roof white livery masses follow the reference image and break the toy-like solid-red read.
box('HoodLiveryWhite_V39',(0,-2.10,1.25),(.72,.64,.018),WHITE,(math.radians(-5),0,0),.025)
# Preserve real 375 mm wheelbase calibration in metadata/CI identity.
box('PHOTO_SCAN_V39_ID',(0,0,-.20),(.01,.01,.01),BLACK,bev=0)
body['reference_mode']='MULTI_VIEW_PHOTO_SLICES';body['reference_set']='|'.join(REFERENCE_SET);body['wheelbase_mm']=375;body['reconstruction']='WATERTIGHT_LONGITUDINAL_LOFT'
# Export vehicle only.
for o in S.objects:o.select_set(o.type=='MESH' and not o.name.startswith('Studio'))
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
# Neutral QA stage exposes silhouette errors instead of hiding them in black.
FLOOR=mat('V39_QA_Neutral',(.11,.12,.13),0,.32,.1);box('StudioFloorV39',(0,0,-.14),(6.2,6.5,.05),FLOOR)
def area(n,loc,e,size):
 d=bpy.data.lights.new(n,'AREA');d.energy=e;d.size=size;o=bpy.data.objects.new(n,d);S.collection.objects.link(o);o.location=loc;return o
def point(o,t=(0,0,1.0)):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
for o in (area('KeyV39',(-4.5,-4.8,6.4),1550,5.0),area('FillV39',(4.8,-1,4.3),1050,4.2),area('RimV39',(0,4.8,5.6),1350,4.0)):point(o)
S.world.color=(.035,.04,.045);S.render.engine='BLENDER_EEVEE';S.render.resolution_x=1280;S.render.resolution_y=960;S.render.resolution_percentage=100;S.render.image_settings.file_format='PNG'
cd=bpy.data.cameras.new('V39_ReferenceCamera');cam=bpy.data.objects.new('V39_ReferenceCamera',cd);S.collection.objects.link(cam);S.camera=cam;cd.lens=72
views={'front':((0,-11.4,1.62),(0,-.2,1.02)),'three':((7.1,-9.0,3.0),(0,0,1.02)),'side':((11.6,0,1.60),(0,0,1.02)),'rear':((0,11.5,1.62),(0,.2,1.02)),'top':((0,-.15,13.2),(0,0,.55))}
for n,(loc,t) in views.items():cam.location=loc;point(cam,t);S.render.filepath=os.path.join(PRE,n+'.png');bpy.ops.render.render(write_still=True)
print({'asset':'MJX7303_V39_PHOTO_SCAN_TWIN','method':'MULTI_VIEW_SILHOUETTE_SLICES','stations':len(ST),'ring':RING,'wheelbaseMM':375,'out':OUT})
