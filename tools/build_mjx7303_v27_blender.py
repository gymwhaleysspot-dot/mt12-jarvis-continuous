#!/usr/bin/env python3
# JARVIS V27 — reference-geometry MJX 7303 / C3 WRC asset
# Hard dimensional anchor: 375 mm wheelbase => 3.75 Blender units.
import bpy, math, os
OUT=os.environ.get('MJX_V27_OUT','assets/mjx7303/mjx7303-v27.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
COL=bpy.data.collections.new('MJX7303_V27_REFERENCE_CAD');bpy.context.scene.collection.children.link(COL)

def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    COL.objects.link(o); return o

def pin(b,names,val):
    for n in names:
        if n in b.inputs:b.inputs[n].default_value=val;return

def mat(name,c,metal=0,rough=.3,coat=.5,alpha=1,emit=None):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    pin(b,['Base Color'],(*c,alpha));pin(b,['Metallic'],metal);pin(b,['Roughness'],rough);pin(b,['Coat Weight','Clearcoat'],coat);pin(b,['Coat Roughness','Clearcoat Roughness'],.045);pin(b,['Alpha'],alpha)
    if emit:pin(b,['Emission Color','Emission'],(*emit,1));pin(b,['Emission Strength'],3)
    if alpha<1:
        try:m.surface_render_method='DITHERED'
        except:pass
        try:m.blend_method='BLEND'
        except:pass
    return m
RED=mat('Citroen_Rally_Red',(.72,.008,.012),.10,.16,1);WHITE=mat('Roof_White',(.94,.95,.98),.03,.18,.9);BLACK=mat('Carbon_Cladding',(.005,.007,.011),.28,.25,.4);GLASS=mat('Automotive_Glass',(.008,.025,.055),0,.06,.18,.22);RUBBER=mat('Rally_Rubber',(.003,.003,.004),0,.78,0);METAL=mat('Wheel_Metal',(.58,.61,.66),.86,.16,.25);YELLOW=mat('Accent_Yellow',(.98,.64,.01),0,.28,.3);LAMP=mat('Lamp',(.78,.90,1),.02,.06,.8,1,(.75,.88,1));TAIL=mat('Tail',(.75,.002,.004),.02,.08,.7,1,(1,.01,.01));DARK=mat('Interior',(.008,.010,.014),.02,.55,.05)
WB=3.75;AX_F=-WB/2;AX_R=WB/2;TRACK=2.56;HX=TRACK/2

def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def box(name,loc,scale,ma,bev=.02,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bev:
        md=o.modifiers.new('bevel','BEVEL');md.width=bev;md.segments=3
    o.data.materials.append(ma);return o

def cyl(name,loc,r,depth,ma,rot=(0,0,0),verts=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(ma);return o

def torus(name,loc,major,minor,ma,rot=(0,0,0),maj=72,minseg=20):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=maj,minor_segments=minseg,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(ma);return o

def panel(name,pts,ma):
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update();o=bpy.data.objects.new(name,me);COL.objects.link(o);o.data.materials.append(ma);return o

def loft(name,stations,ma,sub=2):
    # station y, halfwidth, sill, belt, deck. Ring deliberately stops at deck: greenhouse is separate.
    V=[];F=[];N=10
    for y,w,s,b,d in stations:
        V += [(-w*.88,y,s),(-w,y,s+.20),(-w,y,b*.78),(-w*.96,y,b),(-w*.72,y,d),(w*.72,y,d),(w*.96,y,b),(w,y,b*.78),(w,y,s+.20),(w*.88,y,s)]
    for i in range(len(stations)-1):
        for j in range(N):
            a=i*N+j;b=i*N+(j+1)%N;c=(i+1)*N+j;d=(i+1)*N+(j+1)%N;F.append((a,c,d,b))
    F.append(tuple(range(N-1,-1,-1)));q=(len(stations)-1)*N;F.append(tuple(q+j for j in range(N)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(V,[],F);me.update();o=bpy.data.objects.new(name,me);COL.objects.link(o);o.data.materials.append(ma);smooth(o)
    md=o.modifiers.new('Automotive subdivision','SUBSURF');md.levels=sub;md.render_levels=sub
    return o

def greenhouse(name,st,ma):
    # y, half width, bottom z, roof z
    V=[];F=[];N=8
    for y,w,b,r in st:
        V += [(-w,y,b),(-w*.95,y,b+.28),(-w*.80,y,r-.12),(-w*.52,y,r),(w*.52,y,r),(w*.80,y,r-.12),(w*.95,y,b+.28),(w,y,b)]
    for i in range(len(st)-1):
        for j in range(N):
            a=i*N+j;b=i*N+(j+1)%N;c=(i+1)*N+j;d=(i+1)*N+(j+1)%N;F.append((a,c,d,b))
    F.append(tuple(range(N-1,-1,-1)));q=(len(st)-1)*N;F.append(tuple(q+j for j in range(N)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(V,[],F);me.update();o=bpy.data.objects.new(name,me);COL.objects.link(o);o.data.materials.append(ma);smooth(o);md=o.modifiers.new('Roof subdivision','SUBSURF');md.levels=2;md.render_levels=2;return o

# Lower shell follows reference side profile: low nose, horizontal belt, short rear overhang.
body=loft('BODY_REFERENCE_V27',[
(-2.55,.78,.26,.67,.76),(-2.38,1.02,.25,.78,.88),(-2.18,1.17,.24,.92,1.02),(AX_F,1.25,.24,1.05,1.15),(-1.54,1.29,.24,1.13,1.24),(-1.18,1.25,.25,1.17,1.28),(-.72,1.22,.25,1.19,1.30),(-.20,1.21,.25,1.20,1.31),(.34,1.21,.25,1.20,1.31),(.86,1.22,.25,1.18,1.29),(1.30,1.25,.25,1.15,1.25),(AX_R,1.27,.24,1.10,1.20),(2.10,1.18,.24,1.00,1.10),(2.34,1.02,.25,.88,.98),(2.49,.84,.27,.76,.86)],RED,2)
# Real wheel openings: subtract transverse cylinders from the continuous shell.
cutters=[]
for ay in (AX_F,AX_R):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.59,depth=3.4,location=(0,ay,.54),rotation=(0,math.pi/2,0));c=bpy.context.object;c.name='WheelArchCutter';cutters.append(c)
for c in cutters:
    md=body.modifiers.new('True wheel opening','BOOLEAN');md.operation='DIFFERENCE';md.solver='EXACT';md.object=c
    bpy.context.view_layer.objects.active=body
    try:bpy.ops.object.modifier_apply(modifier=md.name)
    except:pass
for c in cutters:bpy.data.objects.remove(c,do_unlink=True)
# Greenhouse separately follows the C3 roof/window silhouette rather than a dome.
green=greenhouse('GREENHOUSE_REFERENCE_V27',[(-1.28,.84,1.23,1.48),(-1.03,.91,1.24,1.70),(-.66,.94,1.25,1.91),(-.20,.95,1.26,2.02),(.32,.94,1.26,2.02),(.76,.91,1.25,1.94),(1.12,.86,1.24,1.78),(1.42,.76,1.22,1.57)],GLASS)
# White roof skin floating just above glass, matching reference white roof panel.
roof=greenhouse('ROOF_SKIN_V27',[(-1.18,.82,1.45,1.54),(-.91,.88,1.65,1.76),(-.56,.90,1.84,1.96),(-.14,.91,1.94,2.07),(.32,.90,1.94,2.07),(.72,.87,1.85,1.98),(1.08,.81,1.68,1.81),(1.34,.72,1.50,1.62)],WHITE)
# Pillars / belt trim / side details
for sx in(-1,1):
    x=sx*1.205
    box('A_Pillar'+str(sx),(x,-1.06,1.50),(.035,.08,.32),BLACK,.01,rot=(math.radians(22),0,0));box('B_Pillar'+str(sx),(x,-.14,1.55),(.040,.055,.34),BLACK,.01);box('C_Pillar'+str(sx),(x,1.13,1.48),(.045,.11,.29),BLACK,.01,rot=(math.radians(-12),0,0));box('BeltTrim'+str(sx),(x,.10,1.24),(.025,1.23,.035),BLACK,.008);box('Rocker'+str(sx),(sx*1.255,.03,.36),(.05,1.62,.11),BLACK,.018);box('SillAccent'+str(sx),(sx*1.31,.03,.29),(.015,1.60,.022),YELLOW,.004)
    box('Mirror'+str(sx),(sx*1.32,-.86,1.36),(.15,.17,.075),BLACK,.025);box('DoorCard'+str(sx),(sx*1.285,-.05,.80),(.009,.70,.19),BLACK,.002);box('NumberPanel'+str(sx),(sx*1.296,-.43,.91),(.005,.19,.09),WHITE,.002)
    # arch lips follow real cut edges
    for ay in(AX_F,AX_R):torus('ArchLip',(sx*1.265,ay,.55),.49,.05,BLACK,(0,math.pi/2,0),64,14)
# Wheel assemblies aligned to exact axles
for sx in(-1,1):
  for ay in(AX_F,AX_R):
    torus('Tire',(sx*HX,ay,.53),.405,.145,RUBBER,(0,math.pi/2,0));cyl('Rim',(sx*HX,ay,.53),.292,.18,WHITE,(0,math.pi/2,0),64);cyl('Disc',(sx*(HX+.01),ay,.53),.205,.025,METAL,(0,math.pi/2,0),48);cyl('Hub',(sx*(HX+.025),ay,.53),.065,.20,METAL,(0,math.pi/2,0),36)
    for k in range(14):
        a=2*math.pi*k/14;o=box('Spoke',(sx*(HX+.11),ay+math.cos(a)*.145,.53+math.sin(a)*.145),(.011,.13,.016),WHITE,.004);o.rotation_euler[0]=a
    box('Caliper',(sx*(HX+.12),ay-.16,.54),(.028,.045,.10),RED,.012)
# C3 WRC nose, lamps, vents, grille and splitter
box('FrontSplitter',(0,-2.55,.275),(1.20,.18,.042),BLACK,.018);box('CentralGrille',(0,-2.49,.60),(.61,.035,.18),BLACK,.018);box('LowerMouth',(0,-2.50,.40),(.48,.035,.085),DARK,.016)
for sx in(-1,1):
    box('UpperDRL'+str(sx),(sx*.70,-2.48,.95),(.31,.025,.038),LAMP,.02,rot=(0,0,math.radians(-5*sx)));box('MainLamp'+str(sx),(sx*.80,-2.49,.72),(.22,.035,.12),LAMP,.045);box('CornerVent'+str(sx),(sx*1.02,-2.44,.48),(.14,.04,.15),BLACK,.02);box('HoodVent'+str(sx),(sx*.62,-1.47,1.18),(.20,.25,.018),BLACK,.01,rot=(0,0,math.radians(7*sx)))
for z in(.82,.74):
  for sx,ang in((-1,-27),(1,27)):
    o=box('Chevron',(sx*.115,-2.515,z),(.025,.11,.016),WHITE,.004);o.rotation_euler[1]=math.radians(ang)
box('RoofScoop',(0,-.30,2.11),(.18,.27,.065),WHITE,.032)
# Rear hatch, lamps, diffuser and correctly lower/smaller WRC wing.
for sx in(-1,1):box('TailLamp'+str(sx),(sx*.82,2.43,1.02),(.18,.03,.20),TAIL,.055)
box('RearHatchTrim',(0,2.40,1.15),(.72,.03,.08),BLACK,.012);box('RearBumper',(0,2.46,.50),(.96,.07,.18),RED,.038);box('RearDiffuser',(0,2.54,.29),(.88,.16,.09),BLACK,.02)
for x in(-.50,-.25,0,.25,.50):box('DiffuserFin',(x,2.61,.21),(.016,.15,.09),BLACK,.004)
box('WingBlade',(0,1.98,1.86),(.88,.18,.032),BLACK,.018,rot=(math.radians(-4),0,0))
for sx in(-1,1):box('WingStand'+str(sx),(sx*.66,1.78,1.68),(.03,.055,.19),BLACK,.01);box('WingEndplate'+str(sx),(sx*.91,1.99,1.85),(.028,.20,.13),BLACK,.01)
# Interior visible through glass
box('CabinFloor',(0,.02,.58),(.72,1.25,.05),DARK,.02);box('Dashboard',(0,-.73,1.12),(.70,.20,.10),DARK,.03);box('Console',(0,-.05,.77),(.11,.34,.12),DARK,.025)
for sx in(-1,1):box('Bucket'+str(sx),(sx*.36,.05,.93),(.24,.28,.35),DARK,.06);box('SeatBack'+str(sx),(sx*.36,.29,1.14),(.25,.11,.34),DARK,.05,rot=(math.radians(-10),0,0))
torus('Steering',(-.34,-.66,1.25),.145,.020,DARK,(math.pi/2,0,0),40,10)
for sx in(-1,1):
    box('CageA'+str(sx),(sx*.64,-.72,1.48),(.025,.025,.52),METAL,.008,rot=(math.radians(20),0,0));box('CageB'+str(sx),(sx*.64,.60,1.45),(.025,.025,.50),METAL,.008,rot=(math.radians(-18),0,0))
# Apply modifiers and export a real GLB.
for o in list(COL.objects):
    if o.type!='MESH':continue
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    for md in list(o.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=md.name)
        except:pass
    o.select_set(False)
for o in bpy.context.scene.objects:o.select_set(False)
for o in COL.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT')
print({'asset':'MJX7303_V27_REFERENCE_CAD','wheelbaseMM':375,'wheelbaseUnits':WB,'trueWheelOpenings':True,'objects':len(COL.objects),'out':OUT})
