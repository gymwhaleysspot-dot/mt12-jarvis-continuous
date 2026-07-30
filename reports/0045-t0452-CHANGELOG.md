# 0045-t0452 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 95.453
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-t0452.lua` (85760 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-t0452.luac` (88990 bytes)

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
- To: 715.0697523902636

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.35348767681885507

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.085528007519315

## Validation

- Regressions: none
- Improvement: 95.453
- Lua SHA-256: `04f435e430f72e45ff5a7259e11a134162caca15f92b2d3d67e05cfec17efc1e`
- LUAC SHA-256: `69361babb0c1b832d1b669a5ef2a0addde5cfc1ec44160885ef2d615bcefe2af`
