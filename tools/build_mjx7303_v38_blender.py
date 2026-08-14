#!/usr/bin/env python3
# JARVIS V38 PHYSICAL TWIN — smooth subdivision body skin + detailed running gear layered on V37.
import bpy, math, os, runpy
from mathutils import Vector
OUT=os.environ.get('MJX_V38_OUT','assets/mjx7303/mjx7303-v38.glb')
PRE=os.environ.get('MJX_V38_PREVIEW_DIR','assets/mjx7303/v38-previews')
os.makedirs(os.path.dirname(OUT),exist_ok=True);os.makedirs(PRE,exist_ok=True)
os.environ['MJX_V37_OUT']='/tmp/mjx7303-v37-base.glb';os.environ['MJX_V37_PREVIEW_DIR']='/tmp/mjx7303-v37-previews'
runpy.run_path('tools/build_mjx7303_v37_blender.py',run_name='__v37base__')
S=bpy.context.scene
# Strip previous QA-only studio elements; V38 exports only the vehicle, then creates its own photographic QA stage.
for o in list(bpy.data.objects):
    if o.type in {'CAMERA','LIGHT'} or o.name.startswith('Studio'):
        bpy.data.objects.remove(o,do_unlink=True)
# Remove the coarse primary shell only; keep V37 glass, aero, lights, interior and hardware.
for o in list(bpy.data.objects):
    if 'BODY_SHELL_V36_REFERENCE' in o.name:
        bpy.data.objects.remove(o,do_unlink=True)

def pinput(bsdf,names,val):
    for n in names:
        if n in bsdf.inputs: bsdf.inputs[n].default_value=val;return True
    return False

def mat(name,color,metal=0,rough=.25,coat=.7):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    b=m.node_tree.nodes.get('Principled BSDF');pinput(b,['Base Color'],(*color,1));pinput(b,['Metallic'],metal);pinput(b,['Roughness'],rough);pinput(b,['Coat Weight','Clearcoat'],coat);pinput(b,['Coat Roughness','Clearcoat Roughness'],.045)
    return m
PAINT=mat('V38_Multilayer_Rally_Red',(.58,.012,.016),.18,.105,1.0)
BLACK=mat('V38_Deep_Black',(.004,.005,.007),0,.54,.08)
METAL=mat('V38_Forged_Aluminum',(.62,.66,.72),.90,.12,.32)
DARK=mat('V38_Dark_Alloy',(.035,.041,.048),.78,.21,.18)
RUBBER=mat('V38_Tire_Rubber',(.006,.006,.007),0,.72,.03)
GLASS=mat('V38_Optical_Black_Glass',(.012,.026,.042),0,.035,.98)
# Structured smooth hood skin. Dense enough to carry compound curvature in the live GLB instead of flat CAD panels.
def grid_surface(name,nu,nv,fn,material,subd=1):
    verts=[];faces=[]
    for j in range(nv):
        v=j/(nv-1)
        for i in range(nu):
            u=i/(nu-1)
            verts.append(fn(u,v))
    for j in range(nv-1):
        for i in range(nu-1):
            a=j*nu+i;b=a+1;c=a+nu+1;d=a+nu;faces.append((a,b,c,d))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);S.collection.objects.link(o);o.data.materials.append(material)
    for p in me.polygons:p.use_smooth=True
    if subd:
        md=o.modifiers.new('SubdivisionSurface','SUBSURF');md.subdivision_type='CATMULL_CLARK';md.levels=subd;md.render_levels=subd
    bev=o.modifiers.new('MicroEdgeSoftening','BEVEL');bev.width=.006;bev.segments=2
    return o

def hood(u,v):
    y=-2.98+2.02*v;t=v;w=1.08+.20*math.sin(math.pi*t*.92);x=(u*2-1)*w
    crown=.105*(1-(x/max(w,.01))**2);z=.86+.54*t-.10*t*t+crown+.018*math.cos((u-.5)*math.pi*2)
    return (x,y,z)
