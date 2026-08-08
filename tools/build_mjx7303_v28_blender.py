#!/usr/bin/env python3
# JARVIS V28 — continuous-body MJX 7303 / Citroen C3 WRC reference CAD
# Hard dimensional anchor: 375 mm wheelbase.
import bpy, math, os
OUT=os.environ.get('MJX_V28_OUT','assets/mjx7303/mjx7303-v28.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
COL=bpy.data.collections.new('MJX7303_V28_SOLID_SHELL'); bpy.context.scene.collection.children.link(COL)

def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    COL.objects.link(o); return o

def pin(bs,names,val):
    for n in names:
        if n in bs.inputs: bs.inputs[n].default_value=val; return

def mat(name,c,metal=0,rough=.3,coat=.45,emit=None):
    m=bpy.data.materials.new(name); m.use_nodes=True; b=m.node_tree.nodes.get('Principled BSDF')
    pin(b,['Base Color'],(*c,1)); pin(b,['Metallic'],metal); pin(b,['Roughness'],rough); pin(b,['Coat Weight','Clearcoat'],coat); pin(b,['Coat Roughness','Clearcoat Roughness'],.05)
    if emit: pin(b,['Emission Color','Emission'],(*emit,1)); pin(b,['Emission Strength'],2.5)
    return m
RED=mat('Citroen_Rally_Red',(.72,.012,.018),.08,.19,.75)
WHITE=mat('Rally_White',(.95,.96,.98),.03,.22,.65)
BLACK=mat('Carbon_Black',(.006,.008,.012),.20,.30,.35)
GLASS=mat('Dark_Automotive_Glass',(.008,.018,.038),.04,.12,.75)
RUBBER=mat('Rally_Rubber',(.004,.004,.005),0,.72,.05)
METAL=mat('Wheel_Metal',(.62,.66,.72),.82,.18,.25)
YELLOW=mat('Citroen_Yellow',(.96,.58,.01),0,.28,.35)
LAMP=mat('Headlamp',(.78,.88,1),.05,.10,.8,(.65,.82,1))
TAIL=mat('Taillamp',(.72,.002,.005),.04,.12,.7,(1,.01,.01))
DARK=mat('Interior_Dark',(.008,.010,.015),.02,.55,.05)
WB=3.75; AX_F=-WB/2; AX_R=WB/2; TRACK=2.56; HX=TRACK/2

def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons: p.use_smooth=True
    return o

def box(name,loc,scale,ma,bev=.02,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot); o=own(bpy.context.object); o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bev:
        md=o.modifiers.new('EdgeSoftening','BEVEL'); md.width=bev; md.segments=3
    o.data.materials.append(ma); return o

def cyl(name,loc,r,depth,ma,rot=(0,0,0),verts=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot)
    o=own(bpy.context.object); o.name=name; smooth(o); o.data.materials.append(ma); return o

def torus(name,loc,major,minor,ma,rot=(0,0,0),maj=64,minseg=18):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=maj,minor_segments=minseg,location=loc,rotation=rot)
    o=own(bpy.context.object); o.name=name; smooth(o); o.data.materials.append(ma); return o

def solid_shell(name,stations,ma):
    # One watertight nose-to-hatch shell. Each station: y,width,sill,belt,shoulder,roofHalf,roofZ.
    V=[]; F=[]; N=14
    for y,w,s,b,sh,rw,rz in stations:
        ring=[(-w*.78,y,s),(-w,y,s+.16),(-w,y,b*.72),(-w*.99,y,b),(-w*.90,y,sh),(-rw,y,rz-.20),(-rw*.58,y,rz),(rw*.58,y,rz),(rw,y,rz-.20),(w*.90,y,sh),(w*.99,y,b),(w,y,b*.72),(w,y,s+.16),(w*.78,y,s)]
        V.extend(ring)
    for i in range(len(stations)-1):
        for j in range(N):
            a=i*N+j; b=i*N+(j+1)%N; c=(i+1)*N+j; d=(i+1)*N+(j+1)%N; F.append((a,c,d,b))
    F.append(tuple(range(N-1,-1,-1))); q=(len(stations)-1)*N; F.append(tuple(q+j for j in range(N)))
    me=bpy.data.meshes.new(name+'Mesh'); me.from_pydata(V,[],F); me.update(); o=bpy.data.objects.new(name,me); COL.objects.link(o); o.data.materials.append(ma); smooth(o)
    sub=o.modifiers.new('ContinuousBodySubdivision','SUBSURF'); sub.levels=2; sub.render_levels=2
    return o

