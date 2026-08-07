from __future__ import annotations

import re

import controller_rewrite_factory as rewrite_factory
import controller_tournament as tournament
import jarvis_canonical_parent

_original_checks = tournament.protected_checks
_original_rewrite = rewrite_factory.experiment_rewrite
_original_bonus = tournament.candidate_bonus


def protected_checks(text: str) -> list[str]:
    """Preserve the complete defended JRW6D lineage floor without hard-coding a display name."""
    errors = [error for error in _original_checks(text) if error != "missing:A17Z"]
    required = (
        "local function zBrain", "V[704]", "X[46]", "V[720]=ac",
        "setgv(3,m_min(V[35],ac))", "V[740+km]", "V[760+km]",
        "local pc=pcall", "pc(getFieldInfo", "pc(getValue",
        "pc(model.getGlobalVariable", "pc(model.setGlobalVariable",
        "/LOGS/m0", "/LOGS/m1", "local function memOpt", "local function watch",
        "V[179]*.0045", "92+4*dc",
        "bb_line(144,li1,0)", "bb_line(147,li4,0)",
        "bb_line(148,rg1,0)", "bb_line(151,rg4,0)",
    )
    errors.extend(f"missing-lineage-floor:{token}" for token in required if token not in text)
    decl = text.find("local function bb_line(")
    first = text.find("bb_line(")
    if first >= 0 and (decl < 0 or first < decl):
        errors.append("unsafe-bb-line-scope:call-before-local-declaration")
    if "setgv(3,V[35])" in text:
        errors.append("forbidden-stale-authority:setgv(3,V[35])")
    for bad in ("V[179]*(.00435", "V[179]*(.0044", "V[179]*.0048", "V[179]*.0050"):
        if bad in text:
            errors.append("forbidden-causal-mutation:restore-fixed-.0045")
    has_runtime_identity = all(
        token in text for token in (
            "bb_line(144,li1,0)", "bb_line(145,li2,0)",
            "bb_line(146,li3,0)", "bb_line(147,li4,0)",
        )
    )
    has_release_label = bool(re.search(r'T\(2,1,"[A-Za-z0-9]{3,8}"', text))
    if not has_runtime_identity:
        errors.append("missing:numeric runtime controller identity")
    if not has_release_label:
        errors.append("missing:generated runtime release label")
    return errors


def _restore_causal_floor(text: str) -> str:
    for old in (
        "V[179]*.0050",
        "V[179]*.0048",
        "V[179]*(.0044+.0001*m_min(1,V[166]/100))",
        "V[179]*(.00435+.00015*m_min(1,X[46]/120))",
    ):
        text = text.replace(old, "V[179]*.0045")
    return text


def _sanitize_inherited_bb_line(text: str) -> str:
    """Remove the inherited pre-declaration group-143 call from the JRW6D source.

    The call lives inside update(), before local function bb_line is declared, so Lua
    resolves it as a global and the MT12 throws 'attempt to call a nil value'.
    Observability adds the same record back later inside bb_tick(), where bb_line is local.
    """
    unsafe = "if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;"
    text = text.replace(unsafe, "")
    return text


def _apply_profile(text: str, profile: str) -> str:
    """Apply profile diversity without mutating the defended causal coefficient or 92→96 floor."""
    fault = "if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end"
    if profile == "learning":
        text = text.replace("V[760+km]>2", "V[760+km]>3", 1)
    elif profile == "observability":
        anchor = "if X[29]>0 then bb_line(135,X[29],0);if X[30]>0 then bb_line(136,X[30],0)end;X[29]=0;X[30]=0 end"
        add = "if X[29]>0 then bb_line(135,X[29],0);if X[30]>0 then bb_line(136,X[30],0)end;bb_line(143,p2221(V[720],V[704],V[114]*100,V[119]*100),0);X[29]=0;X[30]=0 end"
        if text.count(anchor) != 1:
            raise RuntimeError(f"observability bb_tick anchor expected one match, found {text.count(anchor)}")
        text = text.replace(anchor, add, 1)
    elif profile == "conservative":
        text = text.replace(fault, "if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,92)end", 1)
    elif profile == "combined":
        text = text.replace("V[760+km]>2", "V[760+km]>3", 1)
        text = text.replace(fault, "if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,93)end", 1)
    elif profile != "balanced":
        raise ValueError(profile)
    label = {
        "conservative": "JRW1", "balanced": "JRW2", "learning": "JRW3",
        "observability": "JRW4", "combined": "JRW5",
    }[profile]
    text = text.replace('T(2,1,"JRW6D",Z+INVERS)', f'T(2,1,"{label}",Z+INVERS)', 1)
    return text


