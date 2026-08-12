import bpy, math, json, os
from mathutils import Vector

# MICHAEL V65 GEOMETRY LAB
# New architecture: a continuous parametric surface built from measured cross-sections,
# not stacked spheres/boxes. Blender is used only as a deterministic mesh compiler.

OUT=os.environ.get('MICHAEL_V65_OUT','/tmp/michael-v65.glb')
RENDER_DIR=os.environ.get('MICHAEL_V65_RENDERS','/tmp/michael-v65-renders')
os.makedirs(RENDER_DIR,exist_ok=True)

# Blender authoring coordinates: X width, Y front(+)/rear(-), Z up.
# Stations are (Y, half_width, sill_z, belt_z, shoulder_z, roof_half_width, roof_z).
STATIONS=[
 ( 2.52,.96,.26,.62,.88,.00,.00),
 ( 2.30,1.27,.25,.65,.95,.00,.00),
 ( 1.85,1.39,.25,.72,1.03,.54,1.28),
 ( 1.30,1.43,.25,.78,1.08,.83,1.58),
 ( 0.65,1.44,.25,.82,1.10,.98,1.78),
 ( 0.00,1.43,.25,.83,1.11,1.02,1.84),
 (-0.70,1.42,.25,.82,1.10,.99,1.80),
 (-1.35,1.39,.25,.78,1.07,.84,1.61),
 (-1.95,1.36,.25,.70,.98,.55,1.29),
 (-2.38,1.27,.24,.62,.88,.00,.00),
 (-2.55,.96,.23,.55,.78,.00,.00),
]

# Per station cross section from left to right. This produces a coherent shell with a
# center roof crown and side break lines rather than independent primitives.
def section(y,hw,sill,belt,shoulder,rhw,roof):
    pts=[]
    # lower/side/belt/shoulder profile, left half
    pts += [(-hw,sill),(-hw*1.01,sill+.22),(-hw,.belt if False else belt),(-hw*.94,shoulder)]
    if rhw>0:
        pts += [(-rhw,roof-.10),(0,roof)]
    else:
        pts += [(-hw*.58,shoulder+.04),(0,shoulder+.07)]
    # mirror right excluding center point
    right=[(-x,z) for x,z in pts[-2::-1]]
    return [(x,y,z) for x,z in pts+right]

def loft(name,stations,mat):
    loops=[section(*s) for s in stations]
    n=len(loops[0]);verts=[p for loop in loops for p in loop];faces=[]
    for j in range(len(loops)-1):
        a=j*n;b=(j+1)*n
        for i in range(n):
            k=(i+1)%n;faces.append((a+i,a+k,b+k,b+i))
    # caps
    faces.append(tuple(range(n-1,-1,-1)))
    end=(len(loops)-1)*n;faces.append(tuple(end+i for i in range(n)))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    bev=ob.modifiers.new('micro_bevel','BEVEL');bev.width=.018;bev.segments=2
    return ob

def mat(name,rgba,metal=.0,rough=.45):
    m=bpy.data.materials.new(name);m.diffuse_color=rgba;m.metallic=metal;m.roughness=rough;return m
RED=mat('C3 Red',(0.52,.008,.012,1),.28,.22);BLACK=mat('Carbon',(0.008,.010,.014,1),.15,.3);GLASS=mat('Glass',(0.018,.025,.034,1),.05,.1);WHITE=mat('Rally White',(.88,.90,.92,1),.1,.26);SILVER=mat('Lamp Silver',(.72,.78,.84,1),.55,.16);YELLOW=mat('Yellow',(.98,.62,.01,1),.05,.28);BLUE=mat('Blue',(.06,.22,.68,1),.05,.3)

# Clean scene.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
body=loft('BodySurface',STATIONS,RED)

# Helpers.
def cube(name,scale,loc,material,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);return o

