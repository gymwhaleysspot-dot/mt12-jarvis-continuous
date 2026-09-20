from __future__ import annotations

import html
import re
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed


@dataclass
class SearchHit:
    title: str
    url: str
    snippet: str = ""
    provider: str = "web"


class _SearchParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_result = False
        self.in_link = False
        self.in_snippet = False
        self.current = {}
        self.items = []
        self.buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class", "")
        if tag == "a" and ("result__a" in cls):
            self.in_link = True
            self.current = {"url": a.get("href", ""), "title": ""}
            self.buf = []
        elif tag in {"a", "div"} and ("result__snippet" in cls or "result-snippet" in cls):
            self.in_snippet = True
            self.buf = []

    def handle_endtag(self, tag):
        if tag == "a" and self.in_link:
            self.current["title"] = " ".join(self.buf).strip()
            self.items.append(self.current)
            self.in_link = False
        elif tag == "div" and self.in_snippet:
            self.current["snippet"] = " ".join(self.buf).strip()
            self.in_snippet = False

    def handle_data(self, data):
        if self.in_link or self.in_snippet:
            s = re.sub(r"\s+", " ", data).strip()
            if s:
                self.buf.append(s)


def _fetch(url: str, timeout: int = 20, limit: int = 500_000) -> tuple[int, str, str]:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "MomTo-Genealogy-Research/1.0 (+evidence-led research)"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        raw = response.read(limit)
        return response.status, response.headers.get("Content-Type", ""), raw.decode("utf-8", "ignore")


class WebSearchTool:
    name = "web.search"

    def search(self, query: str, domains: list[str] | None = None, limit: int = 8) -> list[SearchHit]:
        q = query
        if domains:
            q += " " + " ".join(f"site:{d}" for d in domains)
        url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": q})
        try:
            status, _, raw = _fetch(url, timeout=20, limit=400_000)
            if not 200 <= status < 400:
                return []
            parser = _SearchParser()
            parser.feed(raw)
            hits = []
            for item in parser.items:
                href = html.unescape(item.get("url", ""))
                if not href or href.startswith("/"):
                    continue
                if href.startswith("//"):
                    href = "https:" + href
                hits.append(SearchHit(
                    title=html.unescape(item.get("title", ""))[:300],
                    url=href,
                    snippet=html.unescape(item.get("snippet", ""))[:700],
                ))
                if len(hits) >= limit:
                    break
            return hits
        except Exception:
            return []


class PageFetchTool:
    name = "web.fetch"

    def fetch(self, url: str, limit: int = 350_000) -> dict:
        try:
            status, content_type, raw = _fetch(url, limit=limit)
            text = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", raw, flags=re.I | re.S)
            text = re.sub(r"<[^>]+>", " ", text)
            text = html.unescape(re.sub(r"\s+", " ", text)).strip()
            return {"ok": 200 <= status < 400, "status": status, "content_type": content_type, "text": text[:120_000]}
        except Exception as exc:
            return {"ok": False, "error": type(exc).__name__, "text": ""}


SOURCE_PROFILES = {
    "web": {"domains": None, "weight": 1.0},
    "familysearch": {"domains": ["familysearch.org"], "weight": 1.25},
    "wikitree": {"domains": ["wikitree.com"], "weight": 1.10},
    "ohio": {"domains": ["ohiohistory.org", "ohiomemory.org", "codes.ohio.gov", "supremecourt.ohio.gov"], "weight": 1.35},
    "webtrees": {"domains": ["webtrees.net"], "weight": 1.05},
    "gramps": {"domains": ["gramps-project.org"], "weight": 1.05},
    "gedcom-navigator": {"domains": ["github.com"], "weight": 0.95},
    "genea-web": {"domains": ["github.com"], "weight": 0.95},
}

def _canonical_url(url: str) -> str:
    try:
        p = urllib.parse.urlsplit(url)
        host = (p.hostname or "").lower()
        path = re.sub(r"/+$", "", p.path or "/")
        return urllib.parse.urlunsplit(("https", host, path, "", ""))
    except Exception:
        return url.strip()

def _dedupe_hits(hits: list[dict], limit: int) -> list[dict]:
    seen = set()
    out = []
    for hit in hits:
        key = _canonical_url(hit.get("url", ""))
        if not key or key in seen:
            continue
        seen.add(key)
        hit["url"] = key
        out.append(hit)
        if len(out) >= limit:
            break
    return out


