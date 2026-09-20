from pathlib import Path
from momto.dna import _num, _provider, _match_key, _read

def test_dna_numeric_parser_and_provider_detection(tmp_path):
    assert _num("34.7 cM") == 34.7
    assert _num("1,234.5") == 1234.5
    assert _num("") is None
    assert _provider(Path("ancestry_matches.csv"), None) == "AncestryDNA"
    assert _provider(Path("23andme_relatives.csv"), None) == "23andMe"
    assert _provider(Path("ftdna_matches.csv"), None) == "FamilyTreeDNA"

def test_dna_match_import_parser_normalizes_csv(tmp_path):
    p=tmp_path/"gedmatch_matches.csv"
    p.write_text("Match ID,Shared cM,Segments,Relationship\nABC,42.5,6,2nd Cousin\n",encoding="utf-8")
    rows=_read(p)
    assert len(rows)==1
    assert _num(rows[0]["Shared cM"]) == 42.5
    assert _num(rows[0]["Segments"]) == 6
    assert len(_match_key(rows[0],1)) == 24
