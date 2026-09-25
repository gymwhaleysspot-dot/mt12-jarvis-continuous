from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
import re

from .ancestry import AncestryPerson, AncestryRelationship
from .db import SessionLocal


@dataclass(frozen=True)
class ParentLane:
    lane: str
    role: str
    known_parent_count: int
    collateral_count: int
    search_terms: tuple[str, ...]


def _norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def build_parent_search_context(case_id: int) -> dict:
    """Build a deterministic, private graph-derived search context.

    This never decides that a person is a biological parent. It turns the
    imported tree into discriminating search anchors and preserves the two
    birth-parent lanes separately.
    """
    with SessionLocal() as db:
        people = db.query(AncestryPerson).filter_by(case_id=case_id).all()
        rels = db.query(AncestryRelationship).filter_by(case_id=case_id).all()

    by_id = {p.external_id: p for p in people}
    focus = next(
        (
            p for p in people
            if "michael" in _norm(p.name)
            and ("braggs" in _norm(p.name) or "whaley" in _norm(p.name))
        ),
        None,
    )
    if focus is None:
        focus = next((p for p in people if "michael" in _norm(p.name)), None)

    if focus is None:
        # The public/always-on worker may not have the user's private GEDCOM.
        # Never fall back to an empty-name query. Seed the two research lanes
        # from the persistent case identity, while clearly marking that the
        # Ancestry graph itself is not loaded.
        from .models import Case
        with SessionLocal() as db:
            case = db.query(Case).filter_by(id=case_id).first()
        if case is None:
            return {
                "loaded": bool(people),
                "focus_found": False,
                "people": len(people),
                "relationships": len(rels),
                "lanes": [],
                "graph_verified": False,
                "reason": "No case identity is available.",
            }
        focus_name = case.birth_name or case.current_name or "Michael Whaley"
        focus_birth = str(case.birth_year or "")
        lanes = []
        for lane, role in (("birth-mother", "mother"), ("birth-father", "father")):
            lanes.append(
                ParentLane(
                    lane=lane,
                    role=role,
                    known_parent_count=0,
                    collateral_count=0,
                    search_terms=tuple(x for x in (focus_name, focus_birth) if x),
                )
            )
        return {
            "loaded": False,
            "focus_found": True,
            "focus": {
                "id": "case-identity",
                "name": focus_name,
                "birth_date": focus_birth,
                "death_date": "",
            },
            "people": len(people),
            "relationships": len(rels),
            "known_parent_count": 0,
            "collateral_count": 0,
            "lanes": [
                {
                    "lane": x.lane,
                    "role": x.role,
                    "known_parent_count": x.known_parent_count,
                    "collateral_count": x.collateral_count,
                    "search_terms": list(x.search_terms),
                }
                for x in lanes
            ],
            "graph_verified": False,
            "guardrail": "Case identity is a search seed only; imported-tree relationships are research anchors, not biological-parent conclusions.",
            "reason": "Private Ancestry graph is not loaded; using persistent case identity as fallback search seed.",
        }

    parent_edges = [
        r for r in rels
        if r.person_id == focus.external_id and r.relationship == "parent"
    ]
    known_parents = [by_id[r.related_person_id] for r in parent_edges if r.related_person_id in by_id]

    adjacency: dict[str, list[str]] = defaultdict(list)
    for r in rels:
        adjacency[r.person_id].append(r.related_person_id)
        adjacency[r.related_person_id].append(r.person_id)

    # Two-hop collateral network: names are used as private search anchors,
    # never published in the public snapshot.
    seen = {focus.external_id}
    frontier = [focus.external_id]
    for _ in range(2):
        nxt = []
        for pid in frontier:
            for rid in adjacency.get(pid, []):
                if rid in by_id and rid not in seen:
                    seen.add(rid)
                    nxt.append(rid)
        frontier = nxt

    collateral = [by_id[x] for x in seen if x in by_id and x != focus.external_id]
    anchors = []
    for p in collateral:
        if p.name:
            anchors.append(p.name)
        if p.birth_date:
            anchors.append(p.birth_date)
    anchors = tuple(dict.fromkeys(anchors))[:32]

    # Resolve imported parent relationships before creating research lanes.
    # A parent already present in the private tree is displayed as known and is
    # never sent back through the "find parent" search lane.
    def _sex(p: AncestryPerson) -> str:
        return _norm(getattr(p, "sex", ""))[:1]

    known_father = next((p for p in known_parents if _sex(p) == "m"), None)
    known_mother = next((p for p in known_parents if _sex(p) == "f"), None)

    lanes = []
    unresolved = []
    for lane, role, known in (
        ("birth-mother", "mother", known_mother),
        ("birth-father", "father", known_father),
    ):
        if known is not None:
            continue
        terms = [focus.name]
        if focus.birth_date:
            terms.append(focus.birth_date)
        terms.extend(p.name for p in known_parents if p.name)
        terms.extend(anchors[:12])
        lanes.append(
            ParentLane(
                lane=lane,
                role=role,
                known_parent_count=len(known_parents),
                collateral_count=len(collateral),
                search_terms=tuple(dict.fromkeys(terms)),
            )
        )
        unresolved.append(role)

    return {
        "loaded": True,
        "focus_found": True,
        "focus": {
            "id": focus.external_id,
            "name": focus.name,
            "birth_date": focus.birth_date,
            "death_date": focus.death_date,
        },
        "people": len(people),
        "relationships": len(rels),
        "known_parent_count": len(known_parents),
        "known_parents": [
            {
                "id": p.external_id,
                "name": p.name,
                "sex": getattr(p, "sex", ""),
                "birth_date": p.birth_date,
                "death_date": p.death_date,
            }
            for p in known_parents
        ],
        "known_father": (
            {"id": known_father.external_id, "name": known_father.name}
            if known_father else None
        ),
        "known_mother": (
            {"id": known_mother.external_id, "name": known_mother.name}
            if known_mother else None
        ),
        "unresolved_parent_roles": unresolved,
        "collateral_count": len(collateral),
        "lanes": [
            {
                "lane": x.lane,
                "role": x.role,
                "known_parent_count": x.known_parent_count,
                "collateral_count": x.collateral_count,
                "search_terms": list(x.search_terms),
            }
            for x in lanes
        ],
        "graph_verified": True,
        "guardrail": "Imported-tree relationships are research anchors, not biological-parent conclusions.",
    }


