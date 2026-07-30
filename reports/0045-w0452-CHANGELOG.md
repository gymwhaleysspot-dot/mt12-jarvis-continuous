# 0045-w0452 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 93.483
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-w0452.lua` (85767 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-w0452.luac` (88977 bytes)

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
- To: 0.0009156409091693629

## Validation

- Regressions: none
- Improvement: 93.483
- Lua SHA-256: `a38faeb7d7b622b312af27a1873e58d36cb3b9128298b69e6fa2020fc894c6bd`
- LUAC SHA-256: `4fd5176eac9fa5cd1355e4e6014e8afda0a139b3fb5a6f5b8508bc72f7ef1f73`
