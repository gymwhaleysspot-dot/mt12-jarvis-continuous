# 0046-w0463 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 92.076
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-w0463.lua` (85842 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-w0463.luac` (89027 bytes)

## Changes

### 1. md function rewrite
- Type: function (md)
- Variant: `meta-hysteresis-verifier`
- Why: Add hysteresis to meta-learning so one noisy sample cannot reverse a learned trend
- From: parent implementation
- To: meta-hysteresis-verifier

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009216305131522752

## Validation

- Regressions: none
- Improvement: 92.076
- Lua SHA-256: `6f5827b3a6f5f6d41f9fad8e0a00df50683e882e15e51b7851d8ab0b3da25ada`
- LUAC SHA-256: `3da2cceb9b0f99161cb7f2d01a99bc68b40d3b156193f848244f396d14a256ee`
