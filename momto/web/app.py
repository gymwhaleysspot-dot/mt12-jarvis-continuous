from __future__ import annotations

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .live_api import router
from ..service import init_case

app=FastAPI(title="MomTo Private API", version="0.1.0")
origins=[x.strip() for x in os.environ.get("CORS_ORIGINS", "https://gymwhaleysspot-dot.github.io").split(",") if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=False,allow_methods=["GET","POST","OPTIONS"],allow_headers=["Authorization","Content-Type"])
app.include_router(router)

@app.on_event("startup")
def startup():
    init_case()

@app.get("/healthz")
def healthz():
    return {"ok":True,"service":"momto-private-api"}
