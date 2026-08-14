#[no_mangle]
pub extern "C" fn michael_particle_budget(frame_ms: f32, scale: f32) -> u32 {
    let pressure = ((frame_ms - 16.7) / 24.0).clamp(0.0, 1.0);
    let density = (1.0 - pressure * 0.72) * scale.clamp(0.5, 2.0);
    (320.0 * density).clamp(48.0, 640.0) as u32
}
#[no_mangle]
pub extern "C" fn michael_lod_score(distance: f32, projected_pixels: f32) -> f32 {
    (projected_pixels / (1.0 + distance.max(0.0) * 0.08)).clamp(0.0, 4096.0)
}
#[no_mangle]
pub extern "C" fn michael_rust_abi() -> u32 { 1 }
