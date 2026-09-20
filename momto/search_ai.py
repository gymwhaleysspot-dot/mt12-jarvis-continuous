from __future__ import annotations
from collections import Counter
from datetime import datetime, timezone
from .db import SessionLocal
from .models import SearchEvent, Evidence, Hypothesis, Task
from .ops import workspace_report
from .genealogy import public_research_catalog, case_research_plan

SEARCH_DOMAINS = (
    "odh-file","non-id","contact-pref","registry","court","dna",
    "public-records","professional",
)

def _case_id() -> int:
    from .service import init_case
    return init_case().id

def learn() -> dict:
    case_id = _case_id()
    with SessionLocal() as db:
        rows = db.query(SearchEvent).filter_by(case_id=case_id).all()
        usefulness = Counter((x.usefulness or "unknown").lower() for x in rows)
        sources = Counter(x.source for x in rows if x.source)
        queries = Counter(x.query for x in rows if x.query)
        return {
            "searches": len(rows),
            "usefulness": dict(usefulness),
            "top_sources": sources.most_common(10),
            "top_queries": queries.most_common(10),
        }

def generate_plan(limit: int = 20) -> list[dict]:
    report = workspace_report()
    learned = learn()
    plan: list[dict] = []
    gaps = report["coverage"]
    if gaps["percent"] < 100:
        plan.append({"priority":"high","domain":"coverage","action":"Investigate the next uncovered Ohio search area and record the verified result."})
    if report["contradictions"]:
        plan.append({"priority":"high","domain":"evidence","action":"Resolve the highest-impact recorded contradiction with an independent source."})
    if report["evidence"] and not report["hypotheses"]:
        plan.append({"priority":"high","domain":"hypothesis","action":"Turn existing evidence into a falsifiable hypothesis and identify the next evidence needed."})
    if report["searches"] == 0:
        plan.append({"priority":"high","domain":"discovery","action":"Start with the official Ohio records-access roadmap before broad public-record research."})
    else:
        for source,count in learned["top_sources"][:3]:
            if learned["usefulness"].get("useful",0) == 0:
                plan.append({"priority":"normal","domain":"source-learning","action":f"Re-evaluate {source} using a different query or independent source."})
            elif count:
                plan.append({"priority":"normal","domain":"source-learning","action":f"Use the learned source pattern from {source} for the next evidence-backed search."})
    if report["timeline_events"] == 0:
        plan.append({"priority":"normal","domain":"timeline","action":"Build the initial dated timeline from verified records."})
    if report["source_reviews"] == 0 and report["evidence"]:
        plan.append({"priority":"normal","domain":"source-quality","action":"Rate the reliability of recorded evidence sources."})
    if report["open_tasks"] == 0:
        plan.append({"priority":"normal","domain":"execution","action":"Create the next concrete research task from the strongest documented gap."})
    return plan[:max(1,limit)]

def cycle(limit: int = 20) -> dict:
    from .service import init_case
    case = init_case()
    plan = generate_plan(limit)
    genealogy = case_research_plan(case, limit=limit)
    now = datetime.now(timezone.utc).isoformat()
    return {
        "engine":"momto-search-ai-v1",
        "generated_at":now,
        "mode":"evidence-driven",
        "plan":plan,
        "learning":learn(),
        "workspace":workspace_report(),
        "genealogy": genealogy,
        "public_research_catalog": public_research_catalog(),
        "guardrails":{
            "human_review":True,
            "no_private_data_publication":True,
            "no_intrusive_contact":True,
            "no_access_control_bypass":True,
            "no_identity_invention":True,
        },
    }
