#!/usr/bin/env python3
import json, os, shutil, subprocess, sys, time, math
from pathlib import Path
ROOT=Path.cwd(); GENOME=ROOT/'michael/visual/genome.json'; STATE=ROOT/'michael/visual/live-status.json'
CAPTURE=ROOT/'tools/michael_visual_capture.mjs'; JUDGE=ROOT/'tools/nickelle_owner_truth.py'; WORK=Path('/tmp/nickelle-owner-loop')
CAPTURE_TIMEOUT=int(os.getenv('CAPTURE_TIMEOUT_SECONDS','45')); JUDGE_TIMEOUT=int(os.getenv('JUDGE_TIMEOUT_SECONDS','20'))
GROUPS={
 'owner_livery':['roof_white_width','roof_white_front_z','roof_white_rear_z','roof_white_inset','side_black_height','side_black_center_y','side_identity_front_z','side_identity_rear_z','yellow_accent_height','yellow_accent_y','yellow_accent_front_z','yellow_accent_rear_z','front_black_quarter_scale'],
 'front_fascia':['grille_half_bottom','grille_half_top','grille_bottom_y','grille_top_y','grille_corner_radius','grille_frame_thickness'],
 'headlights':['headlamp_width','headlamp_height','headlamp_corner_radius','headlamp_lens_width','headlamp_lens_height','headlamp_lens_offset_x'],
 'rear_lamps':['rear_lamp_width','rear_lamp_height','rear_lamp_corner_radius','rear_lamp_x','rear_lamp_y','rear_lamp_inner_scale','rear_lamp_z'],
 'rear_aero':['wing_end_x','diffuser_half_bottom','diffuser_half_top'],
 'side_profile':['arch_x','door_red_bottom','door_red_top','door_black_bottom','door_black_top','skirt_y_bottom','skirt_y_top'],
 'roof_greenhouse':['roof_y_front','roof_y_rear','scoop_width','scoop_height','scoop_length'],
 'livery_materials':['paint_roughness_scale','dark_roughness_scale','exposure_scale','key_light_scale','ambient_scale'],
}
ALIASES={'grille':'front_fascia','three_quarter':'front_fascia'}
VIEWS={
 'headlights':{'front':1.0,'three':.7},'front_fascia':{'front':1.0,'three':.65},'owner_livery':{'side':.8,'three':.8,'top':.45},
 'rear_lamps':{'rear':1.0,'three':.35},'rear_aero':{'rear':1.0,'side':.4},'side_profile':{'side':1.0,'three':.55},
 'roof_greenhouse':{'top':1.0,'side':.55,'three':.55},'livery_materials':{'front':.4,'three':.8,'side':.55,'rear':.4,'top':.35}}
IDENTITY_TOPOLOGY_FAILURES={'yellow_livery_missing','white_roof_livery_missing','side_identity_missing','black_quarter_missing'}

def log(msg): print(f"[{time.strftime('%H:%M:%S')}] {msg}",flush=True)
def run(cmd,timeout,**kw):
    try:p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=timeout,**kw)
    except subprocess.TimeoutExpired as e:
        out=e.stdout or ''; out=out.decode(errors='replace') if isinstance(out,bytes) else out
        raise TimeoutError(f"timeout after {timeout}s: {' '.join(map(str,cmd))}\n{out}")
    if p.returncode: raise RuntimeError(f"{' '.join(map(str,cmd))}\n{p.stdout}")
    return p.stdout

def capture(outdir,size=700,label='capture'):
    shutil.rmtree(outdir,ignore_errors=True); env=os.environ.copy();env['MICHAEL_CAPTURE_SIZE']=str(size)
    t=time.monotonic();log(f"START {label} -> {outdir}");run(['node',str(CAPTURE),str(outdir)],env=env,timeout=CAPTURE_TIMEOUT)
    judged=json.loads(run([sys.executable,str(JUDGE),str(outdir)],timeout=JUDGE_TIMEOUT));log(f"DONE  {label} score={judged.get('score')} in {time.monotonic()-t:.1f}s");return judged

