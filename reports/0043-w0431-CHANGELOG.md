# 0043-w0431 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 84.946
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-w0431.lua` (85808 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-w0431.luac` (89007 bytes)

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
- To: 0.0009221778087818343

## Validation

- Regressions: none
- Improvement: 84.946
- Lua SHA-256: `63d9967d0fbcb438e2083f2cfabaacf2c23623a4c50727adb026524291aeea18`
- LUAC SHA-256: `572bd960b5362ac67a0c2a680220a3f1da0daa4645b6bfab58649501f7c99f9c`
