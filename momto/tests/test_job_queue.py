from momto.job_queue import enqueue,claim,finish

def test_research_job_lifecycle(monkeypatch,tmp_path):
    monkeypatch.setenv("MOMTO_DATA_DIR",str(tmp_path))
    from momto.db import Base,engine
    from momto.service import init_case
    Base.metadata.create_all(engine)
    case=init_case()
    job=enqueue(case.id,{"limit":2})
    assert job["status"]=="queued"
    claimed=claim(case.id)
    assert claimed["status"]=="running"
    done=finish(claimed["id"],claimed["lease_token"],{"ok":True}) if "lease_token" in claimed else None
    assert done is not None
