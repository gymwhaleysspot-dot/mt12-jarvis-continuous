from __future__ import annotations

import base64
import binascii
import os
import secrets
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request

from ..service import (
    case_summary, workspace_report, ranked_next_actions, live_activity,
    search_ai_cycle, enhancement_summary, enhancement_wave, init_case,
)
from ..ancestry import import_gedcom, _resolve_input, _parse_gedcom, AncestryPerson, AncestryRelationship
from ..db import SessionLocal
from ..case_vault import CaseVault, VaultError
from ..parent_search import verify_research_chain, build_parent_search_context
from ..job_queue import enqueue, claim, finish, fail

router=APIRouter()
MAX_UPLOAD_BYTES=25*1024*1024


def _require_private_auth(request: Request) -> None:
    expected=os.environ.get("MOMTO_API_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="Private API token is not configured.")
    supplied=request.headers.get("Authorization", "")
    if not supplied.startswith("Bearer ") or not secrets.compare_digest(supplied[7:], expected):
        raise HTTPException(status_code=401, detail="Authentication required.")


@router.get("/api/momto/live")
def momto_live():
    s=case_summary()
    return {"case":{"status":s["status"]},"objectives":{k:{"status":v} for k,v in s["objectives"]},
      "ohio":{"state":"Ohio","roadmap":s["roadmap"],"roadmap_progress":s["roadmap_progress"],"official_sources":["https://codes.ohio.gov/ohio-revised-code/section-3107.38","https://codes.ohio.gov/ohio-revised-code/section-3107.66","https://codes.ohio.gov/ohio-revised-code/section-3705.12"]},
      "dna":s["dna"],"dna_signals":s["dna_signals"],"counts":{"leads":s["lead_count"],"contacts":s["contact_count"],"searches":s["search_count"],"evidence":s["evidence_count"],"hypotheses":s["hypothesis_count"],"open_tasks":s["open_task_count"]},
      "advanced":{**s["advanced"],"workspace":workspace_report()["coverage"]},"next_actions":ranked_next_actions(),"activity":live_activity(25),"search_ai":search_ai_cycle(20),"enhancements":enhancement_summary(),"enhancement_wave":enhancement_wave(25)}


def _ancestry_relationship_count() -> int:
    with SessionLocal() as db:
        return db.query(AncestryRelationship).filter_by(case_id=init_case().id).count()


@router.post("/api/momto/ancestry/import")
async def ancestry_import(request: Request):
    _require_private_auth(request)
    content_type=(request.headers.get("content-type") or "").lower()
    filename="ancestry-upload.zip"
    raw=b""
    if content_type.startswith("multipart/form-data"):
        form=await request.form()
        upload=form.get("file")
        if upload is None or not hasattr(upload, "read"):
            raise HTTPException(status_code=400, detail="Multipart field 'file' is required.")
        filename=Path(str(getattr(upload, "filename", "") or filename)).name
        raw=await upload.read()
    else:
        try:
            payload=await request.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Expected multipart file upload or JSON content_b64 payload.") from exc
        filename=str(payload.get("filename") or filename)
        encoded=str(payload.get("content_b64") or "")
        if not encoded:
            raise HTTPException(status_code=400, detail="No file content was supplied.")
        try:
            raw=base64.b64decode(encoded,validate=True)
        except (ValueError,binascii.Error) as exc:
            raise HTTPException(status_code=400,detail="Invalid base64 file content.") from exc
    if Path(filename).suffix.lower() not in {".zip",".ged",".gedcom"}:
        raise HTTPException(status_code=400,detail="Only .zip, .ged, or .gedcom files are accepted.")
    if not raw:
        raise HTTPException(status_code=400,detail="Uploaded file is empty.")
    if len(raw)>MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413,detail="Family-tree upload exceeds the 25 MB limit.")
    with tempfile.TemporaryDirectory(prefix="momto-ancestry-") as td:
        src=Path(td)/filename
        src.write_bytes(raw)
        try:
            vault=CaseVault()
            parsed, temp=_resolve_input(src)
            try:
                _parse_gedcom(parsed)
            finally:
                if temp is not None: temp.cleanup()
            vault_record=vault.ingest_document(src)
            imported=import_gedcom(src)
        except (VaultError,ValueError,OSError) as exc:
            raise HTTPException(status_code=400,detail=str(exc)) from exc
    return {"ok":True,"source":"Ancestry","filename":filename,"people":imported["people"],"families":imported["families"],
            "relationships":_ancestry_relationship_count(),"encrypted":bool(vault_record.get("encrypted")),"private":True,
            "research_chain":verify_research_chain(init_case().id),
            "note":"Original upload is encrypted in CaseVault; parsed family-tree contents are private and excluded from public snapshots."}


@router.get("/api/momto/private/graph")
def private_graph(request: Request):
    _require_private_auth(request)
    cid=init_case().id
    with SessionLocal() as db:
        people=db.query(AncestryPerson).filter_by(case_id=cid).all()
        rels=db.query(AncestryRelationship).filter_by(case_id=cid).all()
    context=build_parent_search_context(cid)
    return {
        "case_id":cid,
        "people":[{"id":p.external_id,"name":p.name,"birth_date":p.birth_date,"death_date":p.death_date,"sex":p.sex,"living":p.living} for p in people],
        "relationships":[{"person_id":r.person_id,"related_person_id":r.related_person_id,"relationship":r.relationship} for r in rels],
        "parent_context":context,
        "private":True,
    }


@router.get("/api/momto/private/status")
def private_status(request: Request):
    _require_private_auth(request)
    chain=verify_research_chain(init_case().id)
    return {"private":True,"ancestry_loaded":bool(chain.get("people")),"people":chain.get("people",0),"relationships":chain.get("relationships",0),"research_chain":chain}


@router.post("/api/momto/private/research/enqueue")
def research_enqueue(request: Request):
    _require_private_auth(request)
    cid=init_case().id
    return {"ok":True,"job":enqueue(cid,{"source":"private-api","requested_at":"now"})}

@router.post("/api/momto/private/research/run")
def research_run(request: Request):
    _require_private_auth(request)
    cid=init_case().id
    job=claim(cid)
    if job is None:
        return {"ok":True,"status":"idle","message":"No queued research job."}
    try:
        from ..research_agent import run as research_agent_run
        result=research_agent_run(int(job["payload"].get("limit",12)))
        chain=verify_research_chain(cid)
        result={"research":result,"private_research_chain":chain}
        return {"ok":True,"status":"running","job":finish(job["id"],job["lease_token"],result)}
    except Exception as exc:
        failed=fail(job["id"],job["lease_token"],f"{type(exc).__name__}: {exc}",retry=True)
        raise HTTPException(status_code=500,detail={"message":"Research cycle failed","job":failed}) from exc

@router.get("/api/momto/private/research/status")
def research_status(request: Request):
    _require_private_auth(request)
    cid=init_case().id
    from ..db import SessionLocal
    from ..job_queue import ResearchJob, serialize
    with SessionLocal() as db:
        rows=db.query(ResearchJob).filter_by(case_id=cid).order_by(ResearchJob.id.desc()).limit(20).all()
        return {"private":True,"jobs":[serialize(row) for row in rows]}
