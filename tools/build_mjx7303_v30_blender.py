#!/usr/bin/env python3
# JARVIS V30 — clean continuous MJX 7303 / C3 WRC-style rally body
# Coordinate contract: X track, Y vehicle length (front negative), Z up.
import bpy, math, os
OUT=os.environ.get('MJX_V30_OUT','assets/mjx7303/mjx7303-v30.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
COL=bpy.data.collections.new('MJX7303_V30'); bpy.context.scene.collection.children.link(COL)

def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    COL.objects.link(o); return o

def mat(name,c,metal=0.0,rough=.3,emit=None):
    m=bpy.data.materials.new(name); m.use_nodes=True; b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*c,1); b.inputs['Metallic'].default_value=metal; b.inputs['Roughness'].default_value=rough
    if 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value=.55
    elif 'Clearcoat' in b.inputs: b.inputs['Clearcoat'].default_value=.55
    if emit:
        if 'Emission Color' in b.inputs: b.inputs['Emission Color'].default_value=(*emit,1)
        elif 'Emission' in b.inputs: b.inputs['Emission'].default_value=(*emit,1)
        if 'Emission Strength' in b.inputs: b.inputs['Emission Strength'].default_value=2.2
    return m
RED=mat('Rally_Red',(.68,.012,.018),.07,.2); WHITE=mat('Rally_White',(.91,.94,.98),.02,.23)
BLACK=mat('Carbon_Black',(.006,.008,.012),.22,.3); GLASS=mat('Smoked_Glass',(.008,.018,.035),.08,.13)
RUBBER=mat('Tire_Rubber',(.003,.003,.004),0,.78); METAL=mat('Wheel_Metal',(.58,.63,.70),.82,.18)
YELLOW=mat('Accent_Yellow',(.95,.57,.01),0,.28); LAMP=mat('Headlamp',(.86,.92,1),.04,.09,(.72,.88,1)); TAIL=mat('TailLamp',(.72,.002,.005),.04,.12,(1,.01,.01))
WB=3.75; FY=-WB/2; RY=WB/2; HALFTRACK=1.29

def box(name,loc,scale,ma,bev=.03,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot); o=own(bpy.context.object); o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bev:
        md=o.modifiers.new('soft','BEVEL'); md.width=bev; md.segments=3
    o.data.materials.append(ma); return o

def cyl(name,loc,r,depth,ma,rot=(0,0,0),verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot); o=own(bpy.context.object); o.name=name; o.data.materials.append(ma)
    for p in o.data.polygons: p.use_smooth=True
    return o

def torus(name,loc,major,minor,ma,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=56,minor_segments=16,location=loc,rotation=rot); o=own(bpy.context.object); o.name=name; o.data.materials.append(ma)
    for p in o.data.polygons: p.use_smooth=True
    return o

def shell():
    # Ring stations define a compact, upright C3 rally silhouette without floating greenhouse geometry.
    stations=[
      (-2.62,.76,.24,.66,.82,.34,.88),(-2.42,1.02,.23,.78,.98,.48,1.02),(-2.17,1.18,.23,.91,1.10,.60,1.18),
      (FY,1.29,.23,1.03,1.22,.72,1.34),(-1.52,1.33,.23,1.12,1.30,.82,1.55),(-1.18,1.31,.23,1.18,1.34,.90,1.79),
      (-.72,1.28,.23,1.21,1.36,.95,1.97),(-.20,1.26,.23,1.22,1.36,.97,2.03),(.35,1.26,.23,1.22,1.35,.96,2.01),
      (.82,1.28,.23,1.19,1.33,.92,1.90),(1.22,1.31,.23,1.15,1.28,.85,1.72),(1.54,1.32,.23,1.10,1.23,.76,1.51),
      (RY,1.29,.23,1.03,1.17,.66,1.33),(2.18,1.18,.23,.93,1.07,.54,1.16),(2.43,1.01,.24,.81,.94,.43,1.02),(2.60,.80,.26,.70,.82,.35,.91)]
    V=[]; F=[]; N=18
    # Side-to-roof ring: lower side, shoulder, glass edge, roof crown, mirrored.
    for y,w,s,b,sh,rw,rz in stations:
        ring=[(-w*.74,y,s),(-w,y,s+.12),(-w,y,.54),(-w*.99,y,b*.78),(-w*.98,y,b),(-w*.91,y,sh),(-w*.80,y,sh+.12),(-rw,y,rz-.16),(-rw*.48,y,rz),
              (rw*.48,y,rz),(rw,y,rz-.16),(w*.80,y,sh+.12),(w*.91,y,sh),(w*.98,y,b),(w*.99,y,b*.78),(w,y,.54),(w,y,s+.12),(w*.74,y,s)]
        V.extend(ring)
    for i in range(len(stations)-1):
        for j in range(N-1):
            a=i*N+j; b=a+1; c=(i+1)*N+j; d=c+1; F.append((a,c,d,b))
    # close undersides and ends
    for i in range(len(stations)-1): F.append((i*N,(i+1)*N,(i+1)*N+N-1,i*N+N-1))
    F.append(tuple(range(N-1,-1,-1))); q=(len(stations)-1)*N; F.append(tuple(q+j for j in range(N)))
    me=bpy.data.meshes.new('V30BodyMesh'); me.from_pydata(V,[],F); me.update(); o=bpy.data.objects.new('BODY_SHELL_CONTINUOUS_V30',me); COL.objects.link(o); o.data.materials.append(RED)
    for p in o.data.polygons: p.use_smooth=True
    md=o.modifiers.new('BodySubdivision','SUBSURF'); md.levels=2; md.render_levels=2
    return o
