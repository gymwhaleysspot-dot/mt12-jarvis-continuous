# 0047-c0472 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 2
- Simulator score: 92.636
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-c0472.lua` (85875 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-c0472.luac` (89102 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009137440060460987

## Validation

- Regressions: none
- Improvement: 92.636
- Lua SHA-256: `7897066fb11622bad0bfadcd5a2fb776fb209323aa2d118c9beeb2e8fd049c5e`
- LUAC SHA-256: `c1d2436a77ca8c032327de9516a8b413fb996dce15925178ccd2e7fe91889a72`
