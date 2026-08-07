# Jarvis Release Forge

Jarvis controller builds use an A17YA-grade release contract instead of emitting an unverified Lua file.

## Required output

Every successful forge run produces:

- `<release>.lua` — complete source used for the build.
- `<release>.luac` — stripped Lua 5.3 bytecode normalized for the RadioMaster MT12. This is the only deploy file.
- `<RELEASE>_BUILD_AUDIT.txt` — parent lineage, compile/normalization status, contract checks, size/headroom, hashes and hardware-test status.
- `SHA256SUMS.txt` — source and deploy hashes.
- `MANIFEST.json` — machine-readable release identity and validation results.
- `<release>_MT12_BUILD.zip` — the complete archival package.

The temporary desktop/raw bytecode is deleted before packaging so it cannot be mistaken for the MT12 deploy file.

## Hard gates

The default defended-controller contract enforces:

- Lua 5.3 parse and stripped compile.
- MT12 normalization with byte-size fields `04 04 04 04 04`.
- Normalized bytecode no larger than 87,000 bytes.
- MT12-compatible global file-handle reads (`io.read(fileHandle, ...)`); method-style `:read(...)` is rejected.
- A17Y causal `evo()`/`superBrain()` state, including `X[41]`-`X[43]`, `X[46]`, `V[179]*.0045`, and `V[704]`.
- A17YA protected EdgeTX API/GVar wrappers.
- Dual-file `/LOGS/m0` + `/LOGS/m1` memory persistence.
- Active `memOpt()` and `watch()` defenses.
- TCT/GV7 fail-safe target of 1024.
- Final authority ceiling at the GVar output; the flat `setgv(3,V[35])` path is rejected.
- When a parent source is supplied, every named `local function` in the parent must still exist in the candidate.

These are release-structure and regression gates, not a substitute for physical MT12/car testing. The manifest and audit always carry the supplied hardware-test status.

## Run manually

Open **Actions → Jarvis Release Forge → Run workflow** and provide:

- `source`: candidate Lua path in the repository.
- `release`: new short release name.
- `parent`: previous source path when lineage preservation must be checked.
- `size_limit`: normally `87000` and never allowed above it.
- `hardware_status`: leave `NOT_HARDWARE_TESTED` until physical validation is complete.

The workflow can also be called from other Jarvis workflows with `workflow_call`, so controller-generation jobs can feed candidates directly into the same forge instead of maintaining separate packaging logic.

## Local command

```bash
python3 tools/jarvis_release.py \
  --source path/to/candidate.lua \
  --release a17yb \
  --parent path/to/a17ya.lua \
  --limit 87000
```

For contract-only validation without a Lua compiler:

```bash
python3 tools/jarvis_release.py --source a17ya.lua --release test1 --parent a17ya.lua --static-only
```
