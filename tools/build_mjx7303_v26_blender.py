#!/usr/bin/env python3
# JARVIS V26 clean MJX 7303 / C3 WRC Blender game-asset generator
# Hard scale anchor: 375 mm wheelbase -> 3.75 Blender units.
import bpy, math, os
from mathutils import Vector
OUT=os.environ.get('MJX_V26_OUT','assets/mjx7303/mjx7303-v26.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
COL=bpy.data.collections.new('MJX7303_V26_CAD');bpy.context.scene.collection.children.link(COL)

def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    COL.objects.link(o);return o

def pin(bsdf,names,val):
    for n in names:
        if n in bsdf.inputs: bsdf.inputs[n].default_value=val;return

def material(name,color,metal=0,rough=.35,coat=.5,alpha=1,emit=None):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    pin(b,['Base Color'],(*color,alpha));pin(b,['Metallic'],metal);pin(b,['Roughness'],rough);pin(b,['Coat Weight','Clearcoat'],coat);pin(b,['Coat Roughness','Clearcoat Roughness'],.06);pin(b,['Alpha'],alpha)
    if emit: pin(b,['Emission Color','Emission'],(*emit,1));pin(b,['Emission Strength'],2.5)
    if alpha<1:
        try:m.surface_render_method='DITHERED'
        except:pass
        try:m.blend_method='BLEND'
        except:pass
    return m
RED=material('WRC_Red',(.64,.008,.012),.08,.17,1)
WHITE=material('WRC_White',(.93,.94,.97),.04,.20,.9)
BLACK=material('Carbon',(.006,.008,.012),.24,.27,.35)
GLASS=material('Smoked_Glass',(.012,.035,.060),0,.09,.18,.26)
RUBBER=material('Rally_Tire',(.004,.004,.005),0,.76,0)
METAL=material('Machined_Metal',(.50,.53,.58),.88,.18,.2)
YELLOW=material('WRC_Yellow',(.96,.58,.01),0,.28,.3)
LAMP=material('Headlamp',(.7,.86,1),.02,.08,.6,1,(.55,.75,1))
TAIL=material('TailLamp',(.7,.004,.008),.02,.10,.55,1,(1,.01,.01))
DARK=material('Interior',(.010,.012,.016),.02,.52,.06)
WB=3.75;AX_F=-WB/2;AX_R=WB/2;TRACK=2.56;HALF_TRACK=TRACK/2

def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def box(name,loc,scale,mat,bevel=.02,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        m=o.modifiers.new('edge radius','BEVEL');m.width=bevel;m.segments=3
    o.data.materials.append(mat);return o

def cyl(name,loc,r,depth,mat,rot=(0,0,0),verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(mat);return o

def torus(name,loc,major,minor,mat,rot=(0,0,0),maj=56,minseg=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=maj,minor_segments=minseg,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(mat);return o

def panel(name,pts,mat):
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update();o=bpy.data.objects.new(name,me);COL.objects.link(o);o.data.materials.append(mat);return o

def loft(name,sections,mat,subdiv=2):
    # section=(y, halfWidth, sillZ, shoulderZ, glassHalfWidth, roofZ)
    verts=[];faces=[];N=12
    for y,w,sill,sh,gw,roof in sections:
        ring=[(-w,y,sill),(-w,y,sh*.72),(-w*.97,y,sh),(-gw,y,roof*.90),(-gw*.70,y,roof),(0,y,roof*1.012),(gw*.70,y,roof),(gw,y,roof*.90),(w*.97,y,sh),(w,y,sh*.72),(w,y,sill),(0,y,sill*.94)]
        verts.extend(ring)
    for i in range(len(sections)-1):
        for j in range(N):
            a=i*N+j;b=i*N+(j+1)%N;c=(i+1)*N+j;d=(i+1)*N+(j+1)%N;faces.append((a,c,d,b))
    faces.append(tuple(range(N-1,-1,-1)));o=(len(sections)-1)*N;faces.append(tuple(o+j for j in range(N)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();obj=bpy.data.objects.new(name,me);COL.objects.link(obj);obj.data.materials.append(mat);smooth(obj)
    if subdiv:
        m=obj.modifiers.new('Automotive subdivision','SUBSURF');m.subdivision_type='CATMULL_CLARK';m.levels=subdiv;m.render_levels=subdiv
    return obj

# C3/WRC proportioned continuous closed exterior; 375 mm axle spacing is exact in model scale.
sections=[
 (-2.52,.78,.28,.58,.44,.66),(-2.34,.98,.27,.78,.58,.86),(-2.12,1.14,.27,.98,.72,1.12),(AX_F,1.23,.27,1.10,.83,1.31),
 (-1.58,1.26,.28,1.16,.89,1.49),(-1.25,1.23,.29,1.20,.92,1.70),(-.82,1.19,.29,1.22,.93,1.88),(-.34,1.17,.29,1.23,.92,1.99),
 (.14,1.17,.29,1.23,.91,2.03),(.62,1.18,.29,1.22,.89,1.98),(1.04,1.20,.29,1.20,.86,1.87),(1.43,1.23,.28,1.17,.81,1.68),
 (AX_R,1.24,.27,1.12,.75,1.50),(2.10,1.12,.27,1.00,.64,1.31),(2.33,.97,.27,.84,.52,1.10),(2.46,.80,.29,.68,.44,.91)]
body=loft('BODY_CLOSED_SUBDIV_V26',sections,RED,2)
roof=loft('ROOF_CAP_V26',[(-1.21,.76,1.49,1.54,.72,1.73),(-.79,.84,1.56,1.69,.80,1.90),(-.30,.85,1.63,1.80,.81,2.00),(.18,.85,1.65,1.84,.80,2.04),(.67,.82,1.62,1.79,.77,1.99),(1.08,.77,1.53,1.67,.71,1.84),(1.43,.68,1.42,1.52,.62,1.63)],WHITE,1)
# glass
panel('Windshield',[(-.78,-1.20,1.32),(.78,-1.20,1.32),(.69,-.74,1.80),(-.69,-.74,1.80)],GLASS)
panel('RearGlass',[(-.70,1.38,1.36),(.70,1.38,1.36),(.62,1.14,1.70),(-.62,1.14,1.70)],GLASS)
for sx in(-1,1):
    x=sx*1.168
    panel('FrontSideGlass'+str(sx),[(x,-1.10,1.31),(x,-.74,1.77),(x,-.14,1.83),(x,-.14,1.27)],GLASS)
    panel('RearSideGlass'+str(sx),[(x,-.06,1.27),(x,-.06,1.83),(x,.88,1.73),(x,1.33,1.42),(x,1.33,1.27)],GLASS)
    box('B_Pillar'+str(sx),(sx*1.18,-.10,1.53),(.04,.05,.34),BLACK,.01)
    box('C_Pillar'+str(sx),(sx*1.17,1.12,1.48),(.045,.15,.29),BLACK,.012)
    box('Rocker'+str(sx),(sx*1.215,.03,.42),(.055,1.63,.13),BLACK,.025)
    box('SillStripe'+str(sx),(sx*1.274,.03,.315),(.018,1.60,.025),YELLOW,.006)
    for ay in(AX_F,AX_R):torus('ArchLip',(sx*1.245,ay,.62),.49,.055,BLACK,(0,math.pi/2,0),56,12)
# wheels/brakes
for sx in(-1,1):
    for ay in(AX_F,AX_R):
        torus('Tire',(sx*HALF_TRACK,ay,.53),.405,.145,RUBBER,(0,math.pi/2,0))
        cyl('Rim',(sx*HALF_TRACK,ay,.53),.295,.18,WHITE,(0,math.pi/2,0),56)
        cyl('BrakeDisc',(sx*(HALF_TRACK+.01),ay,.53),.205,.028,METAL,(0,math.pi/2,0),44)
        cyl('Hub',(sx*(HALF_TRACK+.025),ay,.53),.065,.20,METAL,(0,math.pi/2,0),36)
        for k in range(12):
            a=2*math.pi*k/12;o=box('Spoke',(sx*(HALF_TRACK+.11),ay+math.cos(a)*.145,.53+math.sin(a)*.145),(.014,.125,.018),WHITE,.006);o.rotation_euler[0]=a
        box('Caliper',(sx*(HALF_TRACK+.12),ay-.16,.54),(.028,.045,.10),RED,.012)
# fascia / aero
box('FrontSplitter',(0,-2.53,.285),(1.18,.20,.045),BLACK,.018);box('FrontGrille',(0,-2.455,.62),(.63,.035,.19),BLACK,.02);box('LowerIntake',(0,-2.47,.43),(.48,.03,.085),DARK,.018)
for sx in(-1,1):
    box('DRL'+str(sx),(sx*.68,-2.45,.91),(.33,.028,.045),LAMP,.022,rot=(0,0,math.radians(-4*sx)))
    box('Headlamp'+str(sx),(sx*.77,-2.46,.70),(.23,.032,.12),LAMP,.04)
    box('FrontVent'+str(sx),(sx*1.00,-2.42,.48),(.15,.035,.14),BLACK,.025)
    box('Mirror'+str(sx),(sx*1.29,-.80,1.35),(.14,.18,.075),BLACK,.028)
    box('DoorGraphic'+str(sx),(sx*1.248,-.02,.82),(.010,.72,.20),BLACK,.003)
    box('NumberPanel'+str(sx),(sx*1.266,-.43,.92),(.006,.20,.095),WHITE,.002)
for z in(.82,.74):
    for sx,ang in((-1,-28),(1,28)):
        o=box('Chevron',(sx*.115,-2.49,z),(.028,.115,.018),WHITE,.006);o.rotation_euler[1]=math.radians(ang)
for sx in(-1,1):box('HoodVent'+str(sx),(sx*.63,-1.48,1.18),(.20,.27,.018),BLACK,.012,rot=(0,0,math.radians(5*sx)))
box('RoofScoop',(0,-.30,2.06),(.19,.28,.07),WHITE,.035)
for sx in(-1,1):box('TailLamp'+str(sx),(sx*.82,2.425,1.05),(.19,.03,.21),TAIL,.06)
box('RearBumper',(0,2.43,.52),(.96,.07,.20),RED,.04);box('RearDiffuser',(0,2.52,.30),(.90,.17,.10),BLACK,.022)
for x in(-.52,-.26,0,.26,.52):box('DiffuserFin',(x,2.60,.22),(.018,.16,.10),BLACK,.005)
box('WingBlade',(0,2.01,1.92),(.92,.22,.035),BLACK,.022,rot=(math.radians(-5),0,0))
for sx in(-1,1):box('WingUpright'+str(sx),(sx*.67,1.80,1.72),(.035,.07,.24),BLACK,.012);box('WingEndplate'+str(sx),(sx*.94,2.02,1.91),(.035,.25,.16),BLACK,.012)
# interior
box('CabinFloor',(0,.03,.58),(.72,1.25,.055),DARK,.025);box('Dashboard',(0,-.72,1.13),(.70,.22,.11),DARK,.035);box('CenterConsole',(0,-.02,.75),(.12,.38,.13),DARK,.03)
for sx in(-1,1):
    box('BucketSeat'+str(sx),(sx*.36,.05,.95),(.25,.30,.37),DARK,.07);box('SeatBack'+str(sx),(sx*.36,.30,1.16),(.26,.12,.36),DARK,.06,rot=(math.radians(-10),0,0))
torus('SteeringWheel',(-.34,-.66,1.25),.145,.021,DARK,(math.pi/2,0,0),40,10)
# apply modifiers before export
for o in list(COL.objects):
    if o.type!='MESH':continue
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    for mod in list(o.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=mod.name)
        except:pass
    o.select_set(False)
# export selected collection through scene
for o in bpy.context.scene.objects:o.select_set(False)
for o in COL.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT')
print({'asset':'MJX7303_V26_CAD','wheelbaseUnits':WB,'wheelbaseMM':375,'objects':len(COL.objects),'out':OUT})
