from fastapi import APIRouter
from ..service import case_summary

router=APIRouter()
@router.get("/api/momto/live")
def momto_live():
    s=case_summary()
    return {"case":{"current_name":s["current_name"],"birth_name":s["birth_name"],"birth_year":s["birth_year"]},
            "objectives":{k.replace("_","_"):{"status":v} for k,v in s["objectives"]},
            "matches":[],"activity":[]}
