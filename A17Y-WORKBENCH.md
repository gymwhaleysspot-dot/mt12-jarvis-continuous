# A17Y Engineering Workbench

The autonomous multi-candidate factory is retired.

A17Y is the immutable protected parent. A workbench run accepts one optional child file and one narrowly scoped mission. It validates source contracts, compiles with Lua 5.3, recursively normalizes for RadioMaster MT12/EdgeTX, enforces the 87,000-byte limit, runs parent and child through the same deterministic harness, compares traces, and packages the evidence.

Promotion stages are:

1. COMPILES
2. SIMULATION PASSED
3. BENCH PASSED — manual approval
4. ROAD PASSED — manual approval

The system never overwrites `a17y.lua`, never chooses a winner automatically, and never promotes a generated child. The protected parent must match SHA-256 `340788ea2a3f4a2bffb996f52828bae957c14494e5063f5140889c80a83f23a0`.

Place experimental children under `candidates/`, then manually run **A17Y Engineering Workbench** with the child path and one exact mission. A blank child path builds and verifies the parent unchanged.
