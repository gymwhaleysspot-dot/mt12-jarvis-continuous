#!/usr/bin/env python3
import json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps

OWNER_FILES=[f"IMG_{n}.jpeg" for n in range(4328,4336)]
VIEWS=["front","three","side","rear","top"]

def load_rgb(p, max_side=900):
    im=Image.open(p).convert("RGB")
    if max(im.size)>max_side:
        im.thumbnail((max_side,max_side),Image.Resampling.LANCZOS)
    return np.asarray(im,dtype=np.float32)/255.0

def classes(a):
    r,g,b=a[...,0],a[...,1],a[...,2]
    mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
    red=(r>.22)&(r>g*1.30)&(r>b*1.18)
    yellow=(r>.42)&(g>.22)&(g<.86)&(b<.38)&(r>g*1.05)
    white=(r>.55)&(g>.55)&(b>.52)&((mx-mn)<.24)
    blue=(b>.25)&(b>r*1.10)&(b>g*1.02)
    dark=(r<.25)&(g<.27)&(b<.30)
    chroma=(mx-mn)>.12
    return red,yellow,white,blue,dark,chroma

def bbox_from_identity(a):
    red,yellow,white,blue,dark,chroma=classes(a)
    seed=red|yellow|blue|(white&chroma)
    ys,xs=np.where(seed)
    h,w=a.shape[:2]
    if len(xs)<40:
        sat=np.max(a,2)-np.min(a,2)
        seed=(sat>.16)&(np.max(a,2)>.28)
        ys,xs=np.where(seed)
    if len(xs)<40:
        return 0,0,w,h
    x0,x1=np.percentile(xs,[1,99]); y0,y1=np.percentile(ys,[1,99])
    bw=max(20,x1-x0); bh=max(20,y1-y0)
    pad_x=bw*.14; pad_y=bh*.18
    x0=max(0,int(x0-pad_x)); x1=min(w,int(x1+pad_x)+1)
    y0=max(0,int(y0-pad_y)); y1=min(h,int(y1+pad_y)+1)
    return x0,y0,x1,y1

def resize64(crop):
    im=Image.fromarray(np.clip(crop*255,0,255).astype(np.uint8))
    im=ImageOps.fit(im,(64,64),method=Image.Resampling.LANCZOS)
    return np.asarray(im,dtype=np.float32)/255.0

def desc(path):
    a=load_rgb(path)
    x0,y0,x1,y1=bbox_from_identity(a)
    c=a[y0:y1,x0:x1]
    if c.size==0: c=a
    n=resize64(c)
    red,yellow,white,blue,dark,chroma=classes(n)
    gray=n[...,0]*.2126+n[...,1]*.7152+n[...,2]*.0722
    gx=np.abs(np.diff(gray,axis=1,prepend=gray[:,:1]))
    gy=np.abs(np.diff(gray,axis=0,prepend=gray[:1,:]))
    edge=np.clip((gx+gy-.11)/.36,0,1)
    masks=np.stack([red,yellow,white,blue,dark],axis=0).astype(np.float32)
    grid=np.zeros((5,8,8),dtype=np.float32)
    for yy in range(8):
        for xx in range(8):
            grid[:,yy,xx]=masks[:,yy*8:(yy+1)*8,xx*8:(xx+1)*8].mean(axis=(1,2))
    edgegrid=edge.reshape(8,8,8,8).mean(axis=(1,3))
    thirds=[]
    for m in masks:
        thirds += [m[:21].mean(),m[21:43].mean(),m[43:].mean(),
                   m[:,:21].mean(),m[:,21:43].mean(),m[:,43:].mean()]
    feat=np.concatenate([
        np.array([red.mean(),yellow.mean(),white.mean(),blue.mean(),dark.mean(),
                  edge.mean(), (x1-x0)/max(1,y1-y0)],dtype=np.float32),
        np.array(thirds,dtype=np.float32),grid.reshape(-1),edgegrid.reshape(-1)
    ])
    return {"path":str(path),"feat":feat,"cropAspect":float((x1-x0)/max(1,y1-y0)),
            "fractions":{"red":float(red.mean()),"yellow":float(yellow.mean()),"white":float(white.mean()),"blue":float(blue.mean()),"dark":float(dark.mean())},
            "edge":float(edge.mean())}

