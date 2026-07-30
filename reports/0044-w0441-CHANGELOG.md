# 0044-w0441 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 85.703
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-w0441.lua` (85822 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-w0441.luac` (89040 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009154722483077598

## Validation

- Regressions: none
- Improvement: 85.703
- Lua SHA-256: `81d609aabbf4d147f3cc32f4edd68f058e2fce9d8ead3dc527066e57b4899368`
- LUAC SHA-256: `9c5812358a0f0da6f8f110c95e42db3cf41f2f30af81bca0678a34f156fb0033`
