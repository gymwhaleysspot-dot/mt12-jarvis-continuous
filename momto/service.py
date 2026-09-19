from datetime import datetime
from .db import Base,engine,SessionLocal
from .models import Case,Objective,DnaStatus,RoadmapItem,Lead,Contact
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
  leads=db.query(Lead).filter_by(case_id=c.id).order_by(Lead.created_at.desc()).all()
  contacts=db.query(Contact).filter_by(case_id=c.id).order_by(Contact.contacted_at.desc()).all()
  dna=db.query(DnaStatus).order_by(DnaStatus.id).all()
  return {
   "id":c.id,"current_name":c.current_name,"birth_name":c.birth_name,"birth_year":c.birth_year,"status":c.status,
   "objectives":[(o.relationship_type,o.status) for o in c.objectives],
   "roadmap":[{"key":x.key,"title":x.title,"authority":x.authority,"status":x.status,"completed_at":x.completed_at.isoformat() if x.completed_at else None} for x in roadmap],
   "dna":[{"provider":x.provider,"status":x.status} for x in dna],
   "lead_count":len(leads),"contact_count":len(contacts)
  }
def complete_roadmap(key,notes=""):
 init_case()
 with SessionLocal() as db:
  item=db.query(RoadmapItem).filter_by(key=key).first()
  if item is None: raise ValueError(f"Unknown Ohio roadmap key: {key}")
  item.status="complete"; item.notes=notes; item.completed_at=datetime.utcnow(); db.commit()
def add_lead(relationship_type,source,summary="",status="new",confidence="unrated",reference="",next_action=""):
 c=init_case()
 with SessionLocal() as db:
  db.add(Lead(case_id=c.id,relationship_type=relationship_type,source=source,summary=summary,status=status,confidence=confidence,reference=reference,next_action=next_action)); db.commit()
def update_dna(provider,status,notes=""):
 init_case()
 with SessionLocal() as db:
  item=db.query(DnaStatus).filter_by(provider=provider).first()
  if item is None: raise ValueError(f"Unknown DNA provider: {provider}")
  item.status=status; item.notes=notes; db.commit()
