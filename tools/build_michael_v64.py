import numpy as np, trimesh, math, json, os
from trimesh.creation import box, cylinder, icosphere
from trimesh.transformations import translation_matrix, rotation_matrix

# MICHAEL V64 CLEAN-SHEET BUILDER
# Authoring convention used below: X = left/right, Y = up, Z = front/rear.
# Our lightweight browser GLB loader consumes raw POSITION accessors and does not
# apply Trimesh's scene-level glTF axis conversion consistently. Therefore the
# complete authored scene is vertex-baked by +90deg around X immediately before
# GLB export. Trimesh's glTF conversion then lands raw browser POSITION data back
# in the renderer's required X-width / Y-up / Z-length frame.
scene=trimesh.Scene()

def mat(name,color,metal=0.0,rough=.5):
    return trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=[*color,1.0], metallicFactor=metal, roughnessFactor=rough)
RED=mat('body_red',(0.56,0.018,0.022),.25,.23);BLACK=mat('carbon_black',(0.008,0.010,0.013),.15,.34);DARK=mat('glass_dark',(0.025,0.035,0.045),.1,.12);WHITE=mat('rally_white',(0.88,0.90,0.91),.15,.24);YELLOW=mat('accent_yellow',(0.96,0.62,0.02),.05,.3);SILVER=mat('lamp_silver',(0.70,0.74,0.78),.45,.18);REDL=mat('lamp_red',(0.72,0.01,0.016),.05,.12);GREY=mat('interior',(0.08,0.09,0.11),.02,.65);SKIN=mat('helmet',(0.78,0.80,0.82),.05,.24);BLUE=mat('livery_blue',(0.08,0.24,0.70),.05,.35)

def add(name,mesh,material,T=None):
    mesh=mesh.copy();mesh.visual.material=material
    if T is not None:mesh.apply_transform(T)
    scene.add_geometry(mesh,node_name=name,geom_name=name);return mesh

def bx(name,ext,center,material,rot=None):
    m=box(extents=ext);T=translation_matrix(center)
    if rot:axis,ang=rot;T=T@rotation_matrix(ang,axis)
    return add(name,m,material,T)

def sph(name,scale,center,material):
    m=icosphere(subdivisions=2,radius=1.0);m.apply_transform(np.diag([scale[0],scale[1],scale[2],1.0]));m.apply_translation(center);return add(name,m,material)

def cyl(name,r,h,center,material,axis='x'):
    m=cylinder(radius=r,height=h,sections=32)
    if axis=='x':m.apply_transform(rotation_matrix(math.pi/2,[0,1,0]))
    elif axis=='y':m.apply_transform(rotation_matrix(math.pi/2,[1,0,0]))
    m.apply_translation(center);return add(name,m,material)

# Primary shell volumes.
sph('body_main',[1.46,.73,2.35],[0,.74,0],RED);sph('nose',[1.42,.52,1.00],[0,.63,2.15],RED);sph('rear_haunch',[1.43,.60,.92],[0,.75,-2.05],RED);sph('roof_shell',[1.04,.44,1.46],[0,1.55,-.25],RED)
bx('rocker',[2.52,.24,3.55],[0,.35,-.10],BLACK);bx('front_splitter',[2.86,.10,.50],[0,.18,2.67],BLACK);bx('rear_lower',[2.65,.18,.44],[0,.22,-2.56],BLACK)
# Wheels and arches.
for sx in (-1,1):
  for z in (-1.62,1.62):
    cyl(f'tire_{sx}_{z}',.54,.36,[sx*1.28,.52,z],BLACK,'x');cyl(f'wheel_{sx}_{z}',.37,.39,[sx*1.28,.52,z],WHITE,'x');sph(f'flare_{sx}_{z}',[.28,.58,.70],[sx*1.39,.67,z],RED)