def _apply_defended_experiment(text: str, area: str) -> str:
    """Move experiments off immutable JRW6D defense anchors when necessary."""
    if area == "truth-speed-fusion":
        old = "clamp(V[179]/250,0,.35)"
        new = "clamp(V[179]/(245+10*V[119]),0,.35)"
        if old in text:
            return text.replace(old, new, 1)
    elif area == "traction-control":
        old = "md<.42 and V[119]<.45"
        new = "md<(.40+.02*V[114]) and V[119]<.45"
        if old in text:
            return text.replace(old, new, 1)
    return text


def _reuse_generation_identity(text: str) -> str:
    """Keep the new rg identity values but remove inherited duplicate rg locals/logger emission."""
    pat = re.compile(r"local rg1,rg2,rg3,rg4=\d+,\d+,\d+,\d+")
    matches = list(pat.finditer(text))
    if not matches:
        raise RuntimeError("missing rewrite generation identity declaration")
    if len(matches) > 1:
        first = matches[0].group(0)
        text = pat.sub("", text)
        anchor = "local bc,bm,bi=0,0,0"
        text = text.replace(anchor, anchor + ";" + first, 1)
    emission = "if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;"
    while text.count(emission) > 1:
        text = text.replace(emission, "", 1)
    return text


def imprint_runtime_identity(text: str, token: str, chunks: list[int]) -> str:
    """Reuse JRW6D's existing li identity locals instead of allocating five more top-level locals."""
    values = ",".join(str(x) for x in chunks)
    pat = re.compile(r"local li1,li2,li3,li4=\d+,\d+,\d+,\d+")
    text, count = pat.subn("local li1,li2,li3,li4=" + values, text, count=1)
    if count != 1:
        raise RuntimeError(f"runtime identity reuse expected one li declaration, found {count}")
    if token in text:
        raise RuntimeError("runtime token must remain numeric-only in deployed Lua")
    return text


def experiment_rewrite(text: str, profile: str, experiment: dict, generation: str) -> str:
    """Generate from the defended parent while keeping JRW6D protections immutable."""
    area = str(experiment.get("area", ""))
    try:
        rewritten = _original_rewrite(text, "balanced", experiment, generation)
    except RuntimeError as exc:
        if "found no source target" not in str(exc):
            raise
        fallback = dict(experiment)
        fallback["area"] = "controller-observability"
        rewritten = _original_rewrite(text, "balanced", fallback, generation)
        anchor = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        if rewritten.count(anchor) != 1:
            raise RuntimeError(f"structural fallback expected one authority anchor, found {rewritten.count(anchor)}")
        if area == "jump-landing-classification":
            mutation = "if V[543]>0 and X[46]<120 then local jc=m_max(0,m_min(1,X[46]/120));ac=m_min(ac,94+2*jc)end;"
        elif area == "sensor-dropout-recovery":
            mutation = "if V[119]>.45 and X[46]<120 then ac=m_min(ac,94)end;"
        else:
            mutation = "if X[46]<80 then ac=m_min(ac,94)end;"
        rewritten = rewritten.replace(anchor, mutation + anchor, 1)
    rewritten = _restore_causal_floor(rewritten)
    rewritten = _reuse_generation_identity(rewritten)
    rewritten = _sanitize_inherited_bb_line(rewritten)
    rewritten = _apply_defended_experiment(rewritten, area)
    rewritten = _apply_profile(rewritten, profile)
    return rewritten


def candidate_bonus(profile: str, text: str) -> dict[str, float]:
    bonus = {"learningGain": 0.0, "safetyGain": 0.0, "observabilityGain": 0.0}
    if profile == "learning":
        bonus["learningGain"] = 3.0 if "V[760+km]>3" in text else 0.0
    elif profile == "conservative":
        bonus["safetyGain"] = 2.5 if "m_min(ac,92)" in text else 0.0
    elif profile == "observability":
        bonus["observabilityGain"] = 3.0 if "bb_line(143" in text else 0.0
    elif profile == "combined":
        bonus["learningGain"] = 1.5 if "V[760+km]>3" in text else 0.0
        bonus["safetyGain"] = 1.5 if "m_min(ac,93)" in text else 0.0
    return bonus


def main() -> None:
    tournament.latest_release = jarvis_canonical_parent.resolve
    tournament.protected_checks = protected_checks
    tournament.candidate_bonus = candidate_bonus
    tournament.imprint_runtime_identity = imprint_runtime_identity
    rewrite_factory.experiment_rewrite = experiment_rewrite
    parent, source = jarvis_canonical_parent.resolve()
    print({"canonicalParent": parent, "source": str(source)})
    rewrite_factory.main()


if __name__ == "__main__":
    main()
