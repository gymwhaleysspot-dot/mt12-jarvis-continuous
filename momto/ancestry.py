from __future__ import annotations

from datetime import datetime
from pathlib import Path
import re

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
    subtag = ""
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
                subtag = ""
                if ident and tag == "INDI":
                    current = {"id": ident, "name": "", "birth": "", "death": "", "sex": "", "famc": "", "fams": []}
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
                elif level == 1 and tag == "FAMS":
                    current["fams"].append(_clean(value))
                elif level == 1 and tag in {"BIRT", "DEAT"}:
                    subtag = tag
                elif level == 2 and tag == "DATE" and subtag == "BIRT":
                    current["birth"] = _clean(value)
                elif level == 2 and tag == "DATE" and subtag == "DEAT":
                    current["death"] = _clean(value)
            elif current_type == "FAM":
                if level == 1 and tag in {"HUSB", "WIFE"}:
                    current[tag.lower()] = _clean(value)
                elif level == 1 and tag == "CHIL":
                    current["children"].append(_clean(value))
    return people, families


def import_gedcom(path: str | Path) -> dict:
    p = Path(path)
    if not p.exists() or p.suffix.lower() not in {".ged", ".gedcom"}:
        raise ValueError("Ancestry tree import must be a GEDCOM (.ged/.gedcom) file")
    people, families = _parse_gedcom(p)
    cid = _case_id()
    from .advanced import audit
    from .models import Evidence
    from .db import engine
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        db.query(AncestryPerson).filter_by(case_id=cid).delete()
        db.query(AncestryTree).filter_by(case_id=cid).delete()
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
            "observation_count": db.query(AncestryObservation).filter_by(case_id=cid).count(),
            "focus_person_present": bool(latest and latest.focus_person),
            "note": "Aggregate Ancestry tree metadata only; living-person details and tree contents remain local.",
        }


def autonomous_cycle(import_dir: str | None = None) -> dict:
    if import_dir:
        scan_import_dir(import_dir)
    return public_summary()
