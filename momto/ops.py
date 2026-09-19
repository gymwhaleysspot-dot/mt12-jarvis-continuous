from __future__ import annotations
from datetime import datetime, timezone
from hashlib import sha256
import json
import shutil
import sqlite3
from pathlib import Path

from .db import DATA_DIR, engine, SessionLocal
from .models import Case, Evidence, Hypothesis, Task, SearchEvent
from .advanced import (
    AuditEvent, Candidate, CandidateFactor, CoverageItem, DnaCluster,
    GraphEdge, GraphNode, SourceReliability, TimelineEvent, DocumentRecord,
    COVERAGE_AREAS, detect_contradictions,
)

def _case_id() -> int:
    from .service import init_case
    return init_case().id

def workspace_report() -> dict:
    case_id = _case_id()
    with SessionLocal() as db:
        coverage = db.query(CoverageItem).filter_by(case_id=case_id).all()
        reviewed = sum(x.status != "unreviewed" for x in coverage)
        contradictions = detect_contradictions()
        return {
            "coverage": {"reviewed": reviewed, "total": len(COVERAGE_AREAS), "percent": round(reviewed * 100 / len(COVERAGE_AREAS)) if COVERAGE_AREAS else 0},
            "evidence": db.query(Evidence).filter_by(case_id=case_id).count(),
            "hypotheses": db.query(Hypothesis).filter_by(case_id=case_id).count(),
            "open_tasks": db.query(Task).filter_by(case_id=case_id, status="open").count(),
            "searches": db.query(SearchEvent).filter_by(case_id=case_id).count(),
            "graph": {
                "nodes": db.query(GraphNode).filter_by(case_id=case_id).count(),
                "edges": db.query(GraphEdge).filter_by(case_id=case_id).count(),
            },
            "dna_clusters": db.query(DnaCluster).filter_by(case_id=case_id).count(),
            "candidates": db.query(Candidate).filter_by(case_id=case_id).count(),
            "candidate_factors": db.query(CandidateFactor).join(Candidate, Candidate.id == CandidateFactor.candidate_id).filter(Candidate.case_id == case_id).count(),
            "timeline_events": db.query(TimelineEvent).filter_by(case_id=case_id).count(),
            "source_reviews": db.query(SourceReliability).filter_by(case_id=case_id).count(),
            "documents": db.query(DocumentRecord).filter_by(case_id=case_id).count(),
            "contradictions": len(contradictions),
            "audit_events": db.query(AuditEvent).filter_by(case_id=case_id).count(),
        }

def ranked_next_actions(limit: int = 8) -> list[dict]:
    case_id = _case_id()
    report = workspace_report()
    actions: list[dict] = []
    with SessionLocal() as db:
        gaps = [x.area for x in db.query(CoverageItem).filter_by(case_id=case_id, status="unreviewed").order_by(CoverageItem.id).all()]
        if report["contradictions"]:
            actions.append({"priority": "high", "action": "Review recorded contradictions and attach source evidence."})
        if gaps:
            actions.append({"priority": "high", "action": "Review the next uncovered search area: " + gaps[0] + "."})
        if report["evidence"] and report["hypotheses"] == 0:
            actions.append({"priority": "high", "action": "Convert documented evidence into a testable hypothesis."})
        if report["hypotheses"] and report["graph"]["edges"] == 0:
            actions.append({"priority": "normal", "action": "Link documented evidence or entities in the relationship graph."})
        if report["dna_clusters"] == 0:
            actions.append({"priority": "normal", "action": "Record lawful DNA cluster observations locally when available."})
        if report["candidates"] == 0 and report["evidence"]:
            actions.append({"priority": "normal", "action": "Create a candidate record only when supported by documented evidence."})
        if report["timeline_events"] == 0:
            actions.append({"priority": "normal", "action": "Start a dated timeline from verified records."})
        if report["source_reviews"] == 0 and report["evidence"]:
            actions.append({"priority": "normal", "action": "Review reliability of the sources already recorded."})
        if report["open_tasks"] == 0:
            actions.append({"priority": "normal", "action": "Create one concrete next-action task from the strongest documented gap."})
    return actions[:max(1, limit)]

def validate_local_state() -> dict:
    db_path = Path(engine.url.database or DATA_DIR / "momto.sqlite3")
    if not db_path.exists():
        return {"ok": False, "database": str(db_path), "error": "database does not exist"}
    with sqlite3.connect(db_path) as conn:
        integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    required = {"cases", "objectives", "roadmap_items", "momto_audit_events", "momto_documents"}
    missing = sorted(required - tables)
    return {"ok": integrity == "ok" and not missing, "integrity": integrity, "missing_tables": missing, "database": str(db_path)}

def backup_local(destination: str | None = None) -> dict:
    state = validate_local_state()
    if not state["ok"]:
        raise RuntimeError("Local MomTo database failed validation: " + json.dumps(state, sort_keys=True))
    source = Path(state["database"])
    if destination:
        target = Path(destination).expanduser()
    else:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        target = DATA_DIR / f"momto-backup-{stamp}.sqlite3"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    digest = sha256(target.read_bytes()).hexdigest()
    return {"path": str(target), "sha256": digest, "bytes": target.stat().st_size, "validated": True}

def recovery_manifest() -> dict:
    state = validate_local_state()
    report = workspace_report() if state["ok"] else {}
    return {
        "format": "momto-recovery-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "database": state,
        "workspace": report,
        "policy": "Local recovery metadata only; private adoption records and documents are never copied into public artifacts.",
    }

def audit_tail(limit: int = 20) -> list[dict]:
    case_id = _case_id()
    with SessionLocal() as db:
        rows = db.query(AuditEvent).filter_by(case_id=case_id).order_by(AuditEvent.id.desc()).limit(max(1, limit)).all()
        return [{"id": x.id, "action": x.action, "object_type": x.object_type, "object_id": x.object_id, "created_at": x.created_at.isoformat()} for x in rows]
def live_activity(limit: int = 25) -> list[dict]:
    """Return a privacy-safe recent activity feed for the public/live UI."""
    case_id = _case_id()
    with SessionLocal() as db:
        rows = (
            db.query(SearchEvent)
            .filter_by(case_id=case_id)
            .order_by(SearchEvent.searched_at.desc(), SearchEvent.id.desc())
            .limit(max(1, limit))
            .all()
        )
        return [
            {
                "kind": "search",
                "at": x.searched_at.isoformat() if x.searched_at else None,
                "source": x.source or "local",
                "query": x.query or "",
                "usefulness": x.usefulness or "unknown",
                "next_action": x.next_action or "",
            }
            for x in rows
        ]
