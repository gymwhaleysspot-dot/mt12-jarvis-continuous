# 0047-m0473 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 2
- Simulator score: 94.494
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-m0473.lua` (85814 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-m0473.luac` (89013 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009110475477086077

## Validation

- Regressions: none
- Improvement: 94.494
- Lua SHA-256: `85ba3133c5b79b9b576e994e55b0179a7bee86564cfca18eecc6a6d0c55898e0`
- LUAC SHA-256: `45c3bfc7b65300db1b235851d3b81d800f350899245005703de2bbebc1901517`
