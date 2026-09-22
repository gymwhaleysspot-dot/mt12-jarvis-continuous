from datetime import datetime
from .db import Base,engine,SessionLocal
from .models import Case,Objective,DnaStatus,RoadmapItem,Lead,Contact,SearchEvent,Evidence,Hypothesis,Task
from . import advanced,ops,ancestry
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
def _roadmap_progress(items):
 counts={}
 for item in items: counts[item.status]=counts.get(item.status,0)+1
 total=len(items)
 complete=counts.get("complete",0)
 activated=total-counts.get("not-started",0)
 actionable=counts.get("ready",0)+counts.get("ready-for-human-review",0)+counts.get("awaiting-user-data",0)
 return {"total":total,"complete":complete,"activated":activated,"actionable":actionable,"percent_complete":round(complete*100/total) if total else 0,"percent_activated":round(activated*100/total) if total else 0,"by_status":counts}

def _seed_bragg_maternal_research(db, case):
 """Seed the private Braggs maternal-search evidence and unresolved household lead."""
 existing={x.title for x in db.query(Evidence).filter_by(case_id=case.id).all()}
 refs=[
  ("1938 Cincinnati directory — Lacey (Mary) Braggs household","directory","Cincinnati Public Library","Lacey (Mary) is listed at 666 Linn with Hattie Braggs, widow of Frank. This establishes an early Cincinnati Lacey/Mary household record but does not independently prove the full maternal chain.","Supports the working Lacey/Mary family anchor.","https://apps.cincinnatilibrary.org/citydirectory/WilliamsCincinnatiDirectory_1938_Pt01.pdf"),
  ("1947 Cincinnati directory — Lacey Braggs","directory","Cincinnati Public Library","Lacey Braggs is listed at 3583 Vine Ave.","Supports continued Cincinnati residence of a Lacey Braggs.","https://apps.cincinnatilibrary.org/citydirectory/WilliamsCincinnatiCityDirectory91771780025qW722c1947_Part5.pdf"),
  ("1955 Cincinnati directory — Lacey Jr. (Shirley) at 3624 Dawson","directory","Cincinnati Public Library","The directory lists Lacey (Mary L.) at 3624 Dawson Ave. and Lacey Jr. (Shirley), USAF, at the same address.","Supports a documented 1955 association between Lacey Jr. and a person identified only as Shirley, and the Lacey/Mary household address.","https://apps.cincinnatilibrary.org/citydirectory/WilliamsCintiCityDirectory_917717800525qW722c1955_Part1.pdf"),
  ("1964 Hamilton County deed index — Lacey Braggs","property-record","Hamilton County Recorder","A Lacey Braggs transaction appears in the 1964 deed index.","Supports a later public-record trail for the Braggs surname; relationship details remain unresolved.","https://recordersoffice.hamilton-co.org/deed_indexes/di1942trter.pdf"),
 ]
 for title,etype,source,summary,supports,ref in refs:
  if title not in existing: db.add(Evidence(case_id=case.id,title=title,evidence_type=etype,source=source,summary=summary,supports=supports,reference=ref))
 if "Lacey Jr. maternal household bridge (1955–1980)" not in {x.title for x in db.query(Lead).filter_by(case_id=case.id).all()}:
  db.add(Lead(case_id=case.id,relationship_type="birth_mother",source="Cincinnati historical directory household reconstruction",summary="Primary unresolved bridge: identify the Shirley associated with Lacey Jr. in 1955, reconstruct Lacey Jr.'s household through 1978–1980, and test any resulting woman against Michael Braggs, born May 19, 1980 in Cincinnati.",status="active",confidence="unrated",reference="1955 Cincinnati directory: https://apps.cincinnatilibrary.org/citydirectory/WilliamsCintiCityDirectory_917717800525qW722c1955_Part1.pdf",next_action="Search 1960s–1981 Cincinnati directories, marriage/death/newspaper records, and the private Ancestry graph for Lacey Jr., Shirley, and the 1978–1980 household."))
 if "Michael Braggs birth-mother identity remains unproven" not in {x.title for x in db.query(Hypothesis).filter_by(case_id=case.id).all()}:
  db.add(Hypothesis(case_id=case.id,title="Michael Braggs birth-mother identity remains unproven",status="open",confidence="unrated",supporting_count=0,contradicting_count=0,unknowns="Identity of the 1955 Shirley; Lacey Jr.'s 1978–1980 address and household; independent parentage record for Michael Braggs.",next_evidence="1978–1981 Cincinnati city directories, marriage records, newspapers/birth announcements, and private Ancestry relationship evidence."))
 if "Reconstruct Lacey Jr. household 1955–1980" not in {x.title for x in db.query(Task).filter_by(case_id=case.id).all()}:
  db.add(Task(case_id=case.id,title="Reconstruct Lacey Jr. household 1955–1980",priority="high",notes="Keep Shirley unresolved until surname/relationship is independently established. Exclude Shirley Price unless a Cincinnati/Lacey Jr. connection is documented. Exclude Frankie Braggs from maternal inference because the case record identifies Frankie as paternal aunt."))
 db.flush()

def init_case():
 from . import dna
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
   for dna_row in db.query(DnaStatus).all():
    if dna_row.status == "not-started":
     dna_row.status="ready-for-import"
     dna_row.notes="DNA signal engine is active; lawful local match exports can be normalized and analyzed without publishing identities."
   db.flush()
   # Public-research progress is distinct from case completion. These states
   # never mark an external request, record receipt, DNA match, or contact as complete.
   research_state={
    "odh-file":("ready","Ohio adoption-file access route researched from current public Ohio law; user identity/signature/fee and any returned records remain required."),
    "non-id":("ready","Ohio non-identifying-information access route researched; actual agency/court request remains a case action."),
    "contact-pref":("researched","Public Ohio adoption-file/contact-preference rules researched; no private filing or parent status inferred."),
    "registry":("researched","Ohio mutual-consent/registry route is a documented research lane; eligibility and registration require case-specific verification."),
    "court":("ready","Ohio probate adoption-form and records-access path researched; the finalizing court and any filing still require case-specific work."),
    "dna":("awaiting-user-data","DNA workflow is implemented locally but requires lawful user-provided test/match data; no identities are published."),
    "public-records":("ready","Lawful public-record research lane is active; no addresses, phone numbers, emails, or private identities are published."),
    "professional":("ready-for-human-review","Professional escalation lane is defined for questions that require legal interpretation or human contact."),
   }
   for item in db.query(RoadmapItem).filter_by(case_id=case.id).all():
    if item.status != "complete" and item.key in research_state:
     item.status,item.notes=research_state[item.key]
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
   "roadmap":[{"key":x.key,"title":x.title,"authority":x.authority,"status":x.status,"notes":x.notes,"completed_at":x.completed_at.isoformat() if x.completed_at else None} for x in roadmap],
   "roadmap_progress":_roadmap_progress(roadmap),
   "dna":[{"provider":x.provider,"status":x.status} for x in dna],
   "dna_signals":__import__("momto.dna",fromlist=["public_summary"]).public_summary(),
   "ancestry":ancestry.public_summary(),
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