# Greenhouse.
bx('windshield',[1.82,.72,.05],[0,1.53,1.07],DARK,([1,0,0],-0.34));bx('rear_glass',[1.78,.63,.05],[0,1.51,-1.37],DARK,([1,0,0],0.28))
for sx in (-1,1):bx(f'side_glass_front_{sx}',[.035,.63,1.03],[sx*1.04,1.48,.54],DARK);bx(f'side_glass_rear_{sx}',[.035,.60,.88],[sx*1.04,1.48,-.66],DARK)
# Roof/livery.
bx('white_roof',[1.88,.055,2.18],[0,1.94,-.30],WHITE);bx('roof_scoop',[.64,.18,.56],[0,2.08,.23],WHITE);bx('roof_scoop_red',[.46,.08,.20],[0,2.18,.26],RED);bx('hood_white',[1.12,.035,1.18],[0,1.26,1.72],WHITE,([1,0,0],-0.10))
# Front identity.
for sx in (-1,1):
  bx(f'front_quarter_{sx}',[.36,.045,.78],[sx*.98,1.20,1.72],BLACK,([1,0,0],-0.10));bx(f'hood_vent_{sx}',[.34,.035,.48],[sx*.57,1.38,1.55],BLACK,([1,0,0],-0.10));bx(f'drl_{sx}',[.72,.055,.07],[sx*.72,.94,2.70],WHITE,([0,1,0],sx*-0.09));bx(f'lamp_pod_red_{sx}',[.62,.30,.10],[sx*.93,.67,2.73],RED);bx(f'lamp_housing_{sx}',[.52,.22,.12],[sx*.93,.67,2.78],BLACK);cyl(f'lamp_projector_{sx}',.085,.06,[sx*(.93-.08*sx),.67,2.86],SILVER,'z');bx(f'lamp_rect_{sx}',[.14,.09,.04],[sx*(.93+.11*sx),.67,2.85],SILVER)
bx('grille',[1.86,.44,.10],[0,.39,2.76],BLACK)
for i,x in enumerate(np.linspace(-.72,.72,9)):bx(f'grille_slat_{i}',[.05,.34,.04],[x,.39,2.83],SILVER,([0,0,1],-.22))
# Side identity.
for sx in (-1,1):
  bx(f'side_black_{sx}',[.035,.43,2.45],[sx*1.455,.72,-.22],BLACK);bx(f'side_yellow_{sx}',[.04,.055,2.55],[sx*1.47,.48,-.22],YELLOW);bx(f'side_vent_{sx}',[.05,.54,.34],[sx*1.48,.70,-1.45],BLACK)
  for j,(z,col) in enumerate([(.35,BLUE),(.18,YELLOW),(.01,WHITE)]):bx(f'stripe_{sx}_{j}',[.045,.60,.10],[sx*1.49,.80,z],col)
# Rear identity.
for sx in (-1,1):
  sph(f'rear_lamp_{sx}',[.24,.27,.10],[sx*1.05,.95,-2.53],REDL);bx(f'rear_lamp_clear_{sx}',[.18,.08,.04],[sx*1.05,1.00,-2.64],SILVER);bx(f'rear_corner_opening_{sx}',[.38,.42,.10],[sx*1.05,.40,-2.70],BLACK);bx(f'rear_yellow_{sx}',[.06,.52,.05],[sx*1.28,.44,-2.73],YELLOW)
