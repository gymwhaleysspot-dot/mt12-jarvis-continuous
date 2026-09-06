from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
POINTER=ROOT/'factory/evolution-controller.json'
CANONICAL=ROOT/'factory/canonical-controller.json'
MAX_BYTES=87000

REQUIRED=(
 'local function zBrain','V[704]','X[46]','V[720]=ac','setgv(3,m_min(V[35],ac))',
 'V[740+km]','V[760+km]','local pc=pcall','pc(getFieldInfo','pc(getValue',
 'pc(model.getGlobalVariable','pc(model.setGlobalVariable','/LOGS/m0','/LOGS/m1',
 'local function memOpt','local function watch','V[179]*.0045','92+4*dc',
 'bb_line(144,li1,0)','bb_line(145,li2,0)','bb_line(146,li3,0)','bb_line(147,li4,0)',
 'bb_line(148,rg1,0)','bb_line(149,rg2,0)','bb_line(150,rg3,0)','bb_line(151,rg4,0)',
 'local bv=cache[2]or 0','local bv=rx;if mph>V[792]','"BAT"',
)
FORBIDDEN=('setgv(3,V[35])','V[179]*(.00435','fid("VFAS")','fid("EscV")','fid("A4")')

def digest(path:Path)->str:return hashlib.sha256(path.read_bytes()).hexdigest()

def canonical_name()->str:
 return json.loads(CANONICAL.read_text())['release']

def resolve()->tuple[str,Path]:
 p=json.loads(POINTER.read_text())
 source=ROOT/p['sourcePath'];deploy=ROOT/p['deployPath']
 if not source.is_file() or not deploy.is_file():raise RuntimeError('evolution parent files missing')
 if digest(source)!=p['sourceSha256'] or digest(deploy)!=p['luacSha256']:raise RuntimeError('evolution parent hash mismatch')
 if deploy.stat().st_size!=int(p['normalizedBytes']):raise RuntimeError('evolution parent size mismatch')
 text=source.read_text()
 missing=[x for x in REQUIRED if x not in text];bad=[x for x in FORBIDDEN if x in text]
 if missing or bad:raise RuntimeError(f'evolution parent violated canonical floor missing={missing} forbidden={bad}')
 if p.get('canonicalFloor')!=canonical_name():raise RuntimeError('evolution parent canonical-floor pointer is stale')
 return p['release'],source

def advance(mission:str,run_number:int|None=None)->dict:
 base=ROOT/'public/builds'/mission
 tournament=json.loads((base/'TOURNAMENT.json').read_text())
 winner=tournament.get('winner')
 if not winner:
  candidates=tournament.get('candidates')
  if not isinstance(candidates,list) or not candidates:raise RuntimeError('tournament has no candidates')
  eligible=[c.get('candidate') for c in candidates if c.get('promotionEfficiencyEligible') is True]
  if eligible:raise RuntimeError(f'tournament omitted winner despite eligible candidates: {eligible}')
  parent=json.loads(POINTER.read_text())
  return {
   'schema':'JARVIS-EVOLUTION-ADVANCE-1','status':'NO_PROMOTION','reason':'NO_ELIGIBLE_CANDIDATES',
   'mission':mission,'generationRun':int(run_number or 0) or None,'winner':None,
   'candidateCount':len(candidates),'eligibleCandidateCount':0,
   'evolutionParent':parent.get('release'),'pointerUnchanged':True,
   'authority':'TOURNAMENT_RESULT_ONLY; BENCH_AND_ROAD_EVIDENCE_STILL_REQUIRED',
  }
 manifest_path=base/winner/'MANIFEST.json'
 if not manifest_path.is_file():raise RuntimeError(f'winner manifest missing: {winner}')
 manifest=json.loads(manifest_path.read_text())
 candidate=next((c for c in tournament.get('candidates',[]) if c.get('candidate')==winner),{})
 contract=manifest.get('rewriteContract') or candidate.get('rewriteContract') or {}
 if manifest.get('status')!='COMPILED' or manifest.get('errors'):raise RuntimeError('tournament winner is not cleanly compiled')
 if candidate.get('promotionEfficiencyEligible') is not True:raise RuntimeError('tournament winner failed promotion-efficiency gate')
 if int(manifest.get('normalizedBytes',10**9))>MAX_BYTES:raise RuntimeError('tournament winner exceeds MT12 size ceiling')
 if not contract.get('sourceNovel') or not contract.get('bytecodeNovel') or not contract.get('behaviorNovel'):raise RuntimeError('tournament winner failed source, bytecode, or behavioral novelty contract')
 source=base/winner/f'{winner}.lua';deploy=base/winner/f'{winner}.luac'
 if digest(source)!=manifest.get('sourceSha256') or digest(deploy)!=manifest.get('luacSha256'):raise RuntimeError('tournament winner hash does not match manifest')
 text=source.read_text();missing=[x for x in REQUIRED if x not in text];bad=[x for x in FORBIDDEN if x in text]
 if missing or bad:raise RuntimeError(f'tournament winner violated canonical floor missing={missing} forbidden={bad}')
 run_number=int(run_number or 0)
 doc={
  'schema':'JARVIS-EVOLUTION-PARENT-2','release':f'{winner}-{run_number}' if run_number else f'{winner}-{mission}',
  'candidate':winner,'generationRun':run_number or None,'mission':mission,
  'sourcePath':str(source.relative_to(ROOT)),'deployPath':str(deploy.relative_to(ROOT)),
  'sourceSha256':digest(source),'luacSha256':digest(deploy),'normalizedBytes':deploy.stat().st_size,
  'authority':'STATIC_EVOLUTION_PARENT_ROAD_UNPROVEN','canonicalFloor':canonical_name(),
  'promotionPolicy':'TOURNAMENT_WINNER_AUTO_FOR_EXPERIMENTAL_EVOLUTION_ONLY; NEVER_AUTO_CANONICAL',
  'requiredForAdvance':['tournament winner','Lua 5.3 compile','MT12 normalization','defended canonical floor preserved','source, bytecode, and behavioral novelty','zero candidate errors','promotion-efficiency eligible','normalized size <= 87000']
 }
 POINTER.write_text(json.dumps(doc,indent=2)+'\n')
 return doc

def main()->int:
 if len(sys.argv)>=2 and sys.argv[1]=='advance':
  if len(sys.argv)<3:raise SystemExit('usage: jarvis_evolution_parent.py advance <mission> [run_number]')
  print(json.dumps(advance(sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else None),indent=2));return 0
 name,path=resolve();print(json.dumps({'evolutionParent':name,'source':str(path),'canonicalFloor':canonical_name()},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
