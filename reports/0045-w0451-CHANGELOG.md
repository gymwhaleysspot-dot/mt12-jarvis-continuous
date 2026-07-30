# 0045-w0451 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 84.699
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-w0451.lua` (85822 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-w0451.luac` (89040 bytes)

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
- To: 0.0009214681262935558

## Validation

- Regressions: none
- Improvement: 84.699
- Lua SHA-256: `6f5b37e193fc7c3df686c80cf65935182f535b7aa8dd2791937f279d8b340fae`
- LUAC SHA-256: `686e97f58995255b14591bb8bcbc45c4331733158f8ac524f6548ce956a4ce79`
