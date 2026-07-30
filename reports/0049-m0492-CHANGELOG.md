# 0049-m0492 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 93.693
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-m0492.lua` (85908 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-m0492.luac` (89122 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Research-directed: true
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. md function rewrite
- Type: function (md)
- Variant: `meta-hysteresis-verifier`
- Research-directed: true
- Why: Add hysteresis to meta-learning so one noisy sample cannot reverse a learned trend
- From: parent implementation
- To: meta-hysteresis-verifier

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.0009113663367236778

## Research evidence

- [A Longitudinal Vehicle Speed Estimation Method Based on Adaptive Fusion of Kalman Filter and Wheel Speed](https://doi.org/10.1109/icaace69793.2026.11508740) — Crossref
- [Fusion of GPS/OSM/DEM Data by Particle Filtering for Vehicle Attitude Estimation](https://doi.org/10.23919/icif.2018.8455730) — Crossref
- [Improved Multi-Sensor Fusion by Federated Invariant Kalman Filtering for Underwater Vehicle State Estimation](https://doi.org/10.1109/icecie66637.2025.11363791) — Crossref
- [Sensor Fusion Estimation for Omni-Directional Vehicle with Mecanum Wheel](https://doi.org/10.1109/aris59192.2023.10268507) — Crossref
- [Efficient Path Estimation via Sensor Fusion of IMU, GPS, and Wheel Encoder and Control Parameter Optimization](https://doi.org/10.1109/icac64487.2024.10851042) — Crossref
- [GPS/Odometry/Map Fusion for Vehicle Positioning Using Potential Functions](https://doi.org/10.1002/9781119876045.ch4) — Crossref

## Validation

- Regressions: none
- Improvement: 93.693
- Lua SHA-256: `c1429ebc0fb97bbfec21b034db4ed97da7f2d9b81f35f20b44a6a3301499a8b1`
- LUAC SHA-256: `7225612d63d6b59f71cc3333458f3b4e7ecca2786fa5fbcef1cc2fa22647c3bb`
