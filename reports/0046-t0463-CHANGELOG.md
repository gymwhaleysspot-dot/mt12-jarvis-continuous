# 0046-t0463 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 96.208
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-t0463.lua` (85760 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-t0463.luac` (88990 bytes)

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
- To: 709.8795581191546

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.533153101659799

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.12115425610757666

## Validation

- Regressions: none
- Improvement: 96.208
- Lua SHA-256: `a41222fa37cbc0ac9a80c195ddfcf22834ed5a2d887715f5cc5e6d7ed7e003d2`
- LUAC SHA-256: `624d6812f9d281004c2685b6adf7e6cc515d7f8182cc6282503aa1a2eb191e78`
