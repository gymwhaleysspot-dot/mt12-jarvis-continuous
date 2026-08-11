#!/usr/bin/env python3
import csv,json,glob,math,sys
from pathlib import Path
ROOT=Path('controller-road-replay'); ROOT.mkdir(exist_ok=True); INDEX=ROOT/'index.json'
def load_index(): return json.load(open(INDEX)) if INDEX.exists() else {'schema':1,'datasets':[],'requiredForPromotion':True,'minimumDatasets':1}
def rows_for(p):
    try:
        if str(p).lower().endswith('.json'):
            x=json.load(open(p));return x.get('events',[]) if isinstance(x,dict) else x
        with open(p,newline='',errors='ignore') as f:return list(csv.DictReader(f))
    except:return []
def fnum(r,*names):
    for n in names:
        if n in r:
            try:return float(r[n])
            except:pass
    return None
def summarize(p):
    rs=rows_for(p);mph=[];rpm=[];slip=[];tc=absn=drops=0
    for r in rs:
        typ=str(r.get('type',''))
        v=fnum(r,'mph','MPH','speed','Speed','speed_avg','speed_max');q=fnum(r,'rpm','RPM','max_rpm');s=fnum(r,'slip','Slip','tcSlip','max_slip_mph')
        if v is not None and math.isfinite(v):mph.append(v)
        if q is not None and math.isfinite(q):rpm.append(q)
        if s is not None and math.isfinite(s):slip.append(s)
        tc+=int('TC_' in typ or (fnum(r,'TC','tc','tcActive') or 0)>0);absn+=int('ABS_' in typ or (fnum(r,'ABS','abs','absActive') or 0)>0);drops+=int((fnum(r,'drop','dropout','sensorDrop') or 0)>0)
    return {'file':str(p),'rows':len(rs),'maxMph':max(mph) if mph else None,'maxRpm':max(rpm) if rpm else None,'maxSlip':max(slip) if slip else None,'tcRows':tc,'absRows':absn,'dropRows':drops,'hasTcAndAbs':tc>0 and absn>0}
def patch_tournament(report):
    p=Path('dist-controller-tournament/TOURNAMENT.json')
    if not p.exists():return
    t=json.load(open(p));t['realDriveReplay']=report
    for c in t.get('candidates',[]):
        if not report['promotionGate']:
            c['promotionEligible']=False;c['roadReplayGate']=False;c['roadReplayStatus']='EXPERIMENTAL_ROAD_REQUIRED'
        else:c['roadReplayGate']=True;c['roadReplayStatus']='REAL_DRIVE_CORPUS_AVAILABLE'
    if t.get('winner') and not report['promotionGate']:t['promotionVerdict']='EXPERIMENTAL_ROAD_REQUIRED'
    json.dump(t,open(p,'w'),indent=2);open(p,'a').write('\n')
def main():
    out=sys.argv[1] if len(sys.argv)>1 else 'dist-controller-tournament/ROAD_REPLAY.json';idx=load_index();files=[]
    for d in idx.get('datasets',[]):
        p=d.get('path') if isinstance(d,dict) else d
        if p and Path(p).exists():files.append(Path(p))
    for pat in ('controller-road-replay/*.csv','controller-road-replay/*.json'):
        for p in glob.glob(pat):
            pp=Path(p)
            if pp.name=='index.json':continue
            if pp not in files:files.append(pp)
    sums=[summarize(p) for p in files];valid=[x for x in sums if x['rows']>=12 and x['hasTcAndAbs']];required=int(idx.get('minimumDatasets',1));pass_gate=len(valid)>=required
    report={'schema':3,'mode':'persistent_real_drive_regression_corpus','requiredForPromotion':bool(idx.get('requiredForPromotion',True)),'minimumDatasets':required,'availableDatasets':len(valid),'promotionGate':pass_gate,'datasets':sums,'reason':'real-drive TC+ABS replay corpus available' if pass_gate else 'no sufficient real-drive TC+ABS corpus is currently committed; controller remains experimental/road-required'}
    Path(out).parent.mkdir(parents=True,exist_ok=True);json.dump(report,open(out,'w'),indent=2);open(out,'a').write('\n');patch_tournament(report);print(json.dumps(report,indent=2))
if __name__=='__main__':main()
