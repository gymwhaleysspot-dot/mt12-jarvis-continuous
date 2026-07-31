# MT12 YA Forge

Clean restart of the MT12 AI controller project.

## Golden baseline

The project is anchored to **A15YA**. Existing behavior is preserved as the reference contract; no subsystem may be simplified or removed merely to save memory.

## First evolution

**A15YB — Unified Episode Brain**

The controller joins prediction, cause, intervention, outcome, confidence, learning eligibility, learning direction, and rollback into one compact causal episode model.

## Repository rule

This repository now uses one deterministic path:

1. preserve and verify the YA baseline
2. compile Lua 5.3 bytecode
3. normalize for RadioMaster MT12 / EdgeTX
4. enforce the 88,944-byte ceiling
5. audit capability retention
6. publish only passing source, normalized LUAC, hashes, and reports

The previous autonomous-agent factory, scratch queues, recovery workflows, stale generations, and model-dependent build state were intentionally removed from the active tree. They remain recoverable from Git history.
