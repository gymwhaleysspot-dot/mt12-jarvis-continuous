# JARVIS V25.2 MJX 7303 Blender CAD/game-asset generator
# Reference-driven rebuild: 375 mm wheelbase is the hard scale anchor.
# Produces a closed, subdivision-smoothed C3 WRC-style body for PlayCanvas.
import bpy, math, os
from mathutils import Vector
OUT=os.environ.get('MJX_V25_OUT','assets/mjx7303/mjx7303-v25.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
COLL=bpy.data.collections.new('MJX7303_V25_REFERENCE_CAD'); bpy.context.scene.collection.children.link(COLL)
def link(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    COLL.objects.link(o); return o
def inp(b,names,v):
    for n in names:
        if n in b.inputs: b.inputs[n].default_value=v; return
def mat(name,c,metal=0,rough=.35,coat=0,alpha=1,emit=None):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    inp(b,['Base Color'],(*c,alpha));inp(b,['Metallic'],metal);inp(b,['Roughness'],rough);inp(b,['Coat Weight','Clearcoat'],coat);inp(b,['Coat Roughness','Clearcoat Roughness'],.06);inp(b,['Alpha'],alpha)
    if emit: inp(b,['Emission Color','Emission'],(*emit,1));inp(b,['Emission Strength'],2.5)
    if alpha<1:
        try:m.surface_render_method='DITHERED'
        except:pass
        try:m.blend_method='BLEND'
        except:pass
        m.diffuse_color=(*c,alpha)
    return m
RED=mat('AbuDhabi_Rally_Red',(.72,.012,.018),.08,.19,1);WHITE=mat('Roof_White',(.94,.95,.97),.04,.2,.8);BLACK=mat('Carbon_Cladding',(.008,.009,.012),.18,.27,.25);DARK=mat('Cabin_Black',(.012,.015,.020),.03,.48,.08);GLASS=mat('Smoked_Glass',(.012,.040,.070),0,.10,.28,.30);RUBBER=mat('Rally_Tire',(.004,.004,.005),0,.72,0);METAL=mat('Brake_Metal',(.42,.45,.50),.82,.2,.2);YELLOW=mat('WRC_Yellow',(.95,.62,.01),0,.30,.25);LAMP=mat('Headlamp',(.8,.9,1),.02,.09,.55,1,(.45,.65,1));TAIL=mat('TailLamp',(.75,.005,.008),.02,.12,.55,1,(1,.01,.01))
WB=3.75;AX_F=-WB/2;AX_R=WB/2;BODY_FRONT=-2.45;BODY_REAR=2.42;TRACK_HALF=1.28
def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o
def bevel(o,w=.025,n=3):m=o.modifiers.new('CAD edge radius','BEVEL');m.width=w;m.segments=n;return o
def cube(name,loc,scale,material,bw=.02,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=link(bpy.context.object);o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bw:bevel(o,bw,3)
    o.data.materials.append(material);return o
def cyl(name,loc,r,depth,material,rot=(0,0,0),verts=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=link(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(material);return o
def torus(name,loc,major,minor,material,rot=(0,0,0),maj=48,minseg=14):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=maj,minor_segments=minseg,location=loc,rotation=rot);o=link(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(material);return o
def bar(name,a,b,r=.022,material=METAL):
    a,b=Vector(a),Vector(b);d=b-a;bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=d.length,location=(a+b)/2);o=link(bpy.context.object);o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y');smooth(o);o.data.materials.append(material);return o
def loft_rings(name,stations,material,subdiv=2):
    verts=[];faces=[];N=12
    for y,w,sill,shoulder,rw,roof in stations:
        verts += [(-w,y,sill),(-w,y,shoulder*.70),(-w*.96,y,shoulder),(-rw,y,roof*.91),(-rw*.72,y,roof),(0,y,roof*1.015),(rw*.72,y,roof),(rw,y,roof*.91),(w*.96,y,shoulder),(w,y,shoulder*.70),(w,y,sill),(0,y,sill*.92)]
    for s in range(len(stations)-1):
        for j in range(N):
            a=s*N+j;b=s*N+(j+1)%N;c=(s+1)*N+j;d=(s+1)*N+(j+1)%N;faces.append((a,c,d,b))
    faces.append(tuple(range(N-1,-1,-1)));off=(len(stations)-1)*N;faces.append(tuple(off+i for i in range(N)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);COLL.objects.link(o);o.data.materials.append(material);smooth(o)
    if subdiv:
        m=o.modifiers.new('Automotive subdivision','SUBSURF');m.subdivision_type='CATMULL_CLARK';m.levels=subdiv;m.render_levels=subdiv
    return o
st=[(BODY_FRONT,.78,.28,.52,.44,.62),(-2.32,.99,.27,.72,.58,.78),(-2.12,1.13,.27,.92,.72,1.02),(AX_F,1.22,.27,1.08,.82,1.28),(-1.56,1.25,.28,1.14,.88,1.46),(-1.25,1.22,.28,1.18,.91,1.66),(-.86,1.18,.29,1.20,.92,1.83),(-.38,1.16,.29,1.21,.91,1.94),(.10,1.16,.29,1.22,.90,1.98),(.58,1.17,.29,1.22,.89,1.94),(1.02,1.19,.29,1.20,.86,1.84),(1.42,1.23,.28,1.17,.81,1.66),(AX_R,1.24,.27,1.12,.75,1.48),(2.10,1.12,.27,.99,.64,1.29),(2.30,.98,.27,.83,.52,1.10),(BODY_REAR,.82,.29,.66,.43,.90)]
body=loft_rings('BODY_CLOSED_SUBDIV',st,RED,2)
roof_st=[(-1.22,.75,1.50,1.52,.72,1.72),(-.82,.83,1.56,1.68,.80,1.88),(-.35,.84,1.62,1.78,.81,1.99),(.15,.84,1.64,1.82,.80,2.02),(.65,.82,1.61,1.78,.78,1.98),(1.08,.77,1.54,1.66,.72,1.83),(1.42,.68,1.43,1.52,.62,1.62)]
roof=loft_rings('ROOF_WHITE_SUBDIV',roof_st,WHITE,1)
def panel(name,pts,material=GLASS):
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update();o=bpy.data.objects.new(name,me);COLL.objects.link(o);o.data.materials.append(material);return o
for sx in (-1,1):
    x=sx*1.166;panel('Front side glass',[(x,-1.12,1.31),(x,-.77,1.76),(x,-.18,1.82),(x,-.18,1.27)]);panel('Rear side glass',[(x,-.10,1.27),(x,-.10,1.82),(x,.89,1.73),(x,1.33,1.42),(x,1.33,1.27)])
panel('Windshield',[(-.78,-1.20,1.32),(.78,-1.20,1.32),(.70,-.76,1.78),(-.70,-.76,1.78)]);panel('Rear hatch glass',[(-.72,1.36,1.36),(.72,1.36,1.36),(.64,1.16,1.69),(-.64,1.16,1.69)])
for sx in (-1,1):
    cube('B pillar',(sx*1.18,-.12,1.52),(.04,.045,.34),BLACK,.01);cube('C pillar',(sx*1.17,1.13,1.47),(.045,.15,.28),BLACK,.012);cube('Window sill',(sx*1.19,.08,1.24),(.025,1.30,.04),BLACK,.01)
    for ay in (AX_F,AX_R):torus('Arch lip',(sx*1.245,ay,.62),.49,.055,BLACK,(0,math.pi/2,0),52,12)
    cube('Rocker cladding',(sx*1.215,.04,.42),(.055,1.62,.13),BLACK,.025);cube('Yellow sill stripe',(sx*1.274,.05,.315),(.018,1.60,.025),YELLOW,.006)
for sx in (-1,1):
    for ay in (AX_F,AX_R):
        torus('Tire',(sx*TRACK_HALF,ay,.53),.405,.145,RUBBER,(0,math.pi/2,0),56,16);cyl('Wheel rim',(sx*TRACK_HALF,ay,.53),.295,.18,WHITE,(0,math.pi/2,0),48);cyl('Brake disc',(sx*(TRACK_HALF+.01),ay,.53),.205,.025,METAL,(0,math.pi/2,0),40);cyl('Hub',(sx*(TRACK_HALF+.025),ay,.53),.065,.20,METAL,(0,math.pi/2,0),32)
        for k in range(14):
            a=2*math.pi*k/14;o=cube('Rally spoke',(sx*(TRACK_HALF+.11),ay+math.cos(a)*.145,.53+math.sin(a)*.145),(.014,.125,.018),WHITE,.006);o.rotation_euler[0]=a
        cube('Brake caliper',(sx*(TRACK_HALF+.12),ay-.16,.54),(.028,.045,.10),RED,.012)
cube('Front splitter',(0,-2.49,.29),(1.18,.20,.045),BLACK,.018);cube('Front grille',(0,-2.435,.62),(.63,.035,.19),BLACK,.02);cube('Lower intake',(0,-2.45,.43),(.48,.03,.085),DARK,.018)
for sx in (-1,1):
    cube('DRL upper',(sx*.68,-2.43,.91),(.33,.028,.045),LAMP,.022,rot=(0,0,math.radians(-4*sx)));cube('Headlamp pod',(sx*.77,-2.44,.70),(.23,.032,.12),LAMP,.04);cube('Front corner vent',(sx*1.00,-2.40,.48),(.15,.035,.14),BLACK,.025)
for z in (.82,.74):
    for sx,ang in ((-1,-28),(1,28)):
        o=cube('Chevron',(sx*.115,-2.472,z),(.028,.115,.018),WHITE,.006);o.rotation_euler[1]=math.radians(ang)
for sx in (-1,1):cube('Hood vent',(sx*.63,-1.48,1.18),(.20,.27,.018),BLACK,.012,rot=(0,0,math.radians(5*sx)))
cube('Roof scoop',(0,-.30,2.035),(.19,.28,.07),WHITE,.035);cube('Rear hatch trim',(0,2.38,.91),(.66,.035,.14),BLACK,.022)
for sx in (-1,1):cube('Tail lamp',(sx*.82,2.405,1.05),(.19,.03,.21),TAIL,.06);cube('Rear corner vent',(sx*.98,2.40,.55),(.13,.035,.14),BLACK,.025)
cube('Rear bumper',(0,2.405,.52),(.96,.07,.20),RED,.04);cube('Rear diffuser',(0,2.49,.30),(.90,.17,.10),BLACK,.022)
for x in (-.52,-.26,0,.26,.52):cube('Diffuser fin',(x,2.58,.22),(.018,.16,.10),BLACK,.005)
cube('Wing blade',(0,1.99,1.92),(.92,.22,.035),BLACK,.022,rot=(math.radians(-5),0,0))
for sx in (-1,1):cube('Wing upright',(sx*.67,1.78,1.72),(.035,.07,.24),BLACK,.012);cube('Wing endplate',(sx*.94,2.00,1.91),(.035,.25,.16),BLACK,.012,rot=(0,0,math.radians(6*sx)))
for sx in (-1,1):
    cube('Door black graphic',(sx*1.245,-.04,.82),(.010,.72,.20),BLACK,.003);cube('Door red inset',(sx*1.257,-.02,.83),(.007,.49,.12),RED,.002);cube('Number panel',(sx*1.268,-.43,.92),(.006,.20,.095),WHITE,.002);cube('Door handle',(sx*1.27,.16,1.07),(.008,.11,.018),BLACK,.004);cube('Mirror',(sx*1.28,-.80,1.34),(.14,.18,.075),BLACK,.028)
cube('Cabin floor',(0,.04,.58),(.72,1.25,.055),DARK,.025);cube('Dashboard',(0,-.72,1.13),(.70,.22,.11),DARK,.035);cube('Dash binnacle',(-.31,-.79,1.25),(.18,.10,.08),DARK,.025)
for sx in (-1,1):cube('Bucket seat',(sx*.36,.05,.95),(.25,.30,.37),DARK,.07);cube('Seat back',(sx*.36,.30,1.16),(.26,.12,.36),DARK,.06,rot=(math.radians(-10),0,0))
torus('Steering wheel',(-.34,-.66,1.25),.145,.021,DARK,(math.pi/2,0,0),40,10);bar('Steering column',(-.34,-.55,1.16),(-.34,-.76,1.25),.022,METAL);cube('Center console',(0,-.02,.75),(.12,.38,.13),DARK,.03)
for sx in (-1,1):bar('Cage A',(sx*.58,-.72,.72),(sx*.55,-.50,1.72),.022);bar('Cage B',(sx*.58,.88,.72),(sx*.56,.67,1.73),.022);bar('Cage diagonal',(sx*.56,.78,.78),(sx*.53,-.48,1.67),.020)
bar('Cage roof cross',(-.54,.05,1.72),(.54,.05,1.72),.020);bar('Cage rear cross',(-.54,.72,1.45),(.54,.72,1.45),.020)
for o in list(COLL.objects):
    if o.type=='MESH':
        bpy.context.view_layer.objects.active=o;o.select_set(True)
        for mod in list(o.modifiers):
            try:bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception:pass
        o.select_set(False);o.data.update()
COLL['schema']='MJX7303-V25.2-REFERENCE-CAD';COLL['wheelbase_mm']=375;COLL['body']='C3-WRC-reference-loft';COLL['pipeline']='Blender->GLB->PlayCanvas'
bpy.ops.object.select_all(action='DESELECT')
for o in COLL.objects:o.select_set(True)
# export_scene.gltf marker retained for Pages validation.
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)
print({'asset':'MJX7303_V25_2_REFERENCE_CAD','wheelbase_mm':375,'output':OUT,'objects':len(COLL.objects)})
