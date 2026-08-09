#!/usr/bin/env python3
import argparse,json,math,re,os
from pathlib import Path
GENOME=Path('michael/visual/genome.json');STATE=Path('michael/visual/state.json');RUNTIME=Path('jarvis/mjx7303-racing-michael-v39.js');HTML=Path('racing-mjx7303-michael-v39.html')
def load(p): return json.loads(Path(p).read_text())
def dump(p,x): Path(p).write_text(json.dumps(x,indent=2,sort_keys=False)+'\n')
def num(x):
    s=f'{float(x):.4f}'.rstrip('0').rstrip('.');return s if s!='-0' else '0'
def body_function(p):
    g=lambda k:num(p[k]);gen=int(load(GENOME).get('generation',0))+1
    native=f"globalThis.__MICHAEL_NATIVE_VISUAL={{wheelRadius:{g('wheel_radius')},wheelTrackX:{g('wheel_track_x')},wheelWidth:{g('wheel_width')},wheelY:{g('wheel_y')},paintRoughnessScale:{g('paint_roughness_scale')},darkRoughnessScale:{g('dark_roughness_scale')},exposureScale:{g('exposure_scale')},keyLightScale:{g('key_light_scale')},ambientScale:{g('ambient_scale')},generation:{gen}}};"
    return f'''// MICHAEL_VISUAL_GENOME_BEGIN -- Nickelle generated; automatic edits stay inside this authority block.\n{native}\nfunction addBodyAuthority(){{\n  if(!xr?._mesh)return;\n  const dark=new BodyBatch(),red=new BodyBatch(),white=new BodyBatch(),yellow=new BodyBatch();\n  dark.q([-{g('grille_half_bottom')},{g('grille_bottom_y')},3.050],[{g('grille_half_bottom')},{g('grille_bottom_y')},3.050],[{g('grille_half_top')},{g('grille_top_y')},3.050],[-{g('grille_half_top')},{g('grille_top_y')},3.050],[0,0,1]);\n  dark.q([-.99,.18,3.000],[.99,.18,3.000],[1.17,.235,2.72],[-1.17,.235,2.72],[0,1,0]);\n  ring(red,-.96,.61,3.054,{g('projector_outer_rx')},{g('projector_outer_ry')},{g('projector_red_inner_rx')},{g('projector_red_inner_ry')},22);ring(red,.96,.61,3.054,{g('projector_outer_rx')},{g('projector_outer_ry')},{g('projector_red_inner_rx')},{g('projector_red_inner_ry')},22);\n  ring(dark,-.96,.61,3.058,{g('projector_black_outer_rx')},{g('projector_black_outer_ry')},{g('projector_black_inner_rx')},{g('projector_black_inner_ry')},22);ring(dark,.96,.61,3.058,{g('projector_black_outer_rx')},{g('projector_black_outer_ry')},{g('projector_black_inner_rx')},{g('projector_black_inner_ry')},22);\n  for(const s of [-1,1]){{const n=[s,0,0],x=s*{g('arch_x')};dark.q([x,.39,2.58],[x,.39,2.03],[x,.98,1.78],[x,1.05,2.31],n);dark.q([x,.42,-1.48],[x,.42,-1.88],[x,.78,-2.00],[x,.88,-1.62],n);red.q([x+s*.006,{g('door_red_bottom')},-.98],[x+s*.006,{g('door_red_bottom')},.92],[x+s*.006,1.12,.83],[x+s*.006,{g('door_red_top')},-.90],n);dark.q([x+s*.011,{g('door_black_bottom')},-.74],[x+s*.011,{g('door_black_bottom')},.70],[x+s*.011,.89,.66],[x+s*.011,{g('door_black_top')},-.68],n);yellow.q([x+s*.015,{g('skirt_y_bottom')},-1.04],[x+s*.015,{g('skirt_y_bottom')},.86],[x+s*.015,{g('skirt_y_top')},.82],[x+s*.015,{g('skirt_y_top')},-1.00],n);dark.box(s*1.17,1.39,.48,.17,.10,.25)}}\n  white.q([-.94,{g('roof_y_front')},-1.40],[.94,{g('roof_y_front')},-1.40],[.84,{g('roof_y_rear')},.92],[-.84,{g('roof_y_rear')},.92],[0,1,0]);white.q([-.72,1.20,2.06],[.72,1.20,2.06],[.62,1.46,1.12],[-.62,1.46,1.12],[0,.55,.84]);\n  white.box(0,1.92,.34,{g('scoop_width')},{g('scoop_height')},{g('scoop_length')});red.box(0,1.995,.21,.39,.025,.20);\n  dark.q([-.98,1.59,-2.49],[.98,1.59,-2.49],[.91,1.64,-2.65],[-.91,1.64,-2.65],[0,1,0]);for(const s of [-1,1]){{const x=s*{g('wing_end_x')};dark.q([x,1.48,-2.47],[x,1.48,-2.72],[x,1.86,-2.82],[x,1.82,-2.50],[s,0,0]);dark.box(s*1.02,1.62,-2.56,.045,.34,.14)}}\n  dark.q([-{g('diffuser_half_bottom')},.19,-3.040],[{g('diffuser_half_bottom')},.19,-3.040],[{g('diffuser_half_top')},.53,-3.040],[-{g('diffuser_half_top')},.53,-3.040],[0,0,-1]);for(const x of [-.68,0,.68])dark.q([x-.032,.18,-3.043],[x+.032,.18,-3.043],[x+.024,.50,-2.86],[x-.024,.50,-2.86],[0,0,-1]);dark.box(0,.37,-3.085,.32,.12,.10);\n  const draws=pushBody(dark,[.006,.008,.010],.12,.44)+pushBody(red,[.64,.018,.020],.02,.32)+pushBody(white,[.82,.82,.79],.02,.34)+pushBody(yellow,[.92,.63,.015],.01,.38);\n  globalThis.__MICHAEL_BODY_AUTHORITY={{source:'OWNER_7303_PHOTOS_VISUAL_GENOME',generation:{gen},frontGrille:true,redProjectorSurrounds:true,blackProjectorBezels:true,blackFrontArches:true,redDoorAuthority:true,blackLowerDoorInsert:true,yellowSkirtAccent:true,whiteRoof:true,whiteHoodGraphic:true,rectangularRoofScoop:true,licensedMainWing:true,blackWingEndplates:true,rearDiffuser:true,centralExhaust:true,whiteRallyWheels:true,nickelleNativeVisual:true,batchedDraws:draws}};\n}}\n// MICHAEL_VISUAL_GENOME_END'''
