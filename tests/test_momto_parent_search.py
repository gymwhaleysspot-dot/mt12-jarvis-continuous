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
