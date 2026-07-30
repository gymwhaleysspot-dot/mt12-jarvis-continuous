# 0044-m0442 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 93.046
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-m0442.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-m0442.luac` (88977 bytes)

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
- To: 0.0009095075763822347

## Validation

- Regressions: none
- Improvement: 93.046
- Lua SHA-256: `2f812a92219f7c23c6da8010e2ac87687a448d4fd815a40547b0b2cba4afe53a`
- LUAC SHA-256: `81bad5c0778711be091f293a3c8eb05372436a48ebae69131d8c18110d57454a`
