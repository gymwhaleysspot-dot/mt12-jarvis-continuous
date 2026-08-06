from __future__ import annotations

import re

import controller_rewrite_factory as rewrite_factory
import controller_tournament as tournament
import jarvis_canonical_parent

_original_checks = tournament.protected_checks
_original_rewrite = rewrite_factory.experiment_rewrite


def protected_checks(text: str) -> list[str]:
    """Preserve the complete a17z lineage floor without hard-coding a display name."""
    errors = [error for error in _original_checks(text) if error != "missing:A17Z"]
    required = (
        "local function zBrain", "V[704]", "X[46]", "V[720]=ac",
        "setgv(3,m_min(V[35],ac))", "V[740+km]", "V[760+km]",
    )
    errors.extend(f"missing-lineage-floor:{token}" for token in required if token not in text)
    if "setgv(3,V[35])" in text:
        errors.append("forbidden-stale-authority:setgv(3,V[35])")
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


def experiment_rewrite(text: str, profile: str, experiment: dict, generation: str) -> str:
    """Use the primary mutation, then structural fallbacks for evolved source layouts."""
    try:
        return _original_rewrite(text, profile, experiment, generation)
    except RuntimeError as exc:
        if "found no source target" not in str(exc):
            raise
        area = str(experiment.get("area", ""))
        fallback_experiment = dict(experiment)
        fallback_experiment["area"] = "controller-observability"
        rewritten = _original_rewrite(text, profile, fallback_experiment, generation)
        anchor = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        if rewritten.count(anchor) != 1:
            raise RuntimeError(f"structural fallback expected one authority anchor, found {rewritten.count(anchor)}")
        if area == "jump-landing-classification":
            mutation = "if V[543]>0 and X[46]<120 then local jc=m_max(0,m_min(1,X[46]/120));ac=m_min(ac,94+2*jc)end;"
        elif area == "sensor-dropout-recovery":
            mutation = "if X[46]<120 then local dc=m_max(0,m_min(1,X[46]/120));ac=m_min(ac,92+4*dc)end;"
        else:
            mutation = "if X[46]<80 then ac=m_min(ac,94)end;"
        rewritten = rewritten.replace(anchor, mutation + anchor, 1)
        if mutation not in rewritten:
            raise RuntimeError(f"structural {area} mutation did not persist")
        return rewritten


def main() -> None:
    tournament.latest_release = jarvis_canonical_parent.resolve
    tournament.protected_checks = protected_checks
    rewrite_factory.experiment_rewrite = experiment_rewrite
    parent, source = jarvis_canonical_parent.resolve()
    print({"canonicalParent": parent, "source": str(source)})
    rewrite_factory.main()


if __name__ == "__main__":
    main()
