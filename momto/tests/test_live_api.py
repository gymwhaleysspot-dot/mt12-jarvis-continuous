from fastapi import FastAPI
from momto.web.live_api import router

def test_live_api_returns_case_and_objectives():
    app = FastAPI()
    app.include_router(router)
    routes = {route.path: route for route in app.routes}
    response = routes["/api/momto/live"].endpoint()
    assert response["case"] == {"current_name": "Michael Whaley", "birth_name": "Michael Braggs", "birth_year": 1980}
    assert set(response["objectives"]) == {"birth_mother", "birth_father"}
    assert response["matches"] == []
