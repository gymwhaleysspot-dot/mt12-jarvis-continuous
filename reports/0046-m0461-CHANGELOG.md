# 0046-m0461 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 86.517
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-m0461.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-m0461.luac` (88977 bytes)

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
- To: 0.0009131688461938571

## Validation

- Regressions: none
- Improvement: 86.517
- Lua SHA-256: `5b6c36bafd46d24da2b9b3bd80b4f7286c9d0c3de8888dd9f14c31b73d4ad148`
- LUAC SHA-256: `fa658bb49266ee413bad43ae49623a00dcba80e6dffc88cb1d9d949b392f0ce9`
