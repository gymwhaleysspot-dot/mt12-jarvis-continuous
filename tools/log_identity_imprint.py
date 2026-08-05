from __future__ import annotations
import csv,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist-jarvis-factory'

def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def builds():
 out=[]
 for m in ROOT.glob('public/builds/**/MANIFEST.json'):
  try:
   x=json.loads(m.read_text());x['_path']=str(m.parent.relative_to(ROOT));out.append(x)
  except:pass
 for s in ROOT.glob('public/builds/**/STATUS.json'):
  try:
   x=json.loads(s.read_text());x['_path']=str(s.parent.relative_to(ROOT));out.append(x)
  except:pass
 return out

def identity_for_candidate(d):
 lua=next(d.glob('*.lua'),None);luac=next(d.glob('*.luac'),None);man=next(d.glob('MANIFEST.json'),None)
 if not lua or not luac:return None
 meta=json.loads(man.read_text()) if man else {}
 ident={'schema':1,'controller':meta.get('candidate',lua.stem).upper(),'sourceSha256':h(lua),'luacSha256':h(luac),'parent':meta.get('parent'),'buildPath':str(d.relative_to(ROOT)),'memorySchema':'AIC9Z-18/24','identityToken':h(luac)[:16]}
 (d/'IDENTITY.json').write_text(json.dumps(ident,indent=2)+'\n')
 return ident

def classify_log(p,index):
 head=p.read_text(errors='ignore')[:16384];matches=[]
 for b in index:
  src=(b.get('sourceSha256') or b.get('source',{}).get('sha256') or '')
  lc=(b.get('luacSha256') or b.get('luac',{}).get('sha256') or '')
  name=str(b.get('candidate') or b.get('mission') or b.get('release') or '')
  score=0;reasons=[]
  for val,w,label in [(lc,100,'luacSha'),(src,90,'sourceSha'),(lc[:16] if lc else '',80,'token'),(name,40,'name')]:
   if val and val.lower() in head.lower():score+=w;reasons.append(label)
  if score:matches.append({'score':score,'build':b.get('_path'),'controller':name,'reasons':reasons})
 matches.sort(key=lambda x:x['score'],reverse=True)
 return {'log':str(p.relative_to(ROOT)),'match':matches[0] if matches else None,'confidence':'EXACT' if matches and matches[0]['score']>=80 else 'INFERRED' if matches else 'UNKNOWN','alternatives':matches[1:4]}

def main():
 OUT.mkdir(exist_ok=True);idents=[]
 for d in (ROOT/'dist-controller-tournament').iterdir() if (ROOT/'dist-controller-tournament').exists() else []:
  if d.is_dir():
   x=identity_for_candidate(d)
   if x:idents.append(x)
 idx=builds()+[dict(x,_path=x['buildPath'],candidate=x['controller']) for x in idents]
 logs=[classify_log(p,idx) for p in sorted((ROOT/'tests/replays').glob('*.csv'))] if (ROOT/'tests/replays').exists() else []
 report={'schema':1,'identities':idents,'logs':logs,'exactMatches':sum(x['confidence']=='EXACT' for x in logs),'unknown':sum(x['confidence']=='UNKNOWN' for x in logs)}
 (OUT/'LOG-IDENTITY-ATTRIBUTION.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'identities':len(idents),'logs':len(logs),'exact':report['exactMatches'],'unknown':report['unknown']}))
if __name__=='__main__':main()