class GenealogySearchTools:
    """MCP-style, provider-neutral tools that MomTo can call from its research loop.

    The interface intentionally mirrors genealogy-mcp's lookup/search/walk/lateral
    concepts while keeping MomTo's private Ancestry graph in its own database.
    """

    name = "genealogy"

    def __init__(self, case_id: int):
        self.case_id = case_id
        self.web = WebSearchTool()
        self.fetcher = PageFetchTool()

    def search(self, query: str, provider: str = "web", limit: int = 8) -> list[dict]:
        profile = SOURCE_PROFILES.get(provider, SOURCE_PROFILES["web"])
        hits = [h.__dict__ for h in self.web.search(query, domains=profile["domains"], limit=limit)]
        for hit in hits:
            hit["provider"] = provider
        return _dedupe_hits(hits, limit)

    def parallel_search(self, planned: list[dict], per_query: int = 6, workers: int = 6) -> list[dict]:
        """Run independent provider searches concurrently, then deduplicate deterministically."""
        jobs = []
        for item in planned:
            q = str(item.get("query") or "").strip()
            lane = item.get("lane")
            if not q or lane not in {"birth-mother", "birth-father"}:
                continue
            provider = item.get("provider", "web")
            jobs.append((lane, provider, q, item.get("purpose", "")))
        results = []
        with ThreadPoolExecutor(max_workers=max(1, min(workers, len(jobs) or 1))) as pool:
            futures = {
                pool.submit(self.search, q, provider, per_query): (lane, provider, q, purpose)
                for lane, provider, q, purpose in jobs
            }
            for future in as_completed(futures):
                lane, provider, q, purpose = futures[future]
                try:
                    hits = future.result()
                except Exception:
                    hits = []
                for hit in hits:
                    hit["lane"] = lane
                    hit["query_purpose"] = purpose
                results.append({
                    "lane": lane,
                    "provider": provider,
                    "query": q,
                    "purpose": purpose,
                    "hits": hits,
                })
        return sorted(results, key=lambda x: (x["lane"], x["provider"], x["query"]))


    def fetch(self, url: str) -> dict:
        return self.fetcher.fetch(url)

    def lookup_local_graph(self) -> dict:
        from .ancestry import AncestryPerson, AncestryRelationship
        from .db import SessionLocal
        with SessionLocal() as db:
            people = db.query(AncestryPerson).filter_by(case_id=self.case_id).all()
            rels = db.query(AncestryRelationship).filter_by(case_id=self.case_id).all()
            by_id = {p.external_id: p for p in people}
            focus = next((p for p in people if "michael" in p.name.lower() and ("braggs" in p.name.lower() or "whaley" in p.name.lower())), None)
            if not focus:
                return {"focus": None, "parents": [], "related_count": len(people)}
            parent_ids = [r.related_person_id for r in rels if r.person_id == focus.external_id and r.relationship == "parent"]
            parents = []
            for pid in parent_ids:
                p = by_id.get(pid)
                if p:
                    parents.append({"name": p.name, "birth_date": p.birth_date, "death_date": p.death_date, "sex": p.sex})
            return {"focus": {"name": focus.name, "birth_date": focus.birth_date}, "parents": parents, "related_count": len(people)}


    def graph_search_plan(self, target: str = "both", limit: int = 24) -> list[dict]:
        """Build graph-oriented searches inspired by mature genealogy tooling.

        Native MomTo capabilities: fuzzy-name variants, FAN relationships,
        relationship-path checks, and duplicate/contradiction review.
        """
        graph = self.lookup_local_graph()
        focus = graph.get("focus") or {}
        name = focus.get("name", "")
        birth = focus.get("birth_date", "")
        lanes = ["birth-mother", "birth-father"] if target == "both" else [target]
        out = []
        for lane in lanes:
            role = "mother" if lane == "birth-mother" else "father"
            out.extend([
                {"lane": lane, "kind": "fuzzy-name", "query": f'"{name}" {role} Ohio', "purpose": "Fuzzy/variant-name identity discovery."},
                {"lane": lane, "kind": "fan-network", "query": f'"{name}" siblings aunts uncles Ohio', "purpose": "Lateral FAN-network discovery around the birth family."},
                {"lane": lane, "kind": "timeline", "query": f'"{name}" {birth} Ohio records' if birth else f'"{name}" Ohio records', "purpose": "Date/place consistency check."},
                {"lane": lane, "kind": "relationship-path", "query": f'"{name}" {role} grandparents Ohio', "purpose": "Relationship-path and collateral-family discovery."},
                {"lane": lane, "kind": "negative-check", "query": f'"{name}" {role} Ohio obituary marriage death', "purpose": "Negative-search coverage and contradiction checks."},
            ])
        return out[:limit]

    def build_searches(self, target: str = "both", limit: int = 20) -> list[dict]:
        graph = self.lookup_local_graph()
        focus = graph.get("focus") or {}
        name = focus.get("name", "")
        birth = focus.get("birth_date", "")
        targets = ["birth-mother", "birth-father"] if target == "both" else [target]
        searches = []
        for lane in targets:
            role = "mother" if lane == "birth-mother" else "father"
            base = [
                f'"{name}" adoption Ohio {role}',
                f'"{name}" birth mother Ohio' if role == "mother" else f'"{name}" birth father Ohio',
                f'"{name}" {birth} Ohio adoption' if birth else f'"{name}" Ohio adoption records',
                f'"{name}" Ohio parents siblings',
            ]
            for q in base:
                searches.append({"lane": lane, "query": q, "purpose": f"Find public evidence relevant to {role} identity."})
        return searches[:limit]


TOOLS = {
    "web.search": WebSearchTool(),
}


def available_tools() -> list[str]:
    return [
        "web.search", "web.fetch", "genealogy.search",
        "genealogy.lookup_local_graph", "genealogy.build_searches",
        "genealogy.graph_search_plan",
        "genealogy.fuzzy_name_variants", "genealogy.relationship_paths",
        "genealogy.duplicate_review", "genealogy.timeline_review",
    ]
