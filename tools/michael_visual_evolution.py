#!/usr/bin/env python3
import argparse,json,math,re,os
from pathlib import Path
from datetime import datetime,timezone

GENOME=Path('michael/visual/genome.json')
STATE=Path('michael/visual/state.json')
RUNTIME=Path('jarvis/mjx7303-racing-michael-v39.js')
HTML=Path('racing-mjx7303-michael-v39.html')

def load(p): return json.loads(Path(p).read_text())
def dump(p,x): Path(p).write_text(json.dumps(x,indent=2,sort_keys=False)+'\n')

def apply(proposal_path):
    genome=load(GENOME);state=load(STATE);proposal=load(proposal_path)
    params=dict(genome['parameters']);cand=proposal.get('candidateParameters') or {}
    if not isinstance(cand,dict) or not cand: raise SystemExit('No candidateParameters proposed')
    if len(cand)>6: raise SystemExit('Candidate exceeds six-parameter mutation limit')
    locked=set(state.get('lockedParameters',[]));accepted={}
    for k,v in cand.items():
        if k not in params or k not in genome['bounds']: raise SystemExit(f'Unknown visual parameter {k}')
        if k in locked: continue
        lo,hi=map(float,genome['bounds'][k]);old=float(params[k]);new=float(v)
        if not math.isfinite(new): raise SystemExit(f'Non-finite value for {k}')
        new=max(lo,min(hi,new));maxstep=(hi-lo)*float(genome.get('maxStepFraction',.18));new=max(old-maxstep,min(old+maxstep,new))
        params[k]=round(new,4);accepted[k]=params[k]
    if not accepted: raise SystemExit('No unlocked bounded mutation survived validation')
    genome['parameters']=params;genome['generation']=int(genome.get('generation',0))+1
    dump(GENOME,genome)
    print(json.dumps({'generation':genome['generation'],'accepted':accepted,'authority':'NATIVE_V40_GENOME_ONLY'},indent=2))

def active_version(src):
    m=re.search(r"michael-graphics-v40\.js\?v=michael(\d+)",src)
    if not m: raise SystemExit('Cannot find active Michael V40 cache version')
    return int(m.group(1))

def bump_version():
    src=RUNTIME.read_text();html=HTML.read_text();old=active_version(src)
    seen=[int(x) for x in re.findall(r'michael(\d+)',src+html)]
    new=max([old,*seen])+1
    src=re.sub(r"(michael-graphics-v40\.js\?v=michael)\d+",lambda m:m.group(1)+str(new),src)
    src=re.sub(r"(mjx7303-v33\.glb\?v=michael)\d+",lambda m:m.group(1)+str(new),src)
    html=re.sub(r"(mjx7303-racing-michael-v39\.js\?v=michael)\d+",lambda m:m.group(1)+str(new),html)
    RUNTIME.write_text(src);HTML.write_text(html)
    print(json.dumps({'old':old,'new':new,'outerAndInner':True}))

def enable_v40():
    src=RUNTIME.read_text();changed=False
    if './michael-graphics-v40.js' not in src:
        src=src.replace('./michael-graphics-v39.js','./michael-graphics-v40.js');changed=True
    bad=re.search(r'// MICHAEL_VISUAL_GENOME_BEGIN[\s\S]*?// MICHAEL_VISUAL_GENOME_END\n?',src)
    if bad and 'function addBodyAuthority' in bad.group(0):
        src=src[:bad.start()]+"// MICHAEL_VISUAL_GENOME_BEGIN -- native V40 genome authority; no runtime body overlay.\n// MICHAEL_VISUAL_GENOME_END\n"+src[bad.end():];changed=True
    newer=src.replace('refineVehicle();addBodyAuthority();','refineVehicle();');changed=changed or newer!=src;src=newer
    if changed:
        RUNTIME.write_text(src);bump_version()
    print(json.dumps({'changed':changed,'graphics':'v40','authority':'NATIVE_GENOME_ONLY','runtimeBodyOverlay':False},indent=2))

def finalize(proposal_path,verdict_path,base_metrics,cand_metrics,out):
    genome=load(GENOME);state=load(STATE);proposal=load(proposal_path);verdict=load(verdict_path);bm=load(base_metrics);cm=load(cand_metrics)
    b=float(verdict.get('baselineScore',proposal.get('score',0)) or 0);c=float(verdict.get('candidateScore',0) or 0);gain=c-b
    bf=float(bm.get('frameMs') or 0);cf=float(cm.get('frameMs') or 0);perf_ok=cf>0 and cf<=20.0 and (bf<=0 or cf<=bf+.8)
    ready=bool(cm.get('ready')) and bool(cm.get('v39'));src=RUNTIME.read_text()
    invariants=('lat=clamp((p?.x||0)*1.55' in src and 'function chaseRoad' in src and 'michael-graphics-v40.js' in src and 'addBodyAuthority();' not in src)
    regressions=list(verdict.get('regressions') or []);temporal_ok=True;uncertainty=0
    temporal=os.getenv('NICKELLE_TEMPORAL_JSON');analysis=os.getenv('NICKELLE_ANALYSIS_JSON')
    if temporal and Path(temporal).exists(): temporal_ok=bool(load(temporal).get('summary',{}).get('temporalPass',False))
    if analysis and Path(analysis).exists(): uncertainty=float(load(analysis).get('uncertainty',0) or 0)
    promote=bool(verdict.get('promote')) and gain>=float(genome.get('minimumPromotionGain',1.5)) and not regressions and perf_ok and ready and invariants and temporal_ok and uncertainty<=.72
    decision={'promote':promote,'baselineScore':b,'candidateScore':c,'gain':gain,'performanceOK':perf_ok,'ready':ready,'invariants':invariants,'temporalOK':temporal_ok,'uncertainty':uncertainty,'regressions':regressions,'nativeGenomeOnly':True,'runtimeBodyOverlay':False,'reason':verdict.get('reason','')}
    if promote:
        state['generation']=int(genome.get('generation',0));state['bestScore']=c;state['lastCandidateScore']=c;state['lastDecision']='PROMOTED'
        changed=(proposal.get('candidateParameters') or {}).keys();wins=state.setdefault('stableWins',{});locked=set(state.get('lockedParameters',[]));limit=int(genome.get('lockAfterStableWins',8))
        for k in changed:
            wins[k]=int(wins.get(k,0))+1
            if wins[k]>=limit: locked.add(k)
        state['lockedParameters']=sorted(locked)
    else:
        state['lastCandidateScore']=c;state['lastDecision']='REJECTED'
    state['lastRun']=datetime.now(timezone.utc).isoformat();state['protectedRegressions']=regressions;state['nativeGenomeOnly']=True;state['runtimeBodyOverlay']=False
    dump(STATE,state);dump(out,decision);print(json.dumps(decision,indent=2))

def main():
    ap=argparse.ArgumentParser();sp=ap.add_subparsers(dest='cmd',required=True)
    a=sp.add_parser('apply');a.add_argument('proposal')
    sp.add_parser('bump-version');sp.add_parser('enable-v40')
    f=sp.add_parser('finalize');f.add_argument('proposal');f.add_argument('verdict');f.add_argument('base_metrics');f.add_argument('cand_metrics');f.add_argument('out')
    args=ap.parse_args()
    if args.cmd=='apply': apply(args.proposal)
    elif args.cmd=='bump-version': bump_version()
    elif args.cmd=='enable-v40': enable_v40()
    else: finalize(args.proposal,args.verdict,args.base_metrics,args.cand_metrics,args.out)
if __name__=='__main__': main()
