const instantiate = async (url, imports = {}) => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok)
        throw new Error(`${response.status} ${url}`);
    const bytes = await response.arrayBuffer();
    return WebAssembly.instantiate(bytes, imports);
};
export async function bootMichaelPolyglot(base = './generated/', cache = 'michael71') {
    const states = [];
    let cpp = null, rust = null, assembly = null, zig = null;
    let fallbackExposure = 1.18;
    try {
        const factory = (await import(`${base}michael-core.js?v=${cache}`)).default;
        cpp = await factory({ locateFile: (n) => `${base}${n}?v=${cache}` });
        cpp._michael_boot(0x7303);
        states.push({ name: 'C/C++ Wasm', ready: cpp._michael_abi() === 1 });
    }
    catch (error) {
        states.push({ name: 'C/C++ Wasm', ready: false, reason: String(error) });
    }
    for (const [name, file, set] of [['Rust Wasm', 'michael-rust.wasm', (v) => rust = v], ['AssemblyScript Wasm', 'michael-assembly.wasm', (v) => assembly = v], ['Zig Wasm', 'michael-zig.wasm', (v) => zig = v]]) {
        try {
            const v = (await instantiate(`${base}${file}?v=${cache}`)).instance.exports;
            set(v);
            states.push({ name, ready: true });
        }
        catch (error) {
            states.push({ name, ready: false, reason: String(error) });
        }
    }
    const exposure = (drive, frameMs, dt) => { if (cpp)
        return cpp._michael_visual_tick(drive ? 1 : 0, frameMs, dt); const target = (drive ? 1.10 : 1.22) - Math.max(0, Math.min(1, (frameMs - 16.7) / 24)) * .06; fallbackExposure += (target - fallbackExposure) * (1 - Math.exp(-4.5 * Math.min(.1, dt))); return fallbackExposure; };
    const particleBudget = (frameMs, scale) => rust?.michael_particle_budget ? Number(rust.michael_particle_budget(frameMs, scale)) : Math.max(48, Math.min(640, 320 * (1 - Math.max(0, Math.min(1, (frameMs - 16.7) / 24)) * .72) * Math.max(.5, Math.min(2, scale))));
    const quality = (frameMs, scale) => assembly?.michaelQualityScore ? Number(assembly.michaelQualityScore(frameMs, scale)) : Math.max(0, 1 - Math.max(0, frameMs - 16.7) / 33.3) * .72 + Math.min(1, scale / 1.5) * .28;
    // Keep every named view composed to the same physical framing model on portrait phones.
    const cameraPreset = (view, aspect) => { const portrait = Math.max(0, Math.min(1, (1 - Math.max(.45, Math.min(1.8, aspect))) / .55)), fit = 1 + portrait * .055, presets = { front: [0, .055, 11.78, .80], three: [-.72, .115, 12.02, .81], side: [-Math.PI / 2, .055, 12.92, .77], rear: [Math.PI, .055, 11.78, .80], top: [-.42, .895, 15.35, .73] }, p = presets[view] || presets.three; return { yaw: p[0], pitch: p[1], distance: p[2] * fit, targetY: p[3] }; };
    void zig;
    const api = { abi: 1, states, exposure, particleBudget, quality, cameraPreset };
    globalThis.__MICHAEL_POLYGLOT = api;
    return api;
}
