#!/usr/bin/env python3
"""Open-ended, evidence-gated idea generation for Jarvis controller evolution.

Implements a compact quality-diversity archive: ideas compete inside behavioral
niches, exhausted emitters cool down, and selection balances predicted quality,
behavioral novelty, evidence value, and coverage gain. It proposes experiments;
it never bypasses compile, semantic novelty, canonical-floor, bench, or road gates.
"""
from __future__ import annotations
import hashlib,json,math
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
STATE=ROOT/'factory'/'memory'/'innovation-state.json'
ARCHIVE=ROOT/'factory'/'memory'/'quality-diversity-archive.json'

EMITTERS={
 'truth-speed-fusion':[
  ('lag-phase-estimator',['phase-correlated GPS/RPM lag tracking','bounded handoff hysteresis']),
  ('dual-model-consensus',['independent GPS and RPM prediction residuals','agreement-conditioned truth authority']),
  ('innovation-gated-filter',['residual innovation gate','confidence decay during contradictory sensors']),
  ('lead-pull-observer',['separate acceleration lead and coast pull estimates','direction-aware scale learning']),
 ],
 'jump-landing-classification':[
  ('temporal-evidence-lattice',['independent takeoff, airborne, apex and landing evidence','ordered state-transition validation']),
  ('wheelspin-rejection',['wheelspin-versus-airborne likelihood ratio','ground-contact contradiction veto']),
  ('landing-impulse-observer',['post-air RPM/GPS convergence impulse','adaptive landing confirmation window']),
  ('hysteretic-flight-belief',['asymmetric airborne enter/exit confidence','minimum evidence dwell without fixed jump duration']),
 ],
 'sensor-dropout-recovery':[
  ('confidence-coast',['graded fail-open sensor confidence','state-preserving dropout coast']),
  ('shadow-estimator',['parallel last-good-state predictor','bounded residual catch-up on recovery']),
  ('sensor-quorum',['multi-signal validity voting','single-sensor contradiction isolation']),
  ('recovery-slew',['continuity-preserving authority slew','dropout-length-conditioned recovery rate']),
 ],
 'traction-control':[
  ('surface-slip-envelope',['surface-conditioned slip envelope','continuous intervention release']),
  ('energy-rate-controller',['wheel-energy growth estimator','torque authority proportional to excess energy rate']),
  ('predictive-slip-brake',['one-step slip forecast','pre-emptive but bounded authority reduction']),
  ('recovery-memory',['intervention outcome memory','reapply suppression after stable recovery']),
 ],
 'abs-control':[
  ('lock-confidence-ramp',['adaptive lock target confidence','linear release and reapply timing']),
  ('deceleration-residual',['expected-versus-observed deceleration residual','lock confidence independent of static brake']),
  ('cadence-adaptation',['surface-conditioned ABS cadence','recovery-slope-controlled reapply']),
  ('frontier-braking',['brake authority frontier tracking','bounded exploration around last stable deceleration']),
 ],
 'runtime-memory':[
  ('hot-path-cse',['deduplicate hot-path calculations','retain exact behavior while reclaiming bytecode']),
  ('state-lifetime-compaction',['expire nonpersistent scratch state by ownership','reuse only proven-disjoint slots']),
  ('telemetry-packing',['pack low-rate explanation telemetry','preserve full control precision']),
 ],
 'digital-twin-transfer':[
  ('adversarial-domain-randomization',['vary lag, grip, sag and dropout jointly','score worst-decile behavior']),
  ('uncertainty-calibration',['calibrate replay confidence against returned road logs','penalize simulation overconfidence']),
  ('counterexample-replay',['retain worst historical episodes','require improvement on failures without calm regression']),
 ],
 'controller-observability':[
  ('causal-decision-trace',['publish decision cause and supporting evidence','link authority caps to confidence']),
  ('counterfactual-shadow',['record unselected authority outcome estimate','compare chosen versus shadow action']),
  ('coverage-led-telemetry',['emit only unexplained event classes','retire fields after evidence saturation']),
 ],
}

def _load(path:Path,default:Any)->Any:
 try:return json.loads(path.read_text())
 except Exception:return default
def _save(path:Path,value:Any)->None:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,indent=2,sort_keys=True)+'\n')
def signature(area:str,emitter:str,mutations:list[str])->str:
 return hashlib.sha256(json.dumps([area,emitter,mutations],separators=(',',':')).encode()).hexdigest()[:20]