def cyl(name,r,depth,loc,material,rot=(0,math.pi/2,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material);return o

def uv(name,scale,loc,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);return o

# Four wheels: fixed wheelbase/track, independent of body skin.
for x in (-1.25,1.25):
    for y in (-1.58,1.58):
        cyl(f'Tire_{x}_{y}',.515,.34,(x,y,.515),BLACK)
        cyl(f'Wheel_{x}_{y}',.355,.355,(x,y,.515),WHITE)

# Glass fitted to greenhouse, thin and continuous-looking.
cube('Windshield',(1.82,.035,.70),(0,.98,1.46),GLASS,(math.radians(20),0,0))
cube('RearGlass',(1.74,.035,.60),(0,-1.24,1.46),GLASS,(math.radians(-17),0,0))
for x in (-1.015,1.015):
    cube(f'SideGlassFront{x}',(.025,1.00,.56),(x,.45,1.46),GLASS)
    cube(f'SideGlassRear{x}',(.025,.83,.54),(x,-.65,1.44),GLASS)

# WRC stance elements, all aligned to the same body coordinate system.
cube('FrontSplitter',(2.78,.46,.08),(0,2.48,.16),BLACK)
cube('RearDiffuser',(2.60,.38,.13),(0,-2.48,.18),BLACK)
cube('WingBlade',(2.55,.50,.10),(0,-2.08,1.92),BLACK)
for x in (-1.16,1.16):cube(f'WingEnd{x}',(.12,.48,.45),(x,-2.08,1.83),BLACK)

# C3 front identity: DRL eyebrow + lower projector, not two generic rectangles.
for x in (-.72,.72):
    cube(f'DRL{x}',(.58,.045,.055),(x,2.49,.94),WHITE,(0,0,math.radians(-6 if x>0 else 6)))
    uv(f'Projector{x}',(.13,.06,.11),(x*.98,2.53,.67),SILVER)
    cube(f'LampPocket{x}',(.46,.10,.23),(x*.98,2.48,.67),BLACK)
cube('FrontGrille',(1.78,.10,.43),(0,2.51,.39),BLACK)
for i,x in enumerate([-.70,-.52,-.34,-.16,.02,.20,.38,.56,.74]):cube(f'GrilleSlat{i}',(.045,.035,.34),(x,2.57,.39),SILVER,(0,math.radians(12),0))

# Rear lamps and recess.
for x in (-1.02,1.02):
    uv(f'RearLamp{x}',(.23,.08,.22),(x,-2.50,.86),RED)
    cube(f'RearClear{x}',(.17,.04,.06),(x,-2.57,.91),WHITE)
cube('RearPlateRecess',(1.02,.06,.30),(0,-2.55,.52),BLACK)

# Livery as fitted raised cards for now; geometry lab will later bake UVs.
for side in (-1,1):
    x=side*1.435
    cube(f'SideCard{side}',(.025,1.88,.44),(x,-.08,.72),WHITE)
    cube(f'BlueStripe{side}',(.03,.11,.52),(x,.24,.75),BLUE,(0,math.radians(-18),0))
    cube(f'YellowStripe{side}',(.03,.11,.52),(x,.06,.75),YELLOW,(0,math.radians(-18),0))

# Real cockpit silhouettes: seats, driver, navigator, wheel, cage.
for x,role in [(-.42,'Driver'),(.42,'Navigator')]:
    cube(role+'Seat',(.40,.46,.67),(x,-.03,.96),BLACK)
    uv(role+'Helmet',(.19,.19,.21),(x,.16,1.47),WHITE)
    cube(role+'Visor',(.25,.055,.075),(x,.335,1.48),GLASS)
    cube(role+'Torso',(.33,.30,.44),(x,.02,1.17),BLACK)
cyl('SteeringWheel',.18,.035,(-.42,.42,1.20),BLACK,(math.pi/2,0,0))
cube('PaceNotes',(.34,.24,.025),(.42,.40,1.05),WHITE,(math.radians(-18),0,0))
for x in (-.83,.83):
    cube(f'CageRail{x}',(.055,2.0,.055),(x,-.10,1.47),SILVER)

# Ground reference omitted from export.
# Canonical dimensions and semantic checks.
all_mesh=[o for o in bpy.context.scene.objects if o.type=='MESH']
mins=Vector((1e9,1e9,1e9));maxs=Vector((-1e9,-1e9,-1e9))
for o in all_mesh:
    for c in o.bound_box:
        w=o.matrix_world@Vector(c)
        mins.x=min(mins.x,w.x);mins.y=min(mins.y,w.y);mins.z=min(mins.z,w.z)
        maxs.x=max(maxs.x,w.x);maxs.y=max(maxs.y,w.y);maxs.z=max(maxs.z,w.z)
dims=(maxs.x-mins.x,maxs.y-mins.y,maxs.z-mins.z)
assert 2.8<dims[0]<3.3,dims
assert 5.0<dims[1]<5.5,dims
assert 1.8<dims[2]<2.2,dims
assert len([o for o in all_mesh if o.name.startswith('Tire_')])==4
assert bpy.data.objects.get('DriverHelmet') and bpy.data.objects.get('NavigatorHelmet')

# Export actual model.
for o in all_mesh:o.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_materials='EXPORT')

# Five-view orthographic QA renders generated from the exact exported geometry source.
def render_view(name,loc,look,ortho):
    bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;cam.name='QA_'+name
    direction=Vector(look)-cam.location;cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=ortho
    bpy.context.scene.camera=cam;bpy.context.scene.render.resolution_x=768;bpy.context.scene.render.resolution_y=768;bpy.context.scene.render.resolution_percentage=100
    bpy.context.scene.render.image_settings.file_format='PNG';bpy.context.scene.render.filepath=os.path.join(RENDER_DIR,name+'.png')
    bpy.context.scene.world.color=(.035,.04,.05);bpy.context.scene.render.film_transparent=False
    bpy.ops.object.light_add(type='AREA',location=(4,4,7));bpy.context.object.data.energy=1200;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=5
    bpy.ops.object.light_add(type='AREA',location=(-4,-3,4));bpy.context.object.data.energy=700;bpy.context.object.data.size=4
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam,do_unlink=True)

render_view('front',(0,8,1.15),(0,0,1.0),3.8)
render_view('three',(-5.2,6.5,3.0),(0,0,1.0),5.4)
render_view('side',(-8,0,1.2),(0,0,1.0),5.8)
render_view('rear',(0,-8,1.15),(0,0,1.0),3.8)
render_view('top',(0,0,10),(0,0,.6),6.2)

report={'asset':'MICHAEL_V65_PARAMETRIC_SURFACE','architecture':'continuous cross-section loft + semantic hardpoints + five-view render gate','dimensions':[round(v,4) for v in dims],'objects':len(all_mesh),'wheelCount':4,'occupantCount':2,'driverPresent':True,'navigatorPresent':True,'renders':['front','three','side','rear','top'],'out':OUT}
print(json.dumps(report,indent=2))
