#!/usr/bin/env python3
"""Jarvis research-aware portfolio engineering planner.

Ranks unresolved engineering areas using vehicle/log evidence plus verified external
research. External research may change hypothesis priority and wording, but never
mutates controller code directly. Five independent hypotheses plus JRW6 synthesis
remain mandatory and all controller changes remain gated by compile/bench/road tests.
"""
from __future__ import annotations
import json
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
import jarvis_innovation_engine as innovation
ROOT=Path(__file__).resolve().parents[1];FACTORY=ROOT/'factory';PUBLIC=ROOT/'public'/'jarvis-data';OUT=FACTORY/'next-experiment.json';PLAN=PUBLIC/'experiment-plan.json';HISTORY=FACTORY/'memory'/'planner-history.json'
def load(p:Path,d:Any)->Any:
 try:return json.loads(p.read_text(encoding='utf-8'))
 except (FileNotFoundError,json.JSONDecodeError,OSError):return d
def save(p:Path,v:Any)->None:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+'\n',encoding='utf-8')
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
CORE_FIVE=['sensor-dropout-recovery','traction-control','jump-landing-classification','truth-speed-fusion','abs-control']
def main()->int:
 twin=load(FACTORY/'vehicle-model-calibrated.json',{});episodes=load(FACTORY/'memory'/'episodes.json',{});experiments=load(FACTORY/'memory'/'experiments.json',{});evidence=load(FACTORY/'memory'/'evidence.json',{});builds=load(ROOT/'public'/'builds'/'index.json',{});graph=load(FACTORY/'knowledge-graph.json',{});hist=load(HISTORY,{'schema':4,'selections':[]});research=load(FACTORY/'memory'/'external-research.json',{});evolution=load(FACTORY/'evolution-controller.json',{});canonical=load(FACTORY/'canonical-controller.json',{})
 params=twin.get('parameters',{}) if isinstance(twin,dict) else {};cal=twin.get('calibration',{}) if isinstance(twin,dict) else {};exp_rows=experiments.get('experiments',experiments if isinstance(experiments,list) else []);ev_rows=evidence.get('records',evidence if isinstance(evidence,list) else []);ep_rows=episodes.get('episodes',episodes if isinstance(episodes,list) else []);recent=hist.get('selections',[])[-60:];rareas=research.get('areas',{}) if isinstance(research,dict) else {}
 uncertainty={'truth-speed-fusion':max(num(params.get('gpsLagUncertainty'),.55),num(params.get('rpmLagUncertainty'),.55)),'jump-landing-classification':num(params.get('jumpLandingUncertainty'),.60),'sensor-dropout-recovery':num(params.get('dropoutUncertainty'),.62),'traction-control':num(params.get('gripUncertainty'),.58),'abs-control':num(params.get('brakingUncertainty'),.57),'runtime-memory':num(cal.get('runtimeMemoryUncertainty'),.45),'digital-twin-transfer':1-num(cal.get('transferConfidence'),.50),'controller-observability':num(cal.get('explanationUncertainty'),.50)}
 def mentions(rows:list[Any],area:str)->int:
  terms=area.replace('-',' ').split();return sum(1 for r in rows if any(t in json.dumps(r,sort_keys=True).lower() for t in terms))
 ranked=[]
 for area,meta in AREAS.items():
  u=max(0,min(1,uncertainty.get(area,.5)));coverage=mentions(ev_rows if isinstance(ev_rows,list) else [],area)+mentions(ep_rows if isinstance(ep_rows,list) else [],area);tested=mentions(exp_rows if isinstance(exp_rows,list) else [],area);recent_count=sum(1 for x in recent if area in x.get('areas',[x.get('area')]))
  novelty=max(.1,1-min(1,recent_count/5));gap=1-min(1,coverage/20);repeat_penalty=min(.18,recent_count*.035);r=rareas.get(area,{}) if isinstance(rareas,dict) else {};rw=max(0,min(1,num(r.get('supportWeight'),0)));rf=int(r.get('findings',0) or 0);research_bonus=min(.12,rw*.10+(min(rf,3)*.01));info=u*.35+gap*.24+meta['impact']*.23+novelty*.08+rw*.10;priority=info+min(.10,tested*.012)+research_bonus-repeat_penalty
  ranked.append({'area':area,'uncertainty':round(u,4),'evidenceCoverage':coverage,'priorExperiments':tested,'recentSelections':recent_count,'externalResearchFindings':rf,'externalResearchWeight':round(rw,4),'externalResearchHypotheses':r.get('hypotheses',[])[:3] if isinstance(r,dict) else [],'expectedInformationGain':round(info,4),'priority':round(priority,4),**meta})
 ranked.sort(key=lambda x:(x['priority'],x['impact']),reverse=True);portfolio,innovation_state=innovation.select(ranked,5)
 champion=evolution.get('release') or builds.get('recommended') or builds.get('latest') or 'current evolution parent';canonical_floor=canonical.get('release') or 'unknown';eid=f"EXP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}";hypotheses=[]
 for slot,row in enumerate(portfolio,1):
  research_h=row.get('externalResearchHypotheses') or [];base=f"A {row['area']} candidate derived from {champion} using the {row['emitter']} mechanism—{', '.join(row['mutations'])}—will {row['measure']}.";hyp=research_h[0] if research_h else base
  hypotheses.append({'slot':slot,'area':row['area'],'name':f"{row['emitter'].replace('-',' ').title()} for {row['area'].replace('-',' ')}",'hypothesis':hyp,'baselineHypothesis':base,'emitter':row['emitter'],'ideaSignature':row['ideaSignature'],'noveltyAcquisition':row['noveltyAcquisition'],'mutations':row['mutations'],'measurement':row['measure'],'expectedInformationGain':row['expectedInformationGain'],'priority':row['priority'],'externalResearch':{'runId':research.get('researchRun'),'findings':row['externalResearchFindings'],'weight':row['externalResearchWeight'],'sourceIds':(rareas.get(row['area'],{}) or {}).get('sourceIds',[])},'researchCanDirectlyMutateController':False})
 synthesis={'slot':6,'area':'synthesis-all-five','name':'Synthesize all five hypotheses','inputs':[h['area'] for h in hypotheses],'rule':'compose only compatible mutations that occupy a new behavioral niche; reject identity-only, historical-semantic duplicate, canonical-floor regression, compile failure, or MT12 size violation','measurement':'beat each constituent on aggregate benefit while increasing quality-diversity archive coverage'}
 experiment={'id':eid,'area':hypotheses[0]['area'],'emitter':hypotheses[0]['emitter'],'ideaSignature':hypotheses[0]['ideaSignature'],'name':'Quality-diversity active innovation generation plus synthesis','parent':champion,'canonicalFloor':canonical_floor,'hypothesis':'Run five independent archive-selected hypotheses on the active evolution parent, then build a sixth synthesis while continuously checking the immutable canonical floor.','mutations':[m for h in hypotheses for m in h['mutations']],'measurement':'maximize prediction-focused information gain and behavioral archive coverage while preserving defended behavior','expectedInformationGain':round(sum(h['expectedInformationGain'] for h in hypotheses)/5,4),'portfolio':hypotheses,'synthesis':synthesis,'innovationState':innovation_state,'externalResearch':{'runId':research.get('researchRun'),'topic':research.get('topic'),'acceptedBridgeFindings':research.get('acceptedBridgeFindings',0),'policy':research.get('policy',{})},'acceptanceCriteria':{'byteNovel':True,'behaviorallyNovel':True,'semanticNovelAgainstParent':True,'qualityDiversityNicheRequired':True,'identityOnlyRejected':True,'noRegression':True,'minimumConfidence':.85,'mustCompareAgainstChampion':True,'mustPreserveCanonicalFloor':True,'inheritedCapabilityBonus':False,'fiveIndependentHypotheses':True,'sixthSynthesisRequired':True,'externalResearchMayDirectlyMutateController':False},'requiredTests':['Lua 5.3 compile','MT12 normalization','static safety audit','semantic and historical novelty audit','quality-diversity descriptor audit','canonical defended-lineage gate','runtime memory/size check','bench and road evidence before canonical promotion'],'reason':'Portfolio uses emitter cooldown and quality-diversity coverage to explore new engineering mechanisms while retaining a separate immutable safe canonical fallback.','createdAt':now()}
 doc={'schema':'JARVIS-EXPERIMENT-PLAN-5','generatedAt':now(),'champion':champion,'evolutionParent':champion,'canonicalFloor':canonical_floor,'nextExperiment':experiment,'portfolio':hypotheses,'synthesis':synthesis,'rankedUnknowns':ranked,'innovationState':innovation_state,'externalResearchState':experiment['externalResearch'],'graphState':{'nodes':graph.get('nodeCount',0),'relationships':graph.get('relationshipCount',0)},'buildState':{'unique':builds.get('uniqueBuilds',0),'duplicatesRejected':builds.get('duplicatesRejected',0)}}
 save(OUT,doc);save(PLAN,doc);hist['schema']=5;hist.setdefault('selections',[]).append({'at':now(),'areas':[h['area'] for h in hypotheses],'ideaSignatures':[h['ideaSignature'] for h in hypotheses],'emitters':[h['emitter'] for h in hypotheses],'experiment':eid,'champion':champion,'canonicalFloor':canonical_floor,'strategy':'quality-diversity-active-innovation','researchRun':research.get('researchRun')});hist['selections']=hist['selections'][-500:];hist['updatedAt']=now();save(HISTORY,hist)
 print(json.dumps({'experiment':eid,'evolutionParent':champion,'canonicalFloor':canonical_floor,'areas':[h['area'] for h in hypotheses],'synthesis':'synthesis-all-five','researchRun':research.get('researchRun'),'researchFindings':research.get('acceptedBridgeFindings',0)},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
