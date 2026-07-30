# 0042-t0421 changelog

- Family: tuesday
- Parent: generations/accepted/0040-c0403.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 84.706
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-t0421.lua` (85774 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-t0421.luac` (88993 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. ABS response divisor
- Type: parameter


- From: 650
- To: 707.176166961086

### 3. runaway release base
- Type: parameter


- From: 0.1
- To: 0.11694143606247964

## Validation

- Regressions: none
- Improvement: 84.706
- Lua SHA-256: `169f5b1ce9e99c001fff317fb244783b8f0abaf8e3a2682fca72de63a02eede5`
- LUAC SHA-256: `1721c7a1ce6791a416715686aea33aa3f78f0b97caccb566e90e65ad926fd32b`
