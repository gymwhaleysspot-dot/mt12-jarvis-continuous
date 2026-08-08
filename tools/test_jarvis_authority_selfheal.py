from jarvis_authority_selfheal import inspect,sanitize_parent,validate,TAIL,LERP


def src(extra_helpers="",calls=""):
    return "\n".join([
        "local function clamp(x,a,b)return x end",
        "local function c1(x)return x end",
        LERP,
        extra_helpers,
        "local function run()",
        calls+TAIL,
        "end",
        'T(2,1,"JRW6",Z+INVERS)',
    ])


def test_repeated_calls_are_removed_from_parent():
    j2="local function jA2(a)local e=0;X[55]=lerp(X[55]or e,e,.14);return a end"
    bad=src(j2,"ac=jA2(ac);"*15)
    clean,meta=sanitize_parent(bad)
    assert meta["calls"]["jA2"]==15
    assert meta["defs"]["jA2"]==1
    assert "jA2(ac)" not in clean
    assert "local function jA2(a)" not in clean
    assert TAIL in clean


def test_missing_definition_is_detected():
    bad=src("","ac=jA2(ac);")
    state=inspect(bad)
    assert state["calls"]["jA2"]==1 and state["defs"]["jA2"]==0


def test_scratch_collision_is_rejected():
    j6="local function jA6(a)X[55]=1;return a end"
    jas="local function jAS(a)X[63]=1;return a end"
    j2="local function jA2(a)X[55]=1;return a end"
    bad=src("\n".join([j6,jas,j2]),"ac=jAS(ac);ac=jA2(ac);")
    e=validate(bad,"synthesis")
    assert any(x.startswith("authority-scratch-ownership:jA2") for x in e),e


def test_canonical_synthesis_passes():
    j6="local function jA6(a)X[55]=1;X[62]=1;return a end"
    jas="local function jAS(a)X[63]=1;X[66]=1;return a end"
    j2="local function jA2(a)X[67]=1;X[69]=1;return a end"
    good=src("\n".join([j6,jas,j2]),"ac=jAS(ac);ac=jA2(ac);")
    assert validate(good,"synthesis")==[]


def main():
    test_repeated_calls_are_removed_from_parent()
    test_missing_definition_is_detected()
    test_scratch_collision_is_rejected()
    test_canonical_synthesis_passes()
    print("PASS: Jarvis authority self-heal regression suite")


if __name__=="__main__":main()
