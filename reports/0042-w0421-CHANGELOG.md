# 0042-w0421 changelog

- Family: html
- Parent: generations/accepted/0040-c0403.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 85.753
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-w0421.lua` (85801 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-w0421.luac` (89032 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. boot voice wait
- Type: parameter


- From: 90
- To: 84.82555500481976

## Validation

- Regressions: none
- Improvement: 85.753
- Lua SHA-256: `43e90c484d884450c8a8812e304678f8bd9fff0e753b225a44017fa7c4985e33`
- LUAC SHA-256: `2fd2652758ec14b06a34e0c1728ac1845061b9b876efcb1ce111eec9cfe2ba4c`
