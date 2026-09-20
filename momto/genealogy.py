from __future__ import annotations

from collections import OrderedDict
from datetime import date
import re

# MomTo's genealogy engine deliberately separates public-source discovery from
# the private case identity. Public workers may research source availability and
# record systems; person-specific queries are generated only from the local case.
SOURCE_CATALOG = (
    {"id":"fs-oh-probate","lane":"probate","title":"FamilySearch — Ohio Probate Records, 1789-1996","url":"https://www.familysearch.org/en/search/collection/1992421","record_types":["wills","estates","guardianships","heirs"],"weight":5},
    {"id":"fs-oh-marriages","lane":"marriage","title":"FamilySearch — Ohio County Marriages, 1789-2016","url":"https://www.familysearch.org/en/search/collection/1614804","record_types":["marriage","spouse","parents","residence"],"weight":5},
    {"id":"fs-oh-births","lane":"birth","title":"FamilySearch — Ohio Births and Christenings, 1821-1962","url":"https://www.familysearch.org/en/search/collection/1680845","record_types":["birth","baptism","parents"],"weight":5},
    {"id":"fs-oh-deaths","lane":"death","title":"FamilySearch — Ohio Deaths, 1908-1953","url":"https://www.familysearch.org/en/search/collection/1307272","record_types":["death","residence","spouse","parents","burial"],"weight":5},
    {"id":"fs-oh-collections","lane":"discovery","title":"FamilySearch — Ohio Historical Record Collections","url":"https://www.familysearch.org/en/search/collection/list?ec=region:United+States,placeId:43","record_types":["birth","marriage","death","church","court","directories","naturalization"],"weight":4},
    {"id":"fs-adoption-guide","lane":"adoption","title":"FamilySearch — Searching for Adoption Records","url":"https://www.familysearch.org/en/blog/searching-for-adoption-records","record_types":["adoption","agency","newspaper","church","orphanage"],"weight":4},
    {"id":"oh-memory-newspapers","lane":"newspaper","title":"Ohio Memory — Newspapers","url":"https://ohiomemory.ohiohistory.org/newspapers","record_types":["newspaper","obituary","birth","marriage","adoption"],"weight":5},
    {"id":"oh-death-index","lane":"death","title":"Ohio History Connection — Death Certificate Index","url":"https://resources.ohiohistory.org/death/","record_types":["death","burial","veteran"],"weight":5},
    {"id":"oh-research","lane":"repository","title":"Ohio History Connection — Research","url":"https://www.ohiohistory.org/research/","record_types":["archives","catalog","newspapers","collections"],"weight":4},
    {"id":"loc-ohio-genealogy","lane":"repository","title":"Library of Congress — Ohio Local History & Genealogy","url":"https://guides.loc.gov/ohio-local-history-genealogy","record_types":["repositories","newspapers","local-history"],"weight":4},
    {"id":"ohio-supreme-probate","lane":"court","title":"Supreme Court of Ohio — Probate Forms","url":"https://www.supremecourt.ohio.gov/forms/all-forms/probate/5","record_types":["adoption","probate","court"],"weight":5},
)

LANES = OrderedDict((
    ("identity","Establish the identity bridge: adopted name ↔ birth name, exact birth date/place, and all known aliases."),
    ("adoption","Reconstruct the adoption event: agency/attorney, county, finalization date, court, and record-access path."),
    ("birth-family","Build the birth-family tree outward from parents, siblings, grandparents, aunts/uncles, and residences."),
    ("vital","Cross-check birth, marriage, death, burial, and census-era records; prefer original images when available."),
    ("residence","Track household and residence changes through dated records rather than assuming continuity."),
    ("newspaper","Search births, adoption notices, marriage announcements, obituaries, legal notices, and community items."),
    ("probate","Use wills, estates, guardianships, heir lists, and court files to connect generations."),
    ("church","Use baptism, marriage, funeral, cemetery, and parish records where civil coverage is incomplete."),
    ("dna","Use only lawful user-supplied DNA matches; cluster matches and test hypotheses locally."),
    ("negative-search","Record meaningful negative searches so repeated dead ends are not mistaken for new evidence."),
))

