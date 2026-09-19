from pathlib import Path
from momto.vault import init_vault,ingest,list_documents,validate
def test_private_vault_ingests_and_deduplicates(tmp_path,monkeypatch):
    monkeypatch.chdir(tmp_path); source=Path("synthetic-record.txt"); source.write_text("Synthetic private case note only.\n",encoding="utf-8")
    assert init_vault()["private"] is True
    first=ingest(str(source),"synthetic record"); second=ingest(str(source),"synthetic record")
    assert first["status"]=="ingested" and second["status"]=="duplicate"
    assert len(list_documents())==1 and validate()["integrity_ok"] is True and Path(first["vault_path"]).exists()
