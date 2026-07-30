# 0047-m0472 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 2
- Simulator score: 94.859
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-m0472.lua` (85833 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-m0472.luac` (89072 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009246913094378822

## Validation

- Regressions: none
- Improvement: 94.859
- Lua SHA-256: `8b55134e734799889532117f3e1470a72954a61324dd1ee8ac23faeec051758a`
- LUAC SHA-256: `343f78de5c92be8b3f5960f751265b22410ae0df740146dc0ad4432d8a9b1108`
