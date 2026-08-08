#!/usr/bin/env python3
# JARVIS XR V31 — reference-driven MJX 7303 / licensed C3 WRC body
# Scale: 1 unit = 100 mm. Anchors: 6320 x 2900 x 2370 model-space mm/10,
# 375 mm wheelbase, ~265 mm track, 103 mm tire diameter.
import bpy, math, os
OUT=os.environ.get('MJX_V31_OUT','assets/mjx7303/mjx7303-v31.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
C=bpy.data.collections.new('MJX7303_V31_REFERENCE_BODY');bpy.context.scene.collection.children.link(C)
def own(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 C.objects.link(o);return o
def mat(n,c,m=0,r=.3):
 x=bpy.data.materials.new(n);x.diffuse_color=(*c,1);x.use_nodes=True;b=x.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=m;b.inputs['Roughness'].default_value=r
 if 'Coat Weight' in b.inputs:b.inputs['Coat Weight'].default_value=.7
 return x
RED=mat('C3_Rally_Red',(.56,.008,.012),.08,.18);BLACK=mat('Carbon',(.004,.006,.009),.25,.24);GLASS=mat('Automotive_Glass',(.008,.018,.028),.12,.08);WHITE=mat('Roof_White',(.86,.90,.94),.05,.18);RUB=mat('Tire',(.004,.004,.005),0,.72);AL=mat('Wheel',(.54,.59,.65),.82,.16);LAMP=mat('Lamp',(.88,.94,1),.08,.08);TAIL=mat('Tail',(.68,.005,.008),.05,.10);YEL=mat('SillAccent',(.92,.52,.01),0,.24)
# Reference anchors from the actual 7303: length 632 mm, width 290 mm, height 237 mm.
L=6.32;WB=3.75;FY=-WB/2;RY=WB/2;TRACK=2.65;TX=TRACK/2;WR=.515
# Dense longitudinal stations. Each tuple: y, halfwidth, sillZ, shoulderZ, glassHalfWidth, roofZ.
# Ends and wheel zones are explicitly narrowed to create real fender volumes rather than torus 'arches'.
S=[(-3.16,.73,.25,.66,.34,.78),(-3.02,1.02,.25,.76,.48,.88),(-2.82,1.25,.24,.91,.62,1.02),(-2.58,1.40,.24,1.06,.78,1.17),(-2.30,1.45,.24,1.20,.91,1.34),(FY,1.45,.24,1.32,1.02,1.49),(-1.62,1.44,.24,1.40,1.09,1.65),(-1.35,1.40,.24,1.48,1.13,1.82),(-1.05,1.37,.24,1.55,1.15,1.99),(-.70,1.34,.24,1.60,1.16,2.12),(-.30,1.32,.24,1.62,1.16,2.18),(.10,1.32,.24,1.62,1.16,2.19),(.50,1.33,.24,1.61,1.15,2.15),(.88,1.35,.24,1.57,1.13,2.06),(1.18,1.38,.24,1.50,1.09,1.92),(1.48,1.42,.24,1.42,1.02,1.74),(RY,1.45,.24,1.32,.93,1.54),(2.12,1.44,.24,1.20,.82,1.38),(2.40,1.39,.24,1.07,.69,1.24),(2.67,1.30,.24,.94,.57,1.12),(2.91,1.12,.25,.82,.45,1.02),(3.08,.90,.26,.72,.36,.94),(3.16,.72,.28,.66,.30,.90)]
# 24-point section around exterior: underbody -> side -> shoulder -> glass -> roof -> mirrored.
def ring(y,w,sill,shoulder,gw,roof):
 hood=min(shoulder+.12,1.35) if y<-1.35 else shoulder
 return [(-w*.72,y,.22),(-w,y,.28),(-w,y,.50),(-w*.99,y,.76),(-w*.96,y,1.02),(-w*.90,y,shoulder),(-w*.80,y,shoulder+.09),(-gw*1.08,y,min(roof-.25,shoulder+.22)),(-gw,y,roof-.12),(-gw*.72,y,roof-.02),(-gw*.36,y,roof+.015),(0,y,roof+.025),(gw*.36,y,roof+.015),(gw*.72,y,roof-.02),(gw,y,roof-.12),(gw*1.08,y,min(roof-.25,shoulder+.22)),(w*.80,y,shoulder+.09),(w*.90,y,shoulder),(w*.96,y,1.02),(w*.99,y,.76),(w,y,.50),(w,y,.28),(w*.72,y,.22),(0,y,.20)]
N=24;V=[]
for q in S:V+=ring(*q)
F=[]
for i in range(len(S)-1):
 for j in range(N):F.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
F.append(tuple(range(N-1,-1,-1)));q=(len(S)-1)*N;F.append(tuple(q+j for j in range(N)))
me=bpy.data.meshes.new('V31_reference_surface');me.from_pydata(V,[],F);me.update();body=bpy.data.objects.new('BODY_SHELL_REFERENCE_V31',me);C.objects.link(body);body.data.materials.append(RED)
for p in body.data.polygons:p.use_smooth=True
sub=body.modifiers.new('ReferenceSurface','SUBSURF');sub.levels=2;sub.render_levels=2
# Helpers for shaped secondary surfaces.
def box(n,loc,sc,ma,bev=.02,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=n;o.scale=sc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 if bev:d=o.modifiers.new('edge','BEVEL');d.width=bev;d.segments=3
 return o
def cyl(n,loc,r,d,ma,rot=(0,0,0),v=64):
 bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=d,location=loc,rotation=rot);o=own(bpy.context.object);o.name=n;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o
def tor(n,loc,major,minor,ma):
 bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=72,minor_segments=20,location=loc,rotation=(0,math.pi/2,0));o=own(bpy.context.object);o.name=n;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o
# Flush glass sized to the real greenhouse, with thin pillars.
box('Windshield',(0,-1.28,1.78),(.88,.018,.40),GLASS,.025,(math.radians(30),0,0));box('RearGlass',(0,1.58,1.70),(.76,.018,.32),GLASS,.025,(math.radians(-24),0,0))
for sx in (-1,1):
 x=sx*1.185;box('FrontSideGlass'+str(sx),(x,-.62,1.75),(.012,.49,.31),GLASS,.012);box('RearSideGlass'+str(sx),(x,.58,1.70),(.012,.48,.29),GLASS,.012);box('Bpillar'+str(sx),(x,-.03,1.73),(.022,.045,.34),BLACK,.006);box('Mirror'+str(sx),(sx*1.39,-1.03,1.48),(.12,.16,.07),BLACK,.025)
# Roof skin follows greenhouse instead of floating slab.
box('IntegratedWhiteRoof',(0,.08,2.19),(.83,.93,.025),WHITE,.07);box('RoofScoop',(0,-.48,2.26),(.17,.25,.045),WHITE,.035)
# Correct wheel/tire proportions: 103 mm OD => radius .515 model units.
for sx in (-1,1):
 for y in (FY,RY):
  tor('Tire',(sx*TX,y,.515),.405,.110,RUB);cyl('Rim',(sx*TX,y,.515),.295,.19,AL,(0,math.pi/2,0));cyl('Hub',(sx*(TX+.015),y,.515),.055,.205,BLACK,(0,math.pi/2,0),36)
# Aero, lamps and openings positioned from photo references.
box('FrontSplitter',(0,-3.05,.27),(1.30,.18,.035),BLACK,.018);box('FrontGrille',(0,-3.03,.68),(.67,.025,.18),BLACK,.025);box('LowerIntake',(0,-3.05,.43),(.55,.025,.09),BLACK,.018)
for sx in (-1,1):
 box('DRL'+str(sx),(sx*.74,-3.01,1.02),(.28,.025,.035),LAMP,.022,(0,0,math.radians(-7*sx)));box('MainLamp'+str(sx),(sx*.88,-3.00,.80),(.20,.025,.12),LAMP,.05);box('BumperVent'+str(sx),(sx*1.13,-2.94,.54),(.12,.025,.15),BLACK,.022);box('TailLamp'+str(sx),(sx*.86,2.94,1.10),(.19,.025,.16),TAIL,.055);box('SillAccent'+str(sx),(sx*1.40,.08,.31),(.018,1.65,.022),YEL,.004)
box('RearDiffuser',(0,3.02,.30),(.92,.16,.07),BLACK,.02);box('RearWing',(0,2.48,1.96),(1.02,.22,.035),BLACK,.025,(math.radians(-4),0,0))
for sx in (-1,1):box('WingMount'+str(sx),(sx*.72,2.30,1.78),(.03,.06,.18),BLACK,.01);box('WingPlate'+str(sx),(sx*1.05,2.48,1.96),(.025,.22,.13),BLACK,.01)
# Grounding undertray only, kept below body.
box('Undertray',(0,.02,.225),(.98,1.88,.028),BLACK,.012)
# Apply modifiers deterministically.
for o in list(C.objects):
 if o.type!='MESH':continue
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 for md in list(o.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=md.name)
  except:pass
 o.select_set(False)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)
print('MJX7303 V31 REFERENCE BODY',OUT,os.path.getsize(OUT))
