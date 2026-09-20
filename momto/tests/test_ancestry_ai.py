from momto.research_tools import GenealogySearchTools

def test_parallel_search_deduplicates_and_keeps_lanes(monkeypatch):
    tool = GenealogySearchTools(1)
    def fake_search(query, provider="web", limit=8):
        return [
            {"title": "same", "url": "https://Example.com/a/", "snippet": "x", "provider": provider},
            {"title": query, "url": f"https://example.com/{provider}/{query.replace(' ', '-')}", "snippet": "y", "provider": provider},
        ]
    monkeypatch.setattr(tool, "search", fake_search)
    rows = tool.parallel_search([
        {"lane": "birth-mother", "provider": "web", "query": "mother one", "purpose": "test"},
        {"lane": "birth-father", "provider": "ohio", "query": "father one", "purpose": "test"},
    ], per_query=2, workers=2)
    assert len(rows) == 2
    assert {r["lane"] for r in rows} == {"birth-mother", "birth-father"}
    assert all(r["hits"] for r in rows)
    assert all(h["url"].startswith("https://") for r in rows for h in r["hits"])

def test_parallel_search_ignores_unusable_items():
    tool = GenealogySearchTools(1)
    rows = tool.parallel_search([
        {"lane": "unknown", "provider": "web", "query": "bad"},
        {"lane": "birth-mother", "provider": "web", "query": ""},
    ])
    assert rows == []


def test_open_genealogy_toolkits_are_registered():
    from momto.genealogy import OPEN_GENEALOGY_TOOLKITS, public_research_catalog
    ids = {x["id"] for x in OPEN_GENEALOGY_TOOLKITS}
    assert {"familysearch-gedcom", "gramps-web", "gramps-web-api", "webtrees", "gedcom-navigator", "genea-web", "gramps-mcp", "genealogy-mcp", "open-genealogy", "ancestry-mcp", "gedcommcp", "gedcom-mcp"} <= ids
    catalog = public_research_catalog()
    assert len(catalog["open_source_toolkits"]) >= 12
