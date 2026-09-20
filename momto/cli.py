import typer
import json
from .service import init_case,case_summary,OHIO_ROADMAP,complete_roadmap,add_lead,update_dna,add_search,add_evidence,add_hypothesis,add_task,graph_node,graph_edge,dna_cluster,candidate,candidate_factor,timeline,source_reliability,coverage,ingest_document,contradictions,next_actions,workspace_report,ranked_next_actions,validate_local_state,backup_local,recovery_manifest,audit_tail,search_ai_cycle
from .db import SessionLocal
from .case_vault import CaseVault, VaultError, generate_key
from .dna import import_matches, public_summary
from .ancestry import import_gedcom, record_observation, public_summary as ancestry_summary
from .models import Contact,DnaStatus,SearchEvent,Evidence,Hypothesis,Task
app=typer.Typer(help="MomTo — persistent Ohio adoption-search tracker.")
@app.command()
def init(): init_case(); typer.echo("MomTo initialized; case remains active until explicitly closed.")
@app.command()
def search(): init_case(); typer.echo("ACTIVE SEARCH — Ohio\\nBirth mother: SEARCHING\\nBirth father: SEARCHING")
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
@dna_app.command("import")
def dna_import(path:str,provider:str=""):
 r=import_matches(path,provider or None); typer.echo(json.dumps(r,sort_keys=True))
@dna_app.command("summary")
def dna_summary(): typer.echo(json.dumps(public_summary(),sort_keys=True))
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

v3=typer.Typer(help="MomTo v3 advanced workspace — all ten capabilities remain local/private.")
app.add_typer(v3,name="v3")

@v3.command("graph-node")
def v3_graph_node(node_type:str,label:str,status:str="active"): typer.echo(f"Graph node #{graph_node(node_type,label,status)} created locally.")

@v3.command("graph-edge")
def v3_graph_edge(from_node:int,to_node:int,relation:str,source:str="",confidence:str="unrated",evidence_ref:str=""): typer.echo(f"Graph edge #{graph_edge(from_node,to_node,relation,source,confidence,evidence_ref)} created locally.")

@v3.command("dna-cluster")
def v3_dna_cluster(name:str,provider:str="",match_count:int=0,ancestor_hypothesis:str="",confidence:str="unrated",notes:str=""): dna_cluster(name,provider,match_count,ancestor_hypothesis,confidence,notes); typer.echo("DNA triangulation cluster logged locally.")

@v3.command("candidate")
def v3_candidate(role:str,label:str,notes:str=""): typer.echo(f"Candidate #{candidate(role,label,notes)} created locally.")

@v3.command("candidate-factor")
def v3_candidate_factor(candidate_id:int,factor:str,value:str="",evidence_ref:str=""): candidate_factor(candidate_id,factor,value,evidence_ref); typer.echo("Candidate comparison factor logged locally.")

@v3.command("timeline")
def v3_timeline(event_date:str,title:str,source:str="",certainty:str="unknown",notes:str=""): timeline(event_date,title,source,certainty,notes); typer.echo("Timeline event logged locally.")

@v3.command("source-review")
def v3_source_review(source:str,reliability:float,rationale:str=""): source_reliability(source,reliability,rationale); typer.echo("Source reliability reviewed locally.")

@v3.command("coverage")
def v3_coverage(area:str,status:str,notes:str=""): coverage(area,status,notes); typer.echo("Search coverage updated locally.")

@v3.command("document")
def v3_document(path:str): typer.echo(f"Document #{ingest_document(path)} indexed locally; contents are not published.")

@v3.command("contradictions")
def v3_contradictions(): typer.echo(str(contradictions()))

@v3.command("next-actions")
def v3_next_actions():
    for item in next_actions(): typer.echo("- "+item)


ops=typer.Typer(help="MomTo v4 operational intelligence and local recovery.")
app.add_typer(ops,name="ops")

@ops.command("report")
def ops_report(): typer.echo(json.dumps(workspace_report(),indent=2,sort_keys=True))

@ops.command("next")
def ops_next(limit:int=8):
    for item in ranked_next_actions(limit): typer.echo(f"[{item['priority']}] {item['action']}")

@ops.command("validate")
def ops_validate(): typer.echo(json.dumps(validate_local_state(),indent=2,sort_keys=True))

@ops.command("backup")
def ops_backup(destination:str=""): typer.echo(json.dumps(backup_local(destination or None),indent=2,sort_keys=True))

@ops.command("manifest")
def ops_manifest(): typer.echo(json.dumps(recovery_manifest(),indent=2,sort_keys=True))

@ops.command("audit")
def ops_audit(limit:int=20): typer.echo(json.dumps(audit_tail(limit),indent=2,sort_keys=True))


ai=typer.Typer(help="MomTo Search AI — adaptive, evidence-driven research planning.")
app.add_typer(ai,name="search-ai")

@ai.command("cycle")
def ai_cycle(limit:int=20):
    typer.echo(json.dumps(search_ai_cycle(limit),indent=2,sort_keys=True))

@ai.command("plan")
def ai_plan(limit:int=20):
    for item in search_ai_cycle(limit)["plan"]:
        typer.echo(f"[{item['priority']}] {item['domain']}: {item['action']}")


vault_app=typer.Typer(help="MomTo encrypted private case vault. Vault contents never belong in Git or public snapshots.")
app.add_typer(vault_app,name="vault")

@vault_app.command("key")
def vault_key():
    typer.echo(generate_key())
    typer.echo("Store this key outside the repository as MOMTO_VAULT_KEY.", err=True)

def _vault() -> CaseVault:
    try:
        return CaseVault()
    except VaultError as exc:
        raise typer.BadParameter(str(exc))

@vault_app.command("init")
def vault_init():
    key=generate_key()
    path=CaseVault(key=key).root
    typer.echo(f"Vault initialized at {path}")
    typer.echo(f"MOMTO_VAULT_KEY={key}")
    typer.echo("Keep the key outside Git; do not paste private records into issues, commits, or public snapshots.")

@vault_app.command("ingest")
def vault_ingest(path:str):
    typer.echo(json.dumps(_vault().ingest_document(path),indent=2))

@vault_app.command("summary")
def vault_summary():
    typer.echo(json.dumps(_vault().summary(),indent=2,sort_keys=True))

@vault_app.command("list")
def vault_list(kind:str=""):
    for row in _vault().list_records(kind or None):
        typer.echo(f"{row['id']} {row['kind']} {row['digest']}")

@vault_app.command("evidence")
def vault_evidence(title:str,summary:str="",source:str="",evidence_type:str="record",supports:str="",contradicts:str="",reference:str=""):
    typer.echo(f"Private evidence #{_vault().add_evidence(title,summary,source,evidence_type,supports,contradicts,reference)} recorded.")

@vault_app.command("search")
def vault_search(source:str,query:str,result:str="",usefulness:str="unknown",reference:str="",next_action:str=""):
    typer.echo(f"Private search #{_vault().add_search(source,query,result,usefulness,reference,next_action)} recorded.")

@vault_app.command("hypothesis")
def vault_hypothesis(title:str,confidence:str="unrated",unknowns:str="",next_evidence:str=""):
    typer.echo(f"Private hypothesis #{_vault().add_hypothesis(title,confidence,unknowns,next_evidence)} recorded.")

@vault_app.command("task")
def vault_task(title:str,priority:str="normal",notes:str=""):
    typer.echo(f"Private task #{_vault().add_task(title,priority,notes)} recorded.")

