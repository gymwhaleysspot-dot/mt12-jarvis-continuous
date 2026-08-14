#!/usr/bin/env python3
# JARVIS XR V32 — Blender-first reference reconstruction for MJX 7303 / C3 WRC-style body
# 1 Blender unit = 100 mm. Known anchors: 632 x 290 x 237 mm, WB 375 mm, track ~265 mm, tire OD ~103 mm.
import bpy, math, os
from mathutils import Vector
OUT=os.environ.get('MJX_V32_OUT','assets/mjx7303/mjx7303-v32.glb')
PRE=os.environ.get('MJX_V32_PREVIEW_DIR','assets/mjx7303/v32-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
C=bpy.data.collections.new('MJX7303_V32_MASTER');bpy.context.scene.collection.children.link(C)
def own(o):
 for c in list(o.users_collection): c.objects.unlink(o)
 C.objects.link(o); return o

def mat(name,color,metal=0,rough=.3,coat=.6,alpha=1.0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,alpha)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if 'Coat Weight' in p.inputs:p.inputs['Coat Weight'].default_value=coat
 elif 'Clearcoat' in p.inputs:p.inputs['Clearcoat'].default_value=coat
 if alpha<1:
  p.inputs['Alpha'].default_value=alpha;m.blend_method='BLEND';m.use_screen_refraction=True
 return m
RED=mat('Citroen_Rally_Red',(0.52,0.006,0.012),.12,.16,.9);WHITE=mat('Roof_White',(0.92,.94,.97),.03,.19,.8)
CARBON=mat('Carbon',(0.006,.008,.012),.28,.20,.45);GLASS=mat('Smoked_Glass',(.012,.025,.045),.06,.08,.75,.72)
RUBBER=mat('Tire_Rubber',(.004,.004,.005),0,.58,.1);ALLOY=mat('Wheel_Alloy',(.56,.60,.68),.82,.16,.5)
DARK=mat('Vent_Dark',(.002,.003,.005),.05,.28,.2);YELLOW=mat('Sill_Yellow',(.98,.58,.015),.03,.22,.5)
LAMP=mat('Headlamp',(.83,.91,1),.08,.06,.75);TAIL=mat('TailLamp',(.75,.004,.007),.06,.08,.75)

L=6.32;W=2.90;H=2.37;WB=3.75;FY=-WB/2;RY=WB/2;TRACK=2.65;TX=TRACK/2;TIRE_R=.515

def box(name,loc,scale,ma,bev=.03,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 if bev:
  md=o.modifiers.new('edge','BEVEL');md.width=bev;md.segments=4
 return o

def cyl(name,loc,r,depth,ma,rot=(0,0,0),verts=72):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o

def torus(name,loc,major,minor,ma):
 bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=96,minor_segments=24,location=loc,rotation=(0,math.pi/2,0));o=own(bpy.context.object);o.name=name;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o

def mesh_obj(name,verts,faces,ma,sub=0,solid=0):
 me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);C.objects.link(o);o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 if solid:
  md=o.modifiers.new('Solidify','SOLIDIFY');md.thickness=solid;md.offset=-.5
 if sub:
  md=o.modifiers.new('Subdivision','SUBSURF');md.levels=sub;md.render_levels=sub
 return o

# Dense reference-derived loft. Profile is intentionally wide/low with an upright compact greenhouse.
# y, half body width, belt z, roof half width, roof z, lower side z
ST=[
(-3.16,.62,.72,.26,.88,.24),(-3.08,.92,.78,.37,.96,.23),(-2.96,1.18,.88,.48,1.06,.22),(-2.78,1.36,1.00,.62,1.18,.22),(-2.56,1.45,1.12,.78,1.34,.22),(-2.30,1.45,1.24,.91,1.50,.22),(FY,1.45,1.34,1.02,1.63,.22),
(-1.66,1.44,1.42,1.07,1.76,.22),(-1.45,1.42,1.49,1.10,1.90,.22),(-1.20,1.39,1.55,1.12,2.03,.22),(-.92,1.36,1.60,1.13,2.13,.22),(-.60,1.34,1.63,1.14,2.19,.22),(-.25,1.33,1.64,1.14,2.22,.22),(.10,1.33,1.64,1.14,2.22,.22),(.45,1.34,1.63,1.13,2.19,.22),(.78,1.35,1.60,1.11,2.13,.22),(1.08,1.38,1.55,1.07,2.03,.22),(1.34,1.41,1.48,1.00,1.90,.22),(1.60,1.44,1.40,.92,1.74,.22),(RY,1.45,1.31,.84,1.58,.22),(2.12,1.44,1.20,.72,1.42,.22),(2.38,1.40,1.08,.61,1.28,.22),(2.62,1.34,.96,.52,1.16,.22),(2.84,1.24,.86,.44,1.07,.23),(3.03,1.03,.78,.35,.99,.24),(3.16,.70,.72,.28,.94,.26)]
# 28 points around each section, with real side crown rather than flat panels.
def ring(y,w,belt,rw,rz,sill):
 return [(-w*.67,y,.20),(-w*.91,y,.22),(-w,y,.30),(-w*1.01,y,.46),(-w,y,.66),(-w*.985,y,.88),(-w*.95,y,1.06),(-w*.90,y,belt),(-w*.82,y,belt+.10),(-rw*1.10,y,min(rz-.34,belt+.22)),(-rw*1.04,y,rz-.22),(-rw*.88,y,rz-.10),(-rw*.60,y,rz-.025),(-rw*.30,y,rz+.012),(0,y,rz+.020),(rw*.30,y,rz+.012),(rw*.60,y,rz-.025),(rw*.88,y,rz-.10),(rw*1.04,y,rz-.22),(rw*1.10,y,min(rz-.34,belt+.22)),(w*.82,y,belt+.10),(w*.90,y,belt),(w*.95,y,1.06),(w*.985,y,.88),(w,y,.66),(w*1.01,y,.46),(w,y,.30),(w*.67,y,.20)]
