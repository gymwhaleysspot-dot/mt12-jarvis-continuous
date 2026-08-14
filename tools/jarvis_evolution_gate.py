#!/usr/bin/env python3
"""Jarvis controller evolution authority gate.

Maintains a persistent catalog of unique normalized LUACs, rejects duplicate
bytecode, assigns compact deploy identities, writes the publication contract,
and conservatively selects a recommended candidate.
"""
from __future__ import annotations
import hashlib,json,os,re,shutil,time,zipfile
from dataclasses import dataclass
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
ROOT=Path(__file__).resolve().parents[1];BUILDS=ROOT/'public'/'builds';INDEX=BUILDS/'index.json';REGISTRY=ROOT/'factory'/'evolution-registry.json';MISSION=ROOT/'public'/'jarvis-data'/'active-mission.json';NAME_RE=re.compile(r'^[a-z][a-z0-9]{0,5}$')
def now():return datetime.now(timezone.utc).isoformat()
def load(p,d):
 try:return json.loads(p.read_text())
 except (FileNotFoundError,json.JSONDecodeError,OSError):return d
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for c in iter(lambda:f.read(1048576),b''):h.update(c)
 return h.hexdigest()
def base36(n):
 c='0123456789abcdefghijklmnopqrstuvwxyz';o='0' if not n else ''
 while n:n,r=divmod(n,36);o=c[r]+o
 return o
def next_name(reg):
 n=int(reg.get('nextSequence',1));names=reg.setdefault('names',{})
 while True:
  x='j'+base36(n).rjust(5,'0')[-5:];n+=1
  if x not in names:reg['nextSequence']=n;return x
def candidate_files(d):
 ls=sorted(d.glob('*.luac'),key=lambda p:(p.name!='candidate.luac',p.name));ss=sorted(d.glob('*.lua'),key=lambda p:(p.name!='candidate.lua',p.name));return(ls[0] if ls else None,ss[0] if ss else None)
def evidence(d):
 m={**load(d/'FACTORY-RESULT.json',{}),**load(d/'EVALUATION.json',{}),**load(d/'STATUS.json',{})};a=str(m.get('authority') or m.get('promotionLevel') or 'COMPILED');s=m.get('scoreDelta',m.get('improvement',m.get('delta')));c=m.get('confidence',m.get('transferConfidence'))
 try:s=float(s) if s is not None else None
 except (TypeError,ValueError):s=None
 try:c=float(c) if c is not None else None
 except (TypeError,ValueError):c=None
 return {'authority':a,'scoreDelta':s,'confidence':c,'regression':bool(m.get('regression') or m.get('regressions')),'raw':m}
def rank(v):
 o=['GENERATED','COMPILED','STATICALLY_VALIDATED','SIMULATION_TESTED','SIMULATION_PROVEN','REPLAY_PROVEN','BENCH_PROVEN','ROAD_PROVEN'];u=v.upper()
 return next((i for i,x in enumerate(o) if x in u),1)
def bundle(out,files):
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
  for p in files:
   if p and p.is_file():z.write(p,p.name)
@dataclass
class Entry:d:Path;mission:str;luac:Path;lua:Path|None;lh:str;sh:str|None;size:int;ev:dict[str,Any]
def valid_registered(item):
 try:
  b=ROOT/item['base'];p=b/item['deploy'];return NAME_RE.fullmatch(item['name']) and p.is_file() and sha(p)==item['luacSha256']
 except Exception:return False
