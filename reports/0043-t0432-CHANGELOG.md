# 0043-t0432 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 94.059
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-t0432.lua` (85814 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-t0432.luac` (89059 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. ABS blend
- Type: parameter


- From: 0.42
- To: 0.49373333135107533

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 740.9813459564466

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.08209992335177958

## Validation

- Regressions: none
- Improvement: 94.059
- Lua SHA-256: `0f8cd7e93914d0f3b6eac3eef095790ebe1db9803beaaecd95b3f1a1c308b7ed`
- LUAC SHA-256: `b6d90ffea4d62191a127084c42a38a827e350c1166a8676e03442535cbb075b3`
