#!/usr/bin/env python3
import argparse, hashlib, json, os, shutil, sys
from datetime import datetime, timezone
from pathlib import Path

MOUNT_ROOTS=[Path('/media'),Path('/mnt'),Path('/run/media'),Path('/Volumes')]

def sha256(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()

def likely_mt12(root):
    if not root.exists(): return []
    out=[]
    try:
        for p in root.rglob('*'):
            if not p.is_dir(): continue
            n=p.name.lower()
            score=0
            if 'mt12' in n or 'radiomaster' in n: score+=5
            if (p/'RADIO').exists(): score+=2
            if (p/'MODELS').exists(): score+=2
            if (p/'LOGS').exists(): score+=3
            if score>=4: out.append((score,p))
    except (PermissionError,OSError): pass
    return out

def detect_mount():
    env=os.environ.get('MT12_MOUNT')
    c=[]
    if env: c.append((99,Path(env)))
    for r in MOUNT_ROOTS: c.extend(likely_mt12(r))
    c=[(s,p) for s,p in c if p.exists()]
    if not c: return None
    c.sort(key=lambda x:(-x[0],len(str(x[1]))))
    return c[0][1]

def emit(obj,path=None):
    txt=json.dumps(obj,indent=2)+"\n"
    if path:
        p=Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(txt)
    else: sys.stdout.write(txt)

def do_detect(a):
    m=detect_mount()
    obj={'schema':1,'connected':bool(m),'model':'RadioMaster MT12' if m else None,'mount':str(m) if m else None,'detectedAt':datetime.now(timezone.utc).isoformat()}
    emit(obj,a.json)
    return 0 if m else 2

def copy_tree(src,dst):
    if src.exists(): shutil.copytree(src,dst,dirs_exist_ok=True)

def do_backup(a):
    m=detect_mount()
    if not m: raise SystemExit('MT12 not detected; set MT12_MOUNT if automount is nonstandard')
    out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    copied=[]
    for name in ('RADIO','MODELS','SCRIPTS','LOGS'):
        s=m/name
        if s.exists(): copy_tree(s,out/name);copied.append(name)
    manifest={'schema':1,'device':'RadioMaster MT12','mount':str(m),'createdAt':datetime.now(timezone.utc).isoformat(),'copied':copied}
    emit(manifest,a.manifest)

def classify(p):
    n=p.name.lower()
    if n in ('m0','m1') or 'aicmem' in n: return 'memory'
    if 'gvbb' in n or 'blackbox' in n: return 'blackbox'
    if p.suffix.lower()=='.csv': return 'radio-csv'
    return 'other'

def do_sync(a):
    m=detect_mount()
    if not m: raise SystemExit('MT12 not detected; set MT12_MOUNT if automount is nonstandard')
    dest=Path(a.destination);dest.mkdir(parents=True,exist_ok=True)
    state_p=Path(a.state_file)
    try: state=json.loads(state_p.read_text()) if state_p.exists() else {}
    except Exception: state={}
    known=set(state.get('sha256',[]))
    files=[];dups=0
    logs=m/'LOGS'
    roots=[logs] if logs.exists() else [m]
    for root in roots:
        for p in root.rglob('*'):
            if not p.is_file(): continue
            kind=classify(p)
            if a.radio_csv and kind!='radio-csv' and not (a.blackbox and kind in ('blackbox','memory')): continue
            if not a.radio_csv and a.blackbox and kind not in ('blackbox','memory'): continue
            if not a.radio_csv and not a.blackbox: continue
            h=sha256(p)
            if h in known: dups+=1;continue
            rel=p.relative_to(m)
            target=dest/rel if a.preserve_paths else dest/p.name
            target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
            known.add(h)
            files.append({'source':str(rel),'path':str(target.relative_to(dest)),'sha256':h,'bytes':p.stat().st_size,'kind':kind})
    state_p.parent.mkdir(parents=True,exist_ok=True)
    emit({'schema':1,'updatedAt':datetime.now(timezone.utc).isoformat(),'sha256':sorted(known)},state_p)
    emit({'schema':1,'device':'RadioMaster MT12','mount':str(m),'newFiles':files,'newFileCount':len(files),'duplicatesSkipped':dups,'createdAt':datetime.now(timezone.utc).isoformat()},a.manifest)

def main():
    p=argparse.ArgumentParser();sp=p.add_subparsers(dest='cmd',required=True)
    d=sp.add_parser('detect');d.add_argument('--json');d.set_defaults(fn=do_detect)
    b=sp.add_parser('backup');b.add_argument('--output',required=True);b.add_argument('--manifest',required=True);b.set_defaults(fn=do_backup)
    s=sp.add_parser('sync');s.add_argument('--destination',required=True);s.add_argument('--state-file',required=True);s.add_argument('--manifest',required=True);s.add_argument('--radio-csv',action='store_true');s.add_argument('--blackbox',action='store_true');s.add_argument('--preserve-paths',action='store_true');s.set_defaults(fn=do_sync)
    a=p.parse_args();r=a.fn(a);raise SystemExit(r or 0)
if __name__=='__main__': main()
