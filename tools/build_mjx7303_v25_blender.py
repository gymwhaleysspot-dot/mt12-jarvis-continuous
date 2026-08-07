# JARVIS V25 MJX 7303 Blender asset generator
# Generates a game-ready C3/WRC-inspired MJX 7303 GLB for the browser renderer.
import bpy, math, os
from mathutils import Vector

OUT=os.environ.get('MJX_V25_OUT','assets/mjx7303/mjx7303-v25.glb')
os.makedirs(os.path.dirname(OUT),exist_ok=True)

# Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes,bpy.data.curves,bpy.data.materials,bpy.data.cameras,bpy.data.lights):
    pass

def set_input(bsdf,names,value):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value=value
            return

def material(name,color,metal=0.0,rough=.35,coat=0.0,coat_rough=.08,alpha=1.0,emission=None):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    set_input(bsdf,['Base Color'],(*color,alpha))
    set_input(bsdf,['Metallic'],metal)
    set_input(bsdf,['Roughness'],rough)
    set_input(bsdf,['Coat Weight','Clearcoat'],coat)
    set_input(bsdf,['Coat Roughness','Clearcoat Roughness'],coat_rough)
    set_input(bsdf,['Alpha'],alpha)
    if emission:
        set_input(bsdf,['Emission Color','Emission'],(*emission,1))
        set_input(bsdf,['Emission Strength'],3.0)
    if alpha<1:
        try:m.surface_render_method='DITHERED'
        except:pass
        try:m.blend_method='BLEND'
        except:pass
        m.diffuse_color=(*color,alpha)
    return m

RED=material('Rally Red',(0.72,0.008,0.015),.12,.18,1.0,.06)
BLACK=material('Carbon Black',(0.008,0.010,0.014),.28,.25,.35,.10)
GLASS=material('Smoked Glass',(0.012,0.035,0.055),.02,.08,.4,.04,.32)
WHITE=material('Rally White',(0.92,0.94,0.98),.06,.20,.75,.07)
DARK=material('Interior',(0.015,0.018,0.022),.05,.48,.12,.2)
METAL=material('Machined Metal',(0.45,0.48,0.52),.82,.19,.25,.08)
RUBBER=material('Tire Rubber',(0.006,0.006,0.007),0,.72,0,.2)
YELLOW=material('Rally Accent',(0.95,0.62,0.01),.02,.32,.35,.12)
LAMP=material('Headlamp',(0.82,0.90,1.0),.05,.08,.7,.03,1.0,(0.55,0.72,1.0))
TAIL=material('Tail Lamp',(0.75,0.005,0.008),.02,.13,.6,.04,1.0,(1.0,0.01,0.01))

COLL=bpy.data.collections.new('MJX7303_V25')
bpy.context.scene.collection.children.link(COLL)

