from pathlib import Path
from momto.vault import init_vault,ingest,list_documents,validate
def test_private_vault_ingests_and_deduplicates(tmp_path,monkeypatch):
    monkeypatch.chdir(tmp_path); source=Path("synthetic-record.txt"); source.write_text("Synthetic private case note only.\n",encoding="utf-8")
    assert init_vault()["private"] is True
    first=ingest(str(source),"synthetic record"); second=ingest(str(source),"synthetic record")
    assert first["status"]=="ingested" and second["status"]=="duplicate"
    assert len(list_documents())==1 and validate()["integrity_ok"] is True and Path(first["vault_path"]).exists()


def test_private_document_facts_are_structured(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    source=Path("record.txt")
    source.write_text("Adoption placement occurred on 1980/04/12. Birth mother information was recorded.\n",encoding="utf-8")
    from momto.advanced import ingest_document, extract_document_facts
    doc_id=ingest_document(str(source))
    facts=extract_document_facts(doc_id)
    assert any(x["fact_type"]=="date" for x in facts)
    assert any(x["fact_type"]=="relationship" for x in facts)
