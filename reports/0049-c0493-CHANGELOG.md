# 0049-c0493 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 95.152
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-c0493.lua` (85835 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-c0493.luac` (89066 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Research-directed: false
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Research-directed: true
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.0009151522285338072

## Research evidence

- [A Dynamic Content Safety Policy Updating Framework Based on Online Learning and Concept Drift Adaptation](https://doi.org/10.1109/mlise70044.2026.11607660) — Crossref
- [Learning Calibration Functions on the Fly: Hybrid Batch Online Stacking Ensembles for the Calibration of Low-Cost Air Quality Sensor Networks in the Presence of Concept Drift](https://doi.org/10.3390/atmos13030416) — Crossref
- [Drift Calibration for Machine Olfaction with an Online Active Learning Approach](https://doi.org/10.1109/icsai.2018.8599390) — Crossref
- [Tackling Concept Drift and Class Imbalance: An F1-Driven Parameter-Efficient Online Learning Framework](https://doi.org/10.2139/ssrn.7070383) — Crossref
- [Learning to Extrapolate and Adjust: Two-Stage Meta-Learning for Concept Drift in Online Time Series Forecasting](https://doi.org/10.24963/ijcai.2024/542) — Crossref
- [Intrusion Detection based on Concept Drift Detection &amp; Online Incremental Learning](https://doi.org/10.21203/rs.3.rs-3692862/v1) — Crossref

## Validation

- Regressions: none
- Improvement: 95.152
- Lua SHA-256: `f4e31e9de51dad131a4afdb8d8b8860dfccad705c8a223907b8ce0e821a7805d`
- LUAC SHA-256: `ce8af14b05ff51c1aa1c7c02d4a90ec63a2ad53ff818d2a8600dbef0d124d3ee`
