# 0047-w0472 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 2
- Simulator score: 95.011
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-w0472.lua` (85822 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-w0472.luac` (89033 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009202378078455385

## Validation

- Regressions: none
- Improvement: 95.011
- Lua SHA-256: `472681cad8bb4788f82796d0940eafb4c184085ec67412c977769dc01fdd14dc`
- LUAC SHA-256: `6c39ca910de689ad71ee96cabc2c6f127c97368f051ff9272ebcac8a5c255694`
