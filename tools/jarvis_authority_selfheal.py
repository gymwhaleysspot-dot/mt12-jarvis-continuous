from __future__ import annotations
import re

HELPERS=("jA1","jA2","jA3","jA4","jA5","jA6","jAS")
CALL_RE=re.compile(r"ac=(jA[1-6]|jAS)\(ac\);")
DEF_RE=re.compile(r"local function (jA[1-6]|jAS)\(a\)")
STAGE_RE=re.compile(r"local function jAS\(a\)local s=(\d+);")
LABEL_RE=re.compile(r'T\(2,1,"JRW([1-6])",Z\+INVERS\)')
TAIL="V[720]=ac;setgv(3,m_min(V[35],ac));"
LERP="local function lerp(a,b,t)t=c1(t);return a+(b-a)*t end"


def inspect(text:str)->dict:
    defs={n:text.count("local function "+n+"(a)") for n in HELPERS}
    calls={n:text.count(n+"(ac)") for n in HELPERS}
    stages=[int(x) for x in STAGE_RE.findall(text)]
    m=LABEL_RE.search(text)
    return {"defs":defs,"calls":calls,"stage":max(stages) if stages else 0,"label":int(m.group(1)) if m else 0}


def sanitize_parent(text:str)->tuple[str,dict]:
    """Remove inherited authority implementation while preserving evolution metadata.

    Jarvis may receive a poisoned evolution parent. The rewrite engine must never
    mutate that graph in place. We strip all authority helpers/calls first and
    return the old label/stage as metadata for the next synthesis step.
    """
    meta=inspect(text)
    lines=[]
    for line in text.splitlines():
        if DEF_RE.search(line.strip()):
            continue
        lines.append(line)
    text="\n".join(lines)
    text=CALL_RE.sub("",text)
    if TAIL not in text:
        raise RuntimeError("selfheal: authority tail missing")
    if LERP not in text:
        raise RuntimeError("selfheal: lexical lerp anchor missing")
    return text,meta


def validate(text:str,profile:str)->list[str]:
    e=[]
    state=inspect(text)
    for n,c in state["defs"].items():
        if c>1:e.append("authority-duplicate-definition:"+n)
    for n,c in state["calls"].items():
        if c>1:e.append("authority-duplicate-call:"+n)
        if c and state["defs"][n]!=1:e.append("authority-call-without-single-definition:"+n)
    lp=text.find(LERP)
    for n in HELPERS:
        p=text.find("local function "+n+"(a)")
        if p>=0 and (lp<0 or p<lp):e.append("authority-helper-before-local-lerp:"+n)

    if profile=="synthesis":
        expected_defs={"jA6":1,"jAS":1,"jA2":1}
        expected_calls={"jAS":1,"jA2":1}
        for n,v in expected_defs.items():
            if state["defs"][n]!=v:e.append(f"authority-synthesis-def:{n}:{state['defs'][n]}")
        for n,v in expected_calls.items():
            if state["calls"][n]!=v:e.append(f"authority-synthesis-call:{n}:{state['calls'][n]}")
        for n in ("jA1","jA3","jA4","jA5"):
            if state["defs"][n] or state["calls"][n]:e.append("authority-synthesis-stale-helper:"+n)
        blocks={}
        for n in ("jA6","jAS","jA2"):
            m=re.search(r"local function "+n+r"\(a\).*?end(?:\n|$)",text,re.S)
            blocks[n]=m.group(0) if m else ""
        owned={"jA6":set(range(55,63)),"jAS":set(range(63,67)),"jA2":set(range(67,70))}
        for n,b in blocks.items():
            used={int(x) for x in re.findall(r"X\[(\d+)\]",b)}
            foreign=used-owned[n]
            if foreign:e.append("authority-scratch-ownership:"+n+":"+",".join(map(str,sorted(foreign))))
        if text.count("ac=jAS(ac);ac=jA2(ac);" )!=1:e.append("authority-synthesis-chain-not-canonical")
    return e


def assert_valid(text:str,profile:str)->None:
    e=validate(text,profile)
    if e:raise RuntimeError("selfheal validation failed: "+" | ".join(e))
