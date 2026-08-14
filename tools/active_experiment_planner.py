from __future__ import annotations
import json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist-jarvis-factory'
def load(p,d):
 try:return json.loads(p.read_text())
 except:return d
def save(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=2,sort_keys=True)+'\n')
def main():
 eps=load(OUT/'ATTRIBUTED-EPISODES.json',{'episodes':[]})['episodes'];twin=load(OUT/'ADAPTIVE-DIGITAL-TWIN.json',{});mem=load(ROOT/'factory/memory/experiments.json',{'records':[]})['records']
 domains={'gps_dropout':0,'rpm_delay':0,'wet_launch':0,'jump_landing':0,'braking':0,'sensor_disagreement':0,'memory_load_save':0,'long_runtime':0}
 for e in eps:
  log=e.get('log','').lower()
  for k in domains:
   if k.replace('_','') in log.replace('_','').replace('-',''):domains[k]+=1
 prior_fail={k:0 for k in domains}
 for r in mem[-200:]:
  txt=json.dumps(r).lower()
  for k in domains:
   if k in txt and r.get('result') not in {'IMPROVED','PROMOTED'}:prior_fail[k]+=1
 ranked=[]
 for k,n in domains.items():
  uncertainty=1/(1+n)
  failurePressure=min(1,prior_fail[k]/5)
  transferGap=1-float(twin.get('transferConfidence',.5) or .5)
  value=.5*uncertainty+.3*failurePressure+.2*transferGap
  ranked.append({'experiment':k,'observedEpisodes':n,'priorFailures':prior_fail[k],'uncertainty':round(uncertainty,4),'expectedInformationGain':round(value,4),'requiredEvidence':['imprinted blackbox log','controller ID groups 144-147','event outcome window']})
 ranked.sort(key=lambda x:x['expectedInformationGain'],reverse=True)
 result={'schema':1,'nextExperiment':ranked[0] if ranked else None,'queue':ranked,'policy':'maximize information gain while preserving protected contracts','automaticAction':'generate targeted simulation and challenger mutations for top experiment'}
 save(OUT/'NEXT-EXPERIMENT.json',result);print(json.dumps(result['nextExperiment']))
if __name__=='__main__':main()
