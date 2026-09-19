from .db import Base,engine,SessionLocal
from .models import Case,Objective,DnaStatus
DNA_PROVIDERS=["AncestryDNA","23andMe","GEDmatch","FamilyTreeDNA"]
OHIO_ROADMAP=[("ODH","Request available non-identifying adoption information from Ohio Department of Health."),("Registry","Review Ohio Adoption Registry options and eligibility."),("Probate Court","Research the applicable probate-court petition/process for adoption records."),("DNA","Use lawful DNA testing/matching services and document consent and match evidence."),("Public records","Manually document lawful results from obituaries, newspapers, and public records."),("Professional help","Consider an adoption professional or attorney when records access or contact questions require it.")]
def init_case():
 Base.metadata.create_all(engine)
 with SessionLocal() as db:
  case=db.query(Case).first()
  if case is None:
   case=Case(current_name="Michael Whaley",birth_name="Michael Braggs",birth_year=1980); db.add(case); db.flush()
   db.add_all([Objective(case_id=case.id,relationship_type="birth_mother"),Objective(case_id=case.id,relationship_type="birth_father")])
   for p in DNA_PROVIDERS: db.add(DnaStatus(provider=p))
   db.commit()
  return case
def case_summary():
 init_case()
 with SessionLocal() as db:
  c=db.query(Case).first()
  return {"id":c.id,"current_name":c.current_name,"birth_name":c.birth_name,"birth_year":c.birth_year,"status":c.status,"objectives":[(o.relationship_type,o.status) for o in c.objectives]}
