import typer
from .service import init_case,case_summary,OHIO_ROADMAP,complete_roadmap,add_lead,update_dna,add_search,add_evidence,add_hypothesis,add_task
from .db import SessionLocal
from .models import Contact,DnaStatus,SearchEvent,Evidence,Hypothesis,Task
app=typer.Typer(help="MomTo — persistent Ohio adoption-search tracker.")
@app.command()
def init(): init_case(); typer.echo("MomTo initialized; case remains active until explicitly closed.")
@app.command()
def search(): init_case(); typer.echo("ACTIVE SEARCH — Ohio\nBirth mother: SEARCHING\nBirth father: SEARCHING")
case_app=typer.Typer(); app.add_typer(case_app,name="case")
@case_app.command("show")
def show():
 s=case_summary(); typer.echo(f"Case #{s['id']}: {s['current_name']} / {s['birth_name']} / {s['birth_year']}"); typer.echo(f"Status: {s['status'].upper()}")
 for r,st in s["objectives"]: typer.echo(f"{r.replace('_',' ').title()}: {st.upper()}")
 typer.echo(f"Ohio roadmap: {sum(x['status']=='complete' for x in s['roadmap'])}/{len(s['roadmap'])} complete")
 typer.echo(f"Leads: {s['lead_count']}  Contacts: {s['contact_count']}  Searches: {s['search_count']}  Evidence: {s['evidence_count']}  Hypotheses: {s['hypothesis_count']}  Open tasks: {s['open_task_count']}")
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
def dna_set(provider:str,status:str,notes:str=""): update_dna(provider,status,notes); typer.echo(f"DNA status updated: {provider}")
contact_app=typer.Typer(); app.add_typer(contact_app,name="contact")
@contact_app.command("add")
def contact(subject:str,response:str="",next_action:str=""):
 c=init_case()
 with SessionLocal() as db: db.add(Contact(case_id=c.id,subject=subject,response=response,next_action=next_action)); db.commit()
 typer.echo("Contact logged locally.")
search_app=typer.Typer(); app.add_typer(search_app,name="search-log")
@search_app.command("add")
def search_add(source:str,query:str="",result:str="",usefulness:str="unknown",reference:str="",next_action:str=""):
 add_search(source,query,result,usefulness,reference,next_action); typer.echo("Search event logged locally.")
@search_app.command("show")
def search_show():
 init_case()
 with SessionLocal() as db:
  for x in db.query(SearchEvent).order_by(SearchEvent.searched_at.desc()).all(): typer.echo(f"{x.searched_at:%Y-%m-%d} {x.source} [{x.usefulness}] {x.query}")
evidence_app=typer.Typer(); app.add_typer(evidence_app,name="evidence")
@evidence_app.command("add")
def evidence_add(title:str,evidence_type:str="record",source:str="",summary:str="",supports:str="",contradicts:str="",reference:str=""):
 add_evidence(title,evidence_type,source,summary,supports,contradicts,reference); typer.echo("Evidence logged locally.")
hyp_app=typer.Typer(); app.add_typer(hyp_app,name="hypothesis")
@hyp_app.command("add")
def hypothesis_add(title:str,confidence:str="unrated",supporting_count:int=0,contradicting_count:int=0,unknowns:str="",next_evidence:str=""):
 add_hypothesis(title,confidence,supporting_count,contradicting_count,unknowns,next_evidence); typer.echo("Hypothesis logged locally.")
task_app=typer.Typer(); app.add_typer(task_app,name="task")
@task_app.command("add")
def task_add(title:str,priority:str="normal",notes:str=""): add_task(title,priority,notes); typer.echo("Task logged locally.")
@task_app.command("show")
def task_show():
 init_case()
 with SessionLocal() as db:
  for x in db.query(Task).filter_by(status="open").order_by(Task.priority,Task.created_at).all(): typer.echo(f"[{x.priority}] {x.title}")
