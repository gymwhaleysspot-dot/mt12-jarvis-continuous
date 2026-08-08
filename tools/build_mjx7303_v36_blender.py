#!/usr/bin/env python3
# JARVIS V36 — high-detail MJX 7303 / Citroen C3 WRC reference reconstruction
# X width, Y length (front negative), Z up. 1 Blender unit = 100 mm.
import bpy, math, os
from mathutils import Vector
OUT=os.environ.get('MJX_V36_OUT','assets/mjx7303/mjx7303-v36.glb')
PRE=os.environ.get('MJX_V36_PREVIEW_DIR','assets/mjx7303/v36-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
S=bpy.context.scene;S.render.engine='BLENDER_EEVEE';S.render.resolution_x=1100;S.render.resolution_y=825;S.render.resolution_percentage=100
S.render.image_settings.file_format='PNG';S.world.color=(.025,.028,.032)
C=bpy.data.collections.new('MJX7303_V36_REFERENCE_MASTER');S.collection.children.link(C)
def own(o):
  for c in list(o.users_collection): c.objects.unlink(o)
  C.objects.link(o);return o
def mat(n,c,metal=0,rough=.3,coat=.6,alpha=1,emit=None):
  m=bpy.data.materials.new(n);m.use_nodes=True;m.diffuse_color=(*c,alpha);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1)
  if 'Metallic' in p.inputs:p.inputs['Metallic'].default_value=metal
  if 'Roughness' in p.inputs:p.inputs['Roughness'].default_value=rough
  if 'Coat Weight' in p.inputs:p.inputs['Coat Weight'].default_value=coat
  elif 'Clearcoat' in p.inputs:p.inputs['Clearcoat'].default_value=coat
  if alpha<1:
    if 'Alpha' in p.inputs:p.inputs['Alpha'].default_value=alpha
    m.blend_method='BLEND';m.use_screen_refraction=True;m.show_transparent_back=True
  if emit:
    if 'Emission Color' in p.inputs:p.inputs['Emission Color'].default_value=(*emit,1);p.inputs['Emission Strength'].default_value=4
  return m
RED=mat('V36_Clearcoat_Rally_Red',(.50,.006,.010),.12,.13,.98);REDHI=mat('V36_Red_Highlight',(.72,.014,.018),.08,.14,.95)
WHITE=mat('V36_Livery_White',(.93,.95,.97),.03,.16,.92);BLACK=mat('V36_Carbon_Black',(.006,.008,.010),.20,.24,.45);VENT=mat('V36_Deep_Vent',(.001,.0015,.002),0,.48,.05)
GLASS=mat('V36_Glass',(.012,.026,.042),.02,.055,.92,.50);RUB=mat('V36_Rubber',(.004,.004,.005),0,.68,.03);AL=mat('V36_Aluminum',(.62,.67,.72),.88,.15,.42)
BRAKE=mat('V36_Brake',(.22,.24,.25),.82,.26,.25);CAL=mat('V36_Caliper',(.85,.025,.01),.48,.20,.4);YEL=mat('V36_Sill_Yellow',(.96,.56,.015),.05,.19,.5)
LAMP=mat('V36_Headlamp_Lens',(.84,.92,1),.04,.045,.92,.82,emit=(.65,.80,1));TAIL=mat('V36_Tail_Lens',(.78,.003,.006),.03,.06,.9,.86,emit=(1,.008,.004));INT=mat('V36_Interior',(.008,.009,.011),.02,.52,.08)
def box(n,loc,sc,ma,bev=.025,rot=(0,0,0)):
  bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=n;o.scale=sc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
  if bev: md=o.modifiers.new('Bevel','BEVEL');md.width=bev;md.segments=5
  return o
def cyl(n,loc,r,d,ma,rot=(0,0,0),v=96):
  bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=d,location=loc,rotation=rot);o=own(bpy.context.object);o.name=n;o.data.materials.append(ma)
  for p in o.data.polygons:p.use_smooth=True
  return o
def tor(n,loc,maj,minr,ma,rot=(0,math.pi/2,0)):
  bpy.ops.mesh.primitive_torus_add(major_radius=maj,minor_radius=minr,major_segments=144,minor_segments=36,location=loc,rotation=rot);o=own(bpy.context.object);o.name=n;o.data.materials.append(ma)
  for p in o.data.polygons:p.use_smooth=True
  return o
