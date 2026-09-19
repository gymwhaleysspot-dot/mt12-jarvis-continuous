from __future__ import annotations
from datetime import datetime
from hashlib import sha256
from pathlib import Path
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base, SessionLocal
from .models import Case, Evidence, Task, DocumentFact

class GraphNode(Base):
    __tablename__="momto_graph_nodes"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    node_type:Mapped[str]=mapped_column(String(40),nullable=False)
    label:Mapped[str]=mapped_column(String(200),nullable=False)
    status:Mapped[str]=mapped_column(String(30),default="active",nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class GraphEdge(Base):
    __tablename__="momto_graph_edges"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    from_node_id:Mapped[int]=mapped_column(ForeignKey("momto_graph_nodes.id"),nullable=False)
    to_node_id:Mapped[int]=mapped_column(ForeignKey("momto_graph_nodes.id"),nullable=False)
    relation:Mapped[str]=mapped_column(String(80),nullable=False)
    source:Mapped[str]=mapped_column(String(200),default="")
    confidence:Mapped[str]=mapped_column(String(30),default="unrated")
    evidence_ref:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class DnaCluster(Base):
    __tablename__="momto_dna_clusters"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    cluster_name:Mapped[str]=mapped_column(String(200),nullable=False)
    provider:Mapped[str]=mapped_column(String(80),default="")
    match_count:Mapped[int]=mapped_column(Integer,default=0,nullable=False)
    shared_ancestor_hypothesis:Mapped[str]=mapped_column(Text,default="")
    confidence:Mapped[str]=mapped_column(String(30),default="unrated")
    notes:Mapped[str]=mapped_column(Text,default="")

class Candidate(Base):
    __tablename__="momto_candidates"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    role:Mapped[str]=mapped_column(String(30),nullable=False)
    label:Mapped[str]=mapped_column(String(200),nullable=False)
    status:Mapped[str]=mapped_column(String(30),default="open",nullable=False)
    notes:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class CandidateFactor(Base):
    __tablename__="momto_candidate_factors"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    candidate_id:Mapped[int]=mapped_column(ForeignKey("momto_candidates.id"),nullable=False)
    factor:Mapped[str]=mapped_column(String(100),nullable=False)
    value:Mapped[str]=mapped_column(Text,default="")
    evidence_ref:Mapped[str]=mapped_column(Text,default="")

class TimelineEvent(Base):
    __tablename__="momto_timeline_events"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    event_date:Mapped[str]=mapped_column(String(40),nullable=False)
    title:Mapped[str]=mapped_column(String(200),nullable=False)
    source:Mapped[str]=mapped_column(String(200),default="")
    certainty:Mapped[str]=mapped_column(String(30),default="unknown")
    notes:Mapped[str]=mapped_column(Text,default="")

class SourceReliability(Base):
    __tablename__="momto_source_reliability"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    source:Mapped[str]=mapped_column(String(200),nullable=False)
    reliability:Mapped[float]=mapped_column(Float,default=0.5)
    rationale:Mapped[str]=mapped_column(Text,default="")
    reviewed_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class CoverageItem(Base):
    __tablename__="momto_coverage"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    area:Mapped[str]=mapped_column(String(120),nullable=False)
    status:Mapped[str]=mapped_column(String(30),default="unreviewed",nullable=False)
    notes:Mapped[str]=mapped_column(Text,default="")

class DocumentRecord(Base):
    __tablename__="momto_documents"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    filename:Mapped[str]=mapped_column(String(255),nullable=False)
    path:Mapped[str]=mapped_column(Text,nullable=False)
    sha256:Mapped[str]=mapped_column(String(64),nullable=False)
    size_bytes:Mapped[int]=mapped_column(Integer,default=0,nullable=False)
    text_chars:Mapped[int]=mapped_column(Integer,default=0,nullable=False)
    indexed_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class AuditEvent(Base):
    __tablename__="momto_audit_events"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
    action:Mapped[str]=mapped_column(String(120),nullable=False)
    object_type:Mapped[str]=mapped_column(String(80),default="")
    object_id:Mapped[str]=mapped_column(String(80),default="")
    detail:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

COVERAGE_AREAS=["ODH file","Non-identifying history","Contact preference","Ohio registry","Probate court","DNA databases","Public records","Family trees","Newspapers","Professional review"]

def _case():
    from .service import init_case
    return init_case()

def audit(db, case_id, action, object_type="", object_id="", detail=""):
    db.add(AuditEvent(case_id=case_id,action=action,object_type=object_type,object_id=str(object_id or ""),detail=detail))

def add_graph_node(node_type,label,status="active"):
    c=_case()
    with SessionLocal() as db:
        n=GraphNode(case_id=c.id,node_type=node_type,label=label,status=status); db.add(n); db.flush()
        audit(db,c.id,"create","graph_node",n.id,node_type); db.commit(); return n.id

def add_graph_edge(from_node,to_node,relation,source="",confidence="unrated",evidence_ref=""):
    c=_case()
    with SessionLocal() as db:
        e=GraphEdge(case_id=c.id,from_node_id=from_node,to_node_id=to_node,relation=relation,source=source,confidence=confidence,evidence_ref=evidence_ref); db.add(e)
        audit(db,c.id,"create","graph_edge",e.id,relation); db.commit(); return e.id

def add_dna_cluster(name,provider="",match_count=0,ancestor_hypothesis="",confidence="unrated",notes=""):
    c=_case()
    with SessionLocal() as db:
        x=DnaCluster(case_id=c.id,cluster_name=name,provider=provider,match_count=match_count,shared_ancestor_hypothesis=ancestor_hypothesis,confidence=confidence,notes=notes); db.add(x); db.flush(); audit(db,c.id,"create","dna_cluster",x.id,name); db.commit()

def add_candidate(role,label,notes=""):
    c=_case()
    with SessionLocal() as db:
        x=Candidate(case_id=c.id,role=role,label=label,notes=notes); db.add(x); db.flush(); audit(db,c.id,"create","candidate",x.id,role); db.commit(); return x.id

def add_candidate_factor(candidate_id,factor,value="",evidence_ref=""):
    c=_case()
    with SessionLocal() as db:
        x=CandidateFactor(candidate_id=candidate_id,factor=factor,value=value,evidence_ref=evidence_ref); db.add(x); audit(db,c.id,"create","candidate_factor",candidate_id,factor); db.commit()

def add_timeline(event_date,title,source="",certainty="unknown",notes=""):
    c=_case()
    with SessionLocal() as db:
        x=TimelineEvent(case_id=c.id,event_date=event_date,title=title,source=source,certainty=certainty,notes=notes); db.add(x); db.flush(); audit(db,c.id,"create","timeline_event",x.id,event_date); db.commit()

def set_source_reliability(source,reliability,rationale=""):
    c=_case()
    with SessionLocal() as db:
        x=db.query(SourceReliability).filter_by(case_id=c.id,source=source).first()
        if x is None: x=SourceReliability(case_id=c.id,source=source); db.add(x)
        x.reliability=max(0,min(1,float(reliability))); x.rationale=rationale; audit(db,c.id,"review","source_reliability",source,str(x.reliability)); db.commit()

def set_coverage(area,status,notes=""):
    c=_case()
    with SessionLocal() as db:
        x=db.query(CoverageItem).filter_by(case_id=c.id,area=area).first()
        if x is None: x=CoverageItem(case_id=c.id,area=area); db.add(x)
        x.status=status; x.notes=notes; audit(db,c.id,"update","coverage",area,status); db.commit()

def ingest_document(path):
    from .vault import ingest as vault_ingest
    c=_case()
    record=vault_ingest(path)
    with SessionLocal() as db:
        x=DocumentRecord(case_id=c.id,filename=record["filename"],path=record["vault_path"],sha256=record["sha256"],size_bytes=record["size_bytes"],text_chars=record["text_chars"])
        db.add(x); db.flush()
        audit(db,c.id,"ingest","document",x.id,record["filename"])
        db.commit()
        return x.id

def extract_document_facts(document_id):
    c=_case()
    with SessionLocal() as db:
        doc=db.query(DocumentRecord).filter_by(id=document_id,case_id=c.id).first()
        if doc is None: raise ValueError("Unknown document")
        p=Path(doc.path)
        if p.suffix.lower() not in {".txt",".md",".csv",".json",".html",".htm"}:
            return []
        text=p.read_text(encoding="utf-8",errors="replace")
        import re
        patterns=[
            ("date",r"\\b(?:19|20)\\d{2}[-/]\\d{1,2}[-/]\\d{1,2}\\b"),
            ("birth_year",r"\\b(?:born|birth)\\D{0,20}((?:19|20)\\d{2})\\b"),
            ("adoption_event",r"\\b(?:adopted|adoption|placement|relinquish(?:ed|ment))\\b[^.\\n]{0,180}"),
            ("relationship",r"\\b(?:birth mother|birth father|biological mother|biological father|sibling|brother|sister)\\b[^.\\n]{0,120}"),
        ]
        facts=[]
        for kind,pattern in patterns:
            for m in re.finditer(pattern,text,re.I):
                value=m.group(0).strip()
                facts.append(DocumentFact(case_id=c.id,document_id=doc.id,fact_type=kind,value=value,confidence="extracted",source_span=value))
        for fact in facts: db.add(fact)
        audit(db,c.id,"extract","document_facts",document_id,str(len(facts)))
        db.commit()
        return [{"fact_type":x.fact_type,"value":x.value,"confidence":x.confidence} for x in facts]

def detect_contradictions():
    c=_case()
    with SessionLocal() as db:
        ev=db.query(Evidence).filter_by(case_id=c.id).all()
        pairs=[]
        for a in ev:
            for b in ev:
                if a.id < b.id:
                    sa=(a.supports or "").lower(); ca=(a.contradicts or "").lower()
                    sb=(b.supports or "").lower(); cb=(b.contradicts or "").lower()
                    if (sa and sa in cb) or (sb and sb in ca):
                        pairs.append({"a":a.id,"b":b.id,"type":"explicit"})
        return pairs

def suggest_next_actions():
    c=_case()
    with SessionLocal() as db:
        actions=[]
        open_tasks=db.query(Task).filter_by(case_id=c.id,status="open").count()
        gaps=db.query(CoverageItem).filter_by(case_id=c.id,status="unreviewed").all()
        if gaps: actions.append("Review uncovered search areas: "+", ".join(x.area for x in gaps[:3]))
        if db.query(GraphEdge).filter_by(case_id=c.id).count()==0: actions.append("Build the first evidence-graph relationship.")
        if db.query(DnaCluster).filter_by(case_id=c.id).count()==0: actions.append("Record DNA cluster/triangulation observations locally.")
        if db.query(Candidate).filter_by(case_id=c.id).count()==0: actions.append("Create a candidate comparison record only when documented evidence exists.")
        if open_tasks==0: actions.append("Create a concrete next-action task from the highest-value evidence gap.")
        return actions

def advanced_summary():
    c=_case()
    with SessionLocal() as db:
        return {
            "graph_nodes":db.query(GraphNode).filter_by(case_id=c.id).count(),
            "graph_edges":db.query(GraphEdge).filter_by(case_id=c.id).count(),
            "dna_clusters":db.query(DnaCluster).filter_by(case_id=c.id).count(),
            "candidates":db.query(Candidate).filter_by(case_id=c.id).count(),
            "timeline_events":db.query(TimelineEvent).filter_by(case_id=c.id).count(),
            "source_reviews":db.query(SourceReliability).filter_by(case_id=c.id).count(),
            "coverage_reviewed":db.query(CoverageItem).filter_by(case_id=c.id).filter(CoverageItem.status!="unreviewed").count(),
            "coverage_total":len(COVERAGE_AREAS),
            "documents":db.query(DocumentRecord).filter_by(case_id=c.id).count(),
            "audit_events":db.query(AuditEvent).filter_by(case_id=c.id).count(),
            "contradictions":len(detect_contradictions()),
        }
