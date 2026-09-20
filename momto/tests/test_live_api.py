from fastapi import FastAPI
from momto.web.live_api import momto_live,router
def test_live_api_returns_safe_aggregate_state():
 app=FastAPI(); app.include_router(router); response=momto_live()
 assert response["case"]=={"status":"active"}
 assert set(response["objectives"])=={"birth_mother","birth_father"}
 assert len(response["ohio"]["roadmap"])==8
 assert response["ohio"]["roadmap_progress"]["total"]==8
 assert response["ohio"]["roadmap_progress"]["complete"]==0
 assert response["ohio"]["roadmap_progress"]["percent_complete"]==0
 assert sum(response["ohio"]["roadmap_progress"]["by_status"].values())==8
 assert response["ohio"]["roadmap_progress"]["activated"] >= 0
 assert set(response["ohio"]["roadmap_progress"]["by_status"]).issubset({"not-started","ready","researched","awaiting-user-data","ready-for-human-review","complete"})
 assert len(response["dna"])==4
 assert set(response["counts"])=={"leads","contacts","searches","evidence","hypotheses","open_tasks"}
 assert isinstance(response["activity"],list)
 assert "search_ai" in response
 assert "birth_name" not in response
