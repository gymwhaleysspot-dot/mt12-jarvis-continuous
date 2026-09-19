from fastapi import APIRouter
from ..service import case_summary,workspace_report,ranked_next_actions,live_activity,search_ai_plan
router=APIRouter()
@router.get("/api/momto/live")
def momto_live():
 s=case_summary()
 return {"case":{"status":s["status"]},"objectives":{k:{"status":v} for k,v in s["objectives"]},
  "ohio":{"state":"Ohio","roadmap":s["roadmap"],"official_sources":["https://codes.ohio.gov/ohio-revised-code/section-3107.38","https://codes.ohio.gov/ohio-revised-code/section-3107.66","https://codes.ohio.gov/ohio-revised-code/section-3705.12"]},
  "dna":s["dna"],"counts":{"leads":s["lead_count"],"contacts":s["contact_count"],"searches":s["search_count"],"evidence":s["evidence_count"],"hypotheses":s["hypothesis_count"],"open_tasks":s["open_task_count"]},
  "advanced":{**s["advanced"],"workspace":workspace_report()["coverage"]},"next_actions":ranked_next_actions(),"activity":live_activity(),"search_ai_plan":search_ai_plan()}
