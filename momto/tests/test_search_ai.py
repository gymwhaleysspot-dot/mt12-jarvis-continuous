from momto.db import Base, engine
from momto.service import init_case, add_search
from momto.search_ai import learn, generate_plan, cycle

def reset():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    init_case()

def test_search_ai_learns_and_generates_safe_plan():
    reset()
    add_search("Ohio official source", "adoption file", usefulness="useful", reference="public")
    learned = learn()
    assert learned["searches"] == 1
    assert learned["top_sources"][0][0] == "Ohio official source"
    result = cycle()
    assert result["engine"] == "momto-search-ai-v1"
    assert result["guardrails"]["human_review"] is True
    assert result["guardrails"]["no_identity_invention"] is True
    assert generate_plan()
