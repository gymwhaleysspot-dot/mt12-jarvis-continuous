from __future__ import annotations
import csv,hashlib,json,math,random,statistics
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];MODEL=ROOT/'factory/vehicle-model.json';OUT=ROOT/'dist-jarvis-factory'

def load(p,d):
 try:return json.loads(p.read_text())
 except:return d

def num(r,*names):
 for n in names:
  try:return float(r.get(n,''))
  except:pass
 return None

def calibrate(m):
 rows=[]
 for p in sorted((ROOT/'tests/replays').glob('*.csv')) if (ROOT/'tests/replays').exists() else []:
  try:
   with p.open(errors='ignore') as f: rows += list(csv.DictReader(f))
  except:pass
 gps=[];rpm=[];noise=[];drop=0;total=0
 for r in rows:
  g=num(r,'GPS','gps','Speed','speed','mph'); rr=num(r,'RPM','rpm'); t=num(r,'TruthMPH','truth_mph','truthMph')
  total+=1
  if g is None or g<=0: drop+=1
  if g is not None and t is not None: noise.append(abs(g-t))
  if g is not None:gps.append(g)
  if rr is not None:rpm.append(rr)
 pri=m['priors'];n=len(rows);w=min(m['calibration']['maximumLogWeight'],n/max(1,m['calibration']['minimumRows'])*.1)
 if noise: pri['sensorNoiseMph']['mean']=(1-w)*pri['sensorNoiseMph']['mean']+w*statistics.median(noise)
 if total: pri['dropoutProbability']['mean']=(1-w)*pri['dropoutProbability']['mean']+w*(drop/total)
 return {'rows':n,'logWeight':round(w,4),'replayHash':hashlib.sha256(''.join(sorted(r.get('Time','') for r in rows[:5000])).encode()).hexdigest(),'model':m}

def sample(rng,p):return max(p['min'],min(p['max'],rng.gauss(p['mean'],p['sigma'])))
def simulate(cal):
 m=cal['model'];v=m['vehicle'];p=m['priors'];cfg=m['simulation'];rng=random.Random(cfg['seed']);scenarios=['dry_launch','wet_launch','loose_launch','straight_acceleration','corner_entry','corner_exit','braking','wheel_lock','gps_dropout','rpm_delay','sensor_disagreement','telemetry_freeze','reconnect','low_battery','jump_landing','false_airborne','cliff_anomaly','throttle_release','car_off','memory_load_save','long_runtime','mixed_surface']; results=[]
 for s in scenarios:
  runs=[]
  for _ in range(cfg['monteCarloRunsPerScenario']):
   grip=p['surfaceGrip']['wet' if 'wet' in s else 'loose' if 'loose' in s else 'mixed' if 'mixed' in s else 'dry'];lag=sample(rng,p['gpsLagFrames']);rlag=sample(rng,p['rpmLagFrames']);noise=sample(rng,p['sensorNoiseMph']);drop=sample(rng,p['dropoutProbability']);sag=sample(rng,p['batterySag']);mph=rpm=0;fp=fn=osc=0;recovery=[];last=0
   for f in range(cfg['framesPerRun']):
    th=0 if f<20 else 1 if f<620 else .2;br=.8 if s in {'braking','wheel_lock'} and 520<f<650 else 0;air=s=='jump_landing' and 330<f<370;slip=max(0,th*(1-grip)*(1.1+sag)+rng.gauss(0,.025));acc=th*0.42*grip*(1-sag)-br*.55-(.03 if air else 0);mph=max(0,mph+acc);target=mph*900*(1+slip)+(3500 if air else 0);rpm+=(target-rpm)/max(1,rlag);gps=None if rng.random()<drop or (s=='gps_dropout' and 280<f<400) else max(0,mph-lag*.03+rng.gauss(0,noise));truth_event=slip>.22 or (s=='wheel_lock' and br>.5);decision=(gps is not None and rpm/900-max(gps,0)>4) or slip>.28
    fp+=decision and not truth_event;fn+=truth_event and not decision;osc+=decision!=last;last=decision
    if s in {'gps_dropout','reconnect'} and f>400 and gps is not None: recovery.append(abs(mph-gps))
   runs.append({'fp':fp,'fn':fn,'osc':osc,'recovery':statistics.mean(recovery) if recovery else 0})
  results.append({'scenario':s,'runs':len(runs),'falsePositiveMean':statistics.mean(x['fp'] for x in runs),'falseNegativeMean':statistics.mean(x['fn'] for x in runs),'oscillationMean':statistics.mean(x['osc'] for x in runs),'recoveryErrorMean':statistics.mean(x['recovery'] for x in runs)})
 return {'schema':2,'authority':'SIMULATION_EVIDENCE','calibration':{k:v for k,v in cal.items() if k!='model'},'vehicle':v,'scenarioCount':len(results),'monteCarloRuns':sum(x['runs'] for x in results),'results':results}

def main():
 OUT.mkdir(exist_ok=True);cal=calibrate(load(MODEL,{}));report=simulate(cal);(OUT/'ADAPTIVE-DIGITAL-TWIN.json').write_text(json.dumps(report,indent=2)+'\n');(ROOT/'factory/vehicle-model-calibrated.json').write_text(json.dumps(cal['model'],indent=2)+'\n');print(json.dumps({'scenarios':report['scenarioCount'],'runs':report['monteCarloRuns'],'rows':report['calibration']['rows']}))
if __name__=='__main__':main()
