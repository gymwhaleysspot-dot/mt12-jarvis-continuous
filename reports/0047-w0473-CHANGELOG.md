# 0047-w0473 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 2
- Simulator score: 94.23
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-w0473.lua` (85903 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-w0473.luac` (89093 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 2. md function rewrite
- Type: function (md)
- Variant: `meta-hysteresis-verifier`
- Why: Add hysteresis to meta-learning so one noisy sample cannot reverse a learned trend
- From: parent implementation
- To: meta-hysteresis-verifier

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009161946570943156

## Validation

- Regressions: none
- Improvement: 94.23
- Lua SHA-256: `abb1c9fbd26d7788e7f0f33257e45f77854d0e96d9ae428c64b7019667c04627`
- LUAC SHA-256: `e36d06e3bc2f3b844af8c2c350b0ec9fed921042179ef155d870e78806a06d07`
