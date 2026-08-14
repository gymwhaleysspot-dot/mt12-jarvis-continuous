import bpy, math, json, os
from mathutils import Vector

OUT=os.environ.get('MICHAEL_V65_OUT','/tmp/michael-v65.glb')
RENDER_DIR=os.environ.get('MICHAEL_V65_RENDERS','/tmp/michael-v65-renders')
os.makedirs(RENDER_DIR,exist_ok=True)

# MICHAEL V65R — SURFACE NETWORK RECONSTRUCTION
# Authoring coordinates: X left/right, Y front(+)/rear(-), Z up.
# This is deliberately NOT one potato-shaped loft. The car is a controlled network:
# lower body + greenhouse + hood/deck + wheel-arch booleans + semantic hardpoints.

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def material(name,color,metal=0.0,rough=.45):
    m=bpy.data.materials.new(name);m.diffuse_color=color;m.metallic=metal;m.roughness=rough;return m
RED=material('C3 Rally Red',(0.54,.008,.012,1),.28,.21)
BLACK=material('Carbon',(0.007,.009,.012,1),.14,.30)
GLASS=material('Glass',(0.018,.027,.038,1),.04,.12)
WHITE=material('Rally White',(.91,.92,.91,1),.10,.25)
SILVER=material('Lamp Silver',(.72,.78,.84,1),.58,.15)
YELLOW=material('Rally Yellow',(.98,.62,.01,1),.05,.27)
BLUE=material('Rally Blue',(.04,.19,.70,1),.05,.28)

# Each lower-body station is: y, halfwidth, sill, belt, shoulder, crown.
# Crown is the exterior top of the lower shell, not the roof.
LOWER=[
 ( 2.58,.82,.20,.50,.66,.72),
 ( 2.44,1.15,.20,.55,.74,.82),
 ( 2.18,1.34,.20,.62,.86,.96),
 ( 1.82,1.46,.20,.70,.99,1.08),
 ( 1.55,1.50,.20,.76,1.05,1.12),
 ( 1.10,1.47,.20,.80,1.08,1.15),
 ( .55,1.45,.20,.82,1.10,1.16),
 ( 0.00,1.44,.20,.82,1.10,1.16),
 (-.60,1.45,.20,.81,1.09,1.15),
 (-1.10,1.48,.20,.78,1.07,1.12),
 (-1.55,1.50,.20,.72,1.02,1.05),
 (-1.90,1.45,.20,.66,.94,.95),
 (-2.20,1.34,.20,.60,.83,.84),
 (-2.45,1.14,.20,.53,.70,.72),
 (-2.58,.84,.20,.47,.62,.64),
]

# Greenhouse stations: y, halfwidth at glass base, roof halfwidth, base z, roof z.
CABIN=[
 (1.34,.93,.71,1.08,1.47),
 (1.02,1.00,.79,1.11,1.66),
 (.58,1.04,.91,1.14,1.81),
 (0.0,1.05,.96,1.15,1.86),
 (-.58,1.04,.91,1.14,1.81),
 (-1.02,.99,.79,1.10,1.65),
 (-1.34,.91,.69,1.05,1.45),
]

def lower_section(y,hw,sill,belt,shoulder,crown):
    # crisp sill -> flare shoulder -> upper shoulder -> center crown
    pts=[(-hw*.82,sill),(-hw,sill+.05),(-hw*1.015,.42),(-hw,.67),(-hw*.965,belt),(-hw*.90,shoulder),(-hw*.62,crown-.03),(0,crown)]
    return [(x,y,z) for x,z in pts+[( -x,z) for x,z in pts[-2::-1]]]

def cabin_section(y,basehw,roofhw,basez,roofz):
    pts=[(-basehw,basez),(-basehw*.96,basez+.17),(-roofhw,roofz-.10),(0,roofz)]
    return [(x,y,z) for x,z in pts+[( -x,z) for x,z in pts[-2::-1]]]

