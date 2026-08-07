#!/usr/bin/env python3
import argparse, hashlib, json, os, re, shutil, subprocess, sys, zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd().resolve()
CONTRACT = ROOT / 'spec' / 'jarvis-release-contract.json'


def die(msg):
    raise SystemExit(f'ERROR: {msg}')


def sha256(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1<<20),b''):
            h.update(chunk)
    return h.hexdigest()


def run(cmd, **kw):
    print('+', ' '.join(map(str,cmd)))
    subprocess.run([str(x) for x in cmd], check=True, **kw)


def compiler():
    for name in ('luac5.3','luac53','luac'):
        p=shutil.which(name)
        if not p: continue
        a=subprocess.run([p,'-v'],capture_output=True,text=True)
        if '5.3' in (a.stdout+a.stderr): return p
    die('Lua 5.3 compiler not found')


def local_functions(text):
    return set(re.findall(r'\blocal\s+function\s+([A-Za-z_][A-Za-z0-9_]*)',text))


def check_contract(text, cfg, parent_text=None):
    checks=[]
    for tok in cfg.get('required_tokens',[]):
        ok=tok in text; checks.append((f'required token: {tok}',ok))
    for tok in cfg.get('forbidden_tokens',[]):
        ok=tok not in text; checks.append((f'forbidden token absent: {tok}',ok))
    for pat in cfg.get('required_regex',[]):
        ok=re.search(pat,text,re.M) is not None; checks.append((f'required regex: {pat}',ok))
    for pat in cfg.get('forbidden_regex',[]):
        ok=re.search(pat,text,re.M) is None; checks.append((f'forbidden regex absent: {pat}',ok))
    if parent_text is not None and cfg.get('preserve_parent_local_functions',True):
        p=local_functions(parent_text); c=local_functions(text); missing=sorted(p-c)
        checks.append((f'parent local functions preserved ({len(p)} checked)',not missing))
        if missing: print('Missing parent functions:', ', '.join(missing), file=sys.stderr)
    failed=[name for name,ok in checks if not ok]
    if failed:
        for name,ok in checks: print(('PASS ' if ok else 'FAIL ')+name)
        die(f'contract failed ({len(failed)} check(s))')
    for name,_ in checks: print('PASS',name)
    return [name for name,_ in checks]


def ensure_inside(path):
    p=path.resolve()
    if p!=ROOT and ROOT not in p.parents: die(f'path escapes repository: {path}')
    return p


def main():
    ap=argparse.ArgumentParser(description='Jarvis MT12 release forge')
    ap.add_argument('--source',required=True)
    ap.add_argument('--release',required=True)
    ap.add_argument('--parent')
    ap.add_argument('--limit',type=int)
    ap.add_argument('--out',default='release')
    ap.add_argument('--hardware-status',default='NOT_HARDWARE_TESTED')
    ap.add_argument('--static-only',action='store_true',help='run contract checks without compiling')
    a=ap.parse_args()
    if not re.fullmatch(r'[a-z0-9]{1,10}',a.release): die('release must match [a-z0-9]{1,10}')
    if not CONTRACT.exists(): die(f'missing {CONTRACT.relative_to(ROOT)}')
    cfg=json.loads(CONTRACT.read_text())
    limit=a.limit or int(cfg.get('default_size_limit',87000))
    if limit>int(cfg.get('absolute_size_limit',87000)): die('requested size limit exceeds contract absolute limit')
    src=ensure_inside(ROOT/a.source)
    if not src.is_file() or src.suffix!='.lua': die(f'missing Lua source: {a.source}')
    text=src.read_text(errors='strict')
    parent_text=None
    if a.parent:
        parent=ensure_inside(ROOT/a.parent)
        if not parent.is_file(): die(f'missing parent source: {a.parent}')
        parent_text=parent.read_text(errors='strict')
    checks=check_contract(text,cfg,parent_text)
    if a.static_only:
        print(json.dumps({'release':a.release,'source':a.source,'contract':'PASS','checks':len(checks)},indent=2)); return

    out=ensure_inside(ROOT/a.out)
    if out==ROOT: die('output directory may not be repository root')
    shutil.rmtree(out,ignore_errors=True); out.mkdir(parents=True)
    source_out=out/f'{a.release}.lua'; shutil.copy2(src,source_out)
    raw=out/f'{a.release}_raw.luac'; deploy=out/f'{a.release}.luac'
    luac=compiler()
    run([luac,'-p',src])
    run([luac,'-s','-o',raw,src])
    normalizer=ROOT/'toolchain'/'normalize_luac53_mt12.js'
    if not normalizer.is_file(): die('missing MT12 normalizer')
    run(['node',normalizer,raw,deploy])
    data=deploy.read_bytes()
    if len(data)>limit: die(f'normalized LUAC {len(data)} exceeds {limit}')
    if data[:4]!=b'\x1bLua': die('invalid Lua bytecode magic')
    if data[12:17]!=b'\x04\x04\x04\x04\x04': die(f'not MT12 normalized: header={data[12:17].hex()}')

    src_sha=sha256(source_out); luac_sha=sha256(deploy)
    parent_name=Path(a.parent).name if a.parent else 'UNSPECIFIED'
    manifest={
        'release':a.release,'source':source_out.name,'deploy':deploy.name,'parent':parent_name,
        'sourceBytes':source_out.stat().st_size,'normalizedBytes':deploy.stat().st_size,
        'ceilingBytes':limit,'marginBytes':limit-deploy.stat().st_size,
        'sourceSha256':src_sha,'luacSha256':luac_sha,'luaVersion':'5.3',
        'mt12Header':'0404040404','contractVersion':cfg.get('version',1),
        'hardwareStatus':a.hardware_status,'builtAt':datetime.now(timezone.utc).isoformat(),
        'checks':checks,'deployOnlyNormalizedLuac':True
    }
    (out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
    (out/'SHA256SUMS.txt').write_text(f'{src_sha}  {source_out.name}\n{luac_sha}  {deploy.name}\n')
    audit=[
        f'{a.release.upper()} JARVIS MT12 BUILD AUDIT','='*36,
        f'Parent: {parent_name}',f'Source: {source_out.name}',f'Deploy: {deploy.name}',
        '', 'HARD GATES', 'Lua 5.3 syntax: PASS','Lua 5.3 stripped compile: PASS',
        'MT12 normalization: PASS (04/04/04/04/04)',f'Normalized bytecode: {deploy.stat().st_size} bytes (PASS <= {limit})',
        f'Headroom: {limit-deploy.stat().st_size} bytes','Contract checks: PASS',
        '', 'RELEASE CONTRACT'
    ]
    audit += [f'- {x}' for x in checks]
    audit += ['', 'SHA-256',f'{source_out.name}: {src_sha}',f'{deploy.name}: {luac_sha}',
              '',f'Hardware status: {a.hardware_status}','DEPLOY ONLY THE NORMALIZED .luac FILE.']
    (out/f'{a.release.upper()}_BUILD_AUDIT.txt').write_text('\n'.join(audit)+'\n')
    z=out/f'{a.release}_MT12_BUILD.zip'
    with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as f:
        for p in (source_out,deploy,out/'SHA256SUMS.txt',out/'MANIFEST.json',out/f'{a.release.upper()}_BUILD_AUDIT.txt'):
            f.write(p,p.name)
    raw.unlink(missing_ok=True)
    print(json.dumps(manifest,indent=2))
    print(f'PASS: {z}')

if __name__=='__main__': main()