grid_surface('BODY_SKIN_V38_SUBD_HOOD',37,31,hood,PAINT,2)

def rear(u,v):
    y=1.05+1.93*v;t=v;w=1.20-.08*t+.05*math.sin(math.pi*t);x=(u*2-1)*w
    crown=.09*(1-(x/max(w,.01))**2);z=1.34-.31*t-.06*t*t+crown
    return (x,y,z)
grid_surface('BODY_SKIN_V38_SUBD_REAR',35,27,rear,PAINT,2)
# Side skins with true wheel openings. This replaces slab sides with continuous convex body curvature.
def side_mesh(side):
    ny,nz=45,23;verts=[];faces=[];valid=[]
    for j in range(nz):
        q=j/(nz-1);z=.30+1.23*q
        for i in range(ny):
            t=i/(ny-1);y=-2.90+5.80*t
            arch=min((y+1.875)**2,(y-1.875)**2)+(z-.54)**2 < .63**2
            x=side*(1.17+.13*math.exp(-((z-.76)/.47)**2)+.035*math.cos(y*.85))
            verts.append((x,y,z));valid.append(not arch)
    for j in range(nz-1):
        for i in range(ny-1):
            a=j*ny+i;b=a+1;c=a+ny+1;d=a+ny
            if valid[a] and valid[b] and valid[c] and valid[d]:faces.append((a,b,c,d) if side>0 else (d,c,b,a))
    me=bpy.data.meshes.new('SideSkinV38Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('BODY_SKIN_V38_SIDE_R' if side>0 else 'BODY_SKIN_V38_SIDE_L',me);S.collection.objects.link(o);o.data.materials.append(PAINT)
    for p in me.polygons:p.use_smooth=True
    md=o.modifiers.new('SubdivisionSurface','SUBSURF');md.levels=1;md.render_levels=1
    return o
side_mesh(-1);side_mesh(1)
# Curved front and rear fascias eliminate the flat vertical billboard effect in head-on views.
def fascia(name,y,front=True):
    def fn(u,v):
        x=(u*2-1)*(1.29-.08*v);z=.30+1.02*v;bulge=.16*(1-(x/1.3)**2)*(1-.35*v);yy=y+(-bulge if front else bulge)
        return (x,yy,z)
    return grid_surface(name,35,23,fn,PAINT,2)
fascia('FrontFascia_V38_PHYSICAL',-3.02,True);fascia('RearFascia_V38_PHYSICAL',3.02,False)
# Wheel-arch lips as upper semicircle tubes, not full CAD rings.
def tube_arc(name,side,cy,cz,r=.625,tube=.025,steps=34,sides=8):
    verts=[];faces=[]
    for i in range(steps):
        a=math.radians(12)+math.radians(156)*i/(steps-1)
        for j in range(sides):
            b=2*math.pi*j/sides
            rr=r+tube*math.cos(b);x=side*(1.292+tube*math.sin(b));y=cy+math.cos(a)*rr;z=cz+math.sin(a)*rr;verts.append((x,y,z))
    for i in range(steps-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides;c=(i+1)*sides+(j+1)%sides;d=(i+1)*sides+j;faces.append((a,b,c,d))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);S.collection.objects.link(o);o.data.materials.append(PAINT)
    for p in me.polygons:p.use_smooth=True
for side in (-1,1):
    for cy in (-1.875,1.875):tube_arc('WheelArchLip_V38',side,cy,.515)
# Wheel barrels, sidewall shoulders and brake calipers add depth from side and 3/4 views.
def tor(name,loc,major,minor,material,rot=(0,math.pi/2,0),majseg=72,minseg=18):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=majseg,minor_segments=minseg,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    return o
def box(name,loc,scale,material,rot=(0,0,0),bev=.01):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
    if bev:md=o.modifiers.new('EdgeRadius','BEVEL');md.width=bev;md.segments=3
    return o
for side in (-1,1):
    for cy in (-1.875,1.875):
        tor('TireShoulder_V38',(side*1.325,cy,.515),.445,.070,RUBBER)
        tor('WheelBarrel_V38',(side*1.343,cy,.515),.305,.036,DARK)
        box('BrakeCaliper_V38',(side*1.385,cy-.13,.515),(.025,.055,.13),PAINT,(0,0,.18*side),.018)
# Layered lamp housings with metallic reflector bowls and optical cover geometry.
for side in (-1,1):
    box('HeadlampHousing_V38',(side*.96,-3.055,.94),(.22,.035,.16),DARK,(0,0,0),.04)
    box('DRLLightGuide_V38',(side*1.02,-3.095,1.06),(.15,.018,.018),METAL,(0,0,side*.10),.012)
    box('TailLampHousing_V38',(side*.98,3.055,.94),(.20,.032,.18),DARK,(0,0,0),.04)
# Physical splitter/diffuser depth and visible undertray.
box('Undertray_V38',(0,.0,.19),(1.20,2.65,.045),BLACK,(0,0,0),.018)
box('FrontSplitter_V38',(0,-3.10,.245),(1.42,.23,.035),BLACK,(0,0,0),.025)
for x in (-.78,-.39,0,.39,.78):box('RearDiffuserFin_V38',(x,2.93,.31),(.035,.30,.14),BLACK,(0,0,0),.012)
# Stable CI identity.
box('PHYSICAL_TWIN_V38_ID',(0,0,-.19),(.01,.01,.01),BLACK,(0,0,0),0)
# Export the live vehicle before QA-only studio geometry is added.
for o in S.objects:o.select_set(o.type=='MESH')
bpy.context.view_layer.objects.active=next((o for o in S.objects if o.type=='MESH'),None)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
# V38 photographic QA: larger neutral studio, soft three-point lighting, 85 mm product lens.
FLOOR=mat('V38_Studio_Neutral',(.055,.060,.068),.05,.22,.20)
box('StudioFloorV38',(0,0,-.12),(6.2,6.6,.06),FLOOR,(0,0,0),.02)
box('StudioBackdropV38',(0,5.4,2.6),(6.2,.05,2.8),FLOOR,(0,0,0),.05)
def area(name,loc,energy,size,color):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=loc;return o
def point(o,target=(0,0,1.0)):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for o in [area('KeyV38',(-4.8,-4.4,6.6),1450,5.4,(1.0,.92,.84)),area('FillV38',(4.9,-1.2,4.5),980,4.4,(.74,.84,1.0)),area('RimV38',(0,4.8,5.8),1300,3.8,(1.0,.72,.58))]:point(o)
S.world.color=(.014,.018,.024);S.render.engine='BLENDER_EEVEE';S.render.resolution_x=1280;S.render.resolution_y=960;S.render.resolution_percentage=100;S.render.image_settings.file_format='PNG';S.render.film_transparent=False
camd=bpy.data.cameras.new('V38_ProductCamera');cam=bpy.data.objects.new('V38_ProductCamera',camd);S.collection.objects.link(cam);S.camera=cam;camd.lens=85
views={'front':((0,-11.7,1.65),(0,-.25,1.00)),'three':((7.2,-9.2,3.15),(0,0,1.00)),'side':((11.8,0,1.65),(0,0,1.00)),'rear':((0,11.8,1.65),(0,.25,1.00)),'top':((5.5,-4.5,12.4),(0,0,.72))}
for name,(loc,target) in views.items():cam.location=loc;point(cam,target);S.render.filepath=os.path.join(PRE,name+'.png');bpy.ops.render.render(write_still=True)
print({'asset':'MJX7303_V38_PHYSICAL_TWIN','out':OUT,'previews':PRE,'body':'SUBDIVISION_COMPOUND_SKIN','camera':'85MM_PRODUCT','liveShader':'JARVIS_PHYSICAL_TWIN_V38'})
