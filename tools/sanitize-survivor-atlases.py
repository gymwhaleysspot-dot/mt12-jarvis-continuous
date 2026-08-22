#!/usr/bin/env python3
"""Repack 4x4 Survivor atlases without detached neighboring-cell fragments."""
from pathlib import Path
import re
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "jarvis/assets/survivor"
RUNTIME = ROOT / "survivor-runtime323.html"
OUT = ASSETS / "sanitized"


def active_atlases():
    text = RUNTIME.read_text()
    hero = re.search(r"const HERO_ATLASES=(\[[^;]+\]);", text)
    rivals = re.search(r"const RIVAL_ATLASES=\{([^;]+)\};", text)
    if not hero or not rivals:
        raise SystemExit("active atlas tables not found")
    paths = re.findall(r"'([^']+atlas[^']+\.webp)'", hero.group(1))
    paths += re.findall(r":'([^']+atlas[^']+\.webp)'", rivals.group(1))
    return list(dict.fromkeys(paths))


def clean_cell(cell):
    rgba = np.asarray(cell).copy()
    alpha = rgba[:, :, 3]
    opaque = alpha > 32
    core = ndimage.binary_opening(opaque, iterations=1)
    labels, count = ndimage.label(core)
    if not count:
        return cell, {"removed": 0, "components": 0}
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    main_id = int(sizes.argmax())
    main = labels == main_id
    keep = ndimage.binary_dilation(main, iterations=3) & (alpha > 0)
    removed = int(np.count_nonzero((alpha > 20) & ~keep))
    rgba[~keep] = 0
    return Image.fromarray(rgba, "RGBA"), {"removed": removed, "components": count}


def sanitize(relative):
    source = ASSETS / relative
    image = Image.open(source).convert("RGBA")
    if image.size != (1280, 1280):
        raise ValueError(f"{relative}: expected 1280x1280, got {image.size}")
    output = Image.new("RGBA", image.size)
    removed = components = 0
    for frame in range(16):
        col, row = frame % 4, frame // 4
        box = (col * 320, row * 320, (col + 1) * 320, (row + 1) * 320)
        cell, stats = clean_cell(image.crop(box))
        output.paste(cell, box[:2])
        removed += stats["removed"]
        components += stats["components"]
    target = OUT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    output.save(target, "WEBP", quality=90, method=6, exact=True)
    return relative, removed, components, target.stat().st_size


def main():
    results = [sanitize(path) for path in active_atlases()]
    for relative, removed, components, size in results:
        print(f"{relative}\tremoved={removed}\tcomponents={components}\tbytes={size}")
    print(f"SANITIZED {len(results)} atlases")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"atlas sanitation failed: {exc}", file=sys.stderr)
        raise
