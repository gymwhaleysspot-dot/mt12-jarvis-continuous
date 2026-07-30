# 0044-t0441 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 86.088
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-t0441.lua` (85753 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-t0441.luac` (88981 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. ABS blend
- Type: parameter


- From: 0.42
- To: 0.36405268613272346

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 574.5131480785203

## Validation

- Regressions: none
- Improvement: 86.088
- Lua SHA-256: `72f346f8e7cd82fe443f81eb39d50f6ffa837ac5957e2b24e1272aa072306665`
- LUAC SHA-256: `d1586c989f268d5cb54562bb972701f432b12410aae1a05dacca2300f3b41a9e`
