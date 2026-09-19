from momto.db import Base,engine
from momto.service import init_case,case_summary,OHIO_ROADMAP,add_search,add_evidence,add_hypothesis,add_task
def test_persistent_two_parent_objectives():
 Base.metadata.drop_all(engine); Base.metadata.create_all(engine); init_case(); s=case_summary()
 assert (s["current_name"],s["birth_name"],s["birth_year"])==("Michael Whaley","Michael Braggs",1980)
 assert set(x[0] for x in s["objectives"])=={"birth_mother","birth_father"}
 assert s["status"]=="active"
 assert len(s["roadmap"])==len(OHIO_ROADMAP)
 assert {x["key"] for x in s["roadmap"]}=={x[0] for x in OHIO_ROADMAP}
def test_workspace_records_are_counted():
 Base.metadata.drop_all(engine); Base.metadata.create_all(engine); init_case()
 add_search("Ohio public source","adoption records","useful","useful")
 add_evidence("ODH guidance",source="Ohio Department of Health",supports="records path")
 add_hypothesis("Candidate relationship hypothesis",confidence="unrated")
 add_task("Request adoption file","high")
 s=case_summary()
 assert s["search_count"]==1 and s["evidence_count"]==1 and s["hypothesis_count"]==1 and s["open_task_count"]==1
