from __future__ import annotations

import json
import os
import urllib.request
from datetime import datetime, timezone

from .db import SessionLocal
from .models import Evidence, Hypothesis, SearchEvent, Task, Lead
from .genealogy import SOURCE_CATALOG
from .research_tools import GenealogySearchTools
from .parent_search import build_parent_search_context, build_discriminating_searches, verify_research_chain


def _now():
    return datetime.now(timezone.utc).isoformat()


def _model(system, payload):
    key = os.environ.get("MOMTO_OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not key:
        return None
    base = os.environ.get("MOMTO_OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("MOMTO_RESEARCH_MODEL", "gpt-5.6")
    body = json.dumps({
        "model": model,
        "input": [
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        "text": {"format": {"type": "json_object"}},
    }).encode()
    req = urllib.request.Request(
        base + "/responses",
        data=body,
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            data = json.loads(response.read().decode())
        out = data.get("output_text")
        if not out:
            for item in data.get("output", []):
                for part in item.get("content", []):
                    if isinstance(part, dict) and part.get("text"):
                        out = part["text"]
                        break
                if out:
                    break
        return json.loads(out) if out else None
    except Exception:
        return None


def _private_context(case):
    with SessionLocal() as db:
        evidence = db.query(Evidence).filter_by(case_id=case.id).all()
        hypotheses = db.query(Hypothesis).filter_by(case_id=case.id).all()
        searches = (
            db.query(SearchEvent)
            .filter_by(case_id=case.id)
            .order_by(SearchEvent.searched_at.desc())
            .limit(60)
            .all()
        )
        tasks = db.query(Task).filter_by(case_id=case.id, status="open").all()
        return {
            "case": {
                "current_name": case.current_name,
                "birth_name": case.birth_name,
                "birth_year": case.birth_year,
            },
            "evidence": [
                {
                    "title": x.title,
                    "source": x.source,
                    "summary": x.summary,
                    "supports": x.supports,
                    "contradicts": x.contradicts,
                }
                for x in evidence[-100:]
            ],
            "hypotheses": [
                {
                    "title": x.title,
                    "status": x.status,
                    "confidence": x.confidence,
                    "supporting": x.supporting_count,
                    "contradicting": x.contradicting_count,
                    "unknowns": x.unknowns,
                    "next_evidence": x.next_evidence,
                }
                for x in hypotheses[-50:]
            ],
            "recent_searches": [
                {"source": x.source, "query": x.query, "usefulness": x.usefulness, "result": x.result[:1500]}
                for x in searches
            ],
            "open_tasks": [{"title": x.title, "priority": x.priority} for x in tasks],
        }


def _save_search(case_id, lane, query, hits):
    with SessionLocal() as db:
        row = SearchEvent(
            case_id=case_id,
            source="Internet/genealogy search",
            query=query,
            result=json.dumps(hits[:8], ensure_ascii=False),
            usefulness="found" if hits else "no-result",
            reference="; ".join(h.get("url", "") for h in hits[:8]),
            next_action="Review returned records/pages and corroborate before establishing identity.",
        )
        db.add(row)
        db.commit()


def _save_leads(case_id, lane, hits):
    # Search hits are leads, not identity conclusions.
    with SessionLocal() as db:
        for hit in hits[:8]:
            title = (hit.get("title") or "Unnamed search result")[:200]
            summary = (hit.get("snippet") or "")[:1500]
            db.add(Lead(
                case_id=case_id,
                relationship_type=lane,
                source=hit.get("provider") or "Internet search",
                summary=summary,
                status="new",
                confidence="unrated",
                reference=hit.get("url", ""),
                next_action="Open and corroborate with an independent record.",
            ))
        db.commit()


def run(limit=12):
    from .service import init_case

    case = init_case()
    context = _private_context(case)
    tools = GenealogySearchTools(case.id)
    local_graph = tools.lookup_local_graph()
    parent_context = build_parent_search_context(case.id)
    chain = verify_research_chain(case.id)

    plan = _model(
        """You are MomTo, an autonomous adoption/genealogy research AI.
Use the private case context to select falsifiable searches for BOTH the birth-mother
and birth-father lanes. You may use public Internet search results as leads, but never
treat a search-engine hit as proof of identity. Prefer original records, government
sources, archives, newspapers, probate, vital records, and structured genealogy
providers. Track alternate names, dates, places, FAN relationships, contradictions,
and negative searches. Never invent people or records.

Return JSON:
{"research_question":"...", "searches":[{"lane":"birth-mother|birth-father","query":"...","purpose":"...","provider":"web|familysearch|wikitree|ohio"}], "cautions":["..."]}

Keep queries focused enough to discriminate between hypotheses.""",
        {
            "context": context,
            "local_ancestry_graph": local_graph,
            "graph_search_plan": tools.graph_search_plan("both", min(24, max(limit * 2, 12))),
            "parent_search_context": parent_context,
            "graph_derived_searches": build_discriminating_searches(parent_context, min(24, max(limit * 2, 12))),
            "available_sources": [
                {k: s[k] for k in ("id", "title", "url", "lane", "record_types")}
                for s in SOURCE_CATALOG
            ],
        },
    )

    if not plan:
        searches = build_discriminating_searches(parent_context, max(limit, 8)) or tools.build_searches("both", max(limit, 8))
        plan = {
            "research_question": "Find corroborating public evidence for the birth-mother and birth-father hypotheses.",
            "searches": searches,
            "cautions": ["Model unavailable; deterministic genealogy search plan is active."],
        }

    planned = [
        x for x in (plan.get("searches") or [])
        if x.get("query") and x.get("lane") in {"birth-mother", "birth-father"}
    ][:limit]

    # A model response can be valid JSON but still omit usable lane-tagged searches.
    # Fall back to the deterministic genealogy plan so callers never receive an empty plan.
    if not planned:
        fallback = build_discriminating_searches(parent_context, max(limit, 8)) or tools.graph_search_plan("both", max(limit, 8))
        if not fallback:
            fallback = tools.graph_search_plan("both", max(limit, 8))
        if not fallback:
            fallback = tools.build_searches("both", max(limit, 8))
        planned = fallback[:limit]
        plan["cautions"] = list(plan.get("cautions") or []) + [
            "Model plan contained no usable lane-tagged searches; deterministic genealogy search plan is active."
        ]

    # Execute independent searches concurrently. This is the main v4 speedup:
    # provider calls overlap while persistence remains sequential and deterministic.
    batches = tools.parallel_search(planned, per_query=6, workers=min(8, max(1, len(planned))))
    results = []
    for batch in batches:
        lane = batch["lane"]
        hits = batch["hits"]
        _save_search(case.id, lane, batch["query"], hits)
        _save_leads(case.id, lane, hits)
        results.append({
            "lane": lane,
            "provider": batch["provider"],
            "query_executed": True,
            "hit_count": len(hits),
            "hits": hits,
        })

    # A second reasoning pass can turn raw search hits into private hypotheses.
    synthesis = _model(
        """You are MomTo's evidence reconciliation pass. Review private search results.
Identify only candidate leads that are explicitly supported by the returned snippets.
Do not invent facts. A candidate is NOT a parent conclusion. For each candidate return
lane, candidate_description, supporting_urls, contradictions, and next_record_type.
Return JSON: {"candidates":[...], "next_searches":[...], "cautions":[...]}.""",
        {
            "case": context["case"],
            "search_results": results,
        },
    )

    candidate_count = 0
    if synthesis:
        candidate_count = len(synthesis.get("candidates") or [])
        with SessionLocal() as db:
            for candidate in (synthesis.get("candidates") or [])[:12]:
                lane = candidate.get("lane", "")
                if lane not in {"birth-mother", "birth-father"}:
                    continue
                urls = candidate.get("supporting_urls") or []
                db.add(Lead(
                    case_id=case.id,
                    relationship_type=lane,
                    source="MomTo evidence reconciliation",
                    summary=json.dumps({
                        "candidate_description": candidate.get("candidate_description", ""),
                        "contradictions": candidate.get("contradictions", []),
                        "next_record_type": candidate.get("next_record_type", ""),
                    }, ensure_ascii=False),
                    status="candidate",
                    confidence="unrated",
                    reference="; ".join(str(u) for u in urls[:8]),
                    next_action="Corroborate with an independent record before treating as an identity match.",
                ))
            db.commit()

    lane_counts = {
        "birth-mother": sum(r["hit_count"] for r in results if r["lane"] == "birth-mother"),
        "birth-father": sum(r["hit_count"] for r in results if r["lane"] == "birth-father"),
    }

    # Only aggregate, public-safe information leaves this function. Private
    # names, queries, snippets, URLs tied to candidates, and DNA identities stay
    # in the local database.
    return {
        "engine": "momto-research-agent-v4",
        "mode": "parallel-multi-provider-genealogy-loop",
        "generated_at": _now(),
        "research_question": "Autonomous public-source research for both birth-parent lanes.",
        "planned_searches": planned,
        "summary": {
            "searches_executed": len(results),
            "hits_found": sum(r["hit_count"] for r in results),
            "birth_mother_hits": lane_counts["birth-mother"],
            "birth_father_hits": lane_counts["birth-father"],
            "candidate_leads": candidate_count,
            "local_ancestry_people_available": local_graph.get("related_count", 0),
            "private_graph_people_loaded": len(local_graph.get("graph_people") or []),
            "private_graph_edges_loaded": len(local_graph.get("graph_edges") or []),
            "research_chain_verified": chain.get("graph_verified", False),
            "parent_lanes_active": chain.get("both_parent_lanes", False),
            "graph_derived_searches_available": chain.get("discriminating_searches", 0),
        },
        "tooling": {
            "web_search": True,
            "page_fetch": True,
            "local_ancestry_graph": True,
            "provider_routing": ["web", "familysearch", "wikitree", "ohio"],
            "parallel_search_workers": min(8, max(1, len(planned))),
            "deduplication": True,
            "evidence_reconciliation": bool(synthesis),
            "nine_step_chain": chain,
        },
        "guardrails": {
            "no_identity_invention": True,
            "candidate_is_not_parent_conclusion": True,
            "human_review_for_contact": True,
            "private_case_data_publication": False,
        },
        "cautions": plan.get("cautions", []),
    }
