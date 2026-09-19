from fastapi import FastAPI
from momto.web.live_api import momto_live, router
def test_live_api_returns_case_and_objectives():
 app=FastAPI(); app.include_router(router); response=momto_live()
 assert response["case"]=={"status":"active"}
 assert set(response["objectives"])=={"birth_mother","birth_father"}
 assert len(response["ohio"]["roadmap"])==8
 assert len(response["dna"])==4
 assert response["leads"]["count"]==0
