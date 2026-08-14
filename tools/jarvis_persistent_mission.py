#!/usr/bin/env python3
import json, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path('.')
STATE=ROOT/'public/jarvis-data/persistent-mission.json'
ACTIVE=ROOT/'public/jarvis-data/active-mission.json'
BUILD_INDEX=ROOT/'public/builds/index.json'
EVIDENCE=ROOT/'public/evidence-data/sessions.json'

# Persistent Mission is intelligence-only. Autonomous controller production is
# owned exclusively by jarvis-complete-rewrite-factory.yml via Always-On.
TASKS=[
 ('evidence-review','evidence-authority.yml'),
 ('historical-learning','historical-log-reingest.yml'),
 ('knowledge-graph','jarvis-knowledge-graph.yml'),
 ('chief-review','chief-engineer.yml'),
 ('discovery','discovery.yml'),
]

def now(): return datetime.now(timezone.utc).isoformat()
def load(p,default):
 try:return json.loads(p.read_text())
 except:return default

def active_runs():
 repo=os.environ.get('GITHUB_REPOSITORY','gymwhaleysspot-dot/mt12-jarvis-continuous')
 out=subprocess.check_output(['gh','run','list','--repo',repo,'--limit','100','--json','workflowName,status,databaseId,createdAt'],text=True)
 return json.loads(out)

def dispatch(wf):
 repo=os.environ.get('GITHUB_REPOSITORY','gymwhaleysspot-dot/mt12-jarvis-continuous')
 subprocess.check_call(['gh','workflow','run',wf,'--repo',repo,'--ref','main'])

def choose_objective(state):
 sessions=load(EVIDENCE,{}).get('sessions',[])
 builds=load(BUILD_INDEX,{})
 if any(s.get('replayReady') and not s.get('reviewed') for s in sessions):
  return 'Convert newly uploaded MT12 evidence into trusted replay-ready engineering knowledge.'
 if not builds.get('recommended'):
  return 'Strengthen evidence, simulation and causal knowledge for the authoritative controller producer.'
 return 'Continuously improve controller intelligence through evidence, simulation, replay and causal evaluation.'

def main():
 state=load(STATE,{})
 if not state:
  state={'schema':2,'missionId':f"J-{int(time.time())}",'createdAt':now(),'cycle':0,'history':[],'tasks':[]}
 state['schema']=2
 state['objective']=choose_objective(state)
 state['state']='ACTIVE';state['updatedAt']=now();state['cycle']=state.get('cycle',0)+1
 runs=active_runs()
 active={r['workflowName']:r for r in runs if r['status'] in ('queued','in_progress','waiting','pending','requested')}
 intel_active=any(any(k in n.lower() for k in ('historical','knowledge','chief','evidence','discovery')) for n in active)
 dispatched=[]
 if not intel_active:
  start=(state['cycle']-1)%len(TASKS)
  for offset in range(len(TASKS)):
   task_id,wf=TASKS[(start+offset)%len(TASKS)]
   try:
    dispatch(wf)
    dispatched.append({'task':task_id,'lane':'intelligence','workflow':wf,'dispatchedAt':now()})
    intel_active=True
    break
   except Exception as e:
    state.setdefault('errors',[]).append({'task':task_id,'error':str(e),'at':now()})
 state['activeLanes']={'controller':'owned-by-always-on','intelligence':intel_active}
 state['lastDispatches']=dispatched
 state['nextAction']='Evaluate intelligence output and feed evidence to the single authoritative rewrite producer.'
 state['history']=(state.get('history',[])+[{'cycle':state['cycle'],'at':now(),'objective':state['objective'],'dispatches':dispatched}])[-100:]
 STATE.parent.mkdir(parents=True,exist_ok=True);STATE.write_text(json.dumps(state,indent=2)+'\n')
 ACTIVE.write_text(json.dumps({'schema':3,'missionId':state['missionId'],'state':'ACTIVE','stage':'persistent-intelligence','objective':state['objective'],'cycle':state['cycle'],'activeLanes':state['activeLanes'],'lastDispatches':dispatched,'nextExperiment':state['nextAction'],'updatedAt':now()},indent=2)+'\n')
 print(json.dumps(state,indent=2))
if __name__=='__main__':main()
