#!/usr/bin/env python3
"""Jarvis uncertainty-driven engineering planner.

Ranks unresolved engineering areas by expected information gain, prior failure
history, evidence coverage, controller impact, and transfer risk. Publishes one
falsifiable next experiment and a durable planner history.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
FACTORY=ROOT/'factory';PUBLIC=ROOT/'public'/'jarvis-data'
OUT=FACTORY/'next-experiment.json';PLAN=PUBLIC/'experiment-plan.json';HISTORY=FACTORY/'memory'/'planner-history.json'

def load(p:Path,d:Any)->Any:
 try:return json.loads(p.read_text(encoding='utf-8'))
 except (FileNotFoundError,json.JSONDecodeError,OSError):return d

def save(p:Path,v:Any)->None:
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+'\n',encoding='utf-8')

def now()->str:return datetime.now(timezone.utc).isoformat()

def num(v:Any,d:float=0.0)->float:
 try:return float(v)
 except (TypeError,ValueError):return d

AREAS={
 'truth-speed-fusion':{'impact':1.00,'mutation':['adaptive GPS/RPM lag estimator','confidence-weighted truth-speed handoff'],'measure':'reduce truth-speed RMSE and TC timing error without added control oscillation'},
 'jump-landing-classification':{'impact':.94,'mutation':['separate airborne and landing evidence','adaptive post-landing confirmation window'],'measure':'reduce jump false positives while preserving true jump recall'},
 'sensor-dropout-recovery':{'impact':.98,'mutation':['graded fail-open sensor confidence','state-preserving dropout recovery'],'measure':'reduce recovery frames and prevent channel/control discontinuities'},
 'traction-control':{'impact':.96,'mutation':['contextual slip severity blend','surface-conditioned intervention release'],'measure':'reduce excess slip and intervention harshness'},
 'abs-control':{'impact':.91,'mutation':['adaptive lock target confidence','linear release/reapply timing'],'measure':'reduce lock duration without increasing stopping distance proxy'},
 'runtime-memory':{'impact':.90,'mutation':['allocation reduction with behavior equivalence','deduplicate hot-path calculations'],'measure':'reduce peak runtime memory and LUAC size with zero behavioral regression'},
 'digital-twin-transfer':{'impact':.88,'mutation':['recalibrate lag/grip distributions from newest sessions','increase adversarial parameter coverage'],'measure':'increase replay-to-road transfer confidence'},
 'controller-observability':{'impact':.82,'mutation':['publish causal event explanation fields','link decisions to evidence and confidence'],'measure':'increase explained-event coverage without runtime instability'},
}

def main()->int:
 twin=load(FACTORY/'vehicle-model-calibrated.json',{})
 episodes=load(FACTORY/'memory'/'episodes.json',{})
 experiments=load(FACTORY/'memory'/'experiments.json',{})
 evidence=load(FACTORY/'memory'/'evidence.json',{})
 builds=load(ROOT/'public'/'builds'/'index.json',{})
 graph=load(FACTORY/'knowledge-graph.json',{})
 hist=load(HISTORY,{'schema':1,'selections':[]})

 params=twin.get('parameters',{}) if isinstance(twin,dict) else {}
 calibration=twin.get('calibration',{}) if isinstance(twin,dict) else {}
 exp_rows=experiments.get('experiments',experiments if isinstance(experiments,list) else [])
 ev_rows=evidence.get('records',evidence if isinstance(evidence,list) else [])
 ep_rows=episodes.get('episodes',episodes if isinstance(episodes,list) else [])
 recent=hist.get('selections',[])[-30:]

 uncertainty={
  'truth-speed-fusion':max(num(params.get('gpsLagUncertainty'),.55),num(params.get('rpmLagUncertainty'),.55)),
  'jump-landing-classification':num(params.get('jumpLandingUncertainty'),.60),
  'sensor-dropout-recovery':num(params.get('dropoutUncertainty'),.62),
  'traction-control':num(params.get('gripUncertainty'),.58),
  'abs-control':num(params.get('brakingUncertainty'),.57),
  'runtime-memory':num(calibration.get('runtimeMemoryUncertainty'),.45),
  'digital-twin-transfer':1-num(calibration.get('transferConfidence'),.50),
  'controller-observability':num(calibration.get('explanationUncertainty'),.50),
 }

 def mentions(rows:list[Any],area:str)->int:
  terms=area.replace('-',' ').split();count=0
  for r in rows:
   text=json.dumps(r,sort_keys=True).lower()
   if any(t in text for t in terms):count+=1
  return count

 ranked=[]
 for area,meta in AREAS.items():
  u=max(0,min(1,uncertainty.get(area,.5)))
  coverage=mentions(ev_rows if isinstance(ev_rows,list) else [],area)+mentions(ep_rows if isinstance(ep_rows,list) else [],area)
  tested=mentions(exp_rows if isinstance(exp_rows,list) else [],area)
  recent_count=sum(1 for x in recent if x.get('area')==area)
  novelty=max(.15,1-min(1,recent_count/4))
  evidence_gap=1-min(1,coverage/20)
  failure_bonus=min(.25,tested*.025)
  information_gain=(u*.42+evidence_gap*.28+meta['impact']*.22+novelty*.08)
  priority=information_gain+failure_bonus
  ranked.append({'area':area,'uncertainty':round(u,4),'evidenceCoverage':coverage,'priorExperiments':tested,'recentSelections':recent_count,'expectedInformationGain':round(information_gain,4),'priority':round(priority,4),**meta})
 ranked.sort(key=lambda x:(x['priority'],x['impact']),reverse=True)
 chosen=ranked[0]
 champion=builds.get('recommended') or builds.get('latest') or 'current champion'
 hypothesis=f"A controller derived from {champion} using {', '.join(chosen['mutation'])} will {chosen['measure']}."
 experiment={
  'id':f"EXP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
  'area':chosen['area'],'name':f"Improve {chosen['area'].replace('-',' ')}",
  'parent':champion,'hypothesis':hypothesis,'mutations':chosen['mutation'],
  'measurement':chosen['measure'],'expectedInformationGain':chosen['expectedInformationGain'],
  'uncertainty':chosen['uncertainty'],'priority':chosen['priority'],
  'acceptanceCriteria':{'byteNovel':True,'behaviorallyNovel':True,'noRegression':True,'minimumConfidence':.85,'mustCompareAgainstChampion':True,'minimumScoreDelta':0.001},
  'requiredTests':['Lua 5.3 compile','MT12 normalization','static safety audit','digital-twin simulation','identical-input replay','adversarial regression suite','runtime memory check'],
  'reason':f"Highest expected information gain; uncertainty={chosen['uncertainty']}, evidence coverage={chosen['evidenceCoverage']}, prior experiments={chosen['priorExperiments']}.",
  'createdAt':now(),
 }
 doc={'schema':'JARVIS-EXPERIMENT-PLAN-1','generatedAt':now(),'champion':champion,'nextExperiment':experiment,'rankedUnknowns':ranked,'graphState':{'nodes':graph.get('nodeCount',0),'relationships':graph.get('relationshipCount',0)},'buildState':{'unique':builds.get('uniqueBuilds',0),'duplicatesRejected':builds.get('duplicatesRejected',0)}}
 save(OUT,doc);save(PLAN,doc)
 hist.setdefault('selections',[]).append({'at':now(),'area':chosen['area'],'experiment':experiment['id'],'expectedInformationGain':chosen['expectedInformationGain'],'champion':champion});hist['selections']=hist['selections'][-500:];hist['updatedAt']=now();save(HISTORY,hist)
 print(json.dumps({'experiment':experiment['id'],'area':chosen['area'],'champion':champion,'expectedInformationGain':chosen['expectedInformationGain']},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