def main():
 BUILDS.mkdir(parents=True,exist_ok=True);reg=load(REGISTRY,{'schema':2,'nextSequence':1,'hashes':{},'names':{},'history':[]});reg['schema']=2
 # Persistent accepted set is the authority. Never rebuild the public index from only this run's discoveries.
 accepted_by_name={n:i for n,i in reg.get('names',{}).items() if isinstance(i,dict) and valid_registered(i)}
 known={i['luacSha256']:n for n,i in accepted_by_name.items()};reg['hashes']=known
 entries=[]
 for d in sorted(p for p in BUILDS.iterdir() if p.is_dir() and p.name!='factory'):
  l,s=candidate_files(d)
  if l:entries.append(Entry(d,d.name,l,s,sha(l),sha(s) if s else None,l.stat().st_size,evidence(d)))
 entries.sort(key=lambda e:e.d.stat().st_mtime);rejected=[];seen_dirs=set()
 for e in entries:
  existing=known.get(e.lh)
  # The canonical directory for an accepted build is not a rejected duplicate.
  if existing:
   canonical=accepted_by_name.get(existing,{})
   if canonical.get('base')==f'public/builds/{e.mission}/':continue
   r={'mission':e.mission,'reason':'BYTE_IDENTICAL_DUPLICATE','duplicateOf':existing,'luacSha256':e.lh,'luacBytes':e.size,'createdAt':datetime.fromtimestamp(e.d.stat().st_mtime,timezone.utc).isoformat()};save(e.d/'NOVELTY.json',{'accepted':False,**r});rejected.append(r);continue
  name=next_name(reg);assert NAME_RE.fullmatch(name);nl=e.d/f'{name}.luac';ns=e.d/f'{name}.lua';shutil.copy2(e.luac,nl) if e.luac!=nl else None;shutil.copy2(e.lua,ns) if e.lua and e.lua!=ns else None
  raw=e.ev['raw'];parent=next((raw.get(k) for k in ('parent','parentName','base','parentController') if isinstance(raw.get(k),str) and raw.get(k)),None)
  if not parent and accepted_by_name:parent=sorted(accepted_by_name.values(),key=lambda x:x.get('createdAt',''))[-1]['name']
  novelty={'accepted':True,'name':name,'mission':e.mission,'byteNovel':True,'behavioralNovelty':'MEASURED' if e.ev['scoreDelta'] is not None else 'UNMEASURED','luacSha256':e.lh,'sourceSha256':e.sh,'evaluatedAt':now()}
  lineage={'schema':1,'name':name,'parent':parent,'mission':e.mission,'mutationHypothesis':raw.get('hypothesis') or raw.get('objective') or 'Builder did not publish a hypothesis','expectedImprovement':raw.get('expectedImprovement'),'sourceSha256':e.sh,'luacSha256':e.lh}
  promo={'eligible':False,'recommended':False,'reason':'INSUFFICIENT_COMPARATIVE_EVIDENCE','authority':e.ev['authority'],'scoreDelta':e.ev['scoreDelta'],'confidence':e.ev['confidence']}
  if e.ev['regression']:promo['reason']='REGRESSION_DETECTED'
  elif rank(e.ev['authority'])>=rank('REPLAY_PROVEN') and (e.ev['scoreDelta'] or 0)>0 and (e.ev['confidence'] or 0)>=.8:promo.update(eligible=True,reason='CLEARED_AUTONOMOUS_PROMOTION_GATE')
  created=datetime.fromtimestamp(e.d.stat().st_mtime,timezone.utc).isoformat();manifest={'schema':1,'name':name,'mission':e.mission,'deploy':nl.name,'source':ns.name if e.lua else None,'authority':e.ev['authority'],'luacBytes':e.size,'luacSha256':e.lh,'sourceSha256':e.sh,'parent':parent,'novelty':novelty,'promotion':promo,'createdAt':created}
  for p,v in [('NOVELTY.json',novelty),('LINEAGE.json',lineage),('BUILD-MANIFEST.json',manifest),('PROMOTION.json',promo)]:save(e.d/p,v)
  (e.d/'BUILD-AUDIT.txt').write_text(f"JARVIS BUILD {name}\nmission={e.mission}\nauthority={e.ev['authority']}\nluacBytes={e.size}\nluacSha256={e.lh}\nsourceSha256={e.sh or 'none'}\nparent={parent or 'none'}\nnovel=true\npromotionEligible={str(promo['eligible']).lower()}\n")
  lines=[f'{e.lh}  {nl.name}']+([f'{e.sh}  {ns.name}'] if e.lua else []);(e.d/'SHA256SUMS.txt').write_text('\n'.join(lines)+'\n');z=e.d/f'{name}-build.zip';bundle(z,[nl,ns if e.lua else None,e.d/'BUILD-MANIFEST.json',e.d/'BUILD-AUDIT.txt',e.d/'SHA256SUMS.txt',e.d/'LINEAGE.json',e.d/'PROMOTION.json',e.d/'NOVELTY.json'])
  item={'name':name,'mission':e.mission,'profile':raw.get('profile'),'authority':e.ev['authority'],'createdAt':created,'parent':parent,'sourceSha256':e.sh,'luacSha256':e.lh,'luacBytes':e.size,'scoreDelta':e.ev['scoreDelta'],'confidence':e.ev['confidence'],'promotionEligible':promo['eligible'],'base':f'public/builds/{e.mission}/','deploy':nl.name,'bundle':z.name,'audit':'BUILD-AUDIT.txt'}
  accepted_by_name[name]=item;known[e.lh]=name;reg.setdefault('names',{})[name]=item
 accepted=sorted(accepted_by_name.values(),key=lambda x:x.get('createdAt',''),reverse=True);eligible=[x for x in accepted if x.get('promotionEligible')];recommended=max(eligible,key=lambda x:(x.get('scoreDelta') or 0,x.get('confidence') or 0),default=None)
 for x in accepted:x['recommended']=bool(recommended and x['name']==recommended['name'])
 if recommended:save(BUILDS/'recommended.json',{'schema':1,'updatedAt':now(),'controller':recommended,'physicalAuthorityCeiling':'REPLAY_PROVEN'})
 elif (BUILDS/'recommended.json').exists():(BUILDS/'recommended.json').unlink()
 rejected.sort(key=lambda x:x['createdAt'],reverse=True);idx={'schema':3,'updatedAt':now(),'latest':accepted[0]['name'] if accepted else None,'recommended':recommended['name'] if recommended else None,'uniqueBuilds':len(accepted),'duplicatesRejected':len(rejected),'builds':accepted,'rejected':rejected[:200],'authorityNotice':'Only BENCH_PROVEN or ROAD_PROVEN builds have physical confirmation.'};save(INDEX,idx)
 reg['hashes']=known;reg['updatedAt']=now();reg.setdefault('history',[]).append({'at':now(),'unique':len(accepted),'duplicates':len(rejected),'recommended':idx['recommended']});reg['history']=reg['history'][-200:];save(REGISTRY,reg)
 save(MISSION,{'schema':1,'mission':os.getenv('GITHUB_RUN_ID',f'local-{int(time.time())}'),'state':'EVOLUTION_GATE_COMPLETE','stage':'publish-and-select','updatedAt':now(),'uniqueCandidates':len(accepted),'duplicatesRejected':len(rejected),'latest':idx['latest'],'recommended':idx['recommended'],'nextExperiment':'Generate a behaviorally distinct candidate' if not recommended else 'Collect physical evidence for recommended candidate'})
 print(json.dumps({'unique':len(accepted),'duplicates':len(rejected),'latest':idx['latest'],'recommended':idx['recommended']},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