def loft(name,stations,section_fn,mat,bevel=.012):
    loops=[section_fn(*s) for s in stations];n=len(loops[0]);verts=[v for loop in loops for v in loop];faces=[]
    for j in range(len(loops)-1):
        a=j*n;b=(j+1)*n
        for i in range(n):
            k=(i+1)%n;faces.append((a+i,a+k,b+k,b+i))
    faces += [tuple(range(n-1,-1,-1)),tuple((len(loops)-1)*n+i for i in range(n))]
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    if bevel:
        mod=ob.modifiers.new('EdgeRadius','BEVEL');mod.width=bevel;mod.segments=2
    return ob

def cube(name,scale,loc,mat,rot=(0,0,0),bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
    if bevel:
        m=o.modifiers.new('EdgeRadius','BEVEL');m.width=bevel;m.segments=2
    return o

def cyl(name,r,depth,loc,mat,rot=(0,math.pi/2,0),verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(mat);return o

def sphere(name,scale,loc,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);return o

def cut_arch(body,y):
    # Wheel arch tunnel crosses full X width; boolean gives an actual opening rather than a painted circle.
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=.60,depth=3.7,location=(0,y,.54),rotation=(0,math.pi/2,0));c=bpy.context.object;c.name='ArchCutter'
    mod=body.modifiers.new('WheelArch','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=c
    bpy.context.view_layer.objects.active=body
    try:bpy.ops.object.modifier_apply(modifier=mod.name)
    finally:bpy.data.objects.remove(c,do_unlink=True)

body=loft('BodyLower',LOWER,lower_section,RED,.018)
# Cut true front and rear arch openings before adding wheels/flares.
cut_arch(body,1.58);cut_arch(body,-1.58)

cabin=loft('Greenhouse',CABIN,cabin_section,RED,.012)

# Hood and rear deck are shallow controlled surfaces, not roof-like body blobs.
cube('HoodSkin',(2.22,1.20,.055),(0,1.78,1.08),RED,(math.radians(-4),0,0),.018)
cube('RearDeck',(2.15,.78,.055),(0,-1.72,1.00),RED,(math.radians(3),0,0),.015)

# Flares integrated around real arch openings.
for x in (-1.38,1.38):
    for y in (-1.58,1.58):
        sphere(f'Flare_{x}_{y}',(.19,.67,.55),(x,y,.58),RED)

# Rally wheels: wheelbase 3.16, track 2.50.
for x in (-1.25,1.25):
    for y in (-1.58,1.58):
        cyl(f'Tire_{x}_{y}',.515,.35,(x,y,.515),BLACK)
        cyl(f'Wheel_{x}_{y}',.355,.37,(x,y,.515),WHITE)
        cyl(f'Hub_{x}_{y}',.10,.385,(x,y,.515),BLACK)

# Glazing follows the actual cabin envelope.
cube('Windshield',(1.82,.035,.69),(0,1.20,1.47),GLASS,(math.radians(27),0,0),.008)
cube('RearGlass',(1.72,.035,.61),(0,-1.20,1.45),GLASS,(math.radians(-25),0,0),.008)
for x in (-1.015,1.015):
    cube(f'SideGlassFront{x}',(.026,1.00,.56),(x,.47,1.47),GLASS,(0,0,0),.005)
    cube(f'SideGlassRear{x}',(.026,.86,.54),(x,-.55,1.45),GLASS,(0,0,0),.005)

# Roof panel and scoop. White roof is exterior geometry, not a floating card.
cube('RoofWhite',(1.78,1.90,.045),(0,-.04,1.855),WHITE,(0,0,0),.018)
cube('RoofScoop',(.48,.52,.12),(0,.34,1.96),BLACK,(0,0,0),.025)

# Front bumper architecture: proper depth layers.
cube('FrontBumper',(2.68,.24,.50),(0,2.45,.55),RED,(0,0,0),.045)
cube('FrontSplitter',(2.82,.50,.075),(0,2.48,.15),BLACK,(0,0,0),.015)
cube('FrontGrille',(1.78,.12,.40),(0,2.59,.40),BLACK,(0,0,0),.055)
for i,x in enumerate([-.69,-.52,-.35,-.18,0,.18,.35,.52,.69]):cube(f'GrilleSlat{i}',(.035,.035,.31),(x,2.665,.40),SILVER,(0,0,0),.004)
# Citroen split-light identity: slim upper DRL, separate lower projector pocket.
for x in (-.72,.72):
    cube(f'DRL_{x}',(.60,.07,.075),(x,2.60,.91),WHITE,(0,0,math.radians(-7 if x>0 else 7)),.02)
    cube(f'ProjectorPocket_{x}',(.46,.13,.25),(x*.98,2.60,.65),BLACK,(0,0,0),.055)
    sphere(f'Projector_{x}',(.12,.075,.105),(x*.98,2.68,.65),SILVER)
    cube(f'CornerIntake_{x}',(.30,.12,.32),(x*1.45,2.55,.45),BLACK,(0,0,0),.045)

# Hood vents are inset-looking dark surfaces located on hood, not floating front planes.
for x in (-.48,.48):cube(f'HoodVent_{x}',(.34,.48,.025),(x,1.63,1.125),BLACK,(0,0,math.radians(3 if x>0 else -3)),.01)

# Rear bumper, lamp housings, wing and diffuser.
cube('RearBumper',(2.64,.24,.48),(0,-2.45,.50),RED,(0,0,0),.045)
cube('RearDiffuser',(2.60,.48,.12),(0,-2.48,.16),BLACK,(0,0,0),.015)
for i,x in enumerate([-.82,-.42,0,.42,.82]):cube(f'DiffuserFin{i}',(.055,.44,.31),(x,-2.49,.26),BLACK,(0,0,0),.01)
for x in (-1.03,1.03):
    sphere(f'RearLamp_{x}',(.24,.09,.23),(x,-2.56,.86),RED)
    cube(f'RearLampClear_{x}',(.16,.05,.065),(x,-2.64,.91),WHITE,(0,0,0),.012)
cube('RearPlateRecess',(1.02,.075,.28),(0,-2.59,.53),BLACK,(0,0,0),.04)
cube('WingBlade',(2.58,.52,.09),(0,-2.02,1.94),BLACK,(math.radians(-3),0,0),.02)
for x in (-1.18,1.18):cube(f'WingEnd_{x}',(.12,.49,.43),(x,-2.02,1.82),BLACK,(0,0,0),.02)

# Side identity follows the body shoulder and rocker; no huge rectangles.
for s in (-1,1):
    x=s*1.465
    cube(f'BlackQuarter_{s}',(.028,.92,.30),(x,1.28,.76),BLACK,(0,0,0),.008)
    cube(f'WhiteDoor_{s}',(.030,1.18,.38),(x,-.05,.72),WHITE,(0,0,0),.008)
    cube(f'YellowRocker_{s}',(.032,1.82,.07),(x,-.05,.39),YELLOW,(0,0,0),.008)
    cube(f'BlueSlash_{s}',(.034,.13,.46),(x,.18,.73),BLUE,(0,math.radians(-18),0),.006)

# Interior: simple but real two-person rally cockpit.
for x,role in [(-.42,'Driver'),(.42,'Navigator')]:
    cube(role+'Seat',(.40,.48,.68),(x,-.02,.94),BLACK,(0,0,0),.035)
    sphere(role+'Helmet',(.19,.19,.21),(x,.18,1.48),WHITE)
    cube(role+'Visor',(.25,.055,.075),(x,.355,1.49),GLASS,(0,0,0),.01)
    cube(role+'Torso',(.32,.30,.43),(x,.02,1.17),BLACK,(0,0,0),.03)
    # red harness strips
    harness=material(role+'Harness',(0.70,.01,.015,1),.0,.42)
    cube(role+'HarnessL',(.055,.055,.40),(x-.075,.16,1.19),harness,(0,0,math.radians(-8)),.005)
    cube(role+'HarnessR',(.055,.055,.40),(x+.075,.16,1.19),harness,(0,0,math.radians(8)),.005)
cyl('SteeringWheel',.18,.035,(-.42,.43,1.20),BLACK,(math.pi/2,0,0))
cube('PaceNotes',(.34,.24,.025),(.42,.42,1.07),WHITE,(math.radians(-18),0,0),.008)
for x in (-.84,.84):cube(f'CageLong_{x}',(.05,2.15,.05),(x,-.06,1.48),SILVER,(0,0,0),.006)

# Semantic and proportion validation BEFORE export.
all_mesh=[o for o in bpy.context.scene.objects if o.type=='MESH'];mins=Vector((1e9,1e9,1e9));maxs=Vector((-1e9,-1e9,-1e9))
for o in all_mesh:
    for c in o.bound_box:
        w=o.matrix_world@Vector(c);mins.x=min(mins.x,w.x);mins.y=min(mins.y,w.y);mins.z=min(mins.z,w.z);maxs.x=max(maxs.x,w.x);maxs.y=max(maxs.y,w.y);maxs.z=max(maxs.z,w.z)
dims=(maxs.x-mins.x,maxs.y-mins.y,maxs.z-mins.z)
assert 2.85<dims[0]<3.20,dims
assert 5.05<dims[1]<5.45,dims
assert 1.90<dims[2]<2.15,dims
assert len([o for o in all_mesh if o.name.startswith('Tire_')])==4
for n in ('BodyLower','Greenhouse','HoodSkin','RoofWhite','FrontGrille','RearDiffuser','DriverHelmet','NavigatorHelmet'):assert bpy.data.objects.get(n),n
# Landmark relationships: these catch impossible assembly even if total bounds look okay.
assert bpy.data.objects['RoofWhite'].location.z>1.8
assert bpy.data.objects['FrontGrille'].location.y>2.5
assert bpy.data.objects['RearDiffuser'].location.y<-2.4
assert bpy.data.objects['DriverHelmet'].location.z>1.4 and bpy.data.objects['NavigatorHelmet'].location.z>1.4

# Apply modifiers so browser gets the exact proven geometry.
for o in list(all_mesh):
    bpy.context.view_layer.objects.active=o
    for mod in list(o.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:pass

# Export standard glTF Y-up. No custom browser-axis compensation.
for o in bpy.context.scene.objects:o.select_set(False)
for o in all_mesh:o.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_materials='EXPORT')

# Five canonical orthographic proof renders. Camera and lights are rebuilt per view.
def clear_qa():
    for o in list(bpy.context.scene.objects):
        if o.type in {'CAMERA','LIGHT'}:bpy.data.objects.remove(o,do_unlink=True)

def render_view(name,loc,look,ortho):
    clear_qa();bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;cam.rotation_euler=(Vector(look)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=ortho;bpy.context.scene.camera=cam
    bpy.context.scene.render.engine='BLENDER_EEVEE_NEXT';bpy.context.scene.render.resolution_x=768;bpy.context.scene.render.resolution_y=768;bpy.context.scene.render.resolution_percentage=100;bpy.context.scene.render.image_settings.file_format='PNG';bpy.context.scene.render.filepath=os.path.join(RENDER_DIR,name+'.png');bpy.context.scene.world.color=(.028,.032,.038)
    for loc2,energy,size in [((4,5,7),1350,5.0),((-4,-3,5),750,4.0),((0,0,7),500,3.0)]:
        bpy.ops.object.light_add(type='AREA',location=loc2);bpy.context.object.data.energy=energy;bpy.context.object.data.size=size
    bpy.ops.render.render(write_still=True)

render_view('front',(0,8,1.05),(0,0,1.0),3.7)
render_view('three',(-5.4,6.6,3.0),(0,0,1.0),5.5)
render_view('side',(-8,0,1.05),(0,0,1.0),5.7)
render_view('rear',(0,-8,1.05),(0,0,1.0),3.7)
render_view('top',(0,0,10),(0,0,.65),6.1)

print(json.dumps({'asset':'MICHAEL_V65R_SURFACE_NETWORK','architecture':'lower body + greenhouse + real arch cuts + hardpoint aero/optics + five-view proof','dimensions':[round(v,4) for v in dims],'objects':len(all_mesh),'wheelCount':4,'occupantCount':2,'driverPresent':True,'navigatorPresent':True,'renders':['front','three','side','rear','top'],'out':OUT},indent=2))