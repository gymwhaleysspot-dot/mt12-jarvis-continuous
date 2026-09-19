from __future__ import annotations
import json, shutil
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any
VAULT_DIR=Path("momto-vault"); DOCS_DIR=VAULT_DIR/"documents"; MANIFEST=VAULT_DIR/"manifest.json"
FORBIDDEN_PARTS={".git",".github","node_modules","momto-vault"}; PRIVATE_SUFFIXES={".sqlite",".sqlite3",".db"}
def _utc(): return datetime.now(timezone.utc).isoformat()
def _manifest():
    if not MANIFEST.exists(): return {"schema":"momto-private-vault-v1","created_at":_utc(),"documents":[]}
    try: return json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (OSError,ValueError): raise RuntimeError("Private vault manifest is unreadable; refusing to continue.")
def _safe_source(path):
    p=path.resolve()
    if any(x in FORBIDDEN_PARTS for x in p.parts): raise ValueError("Vault source is inside a protected repository/runtime directory.")
    if p.suffix.lower() in PRIVATE_SUFFIXES: raise ValueError("Database files cannot be ingested as case documents.")
def init_vault():
    DOCS_DIR.mkdir(parents=True,exist_ok=True)
    if not MANIFEST.exists(): MANIFEST.write_text(json.dumps(_manifest(),indent=2,sort_keys=True)+"\n",encoding="utf-8")
    return {"vault":str(VAULT_DIR),"documents":len(_manifest()["documents"]),"private":True}
def ingest(source,label=""):
    src=Path(source).expanduser()
    if not src.exists() or not src.is_file(): raise FileNotFoundError(str(src))
    _safe_source(src); init_vault(); data=src.read_bytes(); digest=sha256(data).hexdigest(); m=_manifest()
    for row in m["documents"]:
        if row["sha256"]==digest: return {"status":"duplicate",**row,"private":True}
    suffix=src.suffix.lower() or ".bin"; dst=DOCS_DIR/f"{digest}{suffix}"; shutil.copy2(src,dst)
    chars=len(data.decode("utf-8",errors="replace")) if suffix in {".txt",".md",".csv",".json",".html",".htm"} else 0
    row={"id":len(m["documents"])+1,"filename":src.name,"label":label or src.stem,"sha256":digest,"size_bytes":len(data),"text_chars":chars,"vault_path":str(dst),"ingested_at":_utc()}
    m["documents"].append(row); MANIFEST.write_text(json.dumps(m,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    return {"status":"ingested",**row,"private":True}
def list_documents(): return _manifest()["documents"]
def validate():
    m=_manifest(); missing=[x["vault_path"] for x in m["documents"] if not Path(x["vault_path"]).exists()]
    return {"schema":m.get("schema"),"private":True,"document_count":len(m["documents"]),"missing_files":missing,"integrity_ok":not missing}
