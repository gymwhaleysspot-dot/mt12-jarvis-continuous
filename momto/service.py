from datetime import datetime
from .db import Base,engine,SessionLocal
from .models import Case,Objective,DnaStatus,RoadmapItem,Lead,Contact,SearchEvent,Evidence,Hypothesis,Task
from . import advanced,ops
DNA_PROVIDERS=["AncestryDNA","23andMe","GEDmatch","FamilyTreeDNA"]
OHIO_ROADMAP=[
 ("odh-file","ODH adoption-file request","Ohio Department of Health","Request the contents of the adoption file available under current Ohio law; keep the request and returned records local."),
 ("non-id","Non-identifying history","Ohio adoption agency, attorney, or probate court","Request non-identifying birth-parent and sibling information, including medical/genetic history and background."),
 ("contact-pref","Contact-preference check","Ohio Department of Health","Track whether the adoption file contains a biological-parent contact preference or name-redaction filing."),
 ("registry","Ohio registry / mutual-consent options","Ohio adoption services","Document any eligible Ohio registry or mutual-consent registration and follow-up."),
 ("court","Probate-court records path","Applicable Ohio probate court","Identify the court that finalized the adoption and document the lawful records-access route if additional court action is needed."),
 ("dna","DNA matching","Lawful DNA databases","Record test status, match evidence, estimated relationships, and tree-building work locally; do not publish match details."),
 ("public-records","Public-record research","Lawful public sources","Track obituaries, newspapers, directories, and other lawful public records without publishing personal addresses or contact data."),
 ("professional","Professional review","Ohio adoption professional / attorney","Escalate records-access or contact questions when the legal route is unclear.")
]
def init_case():
 Base.metadata.create_all(engine)
 # Importing advanced registers the v3 workspace tables before create_all.
 with SessionLocal() as db:
  case=db.query(Case).first()
  if case is None:
   case=Case(current_name="Michael Whaley",birth_name="Michael Braggs",birth_year=1980); db.add(case); db.flush()
   db.add_all([Objective(case_id=case.id,relationship_type="birth_mother"),Objective(case_id=case.id,relationship_type="birth_father")])
   for p in DNA_PROVIDERS: db.add(DnaStatus(provider=p))
   for key,title,authority,_ in OHIO_ROADMAP: db.add(RoadmapItem(case_id=case.id,key=key,title=title,authority=authority))
   db.commit()
  else:
   existing={x.key for x in db.query(RoadmapItem).filter_by(case_id=case.id).all()}
   for key,title,authority,_ in OHIO_ROADMAP:
    if key not in existing: db.add(RoadmapItem(case_id=case.id,key=key,title=title,authority=authority))
   db.commit()
  return case
def case_summary():
 init_case()
 with SessionLocal() as db:
  c=db.query(Case).first()
  roadmap=db.query(RoadmapItem).filter_by(case_id=c.id).order_by(RoadmapItem.id).all()
  leads=db.query(Lead).filter_by(case_id=c.id).all()
  contacts=db.query(Contact).filter_by(case_id=c.id).all()
  dna=db.query(DnaStatus).order_by(DnaStatus.id).all()
  return {"id":c.id,"current_name":c.current_name,"birth_name":c.birth_name,"birth_year":c.birth_year,"status":c.status,
   "objectives":[(o.relationship_type,o.status) for o in c.objectives],
   "roadmap":[{"key":x.key,"title":x.title,"authority":x.authority,"status":x.status,"completed_at":x.completed_at.isoformat() if x.completed_at else None} for x in roadmap],
   "dna":[{"provider":x.provider,"status":x.status} for x in dna],
   "lead_count":len(leads),"contact_count":len(contacts),
   "search_count":db.query(SearchEvent).filter_by(case_id=c.id).count(),"evidence_count":db.query(Evidence).filter_by(case_id=c.id).count(),
   "hypothesis_count":db.query(Hypothesis).filter_by(case_id=c.id).count(),"open_task_count":db.query(Task).filter_by(case_id=c.id,status="open").count(),
   "advanced":advanced.advanced_summary()}
