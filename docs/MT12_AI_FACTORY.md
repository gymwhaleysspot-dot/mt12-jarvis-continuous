# MT12 AI Build Factory

This factory turns a Lua source into a reproducible MT12 release and audits the interfaces most likely to regress during aggressive compression.

## Run

```bash
python3 tools/mt12_factory.py a15ya.lua --release a15yb \
  --baseline a15xz.lua --out build/a15yb \
  --normalizer toolchain/normalize_luac53_mt12.js
```

Outputs:

- normalized deployable `a15yb.luac`
- matching `a15yb.lua`
- raw Lua 5.3 bytecode
- HTML build report
- JSON build report
- telemetry/persistence interface manifest

## Gates

The factory checks compilation, MT12 normalization, byte ceiling, hashes, removed telemetry compared with a baseline, persistence-slot changes, unsafe file-read syntax, suspicious TCA scaling, explicit garbage collection, and key system signatures.

Use `--strict` to make warnings fail the build.

## Toolchain

The script uses the proven workflow:

1. `luatex --luaonly` and `string.dump(..., true)` for stripped Lua 5.3 bytecode.
2. `normalize_luac53_mt12.js` for MT12 normalization.
3. Only the final normalized `.luac` is the deploy file.

## Factory role

This is the first automated gate for the MT12 AI engineering pipeline. It creates reproducible releases, compares them with a known baseline, inventories telemetry and persistence interfaces, and produces machine-readable manifests that later dashboard, viewer, simulation, and GitHub Actions stages can consume.
