import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

sys.modules.setdefault("controller_tournament", types.ModuleType("controller_tournament"))
from tools import controller_rewrite_factory as factory


class RewriteFactoryNoveltyTests(unittest.TestCase):
    def test_portfolio_profiles_receive_independent_hypotheses(self):
        experiment = {
            "id": "EXP-1",
            "area": "root",
            "portfolio": [
                {"area": f"area-{i}", "ideaSignature": f"sig-{i}", "emitter": f"emit-{i}"}
                for i in range(1, 6)
            ],
        }
        selected = [
            factory.experiment_for_profile(experiment, profile)
            for profile in ("conservative", "balanced", "learning", "observability", "combined")
        ]
        self.assertEqual([item["portfolioSlot"] for item in selected], [1, 2, 3, 4, 5])
        self.assertEqual(len({item["ideaSignature"] for item in selected}), 5)
        self.assertEqual(len({item["emitter"] for item in selected}), 5)
        self.assertEqual(factory.experiment_for_profile(experiment, "synthesis"), experiment)

    def test_historical_archive_indexes_published_semantics(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            build = root / "public/builds/rewrite-123-1"
            build.mkdir(parents=True)
            (build / "BUILD-MANIFEST.json").write_text(json.dumps({
                "mission": "rewrite-123-1",
                "candidates": [
                    {
                        "candidate": "jrw4",
                        "rewriteContract": {"semanticSha256": "abc123"},
                    }
                ],
            }))
            with patch.object(factory, "ROOT", root):
                archive = factory.known_semantic_hashes()
            self.assertEqual(archive, {"abc123": ["rewrite-123-1/jrw4"]})

    def test_semantic_hash_ignores_identity_but_not_behavior(self):
        base = (
            'local rg1,rg2,rg3,rg4=1,2,3,4;'
            'local li=599;local li1,li2,li3,li4=5,6,7,8;'
            'T(2,1,"JRW1",Z+INVERS);return 91\n'
        )
        identity_change = (
            'local rg1,rg2,rg3,rg4=9,10,11,12;'
            'local li=599;local li1,li2,li3,li4=13,14,15,16;'
            'T(2,1,"JRW9",Z+INVERS);return 91\n'
        )
        behavior_change = identity_change.replace("return 91", "return 92")
        self.assertEqual(factory.semantic_sha256(base), factory.semantic_sha256(identity_change))
        self.assertNotEqual(factory.semantic_sha256(base), factory.semantic_sha256(behavior_change))


if __name__ == "__main__":
    unittest.main()
