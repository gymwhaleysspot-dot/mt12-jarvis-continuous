from momto.db import Base, engine
from momto.service import init_case, add_search, live_activity, search_ai_plan

def reset():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    init_case()

def test_live_activity_and_search_ai_are_safe_aggregates():
    reset()
    add_search("official source", "Ohio adoption records", "reviewed", reference="public")
    activity=live_activity()
    assert activity["events"][0]["source"] == "official source"
    assert "generated_at" in activity
    plan=search_ai_plan()
    assert plan and all(x["requires_human_review"] is True for x in plan)
