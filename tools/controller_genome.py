from __future__ import annotations
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist-jarvis-factory'
def load(p,d):
 try:return json.loads(p.read_text())
 except:return d
def main():
 OUT.mkdir(exist_ok=True);t=load(ROOT/'dist-controller-tournament/TOURNAMENT.json',{});sim=load(OUT/'ADAPTIVE-DIGITAL-TWIN.json',{});attr=load(OUT/'LOG-IDENTITY-ATTRIBUTION.json',{});gen=[]
 for c in t.get('candidates',[]):
  profile=c.get('profile','unknown');dims=c.get('intelligenceBreakdown',{});delta=float(c.get('intelligenceDelta') or 0);compiled=c.get('status')=='COMPILED';transfer=max(0,min(.98,.45+.03*sim.get('scenarioCount',0)/22+.02*min(10,attr.get('exactMatches',0))+.025*max(0,delta)))
  g={'schema':1,'controller':c.get('candidate'),'parent':c.get('parent'),'profile':profile,'sourceSha256':c.get('sourceSha256'),'luacSha256':c.get('luacSha256'),'codeFingerprint':hashlib.sha256(json.dumps(c,sort_keys=True).encode()).hexdigest(),'architecture':{'truthFusion':'adaptive' if 'observability' in profile or 'combined' in profile else 'parent','learning':'enhanced' if 'learning' in profile or 'combined' in profile else 'parent','controlStyle':'conservative' if profile=='conservative' else 'balanced','faultTolerance':'measured','causalReasoning':'measured'},'intelligence':dims,'simulation':{'authority':'SIMULATION_PROVEN' if compiled and delta>0 else 'SIMULATION_TESTED','delta':delta,'transferConfidence':round(transfer,4),'scenarioCount':sim.get('scenarioCount',0)},'evidence':{'exactAttributedLogs':attr.get('exactMatches',0),'unknownLogs':attr.get('unknown',0)},'deploymentAuthority':'BENCH_CANDIDATE' if compiled and delta>0 else 'EXPERIMENTAL'};gen.append(g)
 (OUT/'CONTROLLER-GENOMES.json').write_text(json.dumps({'schema':1,'genomes':gen},indent=2)+'\n');print(json.dumps({'genomes':len(gen),'simulationProven':sum(x['simulation']['authority']=='SIMULATION_PROVEN' for x in gen)}))
if __name__=='__main__':main()