bx('rear_recess',[1.05,.34,.08],[0,.56,-2.69],BLACK);bx('rear_diffuser',[2.10,.28,.12],[0,.20,-2.78],BLACK)
for i,x in enumerate(np.linspace(-.82,.82,5)):bx(f'diffuser_fin_{i}',[.06,.38,.32],[x,.14,-2.86],BLACK,([1,0,0],0.22))
# Wing.
bx('wing_main',[2.55,.12,.52],[0,1.92,-2.03],BLACK);bx('wing_upper',[2.45,.12,.48],[0,2.05,-2.02],RED)
for sx in (-1,1):bx(f'wing_end_{sx}',[.14,.48,.48],[sx*1.28,1.87,-2.02],BLACK);bx(f'wing_support_{sx}',[.10,.56,.10],[sx*.82,1.56,-1.90],BLACK)
# Driver + navigator.
for x,role in [(-.42,'driver'),(.42,'navigator')]:
  bx(f'{role}_seat',[.42,.68,.46],[x,1.00,-.05],GREY);sph(f'{role}_helmet',[.20,.22,.20],[x,1.52,.18],SKIN);bx(f'{role}_visor',[.27,.075,.08],[x,1.52,.38],DARK);bx(f'{role}_torso',[.34,.46,.30],[x,1.18,.08],GREY);bx(f'{role}_harness_l',[.05,.48,.04],[x-.08,1.20,.24],REDL,([0,0,1],.20));bx(f'{role}_harness_r',[.05,.48,.04],[x+.08,1.20,.24],REDL,([0,0,1],-.20))
cyl('steering',.19,.035,[-.42,1.22,.52],BLACK,'z');bx('pace_notes',[.34,.20,.035],[.42,1.05,.52],WHITE,([1,0,0],-.25))
# Cage.
for sx in (-1,1):bx(f'cage_side_{sx}',[.055,1.22,.055],[sx*.84,1.30,-.10],SILVER);bx(f'cage_diag_{sx}',[.055,.055,2.05],[sx*.84,1.42,-.10],SILVER)
bx('cage_cross',[1.70,.055,.055],[0,1.64,-.78],SILVER)

# Authoring-space sanity: this is the actual intended car before glTF axis baking.
a=np.asarray(scene.bounds,float);dims=a[1]-a[0]
assert 2.8 < dims[0] < 3.3, ('author width',dims.tolist())
assert 2.0 < dims[1] < 2.5, ('author height',dims.tolist())
assert 5.5 < dims[2] < 6.2, ('author length',dims.tolist())
assert dims[2] > dims[0] > dims[1], ('author axis signature',dims.tolist())

# CRITICAL V64 FIX: bake inverse of Trimesh/glTF Y-up conversion into each mesh.
# Rx(+90): (x,y,z)->(x,-z,y). The glTF export's complementary conversion yields
# raw POSITION accessors that our custom browser loader interprets as X/Y/Z correctly.
axis_bake=rotation_matrix(math.pi/2,[1,0,0])
for g in scene.geometry.values():g.apply_transform(axis_bake)

scene.metadata.update({'asset':'MICHAEL_V64_CLEAN_SHEET_AXIS_FIXED','vehicle':'MJX 7303 Citroen C3 WRC personal twin','construction':'clean-sheet mesh; axis-baked for raw WebGL GLB loader','occupants':2,'driver':True,'navigator':True,'author_coordinate_system':'x width, y up, z front','axis_bake':'Rx(+90deg) before glTF export'})
glb=scene.export(file_type='glb')
out=os.environ.get('MICHAEL_V64_OUT','/tmp/michael-v64-clean.glb');open(out,'wb').write(glb)
# Baked-space signature is intentionally X width / Y length / Z height before the
# exporter conversion. This is what proves the compensation was actually applied.
b=np.asarray(scene.bounds,float);bd=b[1]-b[0]
assert 2.8 < bd[0] < 3.3, ('baked width',bd.tolist())
assert 5.5 < bd[1] < 6.2, ('baked longitudinal axis',bd.tolist())
assert 2.0 < bd[2] < 2.5, ('baked vertical axis',bd.tolist())
print(json.dumps({'asset':'MICHAEL_V64_CLEAN_SHEET_AXIS_FIXED','bytes':len(glb),'geometry_count':len(scene.geometry),'faces':sum(len(g.faces) for g in scene.geometry.values()),'vertices':sum(len(g.vertices) for g in scene.geometry.values()),'author_dims':dims.tolist(),'baked_dims':bd.tolist(),'axis_bake':'Rx(+90deg)','out':out},indent=2))