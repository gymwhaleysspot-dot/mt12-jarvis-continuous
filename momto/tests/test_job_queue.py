from types import SimpleNamespace
from momto.job_queue import serialize

def test_research_job_serialization():
    row=SimpleNamespace(id=7,case_id=1,status="queued",attempts=0,payload_json='{"limit":2}',
        result_json="{}",error="",lease_token="secret",created_at=None,updated_at=None)
    data=serialize(row)
    assert data["id"]==7
    assert data["payload"]["limit"]==2
    assert data["lease_token"]=="secret"