def complete_roadmap(key,notes=""):
 init_case()
 with SessionLocal() as db:
  item=db.query(RoadmapItem).filter_by(key=key).first()
  if item is None: raise ValueError(f"Unknown Ohio roadmap key: {key}")
  item.status="complete"; item.notes=notes; item.completed_at=datetime.utcnow(); db.commit()
def add_lead(relationship_type,source,summary="",status="new",confidence="unrated",reference="",next_action=""):
 c=init_case()
 with SessionLocal() as db: db.add(Lead(case_id=c.id,relationship_type=relationship_type,source=source,summary=summary,status=status,confidence=confidence,reference=reference,next_action=next_action)); db.commit()
def update_dna(provider,status,notes=""):
 init_case()
 with SessionLocal() as db:
  item=db.query(DnaStatus).filter_by(provider=provider).first()
  if item is None: raise ValueError(f"Unknown DNA provider: {provider}")
  item.status=status; item.notes=notes; db.commit()
def add_search(source,query="",result="",usefulness="unknown",reference="",next_action=""):
 c=init_case()
 with SessionLocal() as db: db.add(SearchEvent(case_id=c.id,source=source,query=query,result=result,usefulness=usefulness,reference=reference,next_action=next_action)); db.commit()
def add_evidence(title,evidence_type="record",source="",summary="",supports="",contradicts="",reference=""):
 c=init_case()
 with SessionLocal() as db: db.add(Evidence(case_id=c.id,title=title,evidence_type=evidence_type,source=source,summary=summary,supports=supports,contradicts=contradicts,reference=reference)); db.commit()
def add_hypothesis(title,confidence="unrated",supporting_count=0,contradicting_count=0,unknowns="",next_evidence=""):
 c=init_case()
 with SessionLocal() as db: db.add(Hypothesis(case_id=c.id,title=title,confidence=confidence,supporting_count=supporting_count,contradicting_count=contradicting_count,unknowns=unknowns,next_evidence=next_evidence)); db.commit()
def add_task(title,priority="normal",notes=""):
 c=init_case()
 with SessionLocal() as db: db.add(Task(case_id=c.id,title=title,priority=priority,notes=notes)); db.commit()


# MomTo v3: ten advanced capabilities
def graph_node(node_type,label,status="active"): return advanced.add_graph_node(node_type,label,status)
def graph_edge(from_node,to_node,relation,source="",confidence="unrated",evidence_ref=""): return advanced.add_graph_edge(from_node,to_node,relation,source,confidence,evidence_ref)
def dna_cluster(name,provider="",match_count=0,ancestor_hypothesis="",confidence="unrated",notes=""): return advanced.add_dna_cluster(name,provider,match_count,ancestor_hypothesis,confidence,notes)
def candidate(role,label,notes=""): return advanced.add_candidate(role,label,notes)
def candidate_factor(candidate_id,factor,value="",evidence_ref=""): return advanced.add_candidate_factor(candidate_id,factor,value,evidence_ref)
def timeline(event_date,title,source="",certainty="unknown",notes=""): return advanced.add_timeline(event_date,title,source,certainty,notes)
def source_reliability(source,reliability,rationale=""): return advanced.set_source_reliability(source,reliability,rationale)
def coverage(area,status,notes=""): return advanced.set_coverage(area,status,notes)
def ingest_document(path): return advanced.ingest_document(path)
def contradictions(): return advanced.detect_contradictions()
def next_actions(): return advanced.suggest_next_actions()

# MomTo v4 operational intelligence, recovery, and audit tooling
def workspace_report(): return ops.workspace_report()
def ranked_next_actions(limit=8): return ops.ranked_next_actions(limit)
def validate_local_state(): return ops.validate_local_state()
def backup_local(destination=None): return ops.backup_local(destination)
def recovery_manifest(): return ops.recovery_manifest()
def audit_tail(limit=20): return ops.audit_tail(limit)

# MomTo v5 live/search intelligence wrappers
def live_activity(limit=25): return ops.live_activity(limit)

def search_ai_cycle(limit=20):
 from . import search_ai
 return search_ai.cycle(limit)

def enhancement_summary():
 from . import enhancements
 return enhancements.summary()

def enhancement_wave(limit=25):
 from . import enhancements
 return enhancements.wave(limit)
