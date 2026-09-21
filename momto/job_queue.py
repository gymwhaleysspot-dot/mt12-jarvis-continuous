from __future__ import annotations

import json
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base, SessionLocal

class ResearchJob(Base):
    __tablename__="momto_research_jobs"
    id: Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id: Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    status: Mapped[str]=mapped_column(String(20),default="queued",nullable=False)
    attempts: Mapped[int]=mapped_column(Integer,default=0,nullable=False)
    payload_json: Mapped[str]=mapped_column(Text,default="{}",nullable=False)
    result_json: Mapped[str]=mapped_column(Text,default="{}",nullable=False)
    error: Mapped[str]=mapped_column(Text,default="",nullable=False)
    lease_token: Mapped[str]=mapped_column(String(80),default="",nullable=False)
    leased_at: Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime,default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: Mapped[datetime]=mapped_column(DateTime,default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

def _json(value): return json.dumps(value or {},ensure_ascii=False,sort_keys=True)

def enqueue(case_id:int,payload:dict|None=None)->dict:
    with SessionLocal() as db:
        row=ResearchJob(case_id=case_id,payload_json=_json(payload))
        db.add(row); db.commit(); db.refresh(row)
        return serialize(row)

def claim(case_id:int,lease_seconds:int=900)->dict|None:
    now=datetime.now(timezone.utc).replace(tzinfo=None)
    stale=now-timedelta(seconds=lease_seconds)
    with SessionLocal() as db:
        row=(db.query(ResearchJob).filter(
            ResearchJob.case_id==case_id,
            ((ResearchJob.status=="queued") | ((ResearchJob.status=="running") & (ResearchJob.leased_at < stale)))
        ).order_by(ResearchJob.id).first())
        if row is None: return None
        row.status="running"; row.attempts+=1; row.lease_token=secrets.token_urlsafe(32); row.leased_at=now
        db.commit(); db.refresh(row)
        return serialize(row)

def finish(job_id:int,lease_token:str,result:dict)->dict:
    with SessionLocal() as db:
        row=db.query(ResearchJob).filter_by(id=job_id).first()
        if row is None or not secrets.compare_digest(row.lease_token or "",lease_token):
            raise ValueError("Invalid research-job lease")
        row.status="completed"; row.result_json=_json(result); row.error=""; row.updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit(); db.refresh(row); return serialize(row)

def fail(job_id:int,lease_token:str,error:str,retry:bool=True)->dict:
    with SessionLocal() as db:
        row=db.query(ResearchJob).filter_by(id=job_id).first()
        if row is None or not secrets.compare_digest(row.lease_token or "",lease_token):
            raise ValueError("Invalid research-job lease")
        row.error=error[:4000]; row.status="queued" if retry and row.attempts < 3 else "failed"; row.updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit(); db.refresh(row); return serialize(row)

def serialize(row:ResearchJob)->dict:
    return {"id":row.id,"case_id":row.case_id,"status":row.status,"attempts":row.attempts,
            "payload":json.loads(row.payload_json or "{}"),"result":json.loads(row.result_json or "{}"),
            "error":row.error,"created_at":row.created_at.isoformat() if row.created_at else None,
            "updated_at":row.updated_at.isoformat() if row.updated_at else None}
