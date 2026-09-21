import os
from fastapi.testclient import TestClient
from momto.web.app import app


def test_healthz_is_public():
    response=TestClient(app).get("/healthz")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_private_status_requires_token(monkeypatch):
    monkeypatch.setenv("MOMTO_API_TOKEN", "test-token")
    response=TestClient(app).get("/api/momto/private/status")
    assert response.status_code == 401


def test_private_status_accepts_token(monkeypatch):
    monkeypatch.setenv("MOMTO_API_TOKEN", "test-token")
    response=TestClient(app).get("/api/momto/private/status",headers={"Authorization":"Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["private"] is True
