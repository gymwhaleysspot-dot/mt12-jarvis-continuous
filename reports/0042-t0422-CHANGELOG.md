# 0042-t0422 changelog

- Family: tuesday
- Parent: generations/accepted/0040-c0403.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 94.938
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-t0422.lua` (85739 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-t0422.luac` (88982 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. ABS response divisor
- Type: parameter


- From: 650
- To: 555.6734373364598

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.3411192601122893

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.06486426884424873

## Validation

- Regressions: none
- Improvement: 94.938
- Lua SHA-256: `71c47da9da8b8d72984046bec2992a883f50ce8ded910baffab5cd4f9509d5bf`
- LUAC SHA-256: `e6738f31046d807bccf958faf7ccefc30da5ee0bd4efe17bf415e6dc485da50b`
