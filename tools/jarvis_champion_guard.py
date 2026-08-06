#!/usr/bin/env python3
"""Protect Jarvis's champion from weak, indirect, or unsafe promotion."""
from __future__ import annotations
import json
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
ROOT=Path(__file__).resolve().parents[1];BUILDS=ROOT/'public'/'builds';INDEX=BUILDS/'index.json';REC=BUILDS/'recommended.json';TRACKS=ROOT/'factory'/'tracks.json';OUT=ROOT/'public'/'jarvis-data'/'champion-protection.json';HISTORY=ROOT/'factory'/'memory'/'champion-history.json'
def load(p:Path,d:Any)->Any:
 try:return json.loads(p.read_text(encoding='utf-8'))
 except (FileNotFoundError,json.JSONDecodeError,OSError):return d
def save(p:Path,v:Any)->None:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+'\n',encoding='utf-8')
def now()->str:return datetime.now(timezone.utc).isoformat()
def rank(v:str)->int:
 order=['GENERATED','COMPILED','STATICALLY_VALIDATED','SIMULATION_TESTED','SIMULATION_PROVEN','REPLAY_PROVEN','BENCH_PROVEN','ROAD_PROVEN'];u=str(v).upper();return next((i for i,x in enumerate(order) if x in u),1)
def main()->int:
 idx=load(INDEX,{'builds':[]});tracks=load(TRACKS,{})
 old=load(REC,{})
 champion=(old.get('controller') or {}).get('name') if isinstance(old,dict) else None
 if not champion:
  t=tracks.get('champion')
  champion=t.get('name') or t.get('controller') if isinstance(t,dict) else t
 if not champion:champion=idx.get('recommended') or idx.get('latest')
 builds=idx.get('builds',[]);by={b.get('name'):b for b in builds if b.get('name')}
 champion_build=by.get(champion,{}) if champion else {}
 decisions=[];eligible=[]
 for b in builds:
  name=b.get('name');parent=b.get('parent');authority=b.get('authority','COMPILED');delta=b.get('scoreDelta');confidence=b.get('confidence')
  try:delta=float(delta) if delta is not None else None
  except (TypeError,ValueError):delta=None
  try:confidence=float(confidence) if confidence is not None else None
  except (TypeError,ValueError):confidence=None
  directly_comparable=not champion or name==champion or parent==champion or b.get('comparisonTarget')==champion
  reasons=[]
  if name==champion:reasons.append('CURRENT_CHAMPION')
  if not directly_comparable:reasons.append('NOT_COMPARED_TO_CHAMPION')
  if rank(authority)<rank('REPLAY_PROVEN'):reasons.append('BELOW_REPLAY_PROVEN')
  if delta is None or delta<=0:reasons.append('NO_POSITIVE_CHAMPION_DELTA')
  if confidence is None or confidence<.85:reasons.append('CONFIDENCE_BELOW_85_PERCENT')
  if b.get('regression') or b.get('regressions'):reasons.append('REGRESSION_DETECTED')
  if b.get('luacBytes',0)>98304:reasons.append('MT12_SIZE_SAFETY_EXCEEDED')
  cleared=not reasons and name!=champion
  b['championComparable']=directly_comparable;b['championDelta']=delta if directly_comparable else None;b['championGateEligible']=cleared
  if cleared:eligible.append(b)
  decisions.append({'candidate':name,'parent':parent,'authority':authority,'scoreDelta':delta,'confidence':confidence,'directlyComparable':directly_comparable,'cleared':cleared,'reasons':reasons or ['CLEARED_CHAMPION_GATE']})
 winner=max(eligible,key=lambda x:(x.get('championDelta') or 0,x.get('confidence') or 0,-x.get('luacBytes',0)),default=None)
 promoted=False
 if winner:
  champion=winner['name'];champion_build=winner;promoted=True
 for b in builds:
  b['recommended']=bool(champion and b.get('name')==champion)
 idx['recommended']=champion;idx['championProtected']=True;idx['championGateUpdatedAt']=now();save(INDEX,idx)
 if champion_build:
  save(REC,{'schema':2,'updatedAt':now(),'controller':champion_build,'physicalAuthorityCeiling':'REPLAY_PROVEN','championProtection':{'directComparisonRequired':True,'minimumConfidence':.85,'positiveDeltaRequired':True,'regressionsAllowed':False,'mt12ByteCeiling':98304}})
 report={'schema':'JARVIS-CHAMPION-GUARD-1','updatedAt':now(),'champion':champion,'promotedThisRun':promoted,'challenger':winner.get('name') if winner else None,'rules':{'directComparisonRequired':True,'minimumAuthority':'REPLAY_PROVEN','minimumConfidence':.85,'minimumChampionDelta':0.001,'regressionsAllowed':False,'mt12ByteCeiling':98304},'decisions':decisions}
 save(OUT,report)
 hist=load(HISTORY,{'schema':1,'events':[]});hist.setdefault('events',[]).append({'at':now(),'champion':champion,'promoted':promoted,'challenger':winner.get('name') if winner else None});hist['events']=hist['events'][-500:];hist['updatedAt']=now();save(HISTORY,hist)
 print(json.dumps({'champion':champion,'promoted':promoted,'eligibleChallengers':len(eligible)},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
