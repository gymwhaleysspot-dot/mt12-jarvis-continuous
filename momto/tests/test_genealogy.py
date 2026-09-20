from types import SimpleNamespace

from momto.genealogy import (
    LANES, SOURCE_CATALOG, case_research_plan,
    name_variants, public_research_catalog, source_priorities,
)

def test_genealogy_catalog_has_real_record_lanes():
    assert len(LANES) >= 10
    assert len(SOURCE_CATALOG) >= 10
    assert any(s["id"] == "fs-oh-probate" for s in SOURCE_CATALOG)
    assert any(s["id"] == "oh-memory-newspapers" for s in SOURCE_CATALOG)

def test_name_variants_and_case_plan_are_case_specific():
    case = SimpleNamespace(current_name="Michael Whaley", birth_name="Michael Braggs", birth_year=1980)
    assert "Michael Braggs" in name_variants(case.birth_name)
    plan = case_research_plan(case)
    assert plan["engine"] == "momto-genealogy-v1"
    assert plan["lanes"] == len(LANES)
    assert plan["queries"] > 0
    assert any("Michael Braggs" in q for lane in plan["plan"] for q in lane["queries"] if isinstance(q, str))

def test_public_catalog_never_contains_case_identity():
    catalog = public_research_catalog()
    blob = str(catalog)
    assert "Michael Braggs" not in blob
    assert "Michael Whaley" not in blob
    assert source_priorities("probate")