body=shell()

# Flush glazing and pillars. These are thin skins, not giant interior blocks.
box('Windshield',(0,-1.34,1.62),(.80,.025,.33),GLASS,.018,rot=(math.radians(27),0,0))
box('RearGlass',(0,1.48,1.59),(.69,.025,.29),GLASS,.018,rot=(math.radians(-18),0,0))
for sx in (-1,1):
    x=sx*1.255
    box('FrontSideGlass'+str(sx),(x,-.72,1.57),(.012,.43,.27),GLASS,.008)
    box('RearSideGlass'+str(sx),(x,.49,1.56),(.012,.45,.27),GLASS,.008)
    box('B_Pillar'+str(sx),(x,-.10,1.57),(.022,.045,.31),BLACK,.006)
    box('Rocker'+str(sx),(sx*1.305,.08,.34),(.035,1.55,.08),BLACK,.016)
    box('YellowSill'+str(sx),(sx*1.342,.05,.28),(.012,1.49,.020),YELLOW,.003)
    box('Mirror'+str(sx),(sx*1.36,-.90,1.38),(.13,.16,.065),BLACK,.025)
    for ay in (FY,RY): torus('ArchLip',(sx*1.305,ay,.55),.505,.045,BLACK,(0,math.pi/2,0))

# Roof and rally aero are attached directly to shell.
box('WhiteRoof',(0,.04,2.015),(.80,.82,.040),WHITE,.045)
box('RoofScoop',(0,-.32,2.10),(.16,.22,.055),WHITE,.026)
box('FrontSplitter',(0,-2.58,.27),(1.16,.17,.040),BLACK,.020)
box('RearDiffuser',(0,2.57,.28),(.86,.15,.075),BLACK,.022)
box('WingBlade',(0,2.00,1.82),(.88,.19,.035),BLACK,.022,rot=(math.radians(-4),0,0))
for sx in (-1,1):
    box('WingStand'+str(sx),(sx*.65,1.83,1.66),(.030,.055,.17),BLACK,.010)
    box('WingEndplate'+str(sx),(sx*.91,2.00,1.82),(.025,.20,.12),BLACK,.010)

# C3-style face and rear graphic kept compact and flush.
box('FrontGrille',(0,-2.54,.60),(.61,.028,.16),BLACK,.020); box('LowerMouth',(0,-2.56,.39),(.50,.025,.075),BLACK,.016)
for sx in (-1,1):
    box('DRL'+str(sx),(sx*.70,-2.53,.93),(.27,.028,.038),LAMP,.020,rot=(0,0,math.radians(-5*sx)))
    box('MainLamp'+str(sx),(sx*.81,-2.54,.72),(.20,.030,.11),LAMP,.040)
    box('FrontVent'+str(sx),(sx*1.03,-2.51,.48),(.12,.028,.14),BLACK,.018)
    box('TailLamp'+str(sx),(sx*.82,2.48,.99),(.17,.030,.17),TAIL,.045)
box('RearTrim',(0,2.46,1.17),(.66,.025,.055),BLACK,.012)

# Wheels: correct 375 mm wheelbase / 265 mm-ish track visual anchor.
for sx in (-1,1):
    for ay in (FY,RY):
        torus('Tire',(sx*HALFTRACK,ay,.54),.405,.142,RUBBER,(0,math.pi/2,0))
        cyl('Rim',(sx*HALFTRACK,ay,.54),.285,.17,WHITE,(0,math.pi/2,0),56)
        cyl('Hub',(sx*(HALFTRACK+.025),ay,.54),.065,.19,METAL,(0,math.pi/2,0),32)

# Small underside shadow volume keeps the car grounded without covering the body.
box('Undertray',(0,.02,.27),(.86,1.58,.045),BLACK,.018)

# Bake modifiers for deterministic GLB.
for o in list(COL.objects):
    if o.type!='MESH': continue
    bpy.context.view_layer.objects.active=o; o.select_set(True)
    for md in list(o.modifiers):
        try: bpy.ops.object.modifier_apply(modifier=md.name)
        except: pass
    o.select_set(False)

bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)
print('MJX7303 V30 CLEAN BODY GLB',OUT,os.path.getsize(OUT))
