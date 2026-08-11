#!/usr/bin/env python3
import json, os, shutil, subprocess, sys
from pathlib import Path

ROOT=Path.cwd(); GENOME=ROOT/'michael/visual/genome.json'; STATE=ROOT/'michael/visual/live-status.json'
CAPTURE=ROOT/'tools/michael_visual_capture.mjs'; JUDGE=ROOT/'tools/nickelle_owner_truth.py'; WORK=Path('/tmp/nickelle-owner-loop')
GROUPS={
 'front_fascia':['grille_half_bottom','grille_half_top','grille_bottom_y','grille_top_y','grille_corner_radius','grille_frame_thickness'],
 'headlights':['headlamp_width','headlamp_height','headlamp_corner_radius','headlamp_lens_width','headlamp_lens_height','headlamp_lens_offset_x'],
 'rear_lamps':['rear_lamp_width','rear_lamp_height','rear_lamp_corner_radius','rear_lamp_x','rear_lamp_y','rear_lamp_inner_scale','rear_lamp_z'],
 'rear_aero':['wing_end_x','diffuser_half_bottom','diffuser_half_top'],
 'side_profile':['arch_x','door_red_bottom','door_red_top','door_black_bottom','door_black_top','skirt_y_bottom','skirt_y_top'],
 'roof_greenhouse':['roof_y_front','roof_y_rear','scoop_width','scoop_height','scoop_length'],
 'livery_materials':['paint_roughness_scale','dark_roughness_scale','exposure_scale','key_light_scale','ambient_scale'],
}
ALIASES={'grille':'front_fascia','three_quarter':'front_fascia'}

def run(cmd,**kw):
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,**kw)
    if p.returncode: raise RuntimeError(f"{' '.join(map(str,cmd))}\n{p.stdout}")
    return p.stdout

def capture(outdir,size=760):
    shutil.rmtree(outdir,ignore_errors=True)
    env=os.environ.copy(); env['MICHAEL_CAPTURE_SIZE']=str(size)
    run(['node',str(CAPTURE),str(outdir)],env=env)
    return json.loads(run([sys.executable,str(JUDGE),str(outdir)]))

