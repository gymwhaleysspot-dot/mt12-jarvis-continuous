from .research_agent import run as research_run

def cycle(limit=20):
    return research_run(min(limit,20))

def learn():
    from collections import Counter
    from .db import SessionLocal
    from .models import SearchEvent
    from .service import init_case
    case=init_case()
    with SessionLocal() as db:
        rows=db.query(SearchEvent).filter_by(case_id=case.id).all()
        return {"searches":len(rows),"usefulness":dict(Counter((x.usefulness or "unknown").lower() for x in rows))}

def generate_plan(limit=20):
    r=research_run(min(limit,20))
    return [{"priority":"high" if i==0 else "normal","domain":"research-ai","action":x.get("why") or x.get("query","")} for i,x in enumerate(r.get("planned_searches",[]))][:limit]
