import unittest

from momto.parent_search import build_discriminating_searches


class ParentSearchTests(unittest.TestCase):
    def test_two_lanes_generate_graph_derived_searches(self):
        context = {
            "lanes": [
                {"lane": "birth-mother", "role": "mother",
                 "search_terms": ["Michael Braggs", "Jane Example"]},
                {"lane": "birth-father", "role": "father",
                 "search_terms": ["Michael Braggs", "John Example"]},
            ]
        }
        searches = build_discriminating_searches(context, 24)
        self.assertTrue(searches)
        self.assertIn("birth-mother", {x["lane"] for x in searches})
        self.assertIn("birth-father", {x["lane"] for x in searches})
        self.assertTrue(all(x["graph_derived"] for x in searches))
        self.assertTrue(all(x["provider"] == "web" for x in searches))

    def test_known_parent_drives_relationship_searches(self):
        context = {
            "focus": {"name": "Michael Braggs", "birth_date": "1980"},
            "known_parents": [{"name": "Lacey Braggs", "sex": "M"}],
            "lanes": [
                {"lane": "birth-mother", "role": "mother",
                 "search_terms": ["Michael Braggs", "Lacey Braggs", "Shirley Example"]},
            ],
        }
        searches = build_discriminating_searches(context, 24)
        queries = [x["query"] for x in searches]
        self.assertTrue(any('"Lacey Braggs" spouse children family Ohio' == q for q in queries))
        self.assertTrue(any('"Lacey Braggs" marriage obituary children Ohio' == q for q in queries))
        self.assertTrue(any('"Lacey Braggs" "Michael Braggs" children family Ohio' == q for q in queries))

    def test_searches_are_capped(self):
        context = {
            "lanes": [
                {"lane": "birth-mother", "role": "mother",
                 "search_terms": [f"Anchor {i}" for i in range(20)]},
                {"lane": "birth-father", "role": "father",
                 "search_terms": [f"Anchor {i}" for i in range(20)]},
            ]
        }
        self.assertLessEqual(len(build_discriminating_searches(context, 10)), 10)


if __name__ == "__main__":
    unittest.main()
