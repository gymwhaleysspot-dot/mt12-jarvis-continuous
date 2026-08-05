#!/usr/bin/env python3
import json, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path('.')
STATE=ROOT/'public/jarvis-data/persistent-mission.json'
ACTIVE=ROOT/'public/jarvis-data/active-mission.json'
BUILD_INDEX=ROOT/'public/builds/index.json'
EVIDENCE=ROOT/'public/evidence-data/sessions.json'

TASKS=[
 ('evidence-review','intelligence','evidence-authority.yml'),
 ('historical-learning','intelligence','historical-log-reingest.yml'),
 ('knowledge-graph','intelligence','jarvis-knowledge-graph.yml'),
 ('controller-tournament','intelligence','controller-tournament.yml'),
 ('candidate-build','file','jarvis-complete-factory.yml'),
 ('novelty-promotion','file','jarvis-evolution-gate.yml'),
 ('chief-review','intelligence','chief-engineer.yml'),
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
 cmd=['gh','workflow','run',wf,'--repo',repo,'--ref','main']
 if wf=='jarvis-complete-factory.yml':cmd+=['-f','mode=full']
 subprocess.check_call(cmd)

def choose_objective(state):
 sessions=load(EVIDENCE,{}).get('sessions',[])
 builds=load(BUILD_INDEX,{})
 if any(s.get('replayReady') and not s.get('reviewed') for s in sessions):
  return 'Convert newly uploaded MT12 evidence into trusted replay-ready engineering knowledge.'
 if not builds.get('recommended'):
  return 'Produce a novel MT12 controller that measurably beats its parent without regressions.'
 return 'Continuously improve the current MT12 controller through evidence, simulation, replay and controlled mutation.'

def main():
 state=load(STATE,{})
 if not state:
  state={'schema':1,'missionId':f"J-{int(time.time())}",'createdAt':now(),'cycle':0,'history':[],'tasks':[]}
 state['objective']=choose_objective(state)
 state['state']='ACTIVE';state['updatedAt']=now();state['cycle']=state.get('cycle',0)+1
 runs=active_runs()
 active={r['workflowName']:r for r in runs if r['status'] in ('queued','in_progress','waiting','pending','requested')}
 file_active=any(any(k in n.lower() for k in ('factory','luac','workbench','evolution gate')) for n in active)
 intel_active=any(any(k in n.lower() for k in ('historical','knowledge','tournament','chief','evidence')) for n in active)
 dispatched=[]
 for task_id,lane,wf in TASKS:
  if lane=='file' and file_active:continue
  if lane=='intelligence' and intel_active:continue
  try:
   dispatch(wf);dispatched.append({'task':task_id,'lane':lane,'workflow':wf,'dispatchedAt':now()})
   if lane=='file':file_active=True
   else:intel_active=True
  except Exception as e:
   state.setdefault('errors',[]).append({'task':task_id,'error':str(e),'at':now()})
  if file_active and intel_active:break
 state['activeLanes']={'file':file_active,'intelligence':intel_active}
 state['lastDispatches']=dispatched
 state['nextAction']='Evaluate completed task outputs, update evidence and create the next highest-value task.'
 state['history']=(state.get('history',[])+[{'cycle':state['cycle'],'at':now(),'objective':state['objective'],'dispatches':dispatched}])[-100:]
 STATE.parent.mkdir(parents=True,exist_ok=True);STATE.write_text(json.dumps(state,indent=2)+'\n')
 ACTIVE.write_text(json.dumps({'schema':2,'missionId':state['missionId'],'state':'ACTIVE','stage':'persistent-mission-execution','objective':state['objective'],'cycle':state['cycle'],'activeLanes':state['activeLanes'],'lastDispatches':dispatched,'nextExperiment':state['nextAction'],'updatedAt':now()},indent=2)+'\n')
 print(json.dumps(state,indent=2))
if __name__=='__main__':main()
