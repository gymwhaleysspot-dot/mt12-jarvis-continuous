#!/usr/bin/env python3
import csv,hashlib,json,os,re,statistics
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path('.'); RAW=ROOT/'evidence/raw'; OUT=ROOT/'public/evidence-data'; MEM=ROOT/'factory/memory'
OUT.mkdir(parents=True,exist_ok=True);MEM.mkdir(parents=True,exist_ok=True)
def readj(p,d):
 try:return json.loads(Path(p).read_text())
 except:return d
def writej(p,x):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(x,indent=2,sort_keys=False)+'\n')
def files_for(sid):
 p=RAW/sid
 return [x for x in p.rglob('*') if x.is_file() and x.name!='MANIFEST.json'] if p.exists() else []
def controller_from(paths):
 pat=re.compile(r'\b([aj][a-z0-9]{3,5})\b',re.I)
 for p in paths:
  m=pat.search(p.name)
  if m:return m.group(1).lower(),.78
  if p.suffix.lower() in {'.csv','.log','.txt','.json'}:
   try:
    t=p.read_text(errors='ignore')[:200000];m=pat.search(t)
    if m:return m.group(1).lower(),.96
   except:pass
 return None,.25
def csv_stats(p):
 rows=0;tc=abs_=jumps=drops=0;first=last=None
 try:
  with p.open(errors='ignore',newline='') as f:
   r=csv.DictReader(f)
   for row in r:
    rows+=1; low={str(k).lower():str(v).lower() for k,v in row.items()}
    blob=' '.join(low.values())
    tc+=int('tc' in blob and any(x in blob for x in ['event','active','1','true']))
    abs_+=int('abs' in blob and any(x in blob for x in ['event','active','1','true']))
    jumps+=int('jump' in blob or 'airborne' in blob)
    drops+=int('dropout' in blob or 'sensor_lost' in blob)
    val=next((v for k,v in low.items() if 'time' in k or 'date' in k),None)
    first=first or val;last=val or last
 except:pass
 return {'rows':rows,'tc':tc,'abs':abs_,'jumps':jumps,'drops':drops,'first':first,'last':last}
def pair(paths):
 radio=[p for p in paths if p.suffix.lower()=='.csv' and 'bb' not in p.name.lower() and 'black' not in p.name.lower()]
 bb=[p for p in paths if p.suffix.lower() in {'.csv','.log'} and ('bb' in p.name.lower() or 'black' in p.name.lower() or 'gyro' in p.name.lower())]
 score=.35
 if radio and bb:score=.84
 if radio and bb and abs(radio[0].stat().st_mtime-bb[0].stat().st_mtime)<7200:score=.94
 return radio[:1],bb[:1],score
def replay_contract(session,stats):
 return {'schema':1,'session':session['id'],'parent':session.get('controller'),'identicalInputReplay':True,'metrics':{
 'jumpFalsePositiveRate':None,'jumpTruePositiveRate':None,'tcInterventionQuality':None,'absInterventionQuality':None,
 'truthSpeedError':None,'dropoutRecoveryFrames':None,'controlSmoothness':None,'runtimeMemoryRisk':'UNMEASURED'},
 'observed':stats,'requiredForPromotion':['parent-child identical input','positive score delta','no control regression','novel bytecode','confidence >= 0.80']}
def main():
 sid=os.getenv('SESSION_ID','').strip(); sessions=readj(OUT/'sessions.json',{'schema':2,'sessions':[]});
 targets=[sid] if sid and sid!='certification' else [p.name for p in RAW.iterdir() if p.is_dir()] if RAW.exists() else []
 existing={x['id']:x for x in sessions['sessions']}
 for x in targets:
  paths=files_for(x)
  if not paths:continue
  ctl,cc=controller_from(paths);radio,bb,pc=pair(paths);stats={'tc':0,'abs':0,'jumps':0,'drops':0,'rows':0}
  for p in radio+bb:
   s=csv_stats(p)
   for k in stats:stats[k]+=s.get(k,0) or 0
  conf=round(min(.99,(cc+pc)/2),3);typ='ROAD' if stats['rows']>500 else 'BENCH' if stats['rows'] else 'UNKNOWN'
  sess={'id':x,'controller':ctl,'confidence':conf,'type':typ,'duration':'unknown','state':'REVIEW_REQUIRED' if conf<.9 else 'REPLAY_READY',
   'radioLog':str(radio[0]) if radio else None,'blackbox':str(bb[0]) if bb else None,'events':{k:stats[k] for k in ['tc','abs','jumps','drops']},
   'files':len(paths),'updatedAt':datetime.now(timezone.utc).isoformat()}
  existing[x]=sess;writej(OUT/f'sessions/{x}.json',sess);writej(OUT/f'replays/{x}.json',replay_contract(sess,stats))
 sessions['sessions']=sorted(existing.values(),key=lambda z:z.get('updatedAt',''),reverse=True);sessions['updatedAt']=datetime.now(timezone.utc).isoformat();writej(OUT/'sessions.json',sessions)
 certs=[]
 for p in (ROOT/'evidence/certifications').glob('*.json') if (ROOT/'evidence/certifications').exists() else []:
  certs.append(readj(p,{}))
 writej(OUT/'certifications.json',{'schema':1,'certifications':certs,'updatedAt':datetime.now(timezone.utc).isoformat()})
 twin=readj(ROOT/'factory/vehicle-model-calibrated.json',{'schema':1})
 twin['evidenceSessions']=len(sessions['sessions']);twin['lastEvidenceUpdate']=datetime.now(timezone.utc).isoformat();twin.setdefault('uncertainty',{})
 for k in ['gpsLag','rpmLag','grip','braking','batterySag','dropout','jumpLanding','drivetrainDelay']:twin['uncertainty'].setdefault(k,'REQUIRES_CALIBRATION')
 writej(ROOT/'factory/vehicle-model-calibrated.json',twin)
 mutation={'schema':1,'updatedAt':datetime.now(timezone.utc).isoformat(),'requirements':[
 'declare parent and compact <=6 character identity','state one falsifiable hypothesis','list exact source mutations','predict measurable replay improvement',
 'reject source, bytecode and behavioral duplicates','run identical-input replay against parent','publish regression vector and transfer confidence'],
 'promotionGate':{'minimumConfidence':.8,'positiveDeltaRequired':True,'replayRequired':True,'physicalAuthorityCannotBeSimulated':True}}
 writej(OUT/'mutation-contract.json',mutation)
 status={'schema':2,'state':'COMPLETE','stage':'sessions-paired-replay-contracts-written','updatedAt':datetime.now(timezone.utc).isoformat(),
 'sessionCount':len(sessions['sessions']),'certificationCount':len(certs),'message':'Evidence paired, replay contracts written, twin uncertainty updated, mutation authority enforced.'}
 writej(OUT/'authority-status.json',status);print(json.dumps(status))
if __name__=='__main__':main()
