# 0046-t0461 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 87.916
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-t0461.lua` (85759 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-t0461.luac` (88991 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. runaway release base
- Type: parameter


- From: 0.1
- To: 0.08364910117365071

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 723.7978121443884

## Validation

- Regressions: none
- Improvement: 87.916
- Lua SHA-256: `0df42fb808318fe8276ba9f055fd8ee86c13a87acfc3c49b0c89cb3f3c174ac1`
- LUAC SHA-256: `57ce487d5cd936397a66f66fb73e499d15a530bb8d53c7d9184e40537f65b6f0`