def move_to_coll(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    COLL.objects.link(o)
    return o

def smooth(o):
    if hasattr(o.data,'polygons'):
        for p in o.data.polygons:p.use_smooth=True
    return o

def bevel(o,w=.04,segments=3):
    mod=o.modifiers.new('CAD edge radius','BEVEL');mod.width=w;mod.segments=segments
    return o

def cube(name,loc,scale,mat,bevel_w=.04):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o=move_to_coll(bpy.context.object);o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel_w:bevel(o,bevel_w,3)
    o.data.materials.append(mat)
    return o

def uv_sphere(name,loc,scale,mat,seg=32,rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc)
    o=move_to_coll(bpy.context.object);o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    smooth(o);o.data.materials.append(mat);return o

def cyl(name,loc,radius,depth,mat,rot=(0,0,0),verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc,rotation=rot)
    o=move_to_coll(bpy.context.object);o.name=name;smooth(o);bevel(o,.018,2);o.data.materials.append(mat);return o

def torus(name,loc,major,minor,mat,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=40,minor_segments=12,location=loc,rotation=rot)
    o=move_to_coll(bpy.context.object);o.name=name;smooth(o);o.data.materials.append(mat);return o

def loft(name,sections,ring,mat,powx=.72,powy=.82,subdiv=2):
    verts=[];faces=[]
    for z,w,b,t in sections:
        cy=(b+t)*.5;ry=(t-b)*.5
        for j in range(ring):
            a=2*math.pi*j/ring;ca=math.cos(a);sa=math.sin(a)
            x=math.copysign(abs(ca)**powx,ca)*w
            y=cy+math.copysign(abs(sa)**powy,sa)*ry
            verts.append((x,z,y)) # Blender: x,width ; y,length ; z,height
    ns=len(sections)
    for s in range(ns-1):
        for j in range(ring):
            a=s*ring+j;b=s*ring+(j+1)%ring;c=(s+1)*ring+j;d=(s+1)*ring+(j+1)%ring
            faces.append((a,c,d,b))
    faces.append(tuple(range(ring-1,-1,-1)))
    off=(ns-1)*ring;faces.append(tuple(off+j for j in range(ring)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);COLL.objects.link(o);o.data.materials.append(mat);smooth(o)
    if subdiv:
        m=o.modifiers.new('Automotive subdivision','SUBSURF');m.subdivision_type='CATMULL_CLARK';m.levels=subdiv;m.render_levels=subdiv
    return o

# Main body: compact hatchback proportions with WRC shoulders.
body_sections=[
(-2.20,.68,.28,.48),(-2.08,.88,.27,.64),(-1.88,1.00,.27,.80),(-1.55,1.08,.27,.92),
(-1.22,1.11,.27,1.00),(-.84,1.10,.28,1.05),(-.42,1.08,.28,1.08),(0.00,1.075,.28,1.10),
(.42,1.08,.28,1.11),(.84,1.10,.28,1.09),(1.20,1.11,.28,1.04),(1.52,1.08,.28,.96),
(1.78,1.02,.28,.86),(2.02,.92,.28,.72),(2.18,.72,.29,.55)]
body=loft('BODY_CLOSED_SUBDIV',body_sections,32,RED,.66,.76,2)

# Glasshouse as its own smooth enclosed shell.
glass_sections=[(-.88,.69,.92,1.18),(-.68,.76,.92,1.40),(-.40,.80,.92,1.56),(-.05,.82,.92,1.65),(.36,.82,.92,1.67),(.74,.80,.92,1.62),(1.05,.76,.92,1.50),(1.30,.68,.92,1.30),(1.47,.58,.93,1.10)]
glass=loft('GLASSHOUSE',glass_sections,28,GLASS,.78,.84,2)

# Black belt/pillars visually separate the windows.
for sx in (-1,1):
    cube('Window belt', (sx*.91,.30,.99),(.035,1.48,.07),BLACK,.018)
    for y in (-.62,.18,1.02):cube('Window pillar',(sx*.79,y,1.30),(.055,.055,.39),BLACK,.018)
    cube('Side skirt',(sx*1.03,.05,.39),(.07,2.78,.12),BLACK,.025)
    cube('Mirror',(sx*1.02,-.68,1.28),(.18,.22,.10),BLACK,.04)

# Hood shaping and bumper volumes.
cube('Front bumper',(0,-2.09,.56),(.96,.17,.28),BLACK,.08)
cube('Front splitter',(0,-2.27,.31),(1.05,.28,.055),BLACK,.035)
cube('Rear bumper',(0,2.09,.55),(.94,.16,.25),BLACK,.07)
cube('Rear diffuser',(0,2.22,.31),(.87,.24,.14),BLACK,.035)

# Wide rally arches: painted shoulders + black lip.
wheel_y=(-1.34,1.34)
for sx in (-1,1):
    for wy in wheel_y:
        uv_sphere('Painted fender',(sx*.98,wy,.63),(.43,.56,.40),RED,32,16)
        torus('Arch cladding',(sx*1.055,wy,.56),.41,.065,BLACK,(math.pi/2,0,0))

# Wheels: real tire + rim + disc + caliper + hub + spokes.
for sx in (-1,1):
    for wy in wheel_y:
        torus('Tire',(sx*1.09,wy,.50),.40,.15,RUBBER,(0,math.pi/2,0))
        cyl('Rim barrel',(sx*1.09,wy,.50),.29,.21,WHITE,(0,math.pi/2,0),40)
        cyl('Brake disc',(sx*1.105,wy,.50),.22,.025,METAL,(0,math.pi/2,0),36)
        cyl('Hub',(sx*1.12,wy,.50),.075,.23,METAL,(0,math.pi/2,0),28)
        # 12 spokes in wheel Y/Z plane; slim beveled boxes rotated around X.
        for k in range(12):
            a=2*math.pi*k/12
            o=cube('Rim spoke',(sx*1.125,wy+math.cos(a)*.13,.50+math.sin(a)*.13),(.022,.12,.028),WHITE,.012)
            o.rotation_euler[0]=a
        cal=cube('Brake caliper',(sx*1.13,wy-.16,.51),(.032,.055,.12),RED,.02)

# Front identity: split lamps, center grille, chevrons.
cube('Upper grille',(0,-2.19,.79),(.69,.035,.07),BLACK,.018)
cube('Center intake',(0,-2.21,.57),(.52,.035,.16),DARK,.025)
for sx in (-1,1):
    cube('Upper lamp',(sx*.62,-2.20,.86),(.34,.035,.085),LAMP,.035)
    uv_sphere('Lower lamp',(sx*.73,-2.17,.65),(.23,.06,.19),LAMP,24,12)
for z in (.76,.68):
    for sx,ang in ((-1,-35),(1,35)):
        o=cube('Chevron',(sx*.11,-2.255,z),(.035,.22,.026),WHITE,.01);o.rotation_euler[1]=math.radians(ang)

# Rear lighting and aero.
for sx in (-1,1):uv_sphere('Tail lamp',(sx*.78,2.10,.79),(.22,.055,.23),TAIL,24,12)
cube('Rear wing',(0,1.86,1.63),(.90,.25,.055),BLACK,.035)
for sx in (-1,1):cube('Wing post',(sx*.62,1.80,1.45),(.045,.055,.23),BLACK,.018)
cube('Roof scoop',(0,-.04,1.77),(.22,.36,.09),WHITE,.04)

# Hood vents, door/livery surfaces and panel gaps.
for sx in (-1,1):
    vent=cube('Hood vent',(sx*.52,-1.40,1.03),(.20,.30,.018),BLACK,.016);vent.rotation_euler[2]=math.radians(sx*7)
    cube('Door dark field',(sx*1.082,.10,.74),(.022,.78,.22),BLACK,.01)
    cube('Door red inset',(sx*1.105,.06,.79),(.014,.54,.13),RED,.008)
    cube('Door number panel',(sx*1.122,-.02,.82),(.010,.22,.09),WHITE,.006)
    cube('Rocker accent',(sx*1.095,.03,.33),(.022,2.30,.022),YELLOW,.006)
    # Door seams and handle
    cube('Door seam front',(sx*1.115,-.55,.84),(.009,.012,.42),BLACK,.003)
    cube('Door seam rear',(sx*1.115,.72,.84),(.009,.012,.42),BLACK,.003)
    cube('Door handle',(sx*1.13,.02,.98),(.012,.12,.022),BLACK,.006)

# Interior: floor, dash, buckets, wheel, console, cage, door cards.
cube('Cabin floor',(0,.22,.54),(.72,1.30,.08),DARK,.035)
cube('Dashboard',(0,-.42,1.04),(.67,.30,.12),DARK,.05)
cube('Dash screen',(.28,-.58,1.14),(.18,.035,.09),LAMP,.018)
for sx in (-1,1):
    seat=cube('Bucket seat',(sx*.36,.34,.86),(.28,.34,.40),DARK,.09)
    cube('Door card',(sx*.72,.30,.86),(.035,.68,.25),DARK,.025)
# Steering wheel + column
torus('Steering wheel',(-.34,-.50,1.13),.16,.025,DARK,(math.pi/2,0,0))
cyl('Steering column',(-.34,-.40,1.05),.025,.28,METAL,(math.pi/2,0,0),20)
cube('Center console',(0,.25,.73),(.15,.46,.16),DARK,.04)
cube('Rear bulkhead',(0,1.15,.86),(.66,.06,.35),DARK,.03)
# Cage bars between endpoints
def bar(name,a,b,r=.025,mat=METAL):
    a=Vector(a);b=Vector(b);mid=(a+b)/2;d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=18,radius=r,depth=d.length,location=mid)
    o=move_to_coll(bpy.context.object);o.name=name
    o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
    smooth(o);o.data.materials.append(mat);return o
for sx in (-1,1):
    bar('Cage A',(sx*.58,-.58,.76),(sx*.54,-.25,1.54))
    bar('Cage B',(sx*.58,.88,.76),(sx*.54,.62,1.55))
    bar('Cage diag',(sx*.56,.80,.78),(sx*.52,-.38,1.48))
bar('Cage roof',(-.54,.10,1.53),(.54,.10,1.53))

# Apply modifiers so the exported GLB contains the evaluated CAD surfaces.
for o in list(COLL.objects):
    if o.type=='MESH':
        bpy.context.view_layer.objects.active=o;o.select_set(True)
        for mod in list(o.modifiers):
            try:bpy.ops.object.modifier_apply(modifier=mod.name)
            except:pass
        o.select_set(False)

# Export only our collection objects.
bpy.ops.object.select_all(action='DESELECT')
for o in COLL.objects:o.select_set(True)
# GLB uses +Y up internally; exporter handles Blender Z-up conversion.
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT',export_yup=True)
print('JARVIS V25 GLB',OUT,os.path.getsize(OUT))