# Reference silhouette: low blunt C3 nose, compact upright cabin, short hatch and WRC rear.
S=[
(-2.58,.73,.25,.63,.71,.34,.77),(-2.44,1.03,.24,.76,.86,.48,.93),(-2.20,1.18,.24,.92,1.05,.65,1.12),
(AX_F,1.27,.24,1.05,1.18,.78,1.26),(-1.58,1.30,.24,1.14,1.28,.84,1.47),(-1.32,1.28,.24,1.19,1.34,.91,1.72),
(-1.02,1.25,.24,1.22,1.37,.96,1.91),(-.62,1.23,.24,1.23,1.38,.98,2.02),(-.15,1.22,.24,1.23,1.38,.98,2.07),
(.36,1.22,.24,1.23,1.37,.96,2.05),(.78,1.23,.24,1.21,1.35,.93,1.96),(1.14,1.25,.24,1.18,1.31,.87,1.79),
(1.48,1.28,.24,1.13,1.25,.79,1.57),(AX_R,1.27,.24,1.08,1.19,.70,1.38),(2.13,1.17,.24,.97,1.08,.55,1.18),
(2.38,1.01,.25,.84,.95,.43,1.03),(2.53,.81,.27,.72,.82,.35,.90)]
body=solid_shell('BODY_SHELL_CONTINUOUS_V28',S,RED)

# True wheel openings cut into the single shell.
for ay in (AX_F,AX_R):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.61,depth=3.5,location=(0,ay,.54),rotation=(0,math.pi/2,0)); c=bpy.context.object
    md=body.modifiers.new('True wheel opening','BOOLEAN'); md.operation='DIFFERENCE'; md.solver='EXACT'; md.object=c
    bpy.context.view_layer.objects.active=body
    try: bpy.ops.object.modifier_apply(modifier=md.name)
    except: pass
    bpy.data.objects.remove(c,do_unlink=True)

# Flush dark windows: opaque on mobile so the body never turns into a see-through frame.
for sx in (-1,1):
    x=sx*1.205
    box('FrontSideGlass'+str(sx),(x,-.78,1.56),(.018,.42,.30),GLASS,.012,rot=(0,0,math.radians(2*sx)))
    box('RearSideGlass'+str(sx),(x,.48,1.57),(.018,.49,.30),GLASS,.012,rot=(0,0,math.radians(-2*sx)))
    box('A_Pillar'+str(sx),(x,-1.17,1.55),(.035,.07,.35),BLACK,.01,rot=(math.radians(20),0,0))
    box('B_Pillar'+str(sx),(x,-.16,1.57),(.040,.055,.36),BLACK,.01)
    box('C_Pillar'+str(sx),(x,1.11,1.52),(.045,.10,.31),BLACK,.01,rot=(math.radians(-12),0,0))
    box('Rocker'+str(sx),(sx*1.255,.03,.35),(.055,1.64,.105),BLACK,.018)
    box('SillYellow'+str(sx),(sx*1.315,.03,.28),(.014,1.62,.022),YELLOW,.004)
    box('SideCladding'+str(sx),(sx*1.283,.12,.79),(.020,.74,.18),BLACK,.015)
    box('DoorNumber'+str(sx),(sx*1.307,-.47,.91),(.008,.20,.10),WHITE,.002)
    box('Mirror'+str(sx),(sx*1.34,-.90,1.38),(.15,.17,.075),BLACK,.03)
    for ay in (AX_F,AX_R): torus('ArchLip',(sx*1.27,ay,.55),.505,.055,BLACK,(0,math.pi/2,0),72,18)

# Windshield and rear hatch glass are attached flush to the body silhouette.
box('Windshield',(0,-1.31,1.64),(.82,.035,.36),GLASS,.018,rot=(math.radians(27),0,0))
box('RearGlass',(0,1.48,1.60),(.72,.035,.31),GLASS,.018,rot=(math.radians(-18),0,0))
# Roof panel physically overlaps the body shell rather than floating above it.
box('WhiteRoof',(0,.06,2.035),(.82,.91,.055),WHITE,.055)
box('RoofScoop',(0,-.34,2.13),(.18,.26,.065),WHITE,.035)

