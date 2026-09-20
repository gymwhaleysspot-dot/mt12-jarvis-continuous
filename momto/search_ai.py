from .research_agent import run as research_run

def cycle(limit=20):
    result = research_run(min(limit, 20))
    # Preserve the stable search-AI contract while exposing the newer
    # model-directed engine through mode/details in the returned payload.
    result["engine"] = "momto-search-ai-v4"
    # Keep the stable public safety contract even when the underlying
    # research engine evolves.
    guardrails = dict(result.get("guardrails") or {})
    guardrails.setdefault("human_review", True)
    guardrails.setdefault("no_identity_invention", True)
    guardrails.setdefault("candidate_is_not_parent_conclusion", True)
    guardrails.setdefault("human_review_for_contact", True)
    guardrails.setdefault("private_case_data_publication", False)
    result["guardrails"] = guardrails
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
            "priority": "high" if i < 2 else "normal",
            "domain": x.get("lane", "research-ai"),
            "provider": x.get("provider", "web"),
            "action": x.get("purpose") or x.get("query", ""),
            "query": x.get("query", ""),
        }
        for i, x in enumerate(r.get("planned_searches", []))
    ][:limit]
