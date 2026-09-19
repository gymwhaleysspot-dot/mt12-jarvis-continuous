import typer
from .service import init_case,case_summary,OHIO_ROADMAP,complete_roadmap,add_lead,update_dna,DNA_PROVIDERS
from .db import SessionLocal
from .models import Contact,DnaStatus
app=typer.Typer(help="MomTo — persistent Ohio adoption-search tracker.")
@app.command()
def init(): init_case(); typer.echo("MomTo initialized; case remains active until explicitly closed.")
@app.command()
def search():
 init_case(); typer.echo("ACTIVE SEARCH — Ohio\nBirth mother: SEARCHING\nBirth father: SEARCHING")
case_app=typer.Typer(); app.add_typer(case_app,name="case")
@case_app.command("show")
def show():
 s=case_summary(); typer.echo(f"Case #{s['id']}: {s['current_name']} / {s['birth_name']} / {s['birth_year']}"); typer.echo(f"Status: {s['status'].upper()}")
 for r,st in s["objectives"]: typer.echo(f"{r.replace('_',' ').title()}: {st.upper()}")
 typer.echo(f"Ohio roadmap: {sum(x['status']=='complete' for x in s['roadmap'])}/{len(s['roadmap'])} complete")
 typer.echo(f"Leads: {s['lead_count']}  Contacts: {s['contact_count']}")
roadmap_app=typer.Typer(); app.add_typer(roadmap_app,name="roadmap")
@roadmap_app.command("ohio")
def ohio():
 for key,title,authority,desc in OHIO_ROADMAP: typer.echo(f"[ ] {key}: {title} — {authority} — {desc}")
@roadmap_app.command("complete")
def roadmap_complete(key:str,notes:str=""): complete_roadmap(key,notes); typer.echo(f"Completed Ohio roadmap item: {key}")
lead_app=typer.Typer(); app.add_typer(lead_app,name="lead")
@lead_app.command("add")
def lead_add(relationship_type:str,source:str,summary:str="",status:str="new",confidence:str="unrated",reference:str="",next_action:str=""):
 add_lead(relationship_type,source,summary,status,confidence,reference,next_action); typer.echo("Lead logged locally.")
dna_app=typer.Typer(); app.add_typer(dna_app,name="dna")
@dna_app.command("status")
def dna():
 init_case()
 with SessionLocal() as db:
  for x in db.query(DnaStatus).all(): typer.echo(f"{x.provider}: {x.status}")
@dna_app.command("set")
def dna_set(provider:str,status:str,notes:str=""):
 update_dna(provider,status,notes); typer.echo(f"DNA status updated: {provider}")
contact_app=typer.Typer(); app.add_typer(contact_app,name="contact")
@contact_app.command("add")
def contact(subject:str,response:str="",next_action:str=""):
 c=init_case()
 with SessionLocal() as db: db.add(Contact(case_id=c.id,subject=subject,response=response,next_action=next_action)); db.commit()
 typer.echo("Contact logged locally.")