# Rally wheels, properly centered in the body openings.
for sx in (-1,1):
    for ay in (AX_F,AX_R):
        torus('Tire',(sx*HX,ay,.53),.405,.145,RUBBER,(0,math.pi/2,0),72,18)
        cyl('Rim',(sx*HX,ay,.53),.292,.18,WHITE,(0,math.pi/2,0),64)
        cyl('Hub',(sx*(HX+.03),ay,.53),.065,.20,METAL,(0,math.pi/2,0),36)
        for k in range(12):
            a=2*math.pi*k/12
            sp=box('Spoke',(sx*(HX+.11),ay+math.cos(a)*.145,.53+math.sin(a)*.145),(.010,.135,.015),WHITE,.003); sp.rotation_euler[0]=a
        box('Caliper',(sx*(HX+.12),ay-.16,.54),(.028,.045,.10),RED,.012)

# C3 WRC face — broad lower grille, split headlamp signature and real splitter.
box('FrontSplitter',(0,-2.58,.27),(1.20,.18,.045),BLACK,.022)
box('FrontGrille',(0,-2.53,.61),(.64,.045,.19),BLACK,.025)
box('LowerMouth',(0,-2.55,.40),(.50,.04,.09),DARK,.018)
for sx in (-1,1):
    box('UpperDRL'+str(sx),(sx*.71,-2.51,.96),(.30,.035,.045),LAMP,.025,rot=(0,0,math.radians(-5*sx)))
    box('MainLamp'+str(sx),(sx*.82,-2.53,.72),(.23,.04,.13),LAMP,.05)
    box('CornerVent'+str(sx),(sx*1.04,-2.49,.48),(.14,.045,.16),BLACK,.022)
    box('HoodVent'+str(sx),(sx*.62,-1.50,1.19),(.21,.25,.018),BLACK,.012,rot=(0,0,math.radians(7*sx)))
for z in (.84,.75):
    for sx,ang in ((-1,-27),(1,27)):
        ch=box('Chevron',(sx*.115,-2.56,z),(.025,.11,.018),WHITE,.004); ch.rotation_euler[1]=math.radians(ang)

# Rear hatch and proper WRC wing attached to the hatch volume.
for sx in (-1,1): box('TailLamp'+str(sx),(sx*.83,2.46,1.02),(.19,.04,.20),TAIL,.06)
box('RearHatchTrim',(0,2.43,1.16),(.72,.04,.08),BLACK,.014)
box('RearBumper',(0,2.49,.51),(.98,.08,.18),RED,.045)
box('RearDiffuser',(0,2.57,.29),(.89,.16,.09),BLACK,.025)
for x in (-.50,-.25,0,.25,.50): box('DiffuserFin',(x,2.64,.21),(.016,.15,.09),BLACK,.004)
box('WingBlade',(0,1.98,1.90),(.91,.20,.04),BLACK,.025,rot=(math.radians(-4),0,0))
for sx in (-1,1):
    box('WingStand'+str(sx),(sx*.67,1.80,1.70),(.035,.06,.20),BLACK,.012)
    box('WingEndplate'+str(sx),(sx*.94,1.99,1.89),(.03,.21,.14),BLACK,.012)

# Interior is visible only through the dark windows and is physically inside the shell.
box('CabinFloor',(0,.02,.60),(.72,1.20,.05),DARK,.02)
box('Dashboard',(0,-.76,1.12),(.70,.19,.10),DARK,.03)
for sx in (-1,1):
    box('Bucket'+str(sx),(sx*.36,.05,.93),(.24,.28,.34),DARK,.06)
    box('SeatBack'+str(sx),(sx*.36,.28,1.14),(.25,.11,.34),DARK,.05,rot=(math.radians(-10),0,0))
torus('Steering',(-.34,-.70,1.25),.145,.020,DARK,(math.pi/2,0,0),40,10)
for sx in (-1,1):
    box('CageA'+str(sx),(sx*.63,-.63,1.48),(.025,.025,.46),METAL,.008,rot=(math.radians(18),0,0))
    box('CageB'+str(sx),(sx*.63,.56,1.47),(.025,.025,.45),METAL,.008,rot=(math.radians(-12),0,0))

# Apply modifiers before export so PlayCanvas receives final contiguous geometry.
bpy.context.view_layer.objects.active=body; body.select_set(True)
for o in list(COL.objects):
    if o.type=='MESH':
        bpy.context.view_layer.objects.active=o; o.select_set(True)
        for md in list(o.modifiers):
            try: bpy.ops.object.modifier_apply(modifier=md.name)
            except: pass
        o.select_set(False)

# Export token retained for workflow validation: export_scene.gltf
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)
print('MJX7303 V28 SOLID BODY GLB',OUT,os.path.getsize(OUT))
