from __future__ import annotations

from datetime import datetime
from pathlib import Path
import re
import tempfile
import zipfile

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base, SessionLocal


class AncestryPerson(Base):
    __tablename__ = "momto_ancestry_people"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"), nullable=False)
    external_id: Mapped[str] = mapped_column(String(80), nullable=False)
    name: Mapped[str] = mapped_column(String(240), default="")
    birth_date: Mapped[str] = mapped_column(String(80), default="")
    death_date: Mapped[str] = mapped_column(String(80), default="")
    sex: Mapped[str] = mapped_column(String(20), default="")
    family_id: Mapped[str] = mapped_column(String(80), default="")
    spouse_family_id: Mapped[str] = mapped_column(String(240), default="")
    living: Mapped[bool] = mapped_column(default=False)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AncestryRelationship(Base):
    __tablename__ = "momto_ancestry_relationships"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"), nullable=False)
    person_id: Mapped[str] = mapped_column(String(80), nullable=False)
    related_person_id: Mapped[str] = mapped_column(String(80), nullable=False)
    relationship: Mapped[str] = mapped_column(String(40), nullable=False)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AncestryTree(Base):
    __tablename__ = "momto_ancestry_trees"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"), nullable=False)
    source_file: Mapped[str] = mapped_column(String(255), default="")
    person_count: Mapped[int] = mapped_column(Integer, default=0)
    family_count: Mapped[int] = mapped_column(Integer, default=0)
    focus_person: Mapped[str] = mapped_column(String(240), default="")
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AncestryObservation(Base):
    __tablename__ = "momto_ancestry_observations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"), nullable=False)
    observation_key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, default="")
    source: Mapped[str] = mapped_column(String(200), default="Ancestry")
    certainty: Mapped[str] = mapped_column(String(30), default="observed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


def _case_id() -> int:
    from .service import init_case
    return init_case().id


def _clean(v: str | None) -> str:
    return re.sub(r"\s+", " ", (v or "").strip())


def _parse_gedcom(path: Path) -> tuple[list[dict], list[dict]]:
    people, families = [], []
    current = None
    current_type = None
    event = None
    famc_context = None
    with path.open("r", encoding="utf-8-sig", errors="replace") as fh:
        for raw in fh:
            line = raw.rstrip("\r\n")
            m = re.match(r"^(\d+)\s+(?:(@[^@]+@)\s+)?(.+)$", line)
            if not m:
                continue
            level, ident, payload = int(m.group(1)), m.group(2), m.group(3)
            parts = payload.split(" ", 1)
            tag, value = parts[0], parts[1] if len(parts) > 1 else ""
            if level == 0:
                current = None
                event = None
                famc_context = None
                if ident and tag == "INDI":
                    current = {"id": ident, "name": "", "birth": "", "death": "", "sex": "", "famc": "", "famc_pedi": "", "famc_pedi_by_family": {}, "fams": []}
                    people.append(current); current_type = "INDI"
                elif ident and tag == "FAM":
                    current = {"id": ident, "husb": "", "wife": "", "children": []}
                    families.append(current); current_type = "FAM"
                continue
            if current is None:
                continue
            if current_type == "INDI":
                if level == 1 and tag == "NAME":
                    current["name"] = _clean(value.replace("/", ""))
                elif level == 1 and tag == "SEX":
                    current["sex"] = _clean(value)
                elif level == 1 and tag == "FAMC":
                    current["famc"] = _clean(value)
                    famc_context = current["famc"]
                elif level == 2 and tag == "PEDI" and famc_context:
                    pedigree = _clean(value).lower()
                    current["famc_pedi"] = pedigree
                    current["famc_pedi_by_family"][famc_context] = pedigree
                elif level == 1 and tag == "FAMS":
                    current["fams"].append(_clean(value))
                elif level == 1:
                    event = tag if tag in {"BIRT", "DEAT"} else None
                elif level == 2 and tag == "DATE" and event == "BIRT":
                    current["birth"] = _clean(value)
                elif level == 2 and tag == "DATE" and event == "DEAT":
                    current["death"] = _clean(value)
            elif current_type == "FAM":
                if level == 1 and tag in {"HUSB", "WIFE"}:
                    current[tag.lower()] = _clean(value)
                elif level == 1 and tag == "CHIL":
                    current["children"].append(_clean(value))
    return people, families


def _resolve_input(path: str | Path):
    p = Path(path)
    if not p.exists() or p.suffix.lower() not in {".ged", ".gedcom", ".zip"}:
        raise ValueError("Ancestry tree import must be a GEDCOM or ZIP containing a GEDCOM")
    if p.suffix.lower() != ".zip":
        return p, None
    tmp = tempfile.TemporaryDirectory()
    with zipfile.ZipFile(p) as z:
        names = [n for n in z.namelist() if Path(n).suffix.lower() in {".ged", ".gedcom"} and not n.endswith("/")]
        if len(names) != 1:
            tmp.cleanup()
            raise ValueError("Ancestry ZIP must contain exactly one GEDCOM file")
        target = Path(tmp.name) / Path(names[0]).name
        target.write_bytes(z.read(names[0]))
    return target, tmp


def import_gedcom(path: str | Path) -> dict:
    p, temp = _resolve_input(path)
    try:
        people, families = _parse_gedcom(p)
    finally:
        if temp is not None:
            temp.cleanup()
    cid = _case_id()
    from .advanced import audit
    from .models import Evidence
    from .db import engine
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        db.query(AncestryPerson).filter_by(case_id=cid).delete()
        db.query(AncestryTree).filter_by(case_id=cid).delete()
        db.query(AncestryRelationship).filter_by(case_id=cid).delete()
        for person in people:
            db.add(AncestryPerson(
                case_id=cid, external_id=person["id"], name=person["name"],
                birth_date=person["birth"], death_date=person["death"], sex=person["sex"],
                family_id=person["famc"], spouse_family_id=",".join(person["fams"]),
                living=not bool(person["death"]),
            ))
        focus = [p for p in people if "michael" in p["name"].lower() and ("braggs" in p["name"].lower() or "whaley" in p["name"].lower())]
        focus_name = focus[0]["name"] if focus else ""
        db.add(AncestryTree(case_id=cid, source_file=p.name, person_count=len(people), family_count=len(families), focus_person=focus_name))
        ids = {person["id"] for person in people}
        for family in families:
            parents = [x for x in (family.get("husb"), family.get("wife")) if x]
            for child in family.get("children", []):
                child_row = next((x for x in people if x["id"] == child), None)
                pedigree = (child_row or {}).get("famc_pedi_by_family", {}).get(family["id"], "").lower()
                relationship = "adoptive_parent" if pedigree == "adopted" else "parent"
                for parent in parents:
                    if parent in ids and child in ids:
                        db.add(AncestryRelationship(case_id=cid, person_id=child, related_person_id=parent, relationship=relationship))
            if len(parents) == 2:
                db.add(AncestryRelationship(case_id=cid, person_id=parents[0], related_person_id=parents[1], relationship="spouse"))
                db.add(AncestryRelationship(case_id=cid, person_id=parents[1], related_person_id=parents[0], relationship="spouse"))
        db.add(Evidence(
            case_id=cid, title="Ancestry family-tree import", evidence_type="genealogy-tree",
            source="Ancestry GEDCOM",
            summary=f"Imported {len(people)} people and {len(families)} family records from a user-supplied Ancestry GEDCOM.",
            supports="Provides a local relationship graph and candidate-search starting points.",
            reference=p.name,
        ))
        audit(db, cid, "import", "ancestry_tree", p.name, f"people={len(people)} families={len(families)} focus={focus_name}")
        db.commit()
    return {"source": "Ancestry", "people": len(people), "families": len(families), "focus_person": focus_name}


def record_observation(observation_key: str, value: str, source: str = "Ancestry screenshot", certainty: str = "observed") -> dict:
    cid = _case_id()
    from .advanced import audit
    from .db import engine
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        existing = db.query(AncestryObservation).filter_by(case_id=cid, observation_key=observation_key, value=value).first()
        if existing:
            return {"id": existing.id, "created": False}
        row = AncestryObservation(case_id=cid, observation_key=observation_key, value=value, source=source, certainty=certainty)
        db.add(row); db.flush()
        audit(db, cid, "observe", "ancestry_observation", row.id, observation_key)
        db.commit()
        return {"id": row.id, "created": True}


def import_observation_bundle(path: str | Path) -> dict:
    import json
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    rows = data.get("observations") or []
    results = [record_observation(
        str(row["key"]), str(row["value"]),
        str(row.get("source", "Ancestry screenshot")),
        str(row.get("certainty", "observed")),
    ) for row in rows if "key" in row and "value" in row]
    return {"source": "Ancestry observation bundle", "observations": len(results), "created": sum(1 for x in results if x.get("created"))}


def scan_import_dir(directory: str | Path) -> list[dict]:
    root = Path(directory)
    if not root.exists():
        return []
    return [import_gedcom(p) for p in sorted(root.rglob("*")) if p.is_file() and p.suffix.lower() in {".ged", ".gedcom"}]


def public_summary() -> dict:
    cid = _case_id()
    from .db import engine
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        trees = db.query(AncestryTree).filter_by(case_id=cid).order_by(AncestryTree.imported_at.desc()).all()
        latest = trees[0] if trees else None
        return {
            "provider": "Ancestry",
            "status": "imported" if latest else "ready-for-import",
            "tree_count": len(trees),
            "person_count": latest.person_count if latest else 0,
            "family_count": latest.family_count if latest else 0,
            "relationship_count": db.query(AncestryRelationship).filter_by(case_id=cid).count(),
            "observation_count": db.query(AncestryObservation).filter_by(case_id=cid).count(),
            "focus_person_present": bool(latest and latest.focus_person),
            "note": "Aggregate Ancestry tree metadata only; living-person details and tree contents remain local.",
        }


def autonomous_cycle(import_dir: str | None = None) -> dict:
    if import_dir:
        scan_import_dir(import_dir)
    return public_summary()
