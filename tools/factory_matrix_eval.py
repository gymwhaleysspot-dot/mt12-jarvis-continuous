from __future__ import annotations
import hashlib,json,os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
GROUP=os.environ.get('EVAL_GROUP','core')
SCENARIOS={
 'core':['dry_launch','wet_launch','straight_acceleration','corner_entry','corner_exit','braking','wheel_lock'],
 'sensors':['gps_dropout','rpm_delay','sensor_disagreement','telemetry_freeze','reconnect'],
 'airborne':['jump_landing','false_airborne','cliff_anomaly'],
 'persistence':['car_off','bench_state','memory_load_save','long_runtime'],
 'adversarial':['impossible_gps_jump','rpm_stuck','opposed_sensor_disagreement','throttle_spike','temporary_zero','duplicate_timestamp','delayed_stream','alternating_traction','corrupt_memory','partial_memory','reconnect_storm','clamp_boundaries']
}

def main():
 src=ROOT/'dist-jarvis-factory/FACTORY-RESULT.json'
 data=json.loads(src.read_text())
 out={'schema':1,'group':GROUP,'scenarios':SCENARIOS[GROUP],'candidates':[]}
 for c in data.get('candidates',[]):
  ident=str(c.get('sourceSha256') or c.get('candidate'))
  digest=hashlib.sha256((ident+'|'+GROUP).encode()).hexdigest()
  out['candidates'].append({
   'candidate':c.get('candidate'),'status':'QUEUED_FOR_REPLAY' if c.get('status')=='COMPILED' else 'SKIPPED',
   'scenarioCount':len(SCENARIOS[GROUP]),'evidenceDigest':digest,
   'requiredMetrics':['truthAccuracy','interventionCorrectness','controlSmoothness','confidenceCalibration','causalExplanation'],
   'authority':'STATIC_PLAN_ONLY_UNTIL_REPLAY_OUTPUT_EXISTS'
  })
 p=ROOT/f'dist-eval-{GROUP}.json';p.write_text(json.dumps(out,indent=2)+'\n')
 print(json.dumps(out,indent=2))
if __name__=='__main__':main()
