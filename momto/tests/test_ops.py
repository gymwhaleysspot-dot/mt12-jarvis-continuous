from pathlib import Path

from momto.db import Base, engine
from momto.service import init_case, add_evidence, add_task, coverage
from momto.service import workspace_report, ranked_next_actions, validate_local_state, backup_local, recovery_manifest, audit_tail
from momto.advanced import COVERAGE_AREAS


def reset():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    init_case()


def test_workspace_intelligence_is_deterministic_and_read_only():
    reset()
    add_evidence("Verified record", source="official source", supports="timeline")
    r1 = workspace_report()
    r2 = workspace_report()
    assert r1 == r2
    assert r1["evidence"] == 1
    assert r1["coverage"]["total"] == len(COVERAGE_AREAS)
    actions = ranked_next_actions()
    assert actions and actions[0]["priority"] in {"high", "normal"}


def test_local_recovery_validation_backup_and_manifest(tmp_path):
    reset()
    coverage(COVERAGE_AREAS[0], "reviewed", "checked")
    add_task("Review records", "high")
    state = validate_local_state()
    assert state["ok"] is True
    target = tmp_path / "momto-backup.sqlite3"
    result = backup_local(str(target))
    assert result["validated"] is True
    assert Path(result["path"]).exists()
    assert len(result["sha256"]) == 64
    manifest = recovery_manifest()
    assert manifest["format"] == "momto-recovery-v1"
    assert manifest["database"]["ok"] is True
    assert audit_tail(5)