def mesh(n,V,F,ma,sub=0,solid=0):
  me=bpy.data.meshes.new(n+'Mesh');me.from_pydata(V,[],F);me.update();o=bpy.data.objects.new(n,me);C.objects.link(o);o.data.materials.append(ma)
  for p in me.polygons:p.use_smooth=True
  if solid: md=o.modifiers.new('Solidify','SOLIDIFY');md.thickness=solid;md.offset=-.5
  if sub: md=o.modifiers.new('Subdivision','SUBSURF');md.levels=sub;md.render_levels=sub
  return o
def quad(n,p,ma,solid=.012):return mesh(n,p,[(0,1,2,3)],ma,0,solid)
# Physical anchors: body 6.32 x 2.90 x 2.37; wheelbase 3.75; track 2.65; tire OD 1.03.
WB=3.75;FY=-1.875;RY=1.875;TX=1.325
# Lower shell loft. Section values: y, half-width, sill-z, shoulder-z, deck-z.
SEC=[(-3.16,.64,.22,.70,.73),(-3.08,.96,.23,.80,.78),(-2.92,1.28,.24,.92,.88),(-2.72,1.43,.24,1.03,1.00),(-2.46,1.47,.24,1.15,1.11),(-2.18,1.48,.24,1.27,1.22),(FY,1.48,.24,1.35,1.30),(-1.60,1.46,.24,1.40,1.34),(-1.25,1.42,.24,1.44,1.39),(-.80,1.38,.24,1.48,1.43),(-.30,1.36,.24,1.50,1.46),(.30,1.36,.24,1.50,1.46),(.80,1.38,.24,1.48,1.44),(1.25,1.42,.24,1.43,1.39),(1.58,1.46,.24,1.38,1.34),(RY,1.48,.24,1.32,1.30),(2.18,1.47,.24,1.22,1.20),(2.48,1.44,.24,1.12,1.10),(2.75,1.36,.24,1.00,.98),(2.98,1.16,.23,.87,.86),(3.16,.74,.22,.75,.75)]
def lowring(y,w,sill,sh,deck):
  left=[(-w*.72,y,sill),(-w*.92,y,sill+.02),(-w,y,sill+.12),(-w*1.015,y,.43),(-w*1.01,y,.64),(-w*.995,y,.84),(-w*.97,y,1.03),(-w*.92,y,1.18),(-w*.86,y,sh),(-w*.72,y,deck+.05),(-w*.48,y,deck+.10),(0,y,deck+.12)]
  return left+[(-x,y,z) for x,y,z in reversed(left[:-1])]
N=23;V=[];F=[]
for q in SEC:V+=lowring(*q)
for i in range(len(SEC)-1):
  for j in range(N):F.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
F+=[tuple(range(N-1,-1,-1)),tuple((len(SEC)-1)*N+j for j in range(N))]
body=mesh('BODY_SHELL_V36_REFERENCE',V,F,RED,2,.055)
# Wheel openings
cuts=[]
for y in (FY,RY):
  bpy.ops.mesh.primitive_cylinder_add(vertices=144,radius=.59,depth=3.5,location=(0,y,.515),rotation=(0,math.pi/2,0));c=bpy.context.object;cuts.append(c);md=body.modifiers.new('TrueWheelArch','BOOLEAN');md.operation='DIFFERENCE';md.object=c
bpy.context.view_layer.objects.active=body;body.select_set(True)
for md in list(body.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=md.name)
  except:pass
body.select_set(False)
for c in cuts:bpy.data.objects.remove(c,do_unlink=True)
# Greenhouse: tall, compact C3 hatch profile. Separate shell prevents coupe-like body blob.
G=[(-1.52,.99,1.42,1.54),(-1.34,1.04,1.50,1.78),(-1.10,1.08,1.57,2.03),(-.78,1.10,1.62,2.20),(-.35,1.11,1.64,2.28),(.15,1.11,1.64,2.29),(.62,1.10,1.62,2.27),(1.02,1.07,1.58,2.18),(1.34,1.02,1.51,2.03),(1.58,.95,1.43,1.78),(1.78,.88,1.37,1.55)]
def gring(y,w,b,z):
  return [(-w,y,b),(-w*.98,y,b+.28),(-w*.90,y,b+.52),(-w*.74,y,z-.09),(-w*.45,y,z-.025),(0,y,z), (w*.45,y,z-.025),(w*.74,y,z-.09),(w*.90,y,b+.52),(w*.98,y,b+.28),(w,y,b)]
