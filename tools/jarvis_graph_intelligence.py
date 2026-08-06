#!/usr/bin/env python3
"""Enrich Jarvis's engineering graph with causal controller-evolution memory."""
from __future__ import annotations
import hashlib,json
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
ROOT=Path(__file__).resolve().parents[1];GRAPH=ROOT/'factory'/'knowledge-graph.json';PUBLIC=ROOT/'public'/'jarvis-data'/'engineering-memory.json'
def load(p:Path,d:Any)->Any:
 try:return json.loads(p.read_text(encoding='utf-8'))
 except (FileNotFoundError,json.JSONDecodeError,OSError):return d
def save(p:Path,v:Any)->None:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+'\n',encoding='utf-8')
def ident(kind:str,key:str)->str:return f"{kind}:{hashlib.sha256(f'{kind}:{key}'.encode()).hexdigest()[:16]}"
def now()->str:return datetime.now(timezone.utc).isoformat()
def main()->int:
 g=load(GRAPH,{'schema':'JARVIS-KG-1','nodes':[],'relationships':[]})
 nodes={n['id']:n for n in g.get('nodes',[]) if isinstance(n,dict) and n.get('id')};edges={e['id']:e for e in g.get('relationships',[]) if isinstance(e,dict) and e.get('id')}
 def node(kind:str,key:str,label:str,**props:Any)->str:
  nid=ident(kind,key);base={'id':nid,'kind':kind,'label':label};base.update({k:v for k,v in props.items() if v not in (None,'',[],{})});nodes[nid]={**nodes.get(nid,{}),**base};return nid
 def edge(s:str,r:str,t:str,**props:Any)->None:
  eid=ident('edge',f"{s}|{r}|{t}|{json.dumps(props,sort_keys=True,default=str)}");edges[eid]={'id':eid,'source':s,'relation':r,'target':t,**{k:v for k,v in props.items() if v not in (None,'',[],{})}}
 builds=load(ROOT/'public'/'builds'/'index.json',{});plan=load(ROOT/'public'/'jarvis-data'/'experiment-plan.json',{});guard=load(ROOT/'public'/'jarvis-data'/'champion-protection.json',{});sessions=load(ROOT/'public'/'evidence-data'/'sessions.json',{});experiments=load(ROOT/'factory'/'memory'/'experiments.json',{})
 champion=guard.get('champion') or builds.get('recommended');champion_id=node('controller',str(champion),str(champion),role='champion') if champion else None
 for b in builds.get('builds',[]):
  name=str(b.get('name'));cid=node('controller',name,name,authority=b.get('authority'),luacSha=b.get('luacSha256'),sourceSha=b.get('sourceSha256'),bytes=b.get('luacBytes'),recommended=b.get('recommended'))
  parent=b.get('parent')
  if parent:edge(cid,'DERIVED_FROM',node('controller',str(parent),str(parent)))
  mission=b.get('mission')
  if mission:edge(cid,'BUILT_BY',node('mission',str(mission),str(mission)))
  if b.get('scoreDelta') is not None:
   eid=node('evaluation',f"{name}:{b.get('createdAt')}",f"Evaluation of {name}",scoreDelta=b.get('scoreDelta'),confidence=b.get('confidence'),authority=b.get('authority'))
   edge(cid,'HAS_EVALUATION',eid);edge(eid,'COMPARES_AGAINST',node('controller',str(parent or champion),str(parent or champion)))
  if b.get('championGateEligible'):edge(cid,'CLEARED_CHAMPION_GATE',champion_id or cid)
  elif champion_id and name!=champion:edge(cid,'CHALLENGES',champion_id,eligible=False)
 rejected=builds.get('rejected',[])
 for r in rejected:
  rid=node('rejection',f"{r.get('mission')}:{r.get('luacSha256')}",str(r.get('reason','Rejected candidate')),reason=r.get('reason'),sha=r.get('luacSha256'))
  if r.get('duplicateOf'):edge(rid,'DUPLICATES',node('controller',str(r['duplicateOf']),str(r['duplicateOf'])))
 ex=plan.get('nextExperiment',{})
 if ex:
  xid=node('experiment',str(ex.get('id')),str(ex.get('name') or ex.get('area')),hypothesis=ex.get('hypothesis'),measurement=ex.get('measurement'),expectedInformationGain=ex.get('expectedInformationGain'),uncertainty=ex.get('uncertainty'),status='PLANNED')
  if ex.get('parent'):edge(xid,'USES_PARENT',node('controller',str(ex['parent']),str(ex['parent'])))
  for m in ex.get('mutations',[]):edge(xid,'PROPOSES_MUTATION',node('mutation',str(m),str(m)))
  for test in ex.get('requiredTests',[]):edge(xid,'REQUIRES_TEST',node('test',str(test),str(test)))
 exp_rows=experiments.get('experiments',experiments if isinstance(experiments,list) else [])
 for item in exp_rows if isinstance(exp_rows,list) else []:
  if not isinstance(item,dict):continue
  key=str(item.get('id') or item.get('hypothesis') or len(nodes));xid=node('experiment',key,str(item.get('name') or item.get('hypothesis') or key),hypothesis=item.get('hypothesis'),status=item.get('status'),result=item.get('result'),confidence=item.get('confidence'))
  result=str(item.get('result','')).lower();relation='CONFIRMED_BY' if any(x in result for x in ('pass','confirm','improv','success')) else 'DISPROVED_BY' if any(x in result for x in ('fail','regress','reject','worse')) else 'HAS_EVIDENCE'
  for ref in item.get('evidence',[]) or []:edge(xid,relation,node('evidence',str(ref),str(ref)))
 rows=sessions.get('sessions',sessions if isinstance(sessions,list) else [])
 for s in rows if isinstance(rows,list) else []:
  if not isinstance(s,dict):continue
  sid=node('session',str(s.get('id') or s.get('sessionId')),str(s.get('id') or s.get('sessionId') or 'session'),classification=s.get('classification'),confidence=s.get('confidence'),replayReady=s.get('replayReady'))
  ctrl=s.get('controller')
  if ctrl:edge(sid,'OBSERVED_CONTROLLER',node('controller',str(ctrl),str(ctrl)),confidence=s.get('confidence'))
 counts={}
 for n in nodes.values():counts[n['kind']]=counts.get(n['kind'],0)+1
 doc={'schema':'JARVIS-KG-2','generatedAt':now(),'champion':champion,'currentExperiment':ex.get('id') if ex else None,'counts':counts,'nodeCount':len(nodes),'relationshipCount':len(edges),'nodes':list(nodes.values()),'relationships':list(edges.values())}
 save(GRAPH,doc);save(PUBLIC,doc);print(json.dumps({'nodes':len(nodes),'relationships':len(edges),'champion':champion,'experiment':doc['currentExperiment']},indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
