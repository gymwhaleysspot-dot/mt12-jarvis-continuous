# 0043-t0433 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 94.115
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-t0433.lua` (85787 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-t0433.luac` (88992 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. ABS blend
- Type: parameter


- From: 0.42
- To: 0.32

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 571.7781650944729

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.06

## Validation

- Regressions: none
- Improvement: 94.115
- Lua SHA-256: `6fb3e06a4c37a9d9189bf9eb2099989d07d6efa680adf3089252194379d04782`
- LUAC SHA-256: `ad52243682b33d5cc6f8ffe5c2562033c734245fb63c900e832856c20d53afd6`
