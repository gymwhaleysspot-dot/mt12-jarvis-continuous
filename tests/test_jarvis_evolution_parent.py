import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools import jarvis_evolution_parent as evolution


class EvolutionParentAdvanceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.pointer = self.root / "factory/evolution-controller.json"
        self.pointer.parent.mkdir(parents=True)
        self.pointer.write_text(json.dumps({"release": "jrw-parent-41"}) + "\n")

    def tearDown(self):
        self.tmp.cleanup()

    def write_tournament(self, mission, candidates, winner=None):
        base = self.root / "public/builds" / mission
        base.mkdir(parents=True)
        (base / "TOURNAMENT.json").write_text(json.dumps({
            "winner": winner,
            "candidates": candidates,
        }) + "\n")

    def advance(self, mission="rewrite-33966991971-1"):
        with patch.object(evolution, "ROOT", self.root), patch.object(evolution, "POINTER", self.pointer):
            return evolution.advance(mission, 1829)

    def test_no_eligible_candidate_is_successful_non_promotion(self):
        self.write_tournament("rewrite-33966991971-1", [
            {"candidate": "jrw1", "status": "COMPILED", "normalizedBytes": 87033,
             "promotionEfficiencyEligible": False},
            {"candidate": "jrw2", "status": "COMPILED", "normalizedBytes": 86612,
             "promotionEfficiencyEligible": False},
        ])
        before = self.pointer.read_bytes()

        result = self.advance()

        self.assertEqual(result["status"], "NO_PROMOTION")
        self.assertEqual(result["reason"], "NO_ELIGIBLE_CANDIDATES")
        self.assertEqual(result["candidateCount"], 2)
        self.assertEqual(result["eligibleCandidateCount"], 0)
        self.assertEqual(result["evolutionParent"], "jrw-parent-41")
        self.assertTrue(result["pointerUnchanged"])
        self.assertEqual(self.pointer.read_bytes(), before)

    def test_missing_winner_with_eligible_candidate_is_invalid(self):
        self.write_tournament("rewrite-33966991971-1", [
            {"candidate": "jrw1", "status": "COMPILED", "normalizedBytes": 86999,
             "promotionEfficiencyEligible": True},
        ])

        with self.assertRaisesRegex(RuntimeError, "omitted winner despite eligible candidates"):
            self.advance()

    def test_missing_winner_with_no_candidates_is_invalid(self):
        self.write_tournament("rewrite-33966991971-1", [])

        with self.assertRaisesRegex(RuntimeError, "tournament has no candidates"):
            self.advance()


if __name__ == "__main__":
    unittest.main()
