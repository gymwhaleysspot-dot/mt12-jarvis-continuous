from fastapi import APIRouter
from ..service import case_summary,OHIO_ROADMAP
router=APIRouter()
@router.get("/api/momto/live")
def momto_live():
 s=case_summary()
 return {
  "case":{"status":s["status"]},
  "objectives":{k:{"status":v} for k,v in s["objectives"]},
  "ohio":{"state":"Ohio","roadmap":s["roadmap"],"official_sources":[
   "https://codes.ohio.gov/ohio-revised-code/section-3107.38",
   "https://codes.ohio.gov/ohio-revised-code/section-3107.66",
   "https://codes.ohio.gov/ohio-revised-code/section-3705.12"
  ]},
  "dna":s["dna"],
  "leads":{"count":s["lead_count"]},
  "contacts":{"count":s["contact_count"]}
 }