def apply(proposal_path):
    genome=load(GENOME);state=load(STATE);proposal=load(proposal_path);params=dict(genome['parameters']);cand=proposal.get('candidateParameters') or {}
    if not isinstance(cand,dict) or not cand: raise SystemExit('No candidateParameters proposed')
    if len(cand)>6: raise SystemExit('Candidate exceeds six-parameter mutation limit')
    locked=set(state.get('lockedParameters',[]));accepted={}
    for k,v in cand.items():
        if k not in params or k not in genome['bounds']: raise SystemExit(f'Unknown visual parameter {k}')
        if k in locked: continue
        lo,hi=map(float,genome['bounds'][k]);old=float(params[k]);new=float(v)
        if not math.isfinite(new): raise SystemExit(f'Non-finite value for {k}')
        new=max(lo,min(hi,new));maxstep=(hi-lo)*float(genome.get('maxStepFraction',.18));new=max(old-maxstep,min(old+maxstep,new));params[k]=round(new,4);accepted[k]=params[k]
    if not accepted: raise SystemExit('No unlocked bounded mutation survived validation')
    genome['parameters']=params;genome['generation']=int(genome.get('generation',0))+1;dump(GENOME,genome);src=RUNTIME.read_text();fn=body_function(params)
    pattern=r'(?:\/\/ MICHAEL_VISUAL_GENOME_BEGIN[\s\S]*?\/\/ MICHAEL_VISUAL_GENOME_END|function addBodyAuthority\(\)\{[\s\S]*?\n\})\nclass TruthTelemetry'
    new,n=re.subn(pattern,fn+'\nclass TruthTelemetry',src,count=1)
    if n!=1: raise SystemExit('Could not isolate Michael visual authority function')
    RUNTIME.write_text(new);print(json.dumps({'generation':genome['generation'],'accepted':accepted},indent=2))
def active_version(src):
    m=re.search(r"michael-graphics-v(?:39|40)\.js\?v=michael(\d+)",src)
    if not m: raise SystemExit('Cannot find active Michael cache version')
    return int(m.group(1))
