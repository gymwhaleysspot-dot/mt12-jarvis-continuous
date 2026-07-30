# 0043-c0431 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 85.55
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-c0431.lua` (85840 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-c0431.luac` (89027 bytes)

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
- To: 0.0009161297282672534

## Validation

- Regressions: none
- Improvement: 85.55
- Lua SHA-256: `1b542ddfa770475c0864de4f88912f89b5dc8d5fdc3f20d0854ad08fa8947495`
- LUAC SHA-256: `d5fc3c3ec105cfcf84d705d189e8543cb996eea8dcb2a01b0ce56cd44ba68a8f`
