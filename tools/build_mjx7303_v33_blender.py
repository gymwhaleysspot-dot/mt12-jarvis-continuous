#!/usr/bin/env python3
# JARVIS XR V33 — blueprint-grade Blender reconstruction for MJX 7303 / C3 WRC-style shell
# Coordinate system: X width, Y length (front negative), Z up. 1 unit = 100 mm.
# Hard anchors: 632 x 290 x 237 mm, wheelbase 375 mm, track ~265 mm, tire OD ~103 mm.
import bpy, math, os
from mathutils import Vector

OUT=os.environ.get('MJX_V33_OUT','assets/mjx7303/mjx7303-v33.glb')
PRE=os.environ.get('MJX_V33_PREVIEW_DIR','assets/mjx7303/v33-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.color=(0.018,0.022,0.028)

C=bpy.data.collections.new('MJX7303_V33_BLUEPRINT_MASTER');scene.collection.children.link(C)
def own(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    C.objects.link(o); return o

def mat(name,color,metal=0.0,rough=.3,coat=.65,alpha=1.0,emission=None):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,alpha)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    if 'Metallic' in p.inputs:p.inputs['Metallic'].default_value=metal
    if 'Roughness' in p.inputs:p.inputs['Roughness'].default_value=rough
    if 'Coat Weight' in p.inputs:p.inputs['Coat Weight'].default_value=coat
    elif 'Clearcoat' in p.inputs:p.inputs['Clearcoat'].default_value=coat
    if alpha<1:
        if 'Alpha' in p.inputs:p.inputs['Alpha'].default_value=alpha
        m.blend_method='BLEND';m.use_screen_refraction=True;m.show_transparent_back=True
    if emission:
        if 'Emission Color' in p.inputs:p.inputs['Emission Color'].default_value=(*emission,1);p.inputs['Emission Strength'].default_value=3.0
        elif 'Emission' in p.inputs:p.inputs['Emission'].default_value=(*emission,1)
    return m
RED=mat('V33_C3_Rally_Red',(0.48,0.004,0.008),.10,.16,.95)
RED2=mat('V33_Red_Accent',(0.72,0.008,0.010),.06,.18,.9)
WHITE=mat('V33_Roof_White',(.90,.93,.97),.02,.18,.85)
BLACK=mat('V33_Carbon',(.004,.006,.009),.22,.22,.5)
DARK=mat('V33_Deep_Vent',(.0015,.002,.003),.03,.30,.2)
GLASS=mat('V33_Automotive_Glass',(.008,.018,.030),.04,.07,.8,.58)
RUBBER=mat('V33_Tire_Rubber',(.003,.003,.004),0,.62,.05)
ALLOY=mat('V33_Alloy',(.52,.57,.64),.84,.17,.45)
BRAKE=mat('V33_Brake_Disc',(.18,.20,.22),.85,.24,.25)
CALIPER=mat('V33_Caliper',(0.82,.04,.015),.5,.23,.4)
YELLOW=mat('V33_Sill_Yellow',(.98,.55,.01),.05,.21,.55)
LAMP=mat('V33_Headlamp',(.80,.91,1.0),.05,.06,.8,.94,emission=(.72,.86,1.0))
TAIL=mat('V33_TailLamp',(.72,.002,.004),.04,.08,.8,.92,emission=(1,.01,.01))
INTERIOR=mat('V33_Interior',(.008,.010,.013),.03,.50,.1)

L=6.32;WB=3.75;FY=-WB/2;RY=WB/2;TRACK=2.65;TX=TRACK/2;TIRE_R=.515

def box(name,loc,scale,ma,bev=.03,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
    if bev:
        md=o.modifiers.new('Bevel','BEVEL');md.width=bev;md.segments=4
    return o

def cyl(name,loc,r,depth,ma,rot=(0,0,0),verts=80):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot);o=own(bpy.context.object);o.name=name;o.data.materials.append(ma)
    for p in o.data.polygons:p.use_smooth=True
    return o

def torus(name,loc,major,minor,ma,rot=(0,math.pi/2,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=112,minor_segments=28,location=loc,rotation=rot)
    o=own(bpy.context.object);o.name=name;o.data.materials.append(ma)
    for p in o.data.polygons:p.use_smooth=True
    return o

def mesh_obj(name,verts,faces,ma,sub=0,solid=0):
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);C.objects.link(o);o.data.materials.append(ma)
    for p in o.data.polygons:p.use_smooth=True
    if solid:
        s=o.modifiers.new('Solidify','SOLIDIFY');s.thickness=solid;s.offset=-.5
    if sub:
        s=o.modifiers.new('Subdivision','SUBSURF');s.levels=sub;s.render_levels=sub
    return o

def quad(name,pts,ma,solid=.012): return mesh_obj(name,pts,[(0,1,2,3)],ma,0,solid)

# --- Exterior shell ---
# Longitudinal blueprint stations. C3/WRC character comes from a low hood, steep A-pillar,
# tall near-flat roof and comparatively upright hatch, not a coupe roofline.
# y, bodyHalfWidth, shoulderZ, greenhouseHalfWidth, roofZ, hood/upper-deck Z
ST=[
(-3.16,.72,.72,.26,.88,.72),(-3.08,1.02,.78,.34,.94,.78),(-2.94,1.28,.88,.42,1.02,.88),(-2.76,1.42,1.00,.50,1.10,1.00),
(-2.55,1.45,1.12,.58,1.17,1.12),(-2.30,1.46,1.22,.67,1.24,1.22),(FY,1.46,1.30,.73,1.31,1.30),(-1.68,1.44,1.34,.78,1.39,1.34),
(-1.52,1.42,1.38,.87,1.55,1.35),(-1.36,1.40,1.42,.96,1.74,1.35),(-1.18,1.38,1.46,1.04,1.95,1.38),(-.96,1.36,1.49,1.09,2.11,1.42),
(-.70,1.34,1.51,1.11,2.20,1.46),(-.38,1.33,1.53,1.12,2.23,1.49),(0.00,1.33,1.54,1.12,2.24,1.50),(.38,1.33,1.54,1.12,2.24,1.50),
(.72,1.34,1.53,1.11,2.22,1.49),(1.02,1.36,1.51,1.08,2.18,1.47),(1.28,1.39,1.48,1.02,2.09,1.44),(1.50,1.42,1.44,.94,1.96,1.40),
(1.68,1.45,1.39,.86,1.80,1.36),(RY,1.47,1.33,.77,1.63,1.32),(2.10,1.46,1.25,.69,1.51,1.25),(2.34,1.43,1.16,.61,1.41,1.16),
(2.56,1.38,1.06,.53,1.31,1.06),(2.76,1.31,.96,.45,1.21,.96),(2.94,1.18,.86,.38,1.11,.86),(3.08,.96,.78,.32,1.02,.78),(3.16,.72,.73,.28,.97,.73)]
# 40-point perimeter gives control over sill, fender shoulder, belt line, glass and roof crown.
def ring(y,w,sh,gw,rz,deck):
    left=[
      (-w*.62,y,.19),(-w*.82,y,.20),(-w*.96,y,.24),(-w*1.01,y,.34),(-w*1.015,y,.49),(-w*1.01,y,.66),(-w*.995,y,.84),(-w*.975,y,1.02),
      (-w*.94,y,1.18),(-w*.90,y,sh),(-w*.84,y,sh+.08),(-w*.77,y,sh+.13),(-gw*1.13,y,min(rz-.38,sh+.20)),(-gw*1.10,y,rz-.30),(-gw*1.05,y,rz-.22),
      (-gw*.93,y,rz-.14),(-gw*.76,y,rz-.07),(-gw*.55,y,rz-.025),(-gw*.28,y,rz+.010),(0,y,rz+.020)]
    right=[(-x,y,z) for (x,y,z) in reversed(left[:-1])]
    return left+right
N=39;V=[];F=[]
for s in ST:V.extend(ring(*s))
for i in range(len(ST)-1):
    for j in range(N):F.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
F.append(tuple(range(N-1,-1,-1)));q=(len(ST)-1)*N;F.append(tuple(q+j for j in range(N)))
body=mesh_obj('BODY_SHELL_V33_BLUEPRINT',V,F,RED,2,0)
sol=body.modifiers.new('BodyThickness','SOLIDIFY');sol.thickness=.075;sol.offset=-1
# real wheel-arch openings cut through shell
cutters=[]
for y in (FY,RY):
    bpy.ops.mesh.primitive_cylinder_add(vertices=112,radius=.605,depth=3.6,location=(0,y,.515),rotation=(0,math.pi/2,0));c=bpy.context.object;c.name='V33_ARCH_CUT';cutters.append(c)
    md=body.modifiers.new('WheelArch','BOOLEAN');md.operation='DIFFERENCE';md.object=c
bpy.context.view_layer.objects.active=body;body.select_set(True)
for md in list(body.modifiers):
    try:bpy.ops.object.modifier_apply(modifier=md.name)
    except:pass
body.select_set(False)
for c in cutters:bpy.data.objects.remove(c,do_unlink=True)

# fender flare lips and side aero as real separate surfaces
for sx in (-1,1):
    for y in (FY,RY):
        torus('FenderLip_V33',(sx*1.43,y,.515),.528,.032,BLACK)
    box('SideSkirt_V33',(sx*1.445,.00,.30),(.040,1.78,.050),BLACK,.018)
    box('SillStripe_V33',(sx*1.472,.00,.34),(.011,1.62,.018),YELLOW,.004)

# --- Wheels ---
for sx in (-1,1):
    for y in (FY,RY):
        torus('Tire_V33',(sx*TX,y,.515),.404,.111,RUBBER)
        # outer rim barrel and center
        cyl('RimBarrel_V33',(sx*TX,y,.515),.307,.19,ALLOY,(0,math.pi/2,0),96)
        cyl('BrakeDisc_V33',(sx*(TX-.025),y,.515),.214,.030,BRAKE,(0,math.pi/2,0),72)
        cyl('Hub_V33',(sx*(TX+.015),y,.515),.060,.205,RED2,(0,math.pi/2,0),48)
        # five spokes
        for a in range(5):
            ang=math.radians(a*72)
            box('Spoke_V33',(sx*(TX+.105),y+math.sin(ang)*.16,.515+math.cos(ang)*.16),(.016,.035,.17),ALLOY,.012,(ang,0,0))
        # caliper silhouette
        box('Caliper_V33',(sx*(TX-.06),y-.18,.56),(.028,.045,.12),CALIPER,.015)

# --- Greenhouse and interior ---
quad('Windshield_V33',[(-.95,-1.48,1.43),(.95,-1.48,1.43),(.86,-.86,2.12),(-.86,-.86,2.12)],GLASS,.018)
quad('RearGlass_V33',[(-.81,1.08,2.13),(.81,1.08,2.13),(.91,1.78,1.47),(-.91,1.78,1.47)],GLASS,.018)
for sx in (-1,1):
    x=sx*1.215
    quad('FrontDoorGlass_V33'+str(sx),[(x,-1.39,1.43),(x,-.84,2.10),(x,-.08,2.17),(x,-.12,1.43)],GLASS,.014)
    quad('RearDoorGlass_V33'+str(sx),[(x,-.09,1.43),(x,-.03,2.17),(x,.86,2.13),(x,1.45,1.46)],GLASS,.014)
    box('B_Pillar_V33'+str(sx),(x,-.09,1.80),(.025,.045,.36),BLACK,.006)
    box('Mirror_V33'+str(sx),(sx*1.46,-1.14,1.49),(.12,.15,.07),BLACK,.04)
# roof is conformal and narrow, not floating slab
box('RoofPanel_V33',(0,.06,2.225),(.86,.91,.018),WHITE,.10)
box('RoofScoop_V33',(0,-.52,2.285),(.15,.24,.044),WHITE,.04)
# dark cockpit visible through glass
box('Dashboard_V33',(0,-1.05,1.30),(.83,.20,.10),INTERIOR,.05)
for sx in (-1,1):
    box('Seat_V33'+str(sx),(sx*.47,.15,1.05),(.22,.30,.36),INTERIOR,.08)
# simple steering wheel / roll cage cues
cyl('SteeringWheel_V33',(-.47,-.83,1.45),.16,.035,INTERIOR,(math.pi/2,0,0),64)
for sx in (-1,1):
    box('RollA_V33'+str(sx),(sx*.84,-.70,1.71),(.025,.025,.48),ALLOY,.008,(0,math.radians(-18*sx),0))
    box('RollB_V33'+str(sx),(sx*.87,.72,1.72),(.025,.025,.48),ALLOY,.008,(0,math.radians(14*sx),0))

# --- Front fascia ---
box('FrontSplitter_V33',(0,-3.10,.245),(1.32,.14,.035),BLACK,.025)
# bumper mouth/grille stack
box('FrontMouth_V33',(0,-3.075,.50),(.67,.030,.18),DARK,.035)
box('UpperGrille_V33',(0,-3.072,.74),(.53,.025,.060),DARK,.025)
# Citroen-style double chevron
for z in (.88,.98):
    box('ChevronL_V33',(-.17,-3.085,z),(.28,.018,.018),ALLOY,.010,(0,0,math.radians(13)))
    box('ChevronR_V33',(.17,-3.085,z),(.28,.018,.018),ALLOY,.010,(0,0,math.radians(-13)))
for sx in (-1,1):
    box('DRL_V33'+str(sx),(sx*.83,-3.075,1.03),(.26,.026,.030),LAMP,.022,(0,0,math.radians(-7*sx)))
    box('MainLamp_V33'+str(sx),(sx*.98,-3.066,.79),(.19,.030,.115),LAMP,.055)
    box('CornerIntake_V33'+str(sx),(sx*1.20,-3.015,.53),(.13,.034,.17),DARK,.025)
    box('Canard_V33'+str(sx),(sx*1.31,-2.88,.40),(.14,.12,.020),BLACK,.012,(0,0,math.radians(13*sx)))
# hood crease lines
for sx in (-1,1):
    box('HoodCrease_V33'+str(sx),(sx*.56,-2.16,1.28),(.010,.60,.010),BLACK,.002,(0,0,math.radians(-4*sx)))

# --- Rear fascia + WRC wing ---
box('RearDiffuser_V33',(0,3.08,.28),(.95,.15,.072),BLACK,.025)
box('RearLowerBlack_V33',(0,3.05,.52),(.66,.030,.10),DARK,.025)
for sx in (-1,1):
    box('TailLamp_V33'+str(sx),(sx*.90,3.025,1.08),(.20,.030,.15),TAIL,.055)
    box('RearVent_V33'+str(sx),(sx*1.18,3.00,.51),(.12,.035,.15),DARK,.025)
box('RearWingMain_V33',(0,2.52,2.04),(1.12,.20,.035),BLACK,.035,(math.radians(-5),0,0))
box('RearWingUpper_V33',(0,2.44,2.13),(1.00,.12,.018),BLACK,.025,(math.radians(-9),0,0))
for sx in (-1,1):
    box('WingMount_V33'+str(sx),(sx*.72,2.29,1.83),(.035,.065,.20),BLACK,.012)
    box('WingEndplate_V33'+str(sx),(sx*1.14,2.50,2.04),(.025,.22,.16),BLACK,.018)
# rear hatch seam / center badge cue
box('HatchSeam_V33',(0,2.96,1.38),(.72,.012,.010),BLACK,.003)

# --- livery and panel-scale details ---
# white/red/black blocks kept extremely thin above body to create real RC-car visual scale
for sx in (-1,1):
    box('DoorSlashWhite_V33'+str(sx),(sx*1.438,.18,1.04),(.014,.58,.075),WHITE,.004,(0,0,math.radians(10*sx)))
    box('DoorSlashBlack_V33'+str(sx),(sx*1.446,.38,.90),(.012,.45,.055),BLACK,.004,(0,0,math.radians(-10*sx)))
    box('DoorSeam_V33'+str(sx),(sx*1.420,-.12,1.04),(.010,.020,.58),BLACK,.002)
# undertray below body only
box('Undertray_V33',(0,.00,.185),(.99,2.05,.025),BLACK,.012)

# Apply modifiers before export
for o in list(C.objects):
    if o.type!='MESH': continue
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    for md in list(o.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=md.name)
        except:pass
    o.select_set(False)

# --- Studio preview scene ---
# ground plane and large soft lights are preview-only and excluded from GLB export
bpy.ops.mesh.primitive_plane_add(size=30,location=(0,0,.02));ground=bpy.context.object;ground.name='__PREVIEW_GROUND';ground.data.materials.append(mat('StudioFloor',(.035,.040,.045),.05,.34,.2))
# soft key/fill/rim lights
for name,loc,energy,size in [
 ('Key',(-5,-5,7),1600,5.0),('Fill',(5,-2,4),900,4.0),('Rim',(0,5,5),1300,4.0),('Top',(0,0,8),1000,3.0)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.size=size;obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc
    direction=Vector((0,0,1.0))-obj.location;obj.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
# camera helper
camdata=bpy.data.cameras.new('PreviewCamera');cam=bpy.data.objects.new('PreviewCamera',camdata);scene.collection.objects.link(cam);scene.camera=cam;camdata.lens=58

def point_camera(pos,target=(0,0,1.0),lens=58):
    cam.location=pos;cam.data.lens=lens;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
views={
 'front':((0,-7.8,1.35),(0,-.35,1.05),62),
 'three':((5.3,-6.5,3.2),(0,0,1.05),58),
 'side':((7.2,0,1.45),(0,0,1.10),70),
 'rear':((0,7.8,1.42),(0,.35,1.10),62),
 'top':((0,-.25,9.3),(0,0,.75),58)}
for name,(pos,tgt,lens) in views.items():
    point_camera(pos,tgt,lens);scene.render.filepath=os.path.join(PRE,name+'.png');bpy.ops.render.render(write_still=True)
# remove preview-only objects before GLB export
for o in list(scene.objects):
    if o.name.startswith('__PREVIEW_') or o.name in {'PreviewCamera','Key','Fill','Rim','Top'}:bpy.data.objects.remove(o,do_unlink=True)
# select master collection only
bpy.ops.object.select_all(action='DESELECT')
for o in C.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT',export_yup=True,export_cameras=False,export_lights=False)
print('MJX7303 V33 BLUEPRINT MASTER',OUT,os.path.getsize(OUT),'previews',PRE)
