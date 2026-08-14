#!/usr/bin/env python3
from __future__ import annotations
import json,re
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'research'/'current.json';OUT=ROOT/'factory'/'memory'/'external-research.json';PUB=ROOT/'public'/'jarvis-data'/'external-research.json'
AREA_TERMS={
 'truth-speed-fusion':['gps','gnss','rpm','speed','sensor fusion','kalman','latency','delay','state estimation'],
 'jump-landing-classification':['jump','airborne','landing','ground contact','vertical','classification'],
 'sensor-dropout-recovery':['dropout','fault','sensor failure','fail-open','recovery','missing data','degraded'],
 'traction-control':['traction','wheel slip','slip ratio','wheelspin','grip','surface','torque'],
 'abs-control':['abs','anti-lock','braking','wheel lock','lock ratio','brake'],
 'runtime-memory':['lua','memory','allocation','garbage collection','embedded','runtime','bytecode'],
 'digital-twin-transfer':['digital twin','simulation','transfer','model calibration','replay'],
 'controller-observability':['explain','observability','causal','diagnostic','telemetry','trace'],
}
def load(p:Path,d:Any)->Any:
 try:return json.loads(p.read_text())
 except Exception:return d
def save(p:Path,v:Any):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+'\n')
def area_for(f:dict)->tuple[str,float]:
 text=' '.join([str(f.get('claim','')),str(f.get('testableHypothesis','')),' '.join(map(str,f.get('affectedSystems',[])))]).lower()
 scores={a:sum(1 for t in ts if t in text) for a,ts in AREA_TERMS.items()};area=max(scores,key=scores.get) if scores else 'controller-observability';hits=scores.get(area,0)
 return area,min(1.0,.35+.13*hits)
def main():
 r=load(SRC,{});sources={s.get('id'):s for s in r.get('sources',[]) if s.get('id')};rows=[]
 for f in r.get('acceptedFindings',[]):
  conf=float(f.get('confidence',0) or 0);ids=[x for x in f.get('sourceIds',[]) if x in sources]
  if conf<.65 or not ids:continue
  area,match=area_for(f);quality=sum(min(100,float(sources[i].get('relevanceScore',0) or 0)) for i in ids)/max(1,len(ids))/100
  weight=round(conf*(.65+.35*quality)*match,4)
  rows.append({'area':area,'claim':f.get('claim'),'hypothesis':f.get('testableHypothesis'),'affectedSystems':f.get('affectedSystems',[]),'sourceIds':ids,'confidence':conf,'sourceQuality':round(quality,4),'areaMatch':round(match,4),'researchWeight':weight,'runId':r.get('runId')})
 by={}
 for x in rows:
  d=by.setdefault(x['area'],{'findings':0,'supportWeight':0.0,'maxConfidence':0.0,'hypotheses':[],'sourceIds':set()});d['findings']+=1;d['supportWeight']+=x['researchWeight'];d['maxConfidence']=max(d['maxConfidence'],x['confidence']);d['hypotheses'].append(x['hypothesis']);d['sourceIds'].update(x['sourceIds'])
 for d in by.values():d['supportWeight']=round(min(1.0,d['supportWeight']/max(1,d['findings'])),4);d['sourceIds']=sorted(d['sourceIds']);d['hypotheses']=[h for h in d['hypotheses'] if h][:5]
 out={'schema':'JARVIS-EXTERNAL-RESEARCH-1','generatedAt':datetime.now(timezone.utc).isoformat(),'researchRun':r.get('runId'),'topic':r.get('topic'),'sourceCount':len(sources),'acceptedBridgeFindings':len(rows),'areas':by,'findings':rows,'policy':{'minimumFindingConfidence':.65,'directControllerMutation':False,'use':'planner evidence only; all controller changes remain experimental and gated'}}
 save(OUT,out);save(PUB,out);print(json.dumps({'researchRun':out['researchRun'],'findings':len(rows),'areas':sorted(by)},indent=2))
if __name__=='__main__':main()
