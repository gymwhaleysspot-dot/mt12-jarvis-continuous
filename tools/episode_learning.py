from __future__ import annotations
import csv,hashlib,json,math,statistics
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist-jarvis-factory';MEM=ROOT/'factory/memory'

def load(p,d):
 try:return json.loads(p.read_text())
 except:return d

def save(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=2,sort_keys=True)+'\n')
def num(x):
 try:return float(x)
 except:return 0.0

def rows(p):
 with p.open(errors='ignore',newline='') as f:
  try:return list(csv.DictReader(f))
  except:return []
def pick(r,*names):
 low={str(k).lower():v for k,v in r.items()}
 for n in names:
  if n.lower() in low:return num(low[n.lower()])
 return 0.0

def episodes(p,identity):
 rs=rows(p);out=[];active=None
 for i,r in enumerate(rs):
  mph=pick(r,'mph','speed','gps','truthmph');rpm=pick(r,'rpm');thr=pick(r,'th','thr','throttle');tc=pick(r,'tc','tca','tct');ab=pick(r,'abs','brake');conf=pick(r,'confidence','conf','truthconf')
  slip=max(0.0,(rpm*0.000914)-mph)
  trigger=tc>0 or ab>0 or slip>4 or conf<35
  if trigger and active is None:active={'start':i,'peakSlip':slip,'peakTc':tc,'peakAbs':ab,'minConfidence':conf or 99,'preMph':mph,'preRpm':rpm}
  if active:
   active['peakSlip']=max(active['peakSlip'],slip);active['peakTc']=max(active['peakTc'],tc);active['peakAbs']=max(active['peakAbs'],ab);active['minConfidence']=min(active['minConfidence'],conf or 99)
   if (not trigger and i-active['start']>5) or i-active['start']>=90:
    active['end']=i;active['postMph']=mph;active['postRpm']=rpm;active['recoveryFrames']=i-active['start'];active['outcome']='RECOVERED' if active['postMph']>=active['preMph'] and active['peakSlip']<18 else 'UNSTABLE';active['identityToken']=identity;out.append(active);active=None
 return out

def main():
 OUT.mkdir(exist_ok=True);attr=load(OUT/'LOG-IDENTITY-ATTRIBUTION.json',{'logs':[]});all_eps=[]
 for a in attr.get('logs',[]):
  p=ROOT/a['log'];tok=(a.get('match') or {}).get('identityToken') or a.get('runtimeToken')
  if p.exists():
   for e in episodes(p,tok):e['log']=a['log'];e['episodeId']=hashlib.sha256(f"{a['log']}|{e['start']}|{tok}".encode()).hexdigest()[:16];all_eps.append(e)
 model=load(ROOT/'factory/vehicle-model-calibrated.json',load(ROOT/'factory/vehicle-model.json',{}));stable=[e for e in all_eps if e['outcome']=='RECOVERED']
 if stable:
  model.setdefault('learned',{})['medianRecoveryFrames']=statistics.median(e['recoveryFrames'] for e in stable)
  model['learned']['medianPeakSlip']=statistics.median(e['peakSlip'] for e in stable)
  model['learned']['episodeCount']=len(all_eps)
  model['learned']['stableRate']=round(len(stable)/len(all_eps),4)
 save(ROOT/'factory/vehicle-model-calibrated.json',model)
 memory=load(MEM/'episodes.json',{'schema':1,'records':[]});known={e.get('episodeId') for e in memory['records']};memory['records'] += [e for e in all_eps if e['episodeId'] not in known];save(MEM/'episodes.json',memory)
 counter=[]
 for e in all_eps:
  base=max(1,e['recoveryFrames']);counter.append({'episodeId':e['episodeId'],'observed':e['outcome'],'alternatives':[{'policy':'earlier_intervention','predictedRecoveryFrames':max(1,round(base*.88)),'risk':'medium'},{'policy':'later_intervention','predictedRecoveryFrames':round(base*1.12),'risk':'false-negative'},{'policy':'higher_sensor_skepticism','predictedRecoveryFrames':max(1,round(base*.94)),'risk':'slower acceleration'}]})
 save(OUT/'ATTRIBUTED-EPISODES.json',{'schema':1,'count':len(all_eps),'episodes':all_eps});save(OUT/'COUNTERFACTUALS.json',{'schema':1,'count':len(counter),'records':counter})
 print(json.dumps({'episodes':len(all_eps),'stable':len(stable),'counterfactuals':len(counter)}))
if __name__=='__main__':main()
