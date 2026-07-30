# 0046-t0462 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 94.114
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-t0462.lua` (85807 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-t0462.luac` (89030 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 2. runaway release base
- Type: parameter


- From: 0.1
- To: 0.07933047128200997

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.3348965788423084

### 4. ABS response divisor
- Type: parameter


- From: 650
- To: 568.0387714011595

## Validation

- Regressions: none
- Improvement: 94.114
- Lua SHA-256: `5989e3f07f93f903e2c6316dc611436fcd8d47efa33073341b2034f4aa3c43b8`
- LUAC SHA-256: `f8b3a4129d69ce4e8523a8a73b5cc307e64665d93561d3242c6a490fa3885667`
