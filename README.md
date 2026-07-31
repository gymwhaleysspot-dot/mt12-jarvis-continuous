# MT12 YA Forge

A clean deterministic factory for the RadioMaster MT12 / EdgeTX A15YA lineage.

## Golden baseline

`baseline/a15ya.lua` and its normalized bytecode are the preserved reference contract. No subsystem may be removed, simplified, weakened, or bypassed merely to save memory.

## Candidate lane

`candidate/a15yb.lua` is the active evolution source. Every candidate passes one fixed pipeline:

1. Lua 5.3 syntax validation
2. stripped Lua 5.3 compilation
3. proven MT12 4/4/4/4/4 bytecode normalization
4. 88,944-byte hard ceiling
5. behavior-contract audit
6. SHA-256 generation
7. packaged GitHub Actions artifact

## Run the factory

Use **Actions → MT12 YA Forge → Run workflow**. The optional `web/index.html` page provides the same one-button dispatch using your GitHub token.

The factory has no GitHub Models dependency, no scratch queue, no competing recovery workflow, and no background agent state. A build either passes every hard gate and publishes an artifact or fails visibly.

Only the final normalized `.luac` is deployable to the MT12.
