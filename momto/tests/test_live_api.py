from fastapi import FastAPI
from momto.web.live_api import momto_live,router
def test_live_api_returns_safe_aggregate_state():
 app=FastAPI(); app.include_router(router); response=momto_live()
 assert response["case"]=={"status":"active"}
 assert set(response["objectives"])=={"birth_mother","birth_father"}
 assert len(response["ohio"]["roadmap"])==8
 assert len(response["dna"])==4
 assert set(response["counts"])=={"leads","contacts","searches","evidence","hypotheses","open_tasks"}
 assert isinstance(response["activity"],list)
 assert "search_ai" in response
 assert "birth_name" not in response
