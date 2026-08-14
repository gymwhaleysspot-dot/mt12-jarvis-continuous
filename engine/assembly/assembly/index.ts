export function michaelQualityScore(frameMs: f32, gpuScale: f32): f32 {
  const timing: f32 = Mathf.max(0.0, 1.0 - Mathf.max(0.0, frameMs - 16.7) / 33.3);
  const resolution: f32 = Mathf.min(1.0, gpuScale / 1.5);
  return timing * 0.72 + resolution * 0.28;
}
export function michaelAssemblyAbi(): i32 { return 1; }
