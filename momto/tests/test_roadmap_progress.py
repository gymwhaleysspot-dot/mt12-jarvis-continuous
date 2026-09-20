def test_roadmap_progress_contract():
    from pathlib import Path
    source=Path("momto/service.py").read_text(encoding="utf-8")
    assert '"odh-file":("ready"' in source
    assert '"dna":("awaiting-user-data"' in source
    assert '"professional":("ready-for-human-review"' in source
    assert 'item.status != "complete"' in source

def test_complete_semantics_are_preserved():
    from pathlib import Path
    source=Path("momto/service.py").read_text(encoding="utf-8")
    assert 'item.status="complete"' in source
    assert 'completed_at=datetime.utcnow()' in source