N=28;V=[];F=[]
for s in ST:V.extend(ring(*s))
for i in range(len(ST)-1):
 for j in range(N):F.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
F.append(tuple(range(N-1,-1,-1)));q=(len(ST)-1)*N;F.append(tuple(q+j for j in range(N)))
body=mesh_obj('BODY_SHELL_V32',V,F,RED,2,0)
# Solid body enables actual wheel-arch boolean cutouts.
sol=body.modifiers.new('BodySolid','SOLIDIFY');sol.thickness=.09;sol.offset=-1
# Boolean four wheel openings. Cylinders pass across X (axle direction), then are removed after modifiers are applied.
cutters=[]
for y in (FY,RY):
 bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.61,depth=3.4,location=(0,y,.52),rotation=(0,math.pi/2,0));c=bpy.context.object;c.name='ARCH_CUT';cutters.append(c)
 md=body.modifiers.new('WheelArch'+str(y),'BOOLEAN');md.operation='DIFFERENCE';md.object=c
# Apply body modifiers in order while cutters still exist.
bpy.context.view_layer.objects.active=body;body.select_set(True)
for md in list(body.modifiers):
 try:bpy.ops.object.modifier_apply(modifier=md.name)
 except:pass
body.select_set(False)
for c in cutters:bpy.data.objects.remove(c,do_unlink=True)

# Sculpted fender lips around the true openings.
for sx in (-1,1):
 for y in (FY,RY):
  torus('FenderLip',(sx*1.42,y,.52),.525,.035,CARBON)
# Proper wheels: sidewall + rim + hub + brake disc/caliper silhouette.
for sx in (-1,1):
 for y in (FY,RY):
  torus('Tire',(sx*TX,y,.515),.405,.110,RUBBER)
  cyl('Rim',(sx*TX,y,.515),.300,.18,ALLOY,(0,math.pi/2,0),80)
  cyl('BrakeDisc',(sx*(TX-.015),y,.515),.205,.035,CARBON,(0,math.pi/2,0),64)
  cyl('Hub',(sx*(TX+.015),y,.515),.060,.205,RED,(0,math.pi/2,0),40)

# Reference-shaped glazing as sloped panels, not black blocks.
def quad(name,pts,ma,solid=.015):return mesh_obj(name,pts,[(0,1,2,3)],ma,0,solid)
quad('Windshield',[(-.88,-1.53,1.56),(.88,-1.53,1.56),(.79,-.95,2.07),(-.79,-.95,2.07)],GLASS,.018)
quad('RearGlass',[(-.75,1.10,2.05),(.75,1.10,2.05),(.82,1.70,1.55),(-.82,1.70,1.55)],GLASS,.018)
for sx in (-1,1):
 x=sx*1.205
 # side glass follows front and rear roof slopes
 quad('FrontSideGlass'+str(sx),[(x,-1.42,1.49),(x,-.94,2.04),(x,-.08,2.11),(x,-.14,1.47)],GLASS,.012)
 quad('RearSideGlass'+str(sx),[(x,-.10,1.47),(x,-.04,2.11),(x,.90,2.02),(x,1.46,1.49)],GLASS,.012)
 box('Bpillar'+str(sx),(x,-.09,1.80),(.022,.045,.34),CARBON,.008)
 box('Mirror'+str(sx),(sx*1.46,-1.12,1.47),(.12,.16,.075),CARBON,.035)

# Integrated white roof and scoop, kept thin and conformal.
box('RoofPanel',(0,.02,2.225),(.78,.90,.018),WHITE,.11)
box('RoofScoop',(0,-.52,2.285),(.15,.23,.045),WHITE,.04)

