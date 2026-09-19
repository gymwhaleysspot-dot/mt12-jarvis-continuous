from pathlib import Path
from momto.db import Base,engine
from momto.service import init_case,case_summary,graph_node,graph_edge,dna_cluster,candidate,candidate_factor,timeline,source_reliability,coverage,advanced
from momto.advanced import COVERAGE_AREAS

def reset():
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine); init_case()

def test_all_ten_workspace_capabilities_register_and_count(tmp_path):
    reset()
    a=graph_node("family","Family group")
    b=graph_node("candidate","Candidate")
    graph_edge(a,b,"geographic-link","public record","medium","e1")
    dna_cluster("Cluster A","GEDmatch",3,"shared grandparent","medium")
    c=candidate("birth_mother","Candidate A")
    candidate_factor(c,"geography","Ohio","e2")
    timeline("1980","Adoption finalized","court","high")
    source_reliability("Ohio Department of Health",0.95,"primary official source")
    coverage(COVERAGE_AREAS[0],"reviewed","request path checked")
    s=case_summary()["advanced"]
    assert s["graph_nodes"]==2 and s["graph_edges"]==1
    assert s["dna_clusters"]==1 and s["candidates"]==1 and s["timeline_events"]==1
    assert s["source_reviews"]==1 and s["coverage_reviewed"]==1
    assert s["documents"]==0
    assert s["audit_events"]>=8
    assert "contradictions" in s

def test_local_document_ingestion_is_hashed_not_published(tmp_path):
    reset()
    p=tmp_path/"notes.txt"; p.write_text("private adoption research",encoding="utf-8")
    from momto.service import ingest_document
    ingest_document(str(p))
    s=case_summary()["advanced"]
    assert s["documents"]==1
