# 0047-t0472 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 2
- Simulator score: 95.872
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-t0472.lua` (85815 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-t0472.luac` (89036 bytes)

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

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.4896512213260867

### 4. ABS response divisor
- Type: parameter


- From: 650
- To: 739.3866881551221

### 5. runaway release base
- Type: parameter


- From: 0.1
- To: 0.12923067931842525

## Validation

- Regressions: none
- Improvement: 95.872
- Lua SHA-256: `9692d84190974656602878c84656a59f08b5322cb7203646f047bb128f7c08c2`
- LUAC SHA-256: `1da7b3ef6dfde40582b4c9370a0c128c820cae6998a729dc9db038a75b4d7849`
