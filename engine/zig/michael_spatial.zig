fn clamp(value: f32, low: f32, high: f32) f32 { return @max(low, @min(high, value)); }
export fn michael_visibility_score(distance: f32, radius: f32, projected_pixels: f32) f32 {
    return clamp(projected_pixels * @max(radius, 0.01) / (1.0 + @max(distance, 0.0)), 0.0, 4096.0);
}
export fn michael_spatial_hash(x: i32, y: i32, z: i32) u32 {
    const ux:u32=@bitCast(x); const uy:u32=@bitCast(y); const uz:u32=@bitCast(z);
    return (ux*%73856093) ^ (uy*%19349663) ^ (uz*%83492791);
}
export fn michael_zig_abi() u32 { return 1; }