def name_variants(name: str) -> list[str]:
    s = re.sub(r"[^A-Za-z' -]", " ", name or "").strip()
    if not s:
        return []
    parts = s.split()
    variants = [s, " ".join(reversed(parts))]
    if len(parts) >= 2:
        variants.append(f"{parts[-1]}, {' '.join(parts[:-1])}")
        variants.append("".join(parts))
    return list(dict.fromkeys(variants))

def _year_window(year: int | None, radius: int = 2) -> str:
    if not year:
        return ""
    return f"{year-radius}-{year+radius}"

def case_research_plan(case, facts: list[dict] | None = None, limit: int = 24) -> dict:
    """Build a genealogy research plan from private local case facts.

    This function returns person-specific queries for local use only. Callers
    publishing results must strip names, dates, locations, and match identities.
    """
    facts = facts or []
    names = name_variants(getattr(case, "birth_name", "")) + name_variants(getattr(case, "current_name", ""))
    birth_year = getattr(case, "birth_year", None)
    year = _year_window(birth_year)
    queries = []
    for lane, purpose in LANES.items():
        if lane == "identity":
            q = [f'"{n}" Ohio adoption' for n in names[:3]]
        elif lane == "adoption":
            q = [f'"{n}" adoption Ohio' for n in names[:2]]
        elif lane == "birth-family":
            q = [f'"{n}" Ohio parents siblings' for n in names[:2]]
        elif lane == "vital":
            q = [f'"{n}" Ohio birth marriage death {year}'.strip() for n in names[:2]]
        elif lane == "residence":
            q = [f'"{n}" Ohio residence directory {year}'.strip() for n in names[:2]]
        elif lane == "newspaper":
            q = [f'"{n}" Ohio obituary marriage birth adoption'.strip() for n in names[:2]]
        elif lane == "probate":
            q = [f'"{n}" Ohio probate heirs estate will'.strip() for n in names[:2]]
        elif lane == "church":
            q = [f'"{n}" Ohio baptism church funeral'.strip() for n in names[:2]]
        elif lane == "dna":
            q = ["Cluster user-supplied DNA matches by shared-match group; do not publish identities."]
        else:
            q = [f'Negative search: "{n}" Ohio {lane}' for n in names[:1]]
        queries.append({"lane":lane,"purpose":purpose,"queries":q})
    return {"engine":"momto-genealogy-v1","lanes":len(LANES),"queries":sum(len(x["queries"]) for x in queries),"plan":queries[:limit]}

def public_research_catalog() -> dict:
    return {
        "engine":"momto-genealogy-v1",
        "method":"source-first, evidence-led genealogy",
        "lanes":[{"id":k,"purpose":v} for k,v in LANES.items()],
        "sources":[{k:v for k,v in s.items() if k != "weight"} for s in SOURCE_CATALOG],
        "rules":[
            "Prefer original records/images over derivative indexes when available.",
            "Require two independent records before treating a new relationship as established when practical.",
            "Separate direct evidence from clues and user hypotheses.",
            "Track alternate spellings, married names, aliases, and date/place variants.",
            "Use negative searches as evidence of search coverage, not proof that a person or record never existed.",
            "Never publish private case identity, DNA matches, addresses, phone numbers, emails, photographs, or correspondence.",
        ],
    }

def source_priorities(lane: str) -> list[dict]:
    rows = [s for s in SOURCE_CATALOG if lane in (s["lane"], "discovery") or lane in s["record_types"]]
    return sorted(({k:v for k,v in s.items() if k != "weight"} for s in rows), key=lambda x: next(s["weight"] for s in SOURCE_CATALOG if s["id"] == x["id"]), reverse=True)

def summarize_public_research(results: list[dict]) -> dict:
    successful = [r for r in results if r.get("ok")]
    findings = [r for r in successful if r.get("findings")]
    return {
        "sources_checked": len(results),
        "sources_successful": len(successful),
        "sources_with_findings": len(findings),
        "finding_count": sum(len(r.get("findings") or []) for r in findings),
        "coverage_lanes": sorted({r.get("lane") for r in successful if r.get("lane")}),
    }
