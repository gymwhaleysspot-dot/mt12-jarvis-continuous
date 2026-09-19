import typer
from .service import init_case,case_summary,OHIO_ROADMAP
from .db import SessionLocal
from .models import Contact,DnaStatus
app=typer.Typer(help="MomTo — persistent legal adoption-search assistant.")
@app.command()
def init(): init_case(); typer.echo("MomTo initialized; case remains active until explicitly closed.")
@app.command()
def search():
 init_case(); typer.echo("ACTIVE SEARCH\nBirth mother: SEARCHING\nBirth father: SEARCHING")
case_app=typer.Typer(); app.add_typer(case_app,name="case")
@case_app.command("show")
def show():
 s=case_summary(); typer.echo(f"Case #{s['id']}: {s['current_name']} / {s['birth_name']} / {s['birth_year']}"); typer.echo(f"Status: {s['status'].upper()}")
 for r,st in s["objectives"]: typer.echo(f"{r.replace('_',' ').title()}: {st.upper()}")
dna_app=typer.Typer(); app.add_typer(dna_app,name="dna")
@dna_app.command("status")
def dna(): 
 init_case()
 with SessionLocal() as db:
  for x in db.query(DnaStatus).all(): typer.echo(f"{x.provider}: {x.status}")
roadmap_app=typer.Typer(); app.add_typer(roadmap_app,name="roadmap")
@roadmap_app.command("ohio")
def ohio():
 for k,t in OHIO_ROADMAP: typer.echo(f"[ ] {k}: {t}")
contact_app=typer.Typer(); app.add_typer(contact_app,name="contact")
@contact_app.command("add")
def contact(subject:str,response:str="",next_action:str=""):
 c=init_case()
 with SessionLocal() as db: db.add(Contact(case_id=c.id,subject=subject,response=response,next_action=next_action)); db.commit()
 typer.echo("Contact logged locally.")
