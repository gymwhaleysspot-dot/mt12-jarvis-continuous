# 0049-w0491 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 86.301
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-w0491.lua` (85835 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-w0491.luac` (89072 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Research-directed: false
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Research-directed: true
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.000921982975957105

## Research evidence

- [A Novel Fault Tolerant Scheduling Approach with Energy Optimization for Real-Time Embedded Systems](https://doi.org/10.2139/ssrn.4891188) — Crossref
- [A Novel Fault Tolerant Scheduling Approach with Energy Optimization for Real-Time Embedded Systemss](https://doi.org/10.12785/ijcds/1571111857) — Crossref
- [Research on Optimization Method for Fault-Tolerant Integration of Real-Time Dual-Computer Embedded Systems](https://doi.org/10.2478/amns-2024-0447) — Crossref
- [Cross-Vendor Telemetry Standards for Real-Time Network Synchronization and Observability](https://doi.org/10.2139/ssrn.5976636) — Crossref
- [Multiscale Analysis of Complex Time Series: Integration of Chaos and Random Fractal Theory, and Beyond](https://www.semanticscholar.org/paper/22b6a338396622219a8bca05b607f857c90e135b) — Semantic Scholar
- [Practical Quantum Topological Data Analysis with Applications to High-Dimensional Feature Extraction and Time Series Analysis](http://arxiv.org/abs/2607.27206v1) — arXiv

## Validation

- Regressions: none
- Improvement: 86.301
- Lua SHA-256: `44dc032e62466d8937d607347492ffdfbf167c53c15467d2b5cb3ab0a2a2c27d`
- LUAC SHA-256: `c8126bb25d030e5329909af5d0f9ce783fb726293a1b6cb204839b4842a76a02`
