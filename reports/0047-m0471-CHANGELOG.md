# 0047-m0471 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 2
- Simulator score: 87.682
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-m0471.lua` (85779 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-m0471.luac` (89003 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009222187997692778

## Validation

- Regressions: none
- Improvement: 87.682
- Lua SHA-256: `6dc5218456531ac0b6a91597dc9b7096ba6e79e37210360b6058ff184aa67a40`
- LUAC SHA-256: `a668cfbfa6040276f3124786c272c11088ffc14c6a7c5dfd73221278c6725d0b`
