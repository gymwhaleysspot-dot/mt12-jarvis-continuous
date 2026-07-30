# 0049-m0493 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 95.453
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-m0493.lua` (85834 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-m0493.luac` (89066 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Research-directed: true
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Research-directed: true
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.0009123757403942827

## Research evidence

- [A Longitudinal Vehicle Speed Estimation Method Based on Adaptive Fusion of Kalman Filter and Wheel Speed](https://doi.org/10.1109/icaace69793.2026.11508740) — Crossref
- [Fusion of GPS/OSM/DEM Data by Particle Filtering for Vehicle Attitude Estimation](https://doi.org/10.23919/icif.2018.8455730) — Crossref
- [Improved Multi-Sensor Fusion by Federated Invariant Kalman Filtering for Underwater Vehicle State Estimation](https://doi.org/10.1109/icecie66637.2025.11363791) — Crossref
- [Sensor Fusion Estimation for Omni-Directional Vehicle with Mecanum Wheel](https://doi.org/10.1109/aris59192.2023.10268507) — Crossref
- [Efficient Path Estimation via Sensor Fusion of IMU, GPS, and Wheel Encoder and Control Parameter Optimization](https://doi.org/10.1109/icac64487.2024.10851042) — Crossref
- [GPS/Odometry/Map Fusion for Vehicle Positioning Using Potential Functions](https://doi.org/10.1002/9781119876045.ch4) — Crossref

## Validation

- Regressions: none
- Improvement: 95.453
- Lua SHA-256: `66629fcac94715a09df7fbfea68b4e8dd8984ba5b801b2fd9f4fcdf07487bb1b`
- LUAC SHA-256: `c383ca5b19811d7273e3325f050e2334b0fa8582d147016a08ed518c3c3f4123`