def _distance(a:list[float],b:list[float])->float:
 return math.sqrt(sum((x-y)**2 for x,y in zip(a,b))) if len(a)==len(b) else 1.0
def behavior_descriptor(row:dict[str,Any])->list[float]:
 replay=row.get('behaviorReplay',{}) if isinstance(row,dict) else {}
 caps=replay.get('eventCaps',{}) if isinstance(replay,dict) else {}
 return [round(float(replay.get('meanTargetError',0))/10,4),round(float(replay.get('recoveryError',0))/10,4),round(float(replay.get('authoritySmoothness',0)),4),round(float(caps.get('dropout',0))/100,4),round(float(caps.get('traction',0))/100,4),round(float(caps.get('abs',0))/100,4)]
def refresh_archive()->dict[str,Any]:
 cells={};entries=[]
 for p in (ROOT/'public'/'builds').glob('rewrite-*/TOURNAMENT.json'):
  data=_load(p,{})
  for row in data.get('candidates',[]):
   if row.get('status')!='COMPILED':continue
   d=behavior_descriptor(row);cell=':'.join(str(round(x*10)) for x in d);quality=float(row.get('score') or 0);entry={'mission':p.parent.name,'candidate':row.get('candidate'),'profile':row.get('profile'),'quality':quality,'descriptor':d,'cell':cell,'semanticSha256':(row.get('rewriteContract')or{}).get('semanticSha256')}
   entries.append(entry)
   if cell not in cells or quality>cells[cell]['quality']:cells[cell]=entry
 doc={'schema':'JARVIS-QD-ARCHIVE-1','descriptorAxes':['target-error','recovery-error','smoothness','dropout-cap','traction-cap','abs-cap'],'cells':cells,'entries':entries[-2000:],'coverage':len(cells),'population':len(entries)};_save(ARCHIVE,doc);return doc
def select(ranked:list[dict[str,Any]],count:int=5)->tuple[list[dict[str,Any]],dict[str,Any]]:
 state=_load(STATE,{'schema':'JARVIS-INNOVATION-1','uses':{},'failures':{},'retired':{}});archive=refresh_archive();uses=state.setdefault('uses',{});fails=state.setdefault('failures',{});retired=state.setdefault('retired',{})
 profile_area={'conservative':'sensor-dropout-recovery','balanced':'traction-control','learning':'jump-landing-classification','observability':'truth-speed-fusion','combined':'abs-control','synthesis':'synthesis-all-five'}
 covered_areas={profile_area.get(str(e.get('profile'))) for e in archive.get('entries',[])}
 proposals=[]
 for area in ranked:
  for emitter,mutations in EMITTERS.get(area['area'],[]):
   sig=signature(area['area'],emitter,mutations);used=int(uses.get(sig,0));failed=int(fails.get(sig,0));cooldown=max(0,used-2)+failed*2
   if failed>=3:retired[sig]={'area':area['area'],'emitter':emitter,'reason':'three failed or non-novel trials'};continue
   novelty=1/(1+used+failed);coverage=1.0 if area['area'] not in covered_areas else .35
   acquisition=float(area.get('expectedInformationGain',0))*.45+float(area.get('priority',0))*.25+novelty*.2+coverage*.1-cooldown*.08
   proposals.append({**area,'emitter':emitter,'mutations':mutations,'ideaSignature':sig,'noveltyAcquisition':round(acquisition,4),'priorUses':used,'priorFailures':failed,'retired':False})
 proposals.sort(key=lambda x:(x['noveltyAcquisition'],x.get('impact',0)),reverse=True)
 selected=[];areas=set()
 for p in proposals:
  if p['area'] in areas:continue
  selected.append(p);areas.add(p['area'])
  if len(selected)>=count:break
 for p in selected:uses[p['ideaSignature']]=int(uses.get(p['ideaSignature'],0))+1
 state.update({'schema':'JARVIS-INNOVATION-1','uses':uses,'failures':fails,'retired':retired,'lastSelected':[p['ideaSignature'] for p in selected],'archiveCoverage':archive.get('coverage',0)});_save(STATE,state)
 return selected,{'archiveCoverage':archive.get('coverage',0),'archivePopulation':archive.get('population',0),'retiredIdeas':len(retired),'candidateIdeas':len(proposals),'selectionPolicy':'prediction-focused information gain + quality diversity + emitter cooldown'}
