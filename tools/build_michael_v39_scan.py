#!/usr/bin/env python3
"""MICHAEL V39 deterministic multi-view visual-hull mesher.
Uses repository-local reference photos when available. CI never depends on third-party image URLs.
If references are missing, deterministic synthetic silhouettes are generated only as a build-safe fallback and metadata marks that fact.
"""
from pathlib import Path
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure, morphology, transform

OUT=Path(os.environ.get('MICHAEL_V39_SCAN_OUT','/tmp/michael-v39-scan.obj'))
META=Path(os.environ.get('MICHAEL_V39_SCAN_META','/tmp/michael-v39-scan.json'))
REFDIR=Path(os.environ.get('MICHAEL_V39_REF_DIR','assets/mjx7303/michael-v39-refs'))
REFDIR.mkdir(parents=True,exist_ok=True)
L,W,H=632.0,290.0,237.0
WB,TIRE=375.0,103.0
NX,NY,NZ=192,96,78
CANDIDATES={
 'front':['front.png','front.jpg','front.jpeg','mjx7303-front.png','mjx7303-front.jpg'],
 'rear':['rear.png','rear.jpg','rear.jpeg','mjx7303-rear.png','mjx7303-rear.jpg'],
 'side':['side.png','side.jpg','side.jpeg','mjx7303-side.png','mjx7303-side.jpg'],
 'top':['top.png','top.jpg','top.jpeg','mjx7303-top.png','mjx7303-top.jpg'],
}

def existing(names):
    for n in names:
        p=REFDIR/n
        if p.exists() and p.stat().st_size>1024:return p
    return None

def generated_reference(kind,size=1400):
    a=np.full((size,size,3),255,np.uint8);yy,xx=np.ogrid[:size,:size]
    if kind in ('front','rear'):
        cx,cy,rw,rh=size*.5,size*.55,size*.345,size*.235
        body=((xx-cx)/rw)**2+((yy-cy)/rh)**2<=1
        a[body]=[164,18,24]
        for sx in (-1,1):
            wx,wy,wr=cx+sx*rw*.79,cy+rh*.35,size*.061
            a[(xx-wx)**2+(yy-wy)**2<=wr**2]=[18,18,20]
    elif kind=='side':
        body=(xx>=size*.13)&(xx<=size*.87)&(yy>=size*.45)&(yy<=size*.68)
        roof=((xx-size*.51)/(size*.255))**2+((yy-size*.445)/(size*.125))**2<=1
        a[body|roof]=[164,18,24]
        for wx in (size*.30,size*.70):
            wr,wy=size*.078,size*.69
            a[(xx-wx)**2+(yy-wy)**2<=wr**2]=[18,18,20]
    else:
        cx,cy,rw,rh=size*.5,size*.52,size*.23,size*.395
        a[((xx-cx)/rw)**2+((yy-cy)/rh)**2<=1]=[164,18,24]
    p=REFDIR/f'_generated_{kind}.png';Image.fromarray(a).save(p);return p

def resolve():
    refs={};fallback=[]
    for k,names in CANDIDATES.items():
        p=existing(names)
        if p is None:p=generated_reference(k);fallback.append(k)
        refs[k]=p
    return refs,fallback

def mask_for(path):
    rgb=np.asarray(Image.open(path).convert('RGB'))
    lum=rgb.mean(2);spread=rgb.max(2)-rgb.min(2)
    fg=(lum<238)|((spread>18)&(lum<251))
    fg=morphology.binary_closing(fg,morphology.disk(4));fg=ndimage.binary_fill_holes(fg)
    fg=morphology.remove_small_objects(fg,min_size=max(200,fg.size//1500))
    lab,n=ndimage.label(fg)
    if n:
        counts=np.bincount(lab.ravel());counts[0]=0;fg=lab==counts.argmax()
    ys,xs=np.nonzero(fg)
    if len(xs)<500:raise RuntimeError(f'reference segmentation failed: {path}')
    pad=max(3,int(.012*max(fg.shape)));y0=max(0,ys.min()-pad);y1=min(fg.shape[0],ys.max()+pad+1);x0=max(0,xs.min()-pad);x1=min(fg.shape[1],xs.max()+pad+1)
    return fg[y0:y1,x0:x1]

def resize_bool(m,shape):return transform.resize(m.astype(np.float32),shape,order=1,anti_aliasing=True,preserve_range=True)>.42

def carve_wheels(side):
    h,w=side.shape;x=np.arange(w)[None,:];y=np.arange(h)[:,None];zmm=(1-y/(h-1))*H;smm=(x/(w-1)-.5)*L
    for c in (-WB/2,WB/2):side[(smm-c)**2+(zmm-TIRE/2)**2<(TIRE*.56)**2]=False
    return side

def export_obj(path,verts,faces):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('w') as f:
        f.write('# MICHAEL V39 deterministic visual hull\n')
        for x,y,z in verts:f.write(f'v {x:.7f} {y:.7f} {z:.7f}\n')
        for a,b,c in faces+1:f.write(f'f {a} {b} {c}\n')

paths,fallback=resolve();masks={k:mask_for(p) for k,p in paths.items()}
side=carve_wheels(resize_bool(masks['side'],(NZ,NX)))
front=resize_bool(masks['front'],(NZ,NY));rear=resize_bool(masks['rear'],(NZ,NY));top=resize_bool(masks['top'],(NY,NX))
side=morphology.binary_dilation(side,morphology.disk(1));front=morphology.binary_dilation(front,morphology.disk(1));rear=morphology.binary_dilation(rear,morphology.disk(1));top=morphology.binary_dilation(top,morphology.disk(1))
vol=side[:,None,:]&front[:,:,None]&rear[:,::-1,None]&top[None,:,:]
vol=ndimage.binary_closing(vol,structure=np.ones((3,3,3)),iterations=2);vol=ndimage.binary_fill_holes(vol)
lab,n=ndimage.label(vol)
if n:
    counts=np.bincount(lab.ravel());counts[0]=0;vol=lab==counts.argmax()
if vol.sum()<25000:
    vol=side[:,None,:]&front[:,:,None]&top[None,:,:]
    vol=ndimage.binary_closing(vol,structure=np.ones((3,3,3)),iterations=2);vol=ndimage.binary_fill_holes(vol)
if vol.sum()<25000:raise RuntimeError(f'visual hull too small: {int(vol.sum())} voxels')
verts,faces,_,_=measure.marching_cubes(vol.astype(np.float32),.5,allow_degenerate=False)
z=verts[:,0]/(NZ-1)*H/100.0;x=(verts[:,1]/(NY-1)-.5)*W/100.0;y=(verts[:,2]/(NX-1)-.5)*L/100.0
v=np.column_stack((x,y,z));export_obj(OUT,v,faces.astype(np.int64))
meta={'id':'MICHAEL_V39_PHOTO_SCAN','dimensionsMM':{'length':L,'width':W,'height':H,'wheelbase':WB,'tire':TIRE},'grid':[NX,NY,NZ],'occupiedVoxels':int(vol.sum()),'vertices':int(len(v)),'faces':int(len(faces)),'sources':{k:str(p) for k,p in paths.items()},'method':'MULTIVIEW_SILHOUETTE_VISUAL_HULL_MARCHING_CUBES','referencesTransient':False,'deterministicLocalRefs':True,'fallbackViews':fallback}
META.parent.mkdir(parents=True,exist_ok=True);META.write_text(json.dumps(meta,indent=2));print(meta)
