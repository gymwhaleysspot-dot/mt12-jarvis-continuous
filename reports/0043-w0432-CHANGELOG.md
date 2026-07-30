# 0043-w0432 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 92.617
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-w0432.lua` (85808 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-w0432.luac` (89007 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009160239499308216

## Validation

- Regressions: none
- Improvement: 92.617
- Lua SHA-256: `a886751175d5f957a10665683bd4781599811fea57420f42f67e5ea58b5ec4fb`
- LUAC SHA-256: `2dc9a93536c91064d911a58f265e2d670cbc44f5f37c86d9e9ab3c9d0660cc8a`
