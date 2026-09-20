from pathlib import Path

from momto.ancestry import _parse_gedcom


def test_parse_ancestry_gedcom(tmp_path: Path):
    ged = tmp_path / "tree.ged"
    ged.write_text(
        """0 HEAD
1 SOUR Ancestry
0 @I1@ INDI
1 NAME Michael /Braggs Whaley/
1 BIRT
2 DATE 1980
1 FAMC @F1@
0 @I2@ INDI
1 NAME Lacey /Braggs/
1 DEAT
2 DATE 1996
0 @I3@ INDI
1 NAME Unknown /Mother/
1 FAMS @F1@
0 @F1@ FAM
1 WIFE @I3@
1 CHIL @I1@
""",
        encoding="utf-8",
    )
    people, families = _parse_gedcom(ged)
    assert len(people) == 3
    assert len(families) == 1
    assert people[0]["name"] == "Michael Braggs Whaley"
    assert people[0]["birth"] == "1980"
    assert people[0]["famc"] == "@F1@"
    assert families[0]["wife"] == "@I3@"
    assert families[0]["children"] == ["@I1@"]
