# 0043-m0432 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 94.189
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-m0432.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-m0432.luac` (88977 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.000912342651495738

## Validation

- Regressions: none
- Improvement: 94.189
- Lua SHA-256: `1ea5bff2e93413cab89243a72124da4d33bdb51c9879cebedeb6b54f0f1e0f03`
- LUAC SHA-256: `9d7fc0b0e42d23078125ad94008d3ffc95d90a6852fb228fc00251e46b058966`
