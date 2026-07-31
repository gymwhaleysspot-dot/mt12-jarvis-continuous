#!/usr/bin/env python3
"""MT12 AI Build Factory

Single-file build, audit, compile, normalize, compare, and release pipeline for
EdgeTX Lua 5.3 scripts targeting RadioMaster MT12.
"""
from __future__ import annotations
import argparse, hashlib, html, json, os, re, shutil, subprocess, sys, tempfile
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

DEFAULT_LIMIT = 88944

@dataclass
class Finding:
    level: str
    code: str
    message: str
    detail: str = ""

@dataclass
class BuildResult:
    release: str
    source: str
    source_bytes: int
    luac_bytes: int
    limit: int
    margin: int
    source_sha256: str
    luac_sha256: str
    findings: list[dict]
    telemetry_writes: list[int]
    telemetry_reads: list[int]
    persistence_slots: list[int]
    status: str


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    p = subprocess.run(cmd, cwd=str(cwd) if cwd else None, text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if p.returncode:
        raise RuntimeError(f"Command failed ({p.returncode}): {' '.join(cmd)}\n{p.stdout}")
    return p


def lua_indices(src: str, name: str) -> tuple[set[int], set[int]]:
    writes, reads = set(), set()
    patt = re.compile(rf"\b{name}\s*\[\s*(\d+)\s*\]")
    for m in patt.finditer(src):
        idx = int(m.group(1))
        tail = src[m.end():m.end()+40]
        if re.match(r"\s*=", tail): writes.add(idx)
        else: reads.add(idx)
    return writes, reads


def persistence_slots(src: str) -> set[int]:
    return {int(x) for x in re.findall(r"\bvs\s*\(\s*(\d+)", src)}


def audit_source(src: str, baseline_src: str | None = None) -> tuple[list[Finding], dict]:
    f: list[Finding] = []
    vw, vr = lua_indices(src, 'V')
    slots = persistence_slots(src)

    if 'fileHandle:read' in src or re.search(r"\w+\s*:\s*read\s*\(", src):
        f.append(Finding('ERROR','IO_METHOD','MT12-incompatible method-style file read found',
                         'Use io.read(fileHandle, ...) for the proven MT12 path.'))
    if re.search(r"\bTCA\b", src) and re.search(r"TCA[^\n]{0,80}(?:100|/100)", src):
        f.append(Finding('WARN','TCA_SCALE','Possible 0–100 TCA scaling detected',
                         'TCA/GV pass-through must preserve the 0–1024 contract.'))
    if 'collectgarbage' in src:
        f.append(Finding('WARN','GC_CALL','Explicit collectgarbage call found',
                         'May create timing spikes on EdgeTX.'))
    if re.search(r"io\.open", src) and not re.search(r"car|arm|connected|V\[", src, re.I):
        f.append(Finding('WARN','LOGGER_GATE','File I/O found without an obvious car-on gate.'))

    write_only = sorted(vw - vr)
    read_never_written = sorted(vr - vw)
    if read_never_written:
        f.append(Finding('WARN','UNWRITTEN_TELEMETRY',
                         f'{len(read_never_written)} V fields are read but never directly written',
                         ', '.join(map(str, read_never_written[:40]))))

    counts = {s: len(re.findall(rf"\bvs\s*\(\s*{s}\b", src)) for s in slots}
    suspicious = sorted(s for s,c in counts.items() if c > 4)
    if suspicious:
        f.append(Finding('WARN','PERSISTENCE_REUSE','Heavily reused persistence slots detected',
                         ', '.join(map(str,suspicious))))

    removed_writes = []
    removed_slots = []
    if baseline_src is not None:
        bw, br = lua_indices(baseline_src, 'V')
        bs = persistence_slots(baseline_src)
        removed_writes = sorted(bw - vw)
        removed_slots = sorted(bs - slots)
        if removed_writes:
            f.append(Finding('WARN','REMOVED_TELEMETRY',
                             f'{len(removed_writes)} baseline V writes disappeared',
                             ', '.join(map(str, removed_writes[:60]))))
        if removed_slots:
            f.append(Finding('INFO','REMOVED_PERSISTENCE_SLOTS',
                             f'{len(removed_slots)} baseline persistence slots disappeared',
                             ', '.join(map(str, removed_slots))))

    required = {
        'car-off guard': [r'car', r'(?:off|connected|arm)'],
        'TC authority': [r'TC|tc', r'cut|auth|cap'],
        'ABS logic': [r'ABS|abs'],
        'dashboard': [r'LCD|lcd|drawText|drawGauge'],
        'memory save/load': [r'wrmem|memory|mem'],
    }
    for label, patterns in required.items():
        if not all(re.search(p, src, re.I) for p in patterns):
            f.append(Finding('WARN','MISSING_SIGNATURE',f'Could not confirm {label} from source signatures.'))

    meta = dict(vw=sorted(vw), vr=sorted(vr), slots=sorted(slots),
                write_only=write_only, removed_writes=removed_writes,
                removed_slots=removed_slots)
    return f, meta


def compile_lua(source: Path, raw: Path, normalized: Path, normalizer: Path) -> None:
    luatex = shutil.which('luatex')
    if not luatex:
        raise RuntimeError('luatex not found; Lua 5.3 bytecode compiler unavailable.')
    node = shutil.which('node')
    if not node:
        raise RuntimeError('node not found; MT12 normalizer unavailable.')
    with tempfile.TemporaryDirectory(prefix='mt12factory-') as td:
        dumper = Path(td)/'dump.lua'
        srcq, outq = json.dumps(str(source)), json.dumps(str(raw))
        dumper.write_text(
            f"local f,e=loadfile({srcq});if not f then error(e) end;"
            f"local o=assert(io.open({outq},'wb'));o:write(string.dump(f,true));o:close()\n",
            encoding='utf-8')
        run([luatex,'--luaonly',str(dumper)])
    run([node,str(normalizer),str(raw),str(normalized)])


def html_report(r: BuildResult) -> str:
    findings = ''.join(
        f"<tr class='{x['level'].lower()}'><td>{html.escape(x['level'])}</td>"
        f"<td>{html.escape(x['code'])}</td><td>{html.escape(x['message'])}</td>"
        f"<td>{html.escape(x.get('detail',''))}</td></tr>" for x in r.findings)
    return f'''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>{html.escape(r.release)} build report</title>
<style>body{{font:16px system-ui;margin:24px;max-width:1100px}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}}.c{{border:1px solid #bbb;border-radius:12px;padding:14px}}table{{border-collapse:collapse;width:100%;margin-top:20px}}td,th{{border:1px solid #bbb;padding:8px;text-align:left}}.error{{background:#ffd8d8}}.warn{{background:#fff0c2}}.info{{background:#e7f1ff}}code{{word-break:break-all}}</style>
<h1>{html.escape(r.release)} — {html.escape(r.status)}</h1>
<div class="cards"><div class="c"><b>Normalized LUAC</b><br>{r.luac_bytes:,} bytes</div><div class="c"><b>Limit</b><br>{r.limit:,}</div><div class="c"><b>Margin</b><br>{r.margin:,}</div><div class="c"><b>Source</b><br>{r.source_bytes:,} bytes</div></div>
<p><b>Source SHA-256:</b> <code>{r.source_sha256}</code><br><b>LUAC SHA-256:</b> <code>{r.luac_sha256}</code></p>
<h2>Audit findings</h2><table><tr><th>Level</th><th>Code</th><th>Finding</th><th>Detail</th></tr>{findings or '<tr><td colspan=4>No findings</td></tr>'}</table>
<h2>Interface inventory</h2><p><b>V writes:</b> {', '.join(map(str,r.telemetry_writes))}</p><p><b>V reads:</b> {', '.join(map(str,r.telemetry_reads))}</p><p><b>Persistence slots:</b> {', '.join(map(str,r.persistence_slots))}</p>'''


def main() -> int:
    ap = argparse.ArgumentParser(description='Build and audit MT12 EdgeTX Lua releases.')
    ap.add_argument('source', type=Path)
    ap.add_argument('--release', required=True, help='Release name, e.g. a15yb')
    ap.add_argument('--baseline', type=Path)
    ap.add_argument('--out', type=Path, default=Path('factory_out'))
    ap.add_argument('--limit', type=int, default=DEFAULT_LIMIT)
    ap.add_argument('--normalizer', type=Path, default=Path(__file__).with_name('normalize_luac53_mt12.js'))
    ap.add_argument('--strict', action='store_true', help='Fail on warnings as well as errors.')
    args = ap.parse_args()

    source = args.source.resolve()
    if not source.is_file(): raise SystemExit(f'Source not found: {source}')
    baseline_text = args.baseline.read_text(errors='replace') if args.baseline else None
    src = source.read_text(errors='replace')
    findings, meta = audit_source(src, baseline_text)

    out = args.out.resolve(); out.mkdir(parents=True, exist_ok=True)
    release_src = out/f'{args.release}.lua'
    raw = out/f'{args.release}_raw.luac'
    luac = out/f'{args.release}.luac'
    shutil.copy2(source, release_src)
    compile_lua(release_src, raw, luac, args.normalizer.resolve())

    margin = args.limit - luac.stat().st_size
    if margin < 0:
        findings.append(Finding('ERROR','SIZE_LIMIT',f'Normalized bytecode exceeds limit by {-margin} bytes.'))
    elif margin < 300:
        findings.append(Finding('WARN','LOW_MARGIN',f'Only {margin} bytes remain below the normalized limit.'))

    errors = any(x.level == 'ERROR' for x in findings)
    warnings = any(x.level == 'WARN' for x in findings)
    status = 'FAIL' if errors or (args.strict and warnings) else ('PASS WITH WARNINGS' if warnings else 'PASS')
    result = BuildResult(args.release, str(release_src), release_src.stat().st_size,
                         luac.stat().st_size, args.limit, margin, sha256(release_src), sha256(luac),
                         [asdict(x) for x in findings], meta['vw'], meta['vr'], meta['slots'], status)
    (out/f'{args.release}_report.json').write_text(json.dumps(asdict(result),indent=2),encoding='utf-8')
    (out/f'{args.release}_report.html').write_text(html_report(result),encoding='utf-8')
    (out/f'{args.release}_interface.json').write_text(json.dumps({
        'release': args.release, 'telemetry_writes': meta['vw'], 'telemetry_reads': meta['vr'],
        'persistence_slots': meta['slots'], 'write_only': meta['write_only']},indent=2),encoding='utf-8')
    print(json.dumps(asdict(result), indent=2))
    return 1 if status == 'FAIL' else 0

if __name__ == '__main__':
    raise SystemExit(main())
