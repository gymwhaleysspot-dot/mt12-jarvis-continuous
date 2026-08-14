from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
POINTER=ROOT/'factory/evolution-controller.json'
MAX_BYTES=87000
MARK='AEGIS_EVOLVED_OBSERVABILITY'

def sha(path:Path)->str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main()->int:
    p=json.loads(POINTER.read_text())
    src=ROOT/p['sourcePath']
    dep=ROOT/p['deployPath']
    if not src.is_file() or not dep.is_file():
        raise RuntimeError('active evolution parent files missing')
    if sha(src)!=p['sourceSha256'] or sha(dep)!=p['luacSha256']:
        raise RuntimeError('active evolution parent hash mismatch')
    if dep.stat().st_size!=int(p['normalizedBytes']) or dep.stat().st_size>MAX_BYTES:
        raise RuntimeError('active evolution parent size contract failed')
    s=src.read_text()
    if MARK in s:
        raise RuntimeError('active evolution parent already contains this Aegis stage')
    anchor='local bc,bm,bi=0,0,0'
    if s.count(anchor)!=1:
        raise RuntimeError('Aegis state anchor missing or ambiguous')
    s=s.replace(anchor,anchor+';local aoS,aoO,aoM=-1,-1,-1 --'+MARK,1)
    tail='X[29]=0;X[30]=0 end'
    pos=s.find(tail)
    if pos<0:
        raise RuntimeError('Aegis bb_tick anchor missing')
    pos+=len(tail)
    has143='bb_line(143,' in s
    extra=';local as=V[248]or 0;local ao=V[168]or 0;local am=V[232]or 0;if as~=aoS or m_abs(ao-aoO)>=12 or am~=aoM or (V[237]or 0)>42 then bb_line(142,p2221(as,am,ao,(V[237]or 0)/10),0)'
    if not has143:
        extra+=';bb_line(143,p2221(V[166]or 0,V[167]or 0,V[179]or 0,(V[266]or 0)/10),0)'
    extra+=';aoS=as;aoO=ao;aoM=am end'
    s=s[:pos]+extra+s[pos:]
    out=ROOT/'aegis-next.lua'
    out.write_text(s)
    meta={
        'schema':'JARVIS-AEGIS-EVOLUTION-1',
        'parentRelease':p['release'],
        'parentCandidate':p['candidate'],
        'parentGenerationRun':p.get('generationRun'),
        'parentSourcePath':p['sourcePath'],
        'parentDeployPath':p['deployPath'],
        'parentSourceSha256':p['sourceSha256'],
        'parentLuacSha256':p['luacSha256'],
        'parentNormalizedBytes':p['normalizedBytes'],
        'canonicalFloor':p['canonicalFloor'],
        'mutation':'event-driven truth-source/anomaly/observability logging on active tournament winner',
        'group142Added':True,
        'group143PreservedOrAdded':True,
        'automaticCanonicalPromotion':False,
        'maxNormalizedBytes':MAX_BYTES,
    }
    (ROOT/'aegis-next.json').write_text(json.dumps(meta,indent=2)+'\n')
    print(json.dumps(meta,indent=2))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
