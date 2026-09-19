from __future__ import annotations
from dataclasses import asdict, dataclass

CATEGORIES = (
    "discovery", "evidence", "timeline", "relationships", "dna",
    "sources", "coverage", "tasks", "recovery", "observability",
)

# 10 capability families x 10 capability tracks x 50 concrete actions = 5,000.
# The catalog is a backlog of implementable work, not a claim that every item is
# already implemented. Private records remain local and human review stays required.
CAPABILITY_TRACKS = {
    "discovery": (
        "official-records", "public-indexes", "newspaper-research", "obituary-research",
        "directory-research", "adoption-history", "geographic-narrowing",
        "date-range-narrowing", "source-cross-checking", "search-query-learning",
    ),
    "evidence": (
        "record-capture", "source-citation", "fact-normalization", "provenance",
        "evidence-linking", "support-analysis", "contradiction-analysis",
        "confidence-tracking", "duplicate-detection", "evidence-review",
    ),
    "timeline": (
        "birth-era", "adoption-era", "residence-era", "employment-era", "family-era",
        "document-dates", "event-ordering", "date-conflicts", "gap-detection", "timeline-review",
    ),
    "relationships": (
        "family-graph", "parent-hypotheses", "sibling-hypotheses", "relative-links",
        "household-links", "geographic-links", "record-links", "evidence-links",
        "candidate-links", "graph-review",
    ),
    "dna": (
        "provider-status", "match-import", "relationship-estimates", "shared-matches",
        "cluster-building", "segment-notes", "tree-hypotheses", "triangulation",
        "dna-conflicts", "dna-review",
    ),
    "sources": (
        "source-inventory", "authority-check", "date-check", "provenance-check",
        "reliability-rating", "independent-confirmation", "source-conflicts",
        "source-decay", "citation-completeness", "source-review",
    ),
    "coverage": (
        "roadmap-status", "search-area-gaps", "jurisdiction-gaps", "source-gaps",
        "time-period-gaps", "relationship-gaps", "evidence-gaps", "dna-gaps",
        "document-gaps", "coverage-review",
    ),
    "tasks": (
        "next-action", "priority", "dependency", "due-date", "task-deduplication",
        "task-evidence", "task-completion", "blocked-task", "review-task", "task-audit",
    ),
    "recovery": (
        "database-integrity", "backup", "hash-verification", "manifest",
        "restore-check", "schema-check", "migration-check", "audit-recovery",
        "failure-diagnostics", "recovery-review",
    ),
    "observability": (
        "heartbeat", "live-activity", "search-metrics", "coverage-metrics",
        "evidence-metrics", "task-metrics", "dna-metrics", "source-metrics",
        "worker-health", "dashboard-contracts",
    ),
}

ACTION_PATTERNS = (
    "record the current state and preserve the source reference",
    "compare the result with existing local evidence and flag differences",
    "create a deterministic next-action candidate from the verified gap",
    "validate the result against an independent lawful source",
    "attach a provenance note and confidence state",
    "detect duplicates before adding a new record",
    "surface unresolved contradictions for human review",
    "measure completion without exposing private record contents",
    "retain an audit event for the state transition",
    "verify the operation can be repeated without corrupting prior work",
)

@dataclass(frozen=True)
class Enhancement:
    id: str
    category: str
    capability: str
    title: str
    action: str
    validation: str
    priority: str
    dependency: str
    status: str = "planned"
    public_safe: bool = True
    human_review: bool = True

def catalog() -> list[dict]:
    items = []
    number = 0
    for category in CATEGORIES:
        for capability in CAPABILITY_TRACKS[category]:
            for offset in range(50):
                number += 1
                action = ACTION_PATTERNS[offset % len(ACTION_PATTERNS)]
                validation = (
                    "unit test + deterministic fixture"
                    if offset % 3 == 0
                    else "local-state validation + privacy contract"
                    if offset % 3 == 1
                    else "audit assertion + regression test"
                )
                priority = ("high", "normal", "low")[offset % 3]
                dependency = ("none", "existing-local-state", "review-gate")[offset % 3]
                title = f"{capability.replace('-', ' ').title()} improvement {offset + 1:02d}"
                items.append(asdict(Enhancement(
                    id=f"MOMTO-{number:05d}",
                    category=category,
                    capability=capability,
                    title=title,
                    action=action,
                    validation=validation,
                    priority=priority,
                    dependency=dependency,
                )))
    return items

def summary() -> dict:
    items = catalog()
    by_category = {c: sum(x["category"] == c for x in items) for c in CATEGORIES}
    return {
        "program": "MomTo 5000 Enhancement Program",
        "total": len(items),
        "planned": sum(x["status"] == "planned" for x in items),
        "active": sum(x["status"] == "active" for x in items),
        "complete": sum(x["status"] == "complete" for x in items),
        "public_safe": all(x["public_safe"] for x in items),
        "human_review": all(x["human_review"] for x in items),
        "categories": by_category,
        "current_wave": "wave-01",
        "next": "Implement the highest-value local, evidence-backed enhancements while preserving privacy and human review.",
    }

def wave(limit: int = 25) -> list[dict]:
    return catalog()[:max(1, min(limit, 5000))]
