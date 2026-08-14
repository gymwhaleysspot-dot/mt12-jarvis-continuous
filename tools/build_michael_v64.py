import numpy as np, trimesh, math, json, os
from trimesh.creation import box, cylinder, icosphere
from trimesh.transformations import translation_matrix, rotation_matrix

# MICHAEL V64 STAGE 1 — PROVEN BARE SHELL
# Canonical coordinates are authored AND exported directly:
# X = left/right (width), Y = up (height), Z = front/rear (length).
# No scene-axis compensation, no full-car detail stack. Stage 1 must prove the
# shell and four wheels from FRONT / 3-4 / SIDE / REAR / TOP before detail returns.
scene=trimesh.Scene()

def mat(name,color,metal=0.0,rough=.5):
    return trimesh.visual.material.PBRMaterial(name=name,baseColorFactor=[*color,1.0],metallicFactor=metal,roughnessFactor=rough)
RED=mat('body_red',(0.56,0.018,0.022),.22,.24)
BLACK=mat('rubber_black',(0.008,0.010,0.013),0,.72)
DARK=mat('glass_dark',(0.025,0.035,0.045),0,.16)
WHITE=mat('rally_white',(0.88,0.90,0.91),.12,.26)

def add(name,mesh,material,T=None):
    mesh=mesh.copy();mesh.visual.material=material
    if T is not None: mesh.apply_transform(T)
    scene.add_geometry(mesh,node_name=name,geom_name=name)
    return mesh

def bx(name,ext,center,material,rot=None):
    m=box(extents=ext);T=translation_matrix(center)
    if rot:
        axis,ang=rot;T=T@rotation_matrix(ang,axis)
    return add(name,m,material,T)

def sph(name,scale,center,material):
    m=icosphere(subdivisions=2,radius=1.0)
    m.apply_transform(np.diag([scale[0],scale[1],scale[2],1.0]))
    m.apply_translation(center)
    return add(name,m,material)

def cyl(name,r,h,center,material,axis='x'):
    m=cylinder(radius=r,height=h,sections=32)
    if axis=='x': m.apply_transform(rotation_matrix(math.pi/2,[0,1,0]))
    elif axis=='y': m.apply_transform(rotation_matrix(math.pi/2,[1,0,0]))
    m.apply_translation(center)
    return add(name,m,material)

# Bare C3 WRC-like shell: deliberately few coherent volumes.
sph('body_main',[1.38,.62,2.28],[0,.76,0],RED)
sph('nose',[1.34,.45,.92],[0,.62,2.08],RED)
sph('rear_haunch',[1.35,.52,.84],[0,.73,-2.03],RED)
sph('roof_shell',[1.00,.40,1.36],[0,1.48,-.20],RED)
bx('rocker',[2.50,.20,3.48],[0,.34,-.08],BLACK)
bx('front_splitter',[2.72,.08,.40],[0,.17,2.52],BLACK)
bx('rear_lower',[2.55,.15,.36],[0,.21,-2.48],BLACK)

# Four wheels only. Wheel axis is X; wheel centers share one ground height.
for sx in (-1,1):
    for z in (-1.58,1.58):
        cyl(f'tire_{sx}_{z}',.51,.34,[sx*1.24,.51,z],BLACK,'x')
        cyl(f'wheel_{sx}_{z}',.35,.36,[sx*1.24,.51,z],WHITE,'x')
        sph(f'flare_{sx}_{z}',[.24,.54,.64],[sx*1.34,.64,z],RED)

# Greenhouse establishes orientation without interior complexity.
bx('windshield',[1.76,.66,.045],[0,1.47,1.02],DARK,([1,0,0],-0.32))
bx('rear_glass',[1.72,.58,.045],[0,1.46,-1.28],DARK,([1,0,0],0.27))
for sx in (-1,1):
    bx(f'side_glass_front_{sx}',[.03,.57,.94],[sx*.99,1.43,.49],DARK)
    bx(f'side_glass_rear_{sx}',[.03,.55,.80],[sx*.99,1.43,-.61],DARK)

# Stage-1 orientation markers: roof must be above chassis; splitter must be front.
bx('roof_reference',[1.80,.045,1.95],[0,1.87,-.22],WHITE)

# Validate geometry in the exact coordinates exported to GLB.
b=np.asarray(scene.bounds,float);dims=b[1]-b[0]
assert 2.8 < dims[0] < 3.5, ('width',dims.tolist())
assert 1.8 < dims[1] < 2.5, ('height',dims.tolist())
assert 5.0 < dims[2] < 6.5, ('length',dims.tolist())
assert dims[2] > dims[0] > dims[1], ('axis signature',dims.tolist())
# Named landmark checks catch rotation/transposition before publication.
centers={n:np.asarray(g.centroid) for n,g in scene.geometry.items()}
for sx in (-1,1):
    for z in (-1.58,1.58):
        c=centers[f'tire_{sx}_{z}'];assert abs(c[1]-.51)<.03 and np.sign(c[0])==sx and np.sign(c[2])==np.sign(z)
assert centers['roof_reference'][1] > centers['body_main'][1]+.8
assert centers['front_splitter'][2] > 2.2
assert centers['rear_lower'][2] < -2.2

scene.metadata.update({
    'asset':'MICHAEL_V64_STAGE1_BARE_SHELL',
    'vehicle':'MJX 7303 Citroen C3 WRC personal twin',
    'construction':'stage-1 bare shell and wheels',
    'coordinate_system':'X width, Y up, Z front/rear',
    'axis_bake':'NONE',
    'promotion_rule':'all five canonical views must pass before stage 2'
})
glb=scene.export(file_type='glb')
out=os.environ.get('MICHAEL_V64_OUT','/tmp/michael-v64-clean.glb')
open(out,'wb').write(glb)
print(json.dumps({'asset':'MICHAEL_V64_STAGE1_BARE_SHELL','bytes':len(glb),'geometry_count':len(scene.geometry),'faces':sum(len(g.faces) for g in scene.geometry.values()),'vertices':sum(len(g.vertices) for g in scene.geometry.values()),'dims':dims.tolist(),'axis_bake':'NONE','out':out},indent=2))