def save_status(**changes):
    try:s=json.loads(STATE.read_text())
    except:s={'schema':5}
    s.update(changes);import datetime;s['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();STATE.write_text(json.dumps(s,indent=2)+'\n')
def set_genome(g):GENOME.write_text(json.dumps(g,indent=2)+'\n')
def clone(g):return json.loads(json.dumps(g))
def candidate(g,changes):
    x=clone(g)
    for k,v in changes.items():x['parameters'][k]=round(v,5)
    return x

def part_score(sc,comp):
    p=sc.get('parts',{}); vals=[float(v) for k,v in p.items() if ALIASES.get(k,k)==comp]
    return min(vals) if vals else 50.0

def view_score(sc,comp):
    vs=sc.get('viewScores',{});w=VIEWS.get(comp,{})
    if not w:return min(vs.values()) if vs else 0
    den=sum(w.values());return sum(float(vs.get(k,0))*q for k,q in w.items())/max(den,1e-9)

def need(sc,comp):return (100-part_score(sc,comp))*.65+(100-view_score(sc,comp))*.35

def choose_component(sc,exhausted):
    failures=set(sc.get('identityFailures',[]))
    if failures&IDENTITY_TOPOLOGY_FAILURES and 'owner_livery' not in exhausted:return 'owner_livery',999
    ranked=sorted(((need(sc,c),c) for c in GROUPS if c not in exhausted),reverse=True)
    return (ranked[0][1],ranked[0][0]) if ranked else (None,0)

def no_regression(base,cand,tol=1.75):
    for v,b in base.get('viewScores',{}).items():
        if cand.get('viewScores',{}).get(v,0)<b-tol:return False
    return len(cand.get('identityFailures',[]))<=len(base.get('identityFailures',[]))

def utility(base,cand,comp):
    global_gain=float(cand['score'])-float(base['score']); part_gain=part_score(cand,comp)-part_score(base,comp);view_gain=view_score(cand,comp)-view_score(base,comp)
    regression=sum(max(0,float(base.get('viewScores',{}).get(v,0))-float(cand.get('viewScores',{}).get(v,0))) for v in base.get('viewScores',{}))
    return global_gain+.38*part_gain+.22*view_gain-.18*regression

def main():
    rounds=int(os.getenv('MAX_ROUNDS','6'));base_step=float(os.getenv('STEP_FRACTION','0.12'));max_failures=int(os.getenv('MAX_CAPTURE_FAILURES','8'))
    WORK.mkdir(parents=True,exist_ok=True);log(f"Nickelle adaptive loop: rounds={rounds} capture={CAPTURE_TIMEOUT}s judge={JUDGE_TIMEOUT}s")
    champion=json.loads(GENOME.read_text());champion_score=capture(WORK/'champion',label='baseline');start=champion_score['score'];accepted=rejected=tested=failures=0;exhausted=set();stats={}
    save_status(schema=5,status='RUNNING_SMART',round=0,maxRounds=rounds,score=start,startingScore=start,accepted=0,rejected=0,testedCandidates=0,captureFailures=0,converged=False,viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),authority='DIRECT_OWNER_JPEG_PIXELS',runtimeBodyOverlay=False,optimizer='ADAPTIVE_REGION_AWARE_V2',diagnosis=['Region-aware multi-scale visual search active.'])
    for r in range(1,rounds+1):
        comp,pressure=choose_component(champion_score,exhausted)
        if not comp:break
        protected=set(champion.get('protectedParameters',[]));keys=[k for k in GROUPS[comp] if k in champion['parameters'] and k in champion.get('bounds',{}) and k not in protected]
        keys.sort(key=lambda k:stats.get(k,{}).get('promise',0),reverse=True);keys=keys[:8]
        log(f"ROUND {r}/{rounds} component={comp} need={pressure:.2f} keys={len(keys)} score={champion_score['score']:.3f}")
        if not keys:exhausted.add(comp);rejected+=1;continue
        rows=[]
        for key in keys:
            lo,hi=map(float,champion['bounds'][key]);cur=float(champion['parameters'][key]);hist=stats.get(key,{});momentum=int(hist.get('direction',0));scales=[1.0,.45] if hist.get('tests',0)>1 else [1.0]
            directions=[momentum,-momentum] if momentum else [-1,1]
            for scale in scales:
                step=max((hi-lo)*base_step*scale,1e-5)
                for direction in directions:
                    if not direction:continue
                    val=max(lo,min(hi,cur+direction*step))
                    if abs(val-cur)<1e-9:continue
                    cand=candidate(champion,{key:val});set_genome(cand);out=WORK/f"r{r}-{key}-{'p' if direction>0 else 'm'}-{scale:g}"
                    save_status(status='CAPTURING_SMART',round=r,activeComponent=comp,activeParameter=key,candidateDirection=direction,testedCandidates=tested,captureFailures=failures,score=champion_score['score'],optimizer='ADAPTIVE_REGION_AWARE_V2',diagnosis=[f"Testing {comp}/{key} at scale {scale:g}; target-view need {pressure:.2f}."])
                    try:sc=capture(out,label=f"r{r} {key} {direction:+d} x{scale:g}")
                    except Exception as e:
                        failures+=1;log(f"SKIP {key}: {type(e).__name__}: {e}");set_genome(champion)
                        if failures>=max_failures:raise RuntimeError(f"aborting after {failures} capture failures")
                        continue
                    tested+=1;u=utility(champion_score,sc,comp);gain=sc['score']-champion_score['score'];row={'score':sc['score'],'gain':gain,'utility':u,'key':key,'value':val,'genome':cand,'eval':sc,'dir':str(out),'direction':direction}
                    rows.append(row);h=stats.setdefault(key,{'tests':0,'promise':0,'direction':0});h['tests']+=1
                    if u>h['promise']:
                        h['promise']=u;h['direction']=direction
                    set_genome(champion)
        viable=[x for x in rows if no_regression(champion_score,x['eval'])];best=max(viable,key=lambda x:x['utility'],default=None)
        # Correlated move: combine the two strongest positive changes when they address the same weak component.
        positive=sorted([x for x in viable if x['utility']>.12],key=lambda x:x['utility'],reverse=True)
        if len(positive)>=2 and positive[0]['key']!=positive[1]['key']:
            changes={positive[0]['key']:positive[0]['value'],positive[1]['key']:positive[1]['value']};cand=candidate(champion,changes);set_genome(cand);out=WORK/f"r{r}-pair-{positive[0]['key']}-{positive[1]['key']}"
            try:
                sc=capture(out,label=f"r{r} correlated pair");tested+=1;u=utility(champion_score,sc,comp);row={'score':sc['score'],'gain':sc['score']-champion_score['score'],'utility':u,'key':'+'.join(changes),'value':changes,'genome':cand,'eval':sc,'dir':str(out),'direction':0}
                if no_regression(champion_score,sc) and (best is None or row['utility']>best['utility']):best=row
            except Exception as e:failures+=1;log(f"PAIR SKIP {type(e).__name__}: {e}")
            finally:set_genome(champion)
        if best and best['utility']>=.18 and best['gain']>=-.05:
            champion=best['genome'];champion['generation']=int(champion.get('generation',0))+1;set_genome(champion);champion_score=best['eval'];accepted+=1;exhausted.clear();shutil.rmtree(WORK/'champion',ignore_errors=True);shutil.copytree(best['dir'],WORK/'champion');diagnosis=[f"Accepted {best['key']}; score {best['gain']:+.3f}, region utility {best['utility']:+.3f}."];state='IMPROVING_SMART';log(diagnosis[0])
        else:
            exhausted.add(comp);rejected+=1;diagnosis=[f"{comp} exhausted adaptive search; escalating to next weakest visual region."];state='SEARCHING_SMART';log(diagnosis[0])
        ranked=sorted(((c,need(champion_score,c)) for c in GROUPS),key=lambda x:x[1],reverse=True)[:5]
        save_status(status=state,round=r,score=champion_score['score'],startingScore=start,accepted=accepted,rejected=rejected,testedCandidates=tested,captureFailures=failures,viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),weakest=[{'component':c,'need':n,'score':part_score(champion_score,c),'viewScore':view_score(champion_score,c)} for c,n in ranked],diagnosis=diagnosis,optimizer='ADAPTIVE_REGION_AWARE_V2',parameterIntelligence=stats,topologyEscalations=sorted(exhausted))
        if champion_score['score']>=94 and min(champion_score.get('viewScores',{'x':0}).values())>=90:break
    set_genome(champion);converged=champion_score['score']>=94 and min(champion_score.get('viewScores',{'x':0}).values())>=90
    save_status(status='CONVERGED' if converged else 'STABLE_NEEDS_GEOMETRY',score=champion_score['score'],startingScore=start,accepted=accepted,rejected=rejected,testedCandidates=tested,captureFailures=failures,converged=converged,viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),topologyEscalations=sorted(exhausted),optimizer='ADAPTIVE_REGION_AWARE_V2',parameterIntelligence=stats,diagnosis=[f"Adaptive owner-photo optimization: {start:.3f} -> {champion_score['score']:.3f}; tested {tested}, failures {failures}."])
    result={'start':start,'final':champion_score['score'],'accepted':accepted,'rejected':rejected,'tested':tested,'captureFailures':failures,'converged':converged,'topologyEscalations':sorted(exhausted),'optimizer':'ADAPTIVE_REGION_AWARE_V2'};log(json.dumps(result,separators=(',',':')));Path('/tmp/nickelle-owner-loop-result.json').write_text(json.dumps(result,indent=2)+'\n')
if __name__=='__main__':main()
