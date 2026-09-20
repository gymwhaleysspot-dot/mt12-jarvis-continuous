from __future__ import annotations
import csv, hashlib, json, re
from pathlib import Path
from datetime import datetime
from .db import Base, SessionLocal
from .models import Case, DnaStatus, Evidence, Hypothesis
from .advanced import DnaCluster, audit

PROVIDERS=("AncestryDNA","23andMe","GEDmatch","FamilyTreeDNA")
ALIASES={p:p for p in PROVIDERS}
ALIASES.update({"ancestry":"AncestryDNA","ancestrydna":"AncestryDNA","23andme":"23andMe","gedmatch":"GEDmatch","familytreedna":"FamilyTreeDNA","ftdna":"FamilyTreeDNA"})

class DnaMatch(Base):
    __tablename__="momto_dna_matches"
    id=__import__("sqlalchemy").Column(__import__("sqlalchemy").Integer,primary_key=True)
    case_id=__import__("sqlalchemy").Column(__import__("sqlalchemy").Integer,__import__("sqlalchemy").ForeignKey("cases.id"),nullable=False)
    provider=__import__("sqlalchemy").Column(__import__("sqlalchemy").String(80),nullable=False)
    match_key=__import__("sqlalchemy").Column(__import__("sqlalchemy").String(64),nullable=False)
    shared_cm=__import__("sqlalchemy").Column(__import__("sqlalchemy").Float,nullable=True)
    segment_count=__import__("sqlalchemy").Column(__import__("sqlalchemy").Integer,nullable=True)
    relationship=__import__("sqlalchemy").Column(__import__("sqlalchemy").String(120),default="")
    side=__import__("sqlalchemy").Column(__import__("sqlalchemy").String(40),default="")
    source_file=__import__("sqlalchemy").Column(__import__("sqlalchemy").String(255),default="")
    imported_at=__import__("sqlalchemy").Column(__import__("sqlalchemy").DateTime,default=datetime.utcnow)

def _case_id():
    from .service import init_case
    return init_case().id

def _num(v):
    if v is None: return None
    m=re.search(r"-?\d+(?:\.\d+)?",str(v).replace(",",""))
    return float(m.group(0)) if m else None

def _provider(path: Path, provider: str|None):
    if provider: return ALIASES.get(provider.lower(),provider)
    s=path.name.lower()
    for key,name in ALIASES.items():
        if key in s: return name
    return ""

def _pick(row,*names):
    norm={re.sub(r"[^a-z0-9]","",str(k).lower()):v for k,v in row.items()}
    for n in names:
        v=norm.get(re.sub(r"[^a-z0-9]","",n.lower()))
        if v not in (None,""): return v
    return None

def _match_key(row, index):
    raw=_pick(row,"match_id","match id","profile_id","profile id","kit","kit id","username","display name","name")
    return hashlib.sha256((str(raw) if raw else f"row-{index}").encode()).hexdigest()[:24]

def _read(path):
    with path.open("r",encoding="utf-8-sig",errors="replace",newline="") as f:
        sample=f.read(4096); f.seek(0)
        dialect=csv.Sniffer().sniff(sample,delimiters=",\t;") if sample else csv.excel
        return list(csv.DictReader(f,dialect=dialect))

def import_matches(path, provider=None):
    p=Path(path)
    if not p.exists() or p.suffix.lower() not in {".csv",".tsv"}: raise ValueError("DNA match import must be a CSV/TSV file")
    name=_provider(p,provider)
    if name not in PROVIDERS: raise ValueError("Unknown DNA provider")
    rows=_read(p); cid=_case_id(); imported=0
    Base.metadata.create_all(__import__("momto.db",fromlist=["engine"]).engine)
    with SessionLocal() as db:
        for i,row in enumerate(rows,1):
            key=_match_key(row,i)
            exists=db.query(DnaMatch).filter_by(case_id=cid,provider=name,match_key=key).first()
            if exists: continue
            db.add(DnaMatch(case_id=cid,provider=name,match_key=key,
                shared_cm=_num(_pick(row,"shared_cm","shared cM","shared dna","shared percent","total shared cm")),
                segment_count=int(_num(_pick(row,"segments","segment count","shared segments")) or 0) or None,
                relationship=str(_pick(row,"relationship","predicted relationship","relationship range") or ""),
                side=str(_pick(row,"side","maternal/paternal","parental side") or ""),
                source_file=p.name))
            imported+=1
        status=db.query(DnaStatus).filter_by(provider=name).first()
        if status:
            status.status="imported" if imported or rows else "ready-for-import"
            status.notes=f"Local match import scanned {len(rows)} rows; {imported} new aggregate match records."
        audit(db,cid,"import","dna_matches",name,f"rows={len(rows)} new={imported}")
        db.commit()
    return {"provider":name,"rows":len(rows),"imported":imported}

def scan_import_dir(directory):
    root=Path(directory)
    if not root.exists(): return []
    out=[]
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.suffix.lower() in {".csv",".tsv"}:
            try: out.append(import_matches(p))
            except ValueError: continue
    return out

def summary():
    cid=_case_id()
    Base.metadata.create_all(__import__("momto.db",fromlist=["engine"]).engine)
    with SessionLocal() as db:
        rows=db.query(DnaMatch).filter_by(case_id=cid).all()
        providers={p:{"provider":p,"status":"ready-for-import","match_count":0,"signal_count":0} for p in PROVIDERS}
        for s in db.query(DnaStatus).all():
            if s.provider in providers: providers[s.provider]["status"]=s.status
        for r in rows:
            providers[r.provider]["match_count"]+=1
            providers[r.provider]["signal_count"]+=1
        strong=[r for r in rows if (r.shared_cm or 0)>=20]
        return {"providers":list(providers.values()),"match_count":len(rows),"signal_count":len(rows),
                "strong_signal_count":len(strong),"clusters":db.query(DnaCluster).filter_by(case_id=cid).count(),
                "import_ready":any(x["status"]=="ready-for-import" for x in providers.values())}

def build_clusters():
    cid=_case_id(); Base.metadata.create_all(__import__("momto.db",fromlist=["engine"]).engine)
    with SessionLocal() as db:
        rows=db.query(DnaMatch).filter_by(case_id=cid).all()
        for provider in PROVIDERS:
            matches=[r for r in rows if r.provider==provider]
            if not matches: continue
            name=f"{provider} imported match cluster"
            c=db.query(DnaCluster).filter_by(case_id=cid,cluster_name=name).first()
            if c is None: c=DnaCluster(case_id=cid,cluster_name=name,provider=provider); db.add(c)
            c.match_count=len(matches); c.confidence="observed"; c.shared_ancestor_hypothesis="Imported match evidence; common ancestor not established."
        db.commit()
    return summary()

def autonomous_cycle(import_dir=None):
    if import_dir: scan_import_dir(import_dir)
    return build_clusters()

def public_summary():
    s=summary()
    return {"providers":[{"provider":x["provider"],"status":x["status"],"match_count":x["match_count"],"signal_count":x["signal_count"]} for x in s["providers"]],
            "match_count":s["match_count"],"signal_count":s["signal_count"],"strong_signal_count":s["strong_signal_count"],
            "clusters":s["clusters"],"note":"Aggregate DNA signals only; match identities and private DNA data remain local."}
