import base64
import sqlite3
from pathlib import Path

from cryptography.fernet import Fernet

from momto.case_vault import CaseVault, VaultError, generate_key


def test_vault_encrypts_document_and_deduplicates(tmp_path):
    key = generate_key()
    vault = CaseVault(tmp_path / "vault", key)
    source = tmp_path / "private.txt"
    source.write_text("PRIVATE ADOPTION RECORD", encoding="utf-8")

    first = vault.ingest_document(source)
    second = vault.ingest_document(source)

    assert first["id"] == second["id"]
    assert first["encrypted"] is True
    rows = vault.list_records("document")
    assert len(rows) == 1
    assert rows[0]["payload"]["filename"] == "private.txt"
    assert base64.b64decode(rows[0]["payload"]["content_b64"]) == b"PRIVATE ADOPTION RECORD"

    raw = sqlite3.connect(vault.db_path).execute(
        "SELECT ciphertext FROM records"
    ).fetchone()[0]
    assert b"PRIVATE ADOPTION RECORD" not in raw
    assert b"private.txt" not in raw


def test_vault_keeps_structured_case_records_private(tmp_path):
    vault = CaseVault(tmp_path / "vault", generate_key())
    person = vault.add_person("Synthetic birth parent", "birth_mother", "fixture only")
    vault.add_evidence("Synthetic record", source="fixture", supports="relationship")
    vault.add_relationship(person, person, "self-reference", "fixture", "low")
    vault.add_dna_observation("SyntheticDNA", "Match A", "possible cousin", 75.0, 3)
    vault.add_hypothesis("Synthetic hypothesis", "low", "unknown parent", "birth record")
    vault.add_task("Synthetic review", "normal", "human review required")
    vault.add_search("Synthetic source", "adoption records", "fixture result", "useful")

    summary = vault.summary()
    assert summary["encrypted"] is True
    assert summary["local_only"] is True
    assert summary["total_records"] == 7
    assert summary["by_kind"]["person"] == 1
    assert summary["by_kind"]["dna_observation"] == 1


def test_vault_requires_key(tmp_path):
    try:
        CaseVault(tmp_path / "vault")
    except VaultError as exc:
        assert "MOMTO_VAULT_KEY" in str(exc)
    else:
        raise AssertionError("vault must not initialize without a key")