# Strong C3 WRC face: double chevron, separated upper DRLs and lower lamps, deep corner intakes.
box('FrontSplitter',(0,-3.10,.25),(1.30,.13,.035),CARBON,.025)
box('FrontMouth',(0,-3.06,.52),(.63,.035,.18),DARK,.035)
box('UpperGrille',(0,-3.055,.76),(.52,.028,.075),DARK,.025)
# chevrons built as thin slanted bars
for z in (.90,.99):
 box('ChevronL',( -.16,-3.075,z),(.28,.018,.022),ALLOY,.012,(0,0,math.radians(12)))
 box('ChevronR',( .16,-3.075,z),(.28,.018,.022),ALLOY,.012,(0,0,math.radians(-12)))
for sx in (-1,1):
 box('UpperDRL'+str(sx),(sx*.79,-3.065,1.02),(.25,.027,.035),LAMP,.025,(0,0,math.radians(-6*sx)))
 box('MainLamp'+str(sx),(sx*.92,-3.055,.80),(.20,.030,.115),LAMP,.055)
 box('CornerIntake'+str(sx),(sx*1.17,-3.00,.54),(.13,.035,.18),DARK,.025)
 box('FrontCanard'+str(sx),(sx*1.30,-2.86,.43),(.13,.12,.025),CARBON,.012,(0,0,math.radians(12*sx)))

# Rear hatch treatment + rally diffuser and taillights.
box('RearDiffuser',(0,3.08,.29),(.94,.15,.075),CARBON,.025)
box('RearLowerBlack',(0,3.045,.55),(.67,.030,.11),DARK,.025)
for sx in (-1,1):
 box('TailLamp'+str(sx),(sx*.88,3.02,1.09),(.19,.030,.16),TAIL,.06)
 box('RearVent'+str(sx),(sx*1.16,3.00,.53),(.12,.035,.15),DARK,.025)
# Multi-element WRC rear wing with curved-ish end plates.
box('RearWingMain',(0,2.55,2.00),(1.08,.20,.035),CARBON,.035,(math.radians(-5),0,0))
box('RearWingUpper',(0,2.47,2.08),(.98,.12,.018),CARBON,.025,(math.radians(-9),0,0))
for sx in (-1,1):
 box('WingMount'+str(sx),(sx*.70,2.30,1.80),(.035,.07,.20),CARBON,.012)
 box('WingEndplate'+str(sx),(sx*1.10,2.52,1.99),(.025,.22,.15),CARBON,.018)
# side skirts / livery accents
for sx in (-1,1):
 box('SideSkirt'+str(sx),(sx*1.43,.02,.31),(.035,1.75,.055),CARBON,.018)
 box('YellowSill'+str(sx),(sx*1.465,.02,.34),(.010,1.62,.018),YELLOW,.004)

# hood and door cut-line cues add visual scale without texture dependency.
for sx in (-1,1):
 box('HoodEdge'+str(sx),(sx*.72,-2.20,1.12),(.008,.54,.010),CARBON,.003,(0,0,math.radians(-3*sx)))
 box('DoorLine'+str(sx),(sx*1.405,-.06,1.00),(.010,.025,.56),CARBON,.003)

# undertray hidden below shell
box('Undertray',(0,.02,.19),(.98,2.02,.025),CARBON,.012)

# Apply remaining modifiers deterministically.
for o in list(C.objects):
 if o.type!='MESH':continue
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 for md in list(o.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=md.name)
  except:pass
 o.select_set(False)

# Export GLB first.
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)

# CI visual QA renders. Same model, real Blender lighting, five orthographic-ish views.
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT' if hasattr(bpy.types,'EEVEE_NEXT') else 'BLENDER_EEVEE'
scene.render.resolution_x=900;scene.render.resolution_y=650;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.color=(.018,.022,.028)
# ground
bpy.ops.mesh.primitive_plane_add(size=20,location=(0,0,.0));g=bpy.context.object;g.data.materials.append(mat('Ground',(.025,.028,.032),0,.52,.1))
# area/key + fill + rim
for name,loc,energy,size in [('Key',(4,-4,6),1300,5),('Fill',(-4,-1,3),700,4),('Rim',(0,5,5),1000,4)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=name;l.data.energy=energy;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(math.radians(25),0,math.radians(35 if loc[0]>0 else -35))
# camera helper
def render(name,loc,target=(0,0,1.05),lens=58):
 bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;scene.camera=cam;cam.data.lens=lens
 d=Vector(target)-cam.location;cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler();scene.render.filepath=os.path.join(PRE,name+'.png');bpy.ops.render.render(write_still=True);bpy.data.objects.remove(cam,do_unlink=True)
render('front',(0,-8.8,2.0));render('three',(6.2,-6.4,3.2));render('side',(8.8,0,2.0));render('rear',(0,8.8,2.0));render('top',(0,-.2,11.0),(0,0,.7),52)
print('MJX7303 V32 BLENDER MASTER',OUT,os.path.getsize(OUT),'previews',PRE)
