from pathlib import Path
import zipfile

from momto.ancestry import _parse_gedcom


def test_ancestry_birth_date_does_not_leak_into_residence(tmp_path: Path):
    ged = tmp_path / "tree.ged"
    ged.write_text(
        """0 HEAD
0 @I1@ INDI
1 NAME Michael /Braggs Whaley/
1 SEX M
1 BIRT
2 DATE 19 May 1980
2 PLAC Cincinnati, Hamilton, Ohio
1 RESI
2 DATE 2019
2 PLAC Russells Point, Ohio
1 FAMC @F1@
0 @I2@ INDI
1 NAME Lacey /Braggs Jr/
1 SEX M
1 BIRT
2 DATE 24 Aug 1934
1 DEAT
2 DATE 4 Sep 1996
0 @I3@ INDI
1 NAME Unknown /mother/
1 SEX F
0 @F1@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
""",
        encoding="utf-8",
    )
    people, families = _parse_gedcom(ged)
    michael = next(x for x in people if x["name"] == "Michael Braggs Whaley")
    lacey = next(x for x in people if x["name"] == "Lacey Braggs Jr")
    assert michael["birth"] == "19 May 1980"
    assert lacey["birth"] == "24 Aug 1934"
    assert lacey["death"] == "4 Sep 1996"
    assert families[0]["wife"] == "@I3@"


def test_ancestry_zip_contains_one_gedcom(tmp_path: Path):
    ged = tmp_path / "My family.ged"
    ged.write_text("0 HEAD\n0 @I1@ INDI\n1 NAME Michael /Braggs Whaley/\n1 BIRT\n2 DATE 19 May 1980\n", encoding="utf-8")
    archive = tmp_path / "My family.zip"
    with zipfile.ZipFile(archive, "w") as z:
        z.write(ged, "My family.ged")
    with zipfile.ZipFile(archive) as z:
        assert [n for n in z.namelist() if n.endswith(".ged")] == ["My family.ged"]


def test_ancestry_multiple_families_preserve_each_pedigree(tmp_path: Path):
    ged = tmp_path / "multiple-families.ged"
    ged.write_text(
        """0 HEAD
0 @I1@ INDI
1 NAME Michael /Braggs/
1 FAMC @F1@
2 PEDI birth
1 FAMC @F2@
2 PEDI adopted
0 @F1@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
0 @F2@ FAM
1 HUSB @I4@
1 WIFE @I5@
1 CHIL @I1@
""",
        encoding="utf-8",
    )
    people, _ = _parse_gedcom(ged)
    michael = next(x for x in people if x["name"] == "Michael Braggs")
    assert michael["famc_pedi_by_family"] == {"@F1@": "birth", "@F2@": "adopted"}