def distance(a,b):
    x,y=a["feat"],b["feat"]
    g=np.mean(np.abs(x[:7]-y[:7])*np.array([1.2,2.0,1.7,1.0,1.0,1.3,.55],dtype=np.float32))
    t=np.mean(np.abs(x[7:37]-y[7:37]))
    cg=np.mean(np.abs(x[37:357]-y[37:357]))
    eg=np.mean(np.abs(x[357:]-y[357:]))
    return float(g*.32+t*.18+cg*.34+eg*.16)

def pair(render_descs, owner_descs):
    candidates=[]
    for v,rd in render_descs.items():
        for i,od in enumerate(owner_descs):
            candidates.append((distance(rd,od),v,i))
    usedv=set(); usedo=set(); out={}
    for d,v,i in sorted(candidates):
        if v in usedv or i in usedo: continue
        out[v]=(i,d); usedv.add(v); usedo.add(i)
        if len(usedv)==len(render_descs): break
    for v,rd in render_descs.items():
        if v not in out:
            ds=[(distance(rd,o),i) for i,o in enumerate(owner_descs)]
            d,i=min(ds); out[v]=(i,d)
    return out

def score(render_dir):
    owner=[desc(p) for p in OWNER_FILES if Path(p).exists()]
    if len(owner)<5: raise SystemExit("owner JPEG set missing")
    renders={v:desc(Path(render_dir)/f"{v}.png") for v in VIEWS if (Path(render_dir)/f"{v}.png").exists()}
    if len(renders)<4: raise SystemExit("render view set incomplete")
    pairs=pair(renders,owner)
    view_scores={}; matches={}
    for v,(i,d) in pairs.items():
        s=max(0.0,min(100.0,100.0*(1.0-d/0.34)))
        view_scores[v]=round(s,3)
        matches[v]={"owner":Path(owner[i]["path"]).name,"distance":round(d,5)}
    vals=list(view_scores.values()); mean=sum(vals)/len(vals); worst=min(vals)
    whole=mean*.72+worst*.28
    F=renders.get("front"); S=renders.get("side"); R=renders.get("rear"); T=renders.get("three")
    parts={}
    if F:
        parts["front_fascia"]=view_scores["front"]
        parts["headlights"]=max(0,min(100,view_scores["front"]*.76 + min(100,F["edge"]*420)*.24))
        parts["grille"]=max(0,min(100,view_scores["front"]*.82 + F["fractions"]["dark"]*100*.18))
    if S:
        parts["livery_materials"]=max(0,min(100,view_scores["side"]*.45 + S["fractions"]["yellow"]*500 + S["fractions"]["white"]*170 + S["fractions"]["blue"]*120))
        parts["side_profile"]=view_scores["side"]
        parts["roof_greenhouse"]=max(0,min(100,view_scores["side"]*.68 + S["fractions"]["white"]*180))
    if R:
        parts["rear_lamps"]=view_scores["rear"]
        parts["rear_aero"]=view_scores["rear"]
    if T: parts["three_quarter"]=view_scores["three"]
    identity_fail=[]
    if S:
        if S["fractions"]["yellow"]<.015: identity_fail.append("yellow_livery_missing")
        if S["fractions"]["white"]<.025: identity_fail.append("white_roof_livery_missing")
    if F and F["fractions"]["dark"]<.08: identity_fail.append("front_dark_aero_missing")
    if identity_fail: whole=min(whole,68.0)
    return {"schema":1,"score":round(whole,3),"viewScores":view_scores,"matches":matches,
            "parts":{k:round(v,3) for k,v in parts.items()},"identityFailures":identity_fail,
            "ownerBinaryCount":len(owner),"method":"DIRECT_OWNER_JPEG_SPATIAL_PIXEL_V1"}

if __name__=="__main__":
    if len(sys.argv)<2: raise SystemExit("usage: nickelle_owner_truth.py RENDER_DIR [OUT]")
    out=score(sys.argv[1])
    if len(sys.argv)>2: Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+"\n")
    print(json.dumps(out,indent=2))
