from .research_agent import run as research_run

def cycle(limit=20):
    result = research_run(min(limit, 20))
    # Preserve the stable search-AI contract while exposing the newer
    # model-directed engine through mode/details in the returned payload.
    result["engine"] = "momto-search-ai-v1"
    return result

def learn():
    from collections import Counter
    from .db import SessionLocal
    from .models import SearchEvent
    from .service import init_case
    case = init_case()
    with SessionLocal() as db:
        rows = db.query(SearchEvent).filter_by(case_id=case.id).all()
        top = Counter((x.source or "unknown") for x in rows).most_common()
        return {
            "searches": len(rows),
            "usefulness": dict(Counter((x.usefulness or "unknown").lower() for x in rows)),
            "top_sources": top,
        }

def generate_plan(limit=20):
    r = research_run(min(limit, 20))
    return [
        {
            "priority": "high" if i == 0 else "normal",
            "domain": "research-ai",
            "action": x.get("why") or x.get("query", ""),
        }
        for i, x in enumerate(r.get("planned_searches", []))
    ][:limit]