GN=11;GV=[];GF=[]
for q in G:GV+=gring(*q)
for i in range(len(G)-1):
  for j in range(GN-1):GF.append((i*GN+j,i*GN+j+1,(i+1)*GN+j+1,(i+1)*GN+j))
green=mesh('GreenhouseShell_V36',GV,GF,RED,2,.035)
# Glass surfaces following C3 proportions
quad('Windshield_V36',[(-1.00,-1.47,1.48),(1.00,-1.47,1.48),(.86,-.84,2.18),(-.86,-.84,2.18)],GLASS,.020)
quad('RearGlass_V36',[(-.82,1.04,2.19),(.82,1.04,2.19),(.92,1.66,1.54),(-.92,1.66,1.54)],GLASS,.018)
for s in (-1,1):
 x=s*1.115
 quad('FrontSideGlass_V36'+str(s),[(x,-1.34,1.51),(x,-.78,2.14),(x,-.10,2.22),(x,-.10,1.51)],GLASS,.015)
 quad('RearSideGlass_V36'+str(s),[(x,-.07,1.51),(x,-.03,2.22),(x,.88,2.17),(x,1.48,1.50)],GLASS,.015)
 box('B_Pillar_V36'+str(s),(x,-.085,1.84),(.026,.038,.35),BLACK,.006)
 box('Mirror_V36'+str(s),(s*1.43,-1.12,1.55),(.13,.18,.075),BLACK,.045)
# Proper roof: red perimeter, white centered livery panel, small scoop.
box('RoofSkin_V36',(0,.20,2.285),(.96,1.02,.020),RED,.10)
box('RoofLiveryWhite_V36',(0,.05,2.315),(.74,.72,.010),WHITE,.065)
box('RoofScoop_V36',(0,-.40,2.365),(.15,.24,.045),WHITE,.045)
# Hood white graphic as surface patch, not giant roof slab
quad('HoodLiveryWhite_V36',[(-.72,-2.83,1.03),(.72,-2.83,1.03),(.62,-1.72,1.38),(-.62,-1.72,1.38)],WHITE,.010)
# Fender flare lips, skirts and rally aero
for s in (-1,1):
 for y in (FY,RY):tor('FenderLip_V36',(s*1.43,y,.515),.515,.030,BLACK)
 box('SideSkirt_V36',(s*1.455,0,.30),(.045,1.78,.055),BLACK,.018)
 box('YellowSillLine_V36',(s*1.485,0,.35),(.010,1.62,.018),YEL,.004)
# Wheels: round tire volume, deep rims, spokes, brakes
for s in (-1,1):
 for y in (FY,RY):
  tor('Tire_V36',(s*TX,y,.515),.405,.110,RUB)
  cyl('RimOuter_V36',(s*TX,y,.515),.310,.205,AL,(0,math.pi/2,0),128)
  cyl('RimInnerDark_V36',(s*(TX+.105),y,.515),.250,.012,VENT,(0,math.pi/2,0),96)
  cyl('BrakeDisc_V36',(s*(TX-.030),y,.515),.210,.025,BRAKE,(0,math.pi/2,0),96)
  cyl('Hub_V36',(s*(TX+.120),y,.515),.048,.030,REDHI,(0,math.pi/2,0),64)
  for a in range(10):
   an=math.radians(a*36);yy=y+math.sin(an)*.155;zz=.515+math.cos(an)*.155
   box('WheelSpoke_V36',(s*(TX+.120),yy,zz),(.010,.025,.145),AL,.008,(an,0,0))
  box('Caliper_V36',(s*(TX-.06),y-.19,.55),(.027,.045,.12),CAL,.012)
# Front: split WRC light signature, grille, intake, splitter, canards
box('FrontSplitter_V36',(0,-3.09,.22),(1.36,.14,.035),BLACK,.025)
box('FrontMainGrille_V36',(0,-3.055,.58),(.72,.055,.24),VENT,.03)
box('FrontLowerMouth_V36',(0,-3.095,.34),(.93,.050,.10),VENT,.025)
for s in (-1,1):
 box('FrontCornerIntake_V36',(s*1.08,-2.985,.55),(.19,.055,.25),VENT,.035)
 box('UpperLamp_V36',(s*.92,-2.89,1.00),(.31,.045,.065),LAMP,.055,rot=(math.radians(-5),0,math.radians(-7*s)))
 box('LowerLamp_V36',(s*1.02,-3.00,.73),(.16,.045,.16),LAMP,.065)
 box('FrontCanard_V36',(s*1.28,-2.90,.43),(.18,.16,.018),BLACK,.012,rot=(0,0,math.radians(-8*s)))