def save_status(**changes):
    try:s=json.loads(STATE.read_text())
    except:s={'schema':2}
    s.update(changes)
    import datetime
    s['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    STATE.write_text(json.dumps(s,indent=2)+'\n')

def set_genome(g): GENOME.write_text(json.dumps(g,indent=2)+'\n')
def candidate(g,key,value):
    x=json.loads(json.dumps(g)); x['parameters'][key]=round(value,5); return x

def choose_component(score,exhausted):
    for k,v in sorted(score.get('parts',{}).items(),key=lambda kv:kv[1]):
        group=ALIASES.get(k,k)
        if group in GROUPS and group not in exhausted:return group,v
    for k in GROUPS:
        if k not in exhausted:return k,0
    return None,0

def no_regression(base,cand,tol=2.25):
    for v,b in base.get('viewScores',{}).items():
        if cand.get('viewScores',{}).get(v,0)<b-tol:return False
    if len(cand.get('identityFailures',[]))>len(base.get('identityFailures',[])):return False
    return True

def main():
    rounds=int(os.getenv('MAX_ROUNDS','8')); step_fraction=float(os.getenv('STEP_FRACTION','0.14'))
    WORK.mkdir(parents=True,exist_ok=True)
    champion=json.loads(GENOME.read_text()); champion_score=capture(WORK/'champion')
    start=champion_score['score']; accepted=rejected=tested=0; exhausted=set()
    save_status(schema=2,status='RUNNING',round=0,maxRounds=rounds,score=start,startingScore=start,accepted=0,rejected=0,testedCandidates=0,
                converged=False,viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),
                authority='DIRECT_OWNER_JPEG_PIXELS',runtimeBodyOverlay=False,diagnosis=['Direct owner-JPEG coordinate search started.'],weakest=[])
    for r in range(1,rounds+1):
        comp,_=choose_component(champion_score,exhausted)
        if not comp:break
        protected=set(champion.get('protectedParameters',[]))
        keys=[k for k in GROUPS[comp] if k in champion['parameters'] and k in champion.get('bounds',{}) and k not in protected]
        if not keys:
            exhausted.add(comp); rejected+=1; continue
        best=None
        for key in keys:
            lo,hi=map(float,champion['bounds'][key]); cur=float(champion['parameters'][key]); step=max((hi-lo)*step_fraction,1e-5)
            for direction in (-1,1):
                val=max(lo,min(hi,cur+direction*step))
                if abs(val-cur)<1e-9:continue
                cand=candidate(champion,key,val); set_genome(cand); out=WORK/f"r{r}-{key}-{'p' if direction>0 else 'm'}"
                try:sc=capture(out)
                except Exception as e:
                    print('candidate failed',key,direction,e,file=sys.stderr); continue
                tested+=1; gain=sc['score']-champion_score['score']
                row={'score':sc['score'],'gain':gain,'key':key,'value':val,'genome':cand,'eval':sc,'dir':str(out)}
                if no_regression(champion_score,sc) and (best is None or row['score']>best['score']):best=row
                save_status(status='TESTING',round=r,activeComponent=comp,activeParameter=key,candidateDirection=direction,testedCandidates=tested,
                            score=champion_score['score'],candidateScore=sc['score'],accepted=accepted,rejected=rejected,viewScores=champion_score.get('viewScores',{}),
                            parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),
                            diagnosis=[f"Testing {comp}: {key} {'+' if direction>0 else '-'} against owner JPEG pixels."])
        set_genome(champion)
        if best and best['gain']>=0.20:
            champion=best['genome']; champion['generation']=int(champion.get('generation',0))+1; set_genome(champion); champion_score=best['eval']; accepted+=1; exhausted.clear()
            shutil.rmtree(WORK/'champion',ignore_errors=True); shutil.copytree(best['dir'],WORK/'champion')
            state='IMPROVING'; diagnosis=[f"Accepted {best['key']}={best['value']:.5f}; direct owner-photo gain {best['gain']:+.3f}."]
        else:
            exhausted.add(comp); rejected+=1; state='SEARCHING'; diagnosis=[f"{comp} exhausted bounded parameter search; escalate to topology/asset reconstruction."]
        ranked=sorted(champion_score.get('parts',{}).items(),key=lambda kv:kv[1])[:5]
        save_status(status=state,round=r,score=champion_score['score'],startingScore=start,accepted=accepted,rejected=rejected,testedCandidates=tested,
                    viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),ownerTruthFailures=champion_score.get('identityFailures',[]),
                    weakest=[{'component':k,'score':v} for k,v in ranked],diagnosis=diagnosis,topologyEscalations=sorted(exhausted))
        if champion_score['score']>=94 and min(champion_score.get('viewScores',{'x':0}).values())>=90:break
    set_genome(champion)
    converged=champion_score['score']>=94 and min(champion_score.get('viewScores',{'x':0}).values())>=90
    save_status(status='CONVERGED' if converged else 'STABLE_NEEDS_TOPOLOGY',score=champion_score['score'],startingScore=start,accepted=accepted,rejected=rejected,
                testedCandidates=tested,converged=converged,viewScores=champion_score.get('viewScores',{}),parts=champion_score.get('parts',{}),
                ownerTruthFailures=champion_score.get('identityFailures',[]),topologyEscalations=sorted(exhausted),
                diagnosis=[f"Direct owner-photo optimization complete: {start:.3f} -> {champion_score['score']:.3f}."])
    result={'start':start,'final':champion_score['score'],'accepted':accepted,'rejected':rejected,'tested':tested,'converged':converged,'topologyEscalations':sorted(exhausted)}
    print(json.dumps(result,indent=2)); Path('/tmp/nickelle-owner-loop-result.json').write_text(json.dumps(result,indent=2)+'\n')

if __name__=='__main__':main()