def build_discriminating_searches(context: dict, limit: int = 24) -> list[dict]:
    searches = []
    # Relationship-aware lineage search expansion is applied below.
    for lane in context.get("lanes", []):
        role = lane["role"]
        terms = lane.get("search_terms") or []
        focus = terms[0] if terms else ""
        variants = [
            (f'"{focus}" "{role}" Ohio', "identity-and-role"),
            (f'"{focus}" {role} adoption Ohio', "adoption-record context"),
            (f'"{focus}" siblings grandparents Ohio', "FAN collateral network"),
            (f'"{focus}" obituary marriage death Ohio', "timeline/negative check"),
        ]
        # Expand unresolved-parent searches through every known parent and
        # nearby family anchor. This is especially important when the unknown
        # mother's name is absent from indexed records for the adoptee.
        known_parents = context.get("known_parents") or []
        for parent in known_parents[:4]:
            pname = parent.get("name") or ""
            if pname:
                variants.extend([
                    (f'"{focus}" "{pname}" {role}', "known-parent relationship anchor"),
                    (f'"{pname}" spouse children family Ohio', "known-parent household"),
                    (f'"{pname}" marriage obituary children Ohio', "known-parent life-event record"),
                ])
        for anchor in terms[1:9]:
            variants.extend([
                (f'"{anchor}" "{focus}" {role} Ohio', "collateral-anchor cross-check"),
                (f'"{anchor}" "{focus}" children family Ohio', "parent-child collateral check"),
            ])
        for anchor in terms[1:5]:
            variants.append(
                (f'"{anchor}" "{focus}" {role} Ohio', "collateral-anchor cross-check")
            )
        for query, purpose in variants:
            searches.append({
                "lane": lane["lane"],
                "query": query,
                "purpose": purpose,
                "provider": "web",
                "graph_derived": True,
            })
    return searches[:limit]


def verify_research_chain(case_id: int) -> dict:
    context = build_parent_search_context(case_id)
    return {
        "import_loaded": context.get("loaded", False),
        "focus_found": context.get("focus_found", False),
        "graph_verified": context.get("graph_verified", False),
        "people": context.get("people", 0),
        "relationships": context.get("relationships", 0),
        "unresolved_parent_lanes": len(context.get("lanes", [])),
        "discriminating_searches": len(build_discriminating_searches(context)),
        "candidate_rule": "No candidate becomes a parent conclusion without independent corroboration.",
    }
