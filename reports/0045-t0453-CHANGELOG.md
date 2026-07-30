# 0045-t0453 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 94.54
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-t0453.lua` (85760 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-t0453.luac` (88990 bytes)

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
- To: 524.2306287252111

### 3. runaway release base
- Type: parameter


- From: 0.1
- To: 0.13989952309316142

### 4. ABS blend
- Type: parameter


- From: 0.42
- To: 0.5348652429426088

## Validation

- Regressions: none
- Improvement: 94.54
- Lua SHA-256: `4dc8b01a574d7b879699155cb4fc5830e857950ac703ccedf45e4986f2869a8a`
- LUAC SHA-256: `592d12775786becbf21b3b6b81b2f3f41a85a48b3a82d584aaae1e2b7efa8f3d`
