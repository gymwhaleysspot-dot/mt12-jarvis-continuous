from __future__ import annotations

import base64
import binascii
import os
import tempfile
import urllib.request
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from ..service import case_summary,workspace_report,ranked_next_actions,live_activity,search_ai_cycle,enhancement_summary,enhancement_wave,init_case
from ..ancestry import import_gedcom, _resolve_input, _parse_gedcom, AncestryRelationship
from ..db import SessionLocal
from ..case_vault import CaseVault, VaultError
router=APIRouter()

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
def ancestry_import(payload: dict, request: Request):
 # MomTo runs this endpoint inside the private workspace. The browser never
 # collects or transmits a GitHub credential; CaseVault keeps the upload private.
 filename=str(payload.get("filename") or "ancestry-upload.zip")
 if Path(filename).suffix.lower() not in {".zip",".ged",".gedcom"}:
  raise HTTPException(status_code=400,detail="Only .zip, .ged, or .gedcom files are accepted.")
 encoded=str(payload.get("content_b64") or "")
 if not encoded:
  raise HTTPException(status_code=400,detail="No file content was supplied.")
 try:
  raw=base64.b64decode(encoded,validate=True)
 except (ValueError,binascii.Error) as exc:
  raise HTTPException(status_code=400,detail="Invalid base64 file content.") from exc
 if len(raw)>25*1024*1024:
  raise HTTPException(status_code=413,detail="Family-tree upload exceeds the 25 MB limit.")
 suffix=Path(filename).suffix.lower()
 with tempfile.TemporaryDirectory(prefix="momto-ancestry-") as td:
  src=Path(td)/Path(filename).name
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
         "relationships":_ancestry_relationship_count(),
         "encrypted":bool(vault_record.get("encrypted")),"private":True,
         "note":"Original upload is encrypted in CaseVault; parsed family-tree contents are local/private and excluded from public snapshots."}
