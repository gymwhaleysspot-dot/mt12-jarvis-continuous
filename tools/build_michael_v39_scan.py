#!/usr/bin/env python3
"""MICHAEL V39 photo-scan mesher.
Builds a watertight MJX 7303 visual hull from orthographic-ish product photos instead of hand-drawn CAD surfaces.
The references are downloaded transiently during CI and are not committed to the repository.
Inspired by the visual-hull / multi-view reconstruction approach used by COLMAP, OpenMVS and AliceVision pipelines,
but deliberately uses silhouette carving because clean catalog views are more reliable for this object than sparse SfM.
"""
from pathlib import Path
from collections import deque
import json, os, urllib.request
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure, morphology, transform

OUT=Path(os.environ.get('MICHAEL_V39_SCAN_OUT','/tmp/michael-v39-scan.obj'))
META=Path(os.environ.get('MICHAEL_V39_SCAN_META','/tmp/michael-v39-scan.json'))
TMP=Path(os.environ.get('MICHAEL_V39_REF_DIR','/tmp/michael-v39-refs'));TMP.mkdir(parents=True,exist_ok=True)
# Exact 7303 product references. Side is cropped from the lower half of a two-view catalog image.
REFS={
 'front':('https://mediaupload.toemen.nl/2025/09/hyper-go-7303-1-7-citroen-c3-wrc-4wd-mx-7303-pic3_0028-1024x1024.jpg',(0,0,1,1)),
 'top':('https://shop.robitronic.com/media/image/33/a8/bd/hyper-go-7303-1-7-citroen-c3-wrc-4wd-mx-7303-pic2_0028.jpg',(0,0,1,1)),
 'side':('https://hobbysquare.com.sg/cdn/shop/files/MJX_7303_RC_Car_RC_Buggy_Citroen_Offroad_Buggy-12_grande.jpg?v=1755769040',(0,.47,1,1)),
 'three':('https://www.abx-rc.at/media/image/c3/b5/0d/MX-7303_600x600%402x.jpg',(0,0,1,1)),
}
# Physical shell envelope, millimetres. Wheelbase/tire dimensions are used to carve real wheel openings.
L,W,H=632.0,290.0,237.0
WB,TIRE=375.0,103.0
NX,NY,NZ=192,96,78  # length, width, height; ~1.4M voxels before carving

def download(name,url):
    p=TMP/f'{name}.jpg'
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 MICHAEL-V39-Reconstruction'})
    with urllib.request.urlopen(req,timeout=40) as r:p.write_bytes(r.read())
    if p.stat().st_size<8000:raise RuntimeError(f'{name} reference too small')
    return p

def border_background(rgb,tol=246):
    # Flood-fill only near-white pixels connected to the image edge. White livery enclosed by the car outline stays foreground.
    white=np.all(rgb>=tol,axis=2)
    h,w=white.shape;seen=np.zeros_like(white,bool);q=deque()
    for x in range(w):
        if white[0,x]:seen[0,x]=1;q.append((0,x))
        if white[h-1,x]:seen[h-1,x]=1;q.append((h-1,x))
    for y in range(h):
        if white[y,0]:seen[y,0]=1;q.append((y,0))
        if white[y,w-1]:seen[y,w-1]=1;q.append((y,w-1))
    while q:
        y,x=q.popleft()
        for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0<=yy<h and 0<=xx<w and white[yy,xx] and not seen[yy,xx]:seen[yy,xx]=1;q.append((yy,xx))
    return seen

def mask_for(name,path,crop):
    im=Image.open(path).convert('RGB');w,h=im.size
    x0,y0,x1,y1=crop;im=im.crop((int(x0*w),int(y0*h),int(x1*w),int(y1*h)))
    a=np.asarray(im)
    fg=~border_background(a)
    fg=morphology.binary_closing(fg,morphology.disk(4));fg=ndimage.binary_fill_holes(fg)
    fg=morphology.remove_small_objects(fg,min_size=max(200,fg.size//1500))
    ys,xs=np.nonzero(fg)
    if len(xs)<500:raise RuntimeError(f'{name} segmentation failed')
    pad=max(3,int(.012*max(fg.shape)));y0=max(0,ys.min()-pad);y1=min(fg.shape[0],ys.max()+pad+1);x0=max(0,xs.min()-pad);x1=min(fg.shape[1],xs.max()+pad+1)
    return fg[y0:y1,x0:x1]

def resize_bool(m,shape):
    return transform.resize(m.astype(np.float32),shape,order=1,anti_aliasing=True,preserve_range=True)>.42

def carve_wheel_openings(side):
    # Coordinates on resized side mask: horizontal = vehicle length, vertical = height, origin image top-left.
    h,w=side.shape
    x=np.arange(w)[None,:];y=np.arange(h)[:,None]
    z_mm=(1-y/(h-1))*H
    s_mm=(x/(w-1)-.5)*L
    for c in (-WB/2,WB/2):
        hole=(s_mm-c)**2+(z_mm-TIRE/2)**2<(TIRE*.56)**2
        side[hole]=False
    return side

def export_obj(path,verts,faces):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('w') as f:
        f.write('# MICHAEL V39 scanned visual hull\n')
        for x,y,z in verts:f.write(f'v {x:.7f} {y:.7f} {z:.7f}\n')
        for a,b,c in faces+1:f.write(f'f {a} {b} {c}\n')

paths={k:download(k,u) for k,(u,_) in REFS.items()}
masks={k:mask_for(k,paths[k],REFS[k][1]) for k in ('front','top','side','three')}
side=carve_wheel_openings(resize_bool(masks['side'],(NZ,NX)))
front=resize_bool(masks['front'],(NZ,NY))
top=resize_bool(masks['top'],(NY,NX))
# Conservative silhouette dilation keeps thin fender/wing features from disappearing after intersection.
side=morphology.binary_dilation(side,morphology.disk(1));front=morphology.binary_dilation(front,morphology.disk(1));top=morphology.binary_dilation(top,morphology.disk(1))
vol=side[:,None,:] & front[:,:,None] & top[None,:,:]
vol=ndimage.binary_closing(vol,structure=np.ones((3,3,3)),iterations=2)
vol=ndimage.binary_fill_holes(vol)
# Keep only the dominant connected solid.
lab,n=ndimage.label(vol)
if n:
    counts=np.bincount(lab.ravel());counts[0]=0;vol=lab==counts.argmax()
if vol.sum()<25000:raise RuntimeError(f'visual hull too small: {int(vol.sum())} voxels')
verts,faces,normals,_=measure.marching_cubes(vol.astype(np.float32),.5,allow_degenerate=False)
# marching_cubes axes are z,width,length. Convert to Jarvis x(width), y(length), z(height), front negative Y.
z=verts[:,0]/(NZ-1)*H/100.0
x=(verts[:,1]/(NY-1)-.5)*W/100.0
y=(verts[:,2]/(NX-1)-.5)*L/100.0
v=np.column_stack((x,y,z))
export_obj(OUT,v,faces.astype(np.int64))
meta={'id':'MICHAEL_V39_PHOTO_SCAN','dimensionsMM':{'length':L,'width':W,'height':H,'wheelbase':WB,'tire':TIRE},'grid':[NX,NY,NZ],'occupiedVoxels':int(vol.sum()),'vertices':int(len(v)),'faces':int(len(faces)),'sources':{k:u for k,(u,_) in REFS.items()},'method':'MULTIVIEW_SILHOUETTE_VISUAL_HULL_MARCHING_CUBES','referencesTransient':True}
META.parent.mkdir(parents=True,exist_ok=True);META.write_text(json.dumps(meta,indent=2))
print(meta)
