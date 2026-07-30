# 0044-w0443 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 94.582
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-w0443.lua` (85767 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-w0443.luac` (88977 bytes)

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
- To: 0.000920540654658298

## Validation

- Regressions: none
- Improvement: 94.582
- Lua SHA-256: `280dc9b2c47bc0503c1a4b38593733de9f7de0f7017487a707672ba4237ef943`
- LUAC SHA-256: `2015fe2433698796ba60fb5d51f405655ff7ad36253a53c46edfa59b2beefc1c`