def bump_version():
    src=RUNTIME.read_text();old=active_version(src);new=old+1;src=src.replace(f'michael{old}',f'michael{new}');RUNTIME.write_text(src);HTML.write_text(HTML.read_text().replace(f'michael{old}',f'michael{new}'));print(json.dumps({'old':old,'new':new}))
def enable_v40():
    src=RUNTIME.read_text();
    if "./michael-graphics-v40.js" in src: print(json.dumps({'changed':False,'graphics':'v40'}));return
    old=active_version(src);new=old+1;src=src.replace("./michael-graphics-v39.js", "./michael-graphics-v40.js").replace(f'michael{old}',f'michael{new}');RUNTIME.write_text(src);HTML.write_text(HTML.read_text().replace(f'michael{old}',f'michael{new}'));print(json.dumps({'changed':True,'graphics':'v40','old':old,'new':new}))
def finalize(proposal_path,verdict_path,base_metrics,cand_metrics,out):
    genome=load(GENOME);state=load(STATE);proposal=load(proposal_path);verdict=load(verdict_path);bm=load(base_metrics);cm=load(cand_metrics);b=float(verdict.get('baselineScore',proposal.get('score',0)) or 0);c=float(verdict.get('candidateScore',0) or 0);gain=c-b;bf=float(bm.get('frameMs') or 0);cf=float(cm.get('frameMs') or 0);perf_ok=cf>0 and cf<=20.0 and (bf<=0 or cf<=bf+.8);ready=bool(cm.get('ready')) and bool(cm.get('v39'));src=RUNTIME.read_text();invariants=('lat=clamp((p?.x||0)*1.55' in src and 'function chaseRoad' in src and 'MICHAEL_VISUAL_GENOME_BEGIN' in src and 'michael-graphics-v40.js' in src);regressions=list(verdict.get('regressions') or [])
    temporal_ok=True;temporal=os.getenv('NICKELLE_TEMPORAL_JSON');analysis=os.getenv('NICKELLE_ANALYSIS_JSON')
    if temporal and Path(temporal).exists(): temporal_ok=bool(load(temporal).get('summary',{}).get('temporalPass',False))
    uncertainty=0
    if analysis and Path(analysis).exists(): uncertainty=float(load(analysis).get('uncertainty',0) or 0)
    promote=bool(verdict.get('promote')) and gain>=float(genome.get('minimumPromotionGain',1.5)) and not regressions and perf_ok and ready and invariants and temporal_ok and uncertainty<=.72
    decision={'promote':promote,'baselineScore':b,'candidateScore':c,'gain':gain,'performanceOK':perf_ok,'ready':ready,'invariants':invariants,'temporalOK':temporal_ok,'uncertainty':uncertainty,'regressions':regressions,'reason':verdict.get('reason','')}
    if promote:
        state['generation']=int(genome.get('generation',0));state['bestScore']=c;state['lastCandidateScore']=c;state['lastDecision']='PROMOTED';changed=(proposal.get('candidateParameters') or {}).keys();wins=state.setdefault('stableWins',{});locked=set(state.get('lockedParameters',[]));limit=int(genome.get('lockAfterStableWins',8))
        for k in changed:
            wins[k]=int(wins.get(k,0))+1
            if wins[k]>=limit: locked.add(k)
        state['lockedParameters']=sorted(locked)
    else: state['lastCandidateScore']=c;state['lastDecision']='REJECTED'
    from datetime import datetime,timezone
    state['lastRun']=datetime.now(timezone.utc).isoformat();state['protectedRegressions']=regressions;dump(STATE,state);dump(out,decision);print(json.dumps(decision,indent=2))
def main():
    ap=argparse.ArgumentParser();sp=ap.add_subparsers(dest='cmd',required=True);a=sp.add_parser('apply');a.add_argument('proposal');sp.add_parser('bump-version');sp.add_parser('enable-v40');f=sp.add_parser('finalize');f.add_argument('proposal');f.add_argument('verdict');f.add_argument('baseline_metrics');f.add_argument('candidate_metrics');f.add_argument('out');ns=ap.parse_args()
    if ns.cmd=='apply':apply(ns.proposal)
    elif ns.cmd=='bump-version':bump_version()
    elif ns.cmd=='enable-v40':enable_v40()
    else:finalize(ns.proposal,ns.verdict,ns.baseline_metrics,ns.candidate_metrics,ns.out)
if __name__=='__main__':main()