# Citroen chevrons
for z,w in ((.86,.36),(.80,.28)):
 for s in (-1,1):box('Chevron_V36',(s*.22,-3.12,z),(.23,.025,.020),AL,.008,rot=(0,math.radians(16*s),math.radians(-8*s)))
# Rear hatch details and wing
box('RearDiffuser_V36',(0,3.08,.24),(1.28,.15,.045),BLACK,.025)
box('RearHatchGlassBand_V36',(0,1.71,1.53),(.82,.025,.10),GLASS,.025)
for s in (-1,1):
 box('TailLampUpper_V36',(s*.95,2.93,1.03),(.25,.055,.10),TAIL,.065)
 box('TailLampOuter_V36',(s*1.18,2.88,.89),(.10,.055,.18),TAIL,.055)
 box('RearVent_V36',(s*1.18,3.02,.48),(.15,.05,.20),VENT,.025)
 box('WingMount_V36',(s*.78,2.14,1.78),(.045,.16,.38),BLACK,.018,rot=(math.radians(-8),0,0))
box('RearWingMain_V36',(0,2.38,2.08),(1.25,.28,.045),BLACK,.035,rot=(math.radians(-6),0,0))
box('RearWingFlap_V36',(0,2.55,2.16),(1.20,.12,.028),BLACK,.025,rot=(math.radians(-12),0,0))
for s in (-1,1):box('WingEndplate_V36',(s*1.25,2.40,2.03),(.045,.30,.20),BLACK,.025)
# Interior depth
box('Dashboard_V36',(0,-.92,1.30),(.86,.24,.11),INT,.055)
for s in (-1,1):
 box('Seat_V36'+str(s),(s*.46,.18,1.03),(.22,.31,.36),INT,.075)
 box('RollCageA_V36'+str(s),(s*.83,-.55,1.74),(.025,.025,.46),AL,.008,rot=(0,math.radians(-16*s),0))
 box('RollCageB_V36'+str(s),(s*.85,.72,1.72),(.025,.025,.46),AL,.008,rot=(0,math.radians(13*s),0))
cyl('SteeringWheel_V36',(-.46,-.72,1.48),.16,.035,INT,(math.pi/2,0,0),64)
# Panel gaps / door handles kept thin
for s in (-1,1):
 box('DoorGapFront_V36',(s*1.435,-.52,1.02),(.009,.012,.55),BLACK,.002)
 box('DoorGapRear_V36',(s*1.435,.88,1.00),(.009,.012,.52),BLACK,.002)
 box('DoorHandle_V36',(s*1.455,-.15,1.35),(.018,.13,.025),AL,.008)
# Studio preview floor
FLOOR=mat('V36_StudioFloor',(.10,.11,.12),.18,.24,.35)
box('StudioFloor_V36',(0,0,.02),(5.2,5.2,.025),FLOOR,.01)
# Lighting for QA renders
for name,loc,energy,size,col in [('Key',(4,-4,6),1500,5.0,(1.0,.91,.82)),('Fill',(-4,-1,4),950,4.0,(.72,.84,1.0)),('Rim',(1,5,5),1200,3.0,(1.0,.72,.58))]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=name;l.data.energy=energy;l.data.shape='DISK';l.data.size=size;l.data.color=col
# Camera and previews
bpy.ops.object.camera_add();cam=bpy.context.object;S.camera=cam;cam.data.lens=58
def look(pos,target=(0,0,1.05)):
 cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
views={'front':((0,-9.2,1.55),(0,-.15,1.05)),'three':((6.2,-7.2,3.4),(0,0,1.05)),'side':((8.7,0,1.55),(0,0,1.05)),'rear':((0,9.2,1.60),(0,.1,1.05)),'top':((0,-.2,10.5),(0,0,.7))}
for n,(p,t) in views.items():
 look(p,t);S.render.filepath=os.path.join(PRE,n+'.png');bpy.ops.render.render(write_still=True)
# Remove studio-only floor/lights/camera from GLB; runtime supplies its own ground/lighting.
for o in list(bpy.data.objects):
 if o.name.startswith(('StudioFloor','Key','Fill','Rim','Camera')): bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=False,export_apply=True,export_yup=True,export_materials='EXPORT',export_normals=True)
print({'asset':'MJX7303_V36_REFERENCE_MASTER','out':OUT,'previews':PRE})
