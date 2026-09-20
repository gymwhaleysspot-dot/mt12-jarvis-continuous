from __future__ import annotations
import json, os, re, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from .db import SessionLocal
from .models import Evidence, Hypothesis, SearchEvent, Task
from .genealogy import SOURCE_CATALOG

class _Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        if tag in {"script","style","noscript"}: self.skip+=1
    def handle_endtag(self,tag):
        if tag in {"script","style","noscript"} and self.skip: self.skip-=1
    def handle_data(self,data):
        if not self.skip:
            s=re.sub(r"\s+"," ",data).strip()
            if s:self.parts.append(s)

def _now(): return datetime.now(timezone.utc).isoformat()

def _fetch(url):
    row={"url":url,"ok":False,"checked_at":_now()}
    try:
        req=urllib.request.Request(url,headers={"User-Agent":"MomTo-Research-AI/2.0"})
        with urllib.request.urlopen(req,timeout=20) as r:
            raw=r.read(400000); row.update(status=r.status,ok=200<=r.status<400)
            if "text/html" in (r.headers.get("Content-Type") or ""):
                p=_Text(); p.feed(raw.decode("utf-8","ignore")); txt=" ".join(p.parts)
                terms=("adoption","birth","records","court","probate","genealogy","marriage","death","registry","request","Ohio")
                row["findings"]=[]
                for sentence in re.split(r"(?<=[.!?])\s+",txt):
                    if any(t in sentence.lower() for t in terms) and 50<=len(sentence)<=500: row["findings"].append(sentence)
                    if len(row["findings"])>=8: break
            else: row["findings"]=["Official source fetched successfully."]
    except Exception as e: row["error"]=type(e).__name__
    return row

def _model(system,payload):
    key=os.environ.get("MOMTO_OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not key:return None
    base=os.environ.get("MOMTO_OPENAI_BASE_URL","https://api.openai.com/v1").rstrip("/")
    model=os.environ.get("MOMTO_RESEARCH_MODEL","gpt-5.6")
    body=json.dumps({"model":model,"input":[{"role":"system","content":system},{"role":"user","content":json.dumps(payload,ensure_ascii=False)}],"text":{"format":{"type":"json_object"}}}).encode()
    req=urllib.request.Request(base+"/responses",data=body,headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"},method="POST")
    try:
        with urllib.request.urlopen(req,timeout=60) as r: d=json.loads(r.read().decode())
        out=d.get("output_text")
        if not out:
            for item in d.get("output",[]):
                for part in item.get("content",[]):
                    if isinstance(part,dict) and part.get("text"): out=part["text"]; break
        return json.loads(out) if out else None
    except Exception:return None

def run(limit=12):
    from .service import init_case,workspace_report
    case=init_case()
    with SessionLocal() as db:
        ev=db.query(Evidence).filter_by(case_id=case.id).all()
        hy=db.query(Hypothesis).filter_by(case_id=case.id).all()
        se=db.query(SearchEvent).filter_by(case_id=case.id).order_by(SearchEvent.searched_at.desc()).limit(40).all()
        ta=db.query(Task).filter_by(case_id=case.id,status="open").all()
        context={"evidence":[{"title":x.title,"source":x.source,"summary":x.summary,"supports":x.supports,"contradicts":x.contradicts} for x in ev[-80:]],"hypotheses":[{"title":x.title,"status":x.status,"confidence":x.confidence,"supporting":x.supporting_count,"contradicting":x.contradicting_count,"unknowns":x.unknowns,"next_evidence":x.next_evidence} for x in hy[-40:]],"recent_searches":[{"source":x.source,"query":x.query,"usefulness":x.usefulness,"result":x.result[:1000]} for x in se],"open_tasks":[{"title":x.title,"priority":x.priority} for x in ta]}
    plan=_model("""You are MomTo, an autonomous but careful adoption/genealogy research AI. Reason over the supplied case workspace and build a falsifiable research plan. Separate facts, clues, hypotheses, contradictions and unknowns. Select searches that can discriminate between hypotheses. Never invent people, records, relationships or contact information. Return JSON: research_question, hypotheses[{title,rationale,evidence_needed}], searches[{source_id,query,why}], cautions. Private case facts are never for public publication.""",{"case_type":"Ohio adoption research","context":context,"sources":[{k:s[k] for k in ("id","title","url","lane","record_types")} for s in SOURCE_CATALOG]})
    model_used=bool(plan)
    if not plan:
        plan={"research_question":"Which unresolved evidence gap should be tested next?","hypotheses":[],"searches":[{"source_id":s["id"],"query":"Review this official source for the strongest unresolved evidence gap.","why":"Coverage"} for s in SOURCE_CATALOG[:min(4,limit)]],"cautions":["No model credentials configured; deterministic source research is active."]}
    results=[]
    for item in plan.get("searches",[])[:limit]:
        src=next((s for s in SOURCE_CATALOG if s["id"]==item.get("source_id")),None)
        if not src: continue
        r=_fetch(src["url"]); r.update(source_id=src["id"],title=src["title"],lane=src["lane"],query=item.get("query",""),why=item.get("why","")); results.append(r)
    ok=[r for r in results if r.get("ok")]; report=workspace_report()
    return {"engine":"momto-research-agent-v2","mode":"model-directed" if model_used else "evidence-driven-fallback","generated_at":_now(),"research_question":plan.get("research_question",""),"hypotheses":plan.get("hypotheses",[])[:8],"planned_searches":plan.get("searches",[])[:limit],"results":results,"summary":{"sources_checked":len(results),"sources_successful":len(ok),"finding_count":sum(len(r.get("findings") or []) for r in ok),"coverage_percent":report["coverage"]["percent"]},"cautions":plan.get("cautions",[]),"guardrails":{"no_identity_invention":True,"public_only":True,"human_review_for_contact":True,"human_review":True,"private_case_data_publication":False}}
