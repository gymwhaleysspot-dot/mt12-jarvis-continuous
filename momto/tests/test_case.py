from momto.db import Base,engine
from momto.service import init_case,case_summary
def test_persistent_two_parent_objectives():
 Base.metadata.drop_all(engine); Base.metadata.create_all(engine); init_case(); s=case_summary()
 assert (s["current_name"],s["birth_name"],s["birth_year"])==("Michael Whaley","Michael Braggs",1980)
 assert set(x[0] for x in s["objectives"])=={"birth_mother","birth_father"}
 assert s["status"]=="active"
