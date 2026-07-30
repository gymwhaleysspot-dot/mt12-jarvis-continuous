# 0048-m0482 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 93.687
- Passed: false

## Download files

- Lua source: `generations/candidates/0048-m0482.lua` (85871 bytes)
- MT12 normalized LUAC: `generations/candidates/0048-m0482.luac` (89053 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Research-directed: true
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. md function rewrite
- Type: function (md)
- Variant: `meta-trend-verifier`
- Research-directed: true
- Why: Rebuild meta-learning verification with direction, magnitude and adaptive baseline speed
- From: parent implementation
- To: meta-trend-verifier

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.0009263927785282768

## Research evidence

- [A Longitudinal Vehicle Speed Estimation Method Based on Adaptive Fusion of Kalman Filter and Wheel Speed](https://doi.org/10.1109/icaace69793.2026.11508740) — Crossref
- [Fusion of GPS/OSM/DEM Data by Particle Filtering for Vehicle Attitude Estimation](https://doi.org/10.23919/icif.2018.8455730) — Crossref
- [Improved Multi-Sensor Fusion by Federated Invariant Kalman Filtering for Underwater Vehicle State Estimation](https://doi.org/10.1109/icecie66637.2025.11363791) — Crossref
- [Sensor Fusion Estimation for Omni-Directional Vehicle with Mecanum Wheel](https://doi.org/10.1109/aris59192.2023.10268507) — Crossref
- [Efficient Path Estimation via Sensor Fusion of IMU, GPS, and Wheel Encoder and Control Parameter Optimization](https://doi.org/10.1109/icac64487.2024.10851042) — Crossref
- [GPS/Odometry/Map Fusion for Vehicle Positioning Using Potential Functions](https://doi.org/10.1002/9781119876045.ch4) — Crossref

## Validation

- Regressions: none
- Improvement: 93.687
- Lua SHA-256: `b0eeac65453e2043ce2557ea7b1f8b198eba23d3802c9908941341096397fa6b`
- LUAC SHA-256: `dcf647303a1274a3ae9f6e9e972f54da23f04a4413b1615ff271d0b6ed9a2d53`
