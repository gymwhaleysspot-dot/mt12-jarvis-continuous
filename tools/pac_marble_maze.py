#!/usr/bin/env python3
"""Build and persist the Pac-Marble maze brain.

The maze brain is deliberately defensive: every candidate is validated before it
can become a level, and a known-good generator is always available as a fallback.
"""
import json, os, random, time
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAIN = os.path.join(ROOT, "maze-brain.json")
W = H = 28
START = (14, 26)
GHOSTS = ((13, 12), (14, 12), (15, 12))
CRITICAL = {START, (14, 25), (14, 24), *GHOSTS}

DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def blank():
    return [[1] * W for _ in range(H)]


def carve_path(g, a, b):
    x, y = a
    tx, ty = b
    while (x, y) != (tx, ty):
        if x < tx:
            x += 1
        elif x > tx:
            x -= 1
        elif y < ty:
            y += 1
        else:
            y -= 1
        g[y][x] = 0


def connected_cells(g):
    if len(g) != H or any(len(r) != W for r in g) or g[START[1]][START[0]]:
        return set()
    seen = {START}
    q = deque([START])
    while q:
        x, y = q.popleft()
        for dx, dy in DIRS:
            p = (x + dx, y + dy)
            if 0 <= p[0] < W and 0 <= p[1] < H and not g[p[1]][p[0]] and p not in seen:
                seen.add(p)
                q.append(p)
    return seen


def valid_maze(g):
    if len(g) != H or any(len(r) != W for r in g):
        return False
    if any(g[y][x] for x, y in CRITICAL):
        return False
    opens = {(x, y) for y in range(H) for x in range(W) if not g[y][x]}
    seen = connected_cells(g)
    if not opens or seen != opens:
        return False
    # Keep the outside wall intact; the game has its own tunnel/opening logic.
    if any(g[0][x] == 0 or g[H - 1][x] == 0 or g[y][0] == 0 or g[y][W - 1] == 0
           for x in range(W) for y in range(H)):
        return False
    return True


def make_maze(rng, loop_rate=0.16):
    # Odd-cell recursive backtracker. It is connected by construction.
    g = blank()
    stack = [(1, 1)]
    g[1][1] = 0
    while stack:
        x, y = stack[-1]
        choices = []
        for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
            nx, ny = x + dx, y + dy
            if 1 <= nx <= W - 2 and 1 <= ny <= H - 2 and g[ny][nx]:
                choices.append((nx, ny, dx, dy))
        if not choices:
            stack.pop()
            continue
        nx, ny, dx, dy = rng.choice(choices)
        g[y + dy // 2][x + dx // 2] = 0
        g[ny][nx] = 0
        stack.append((nx, ny))

    # Add symmetric-ish loops for a less tree-like, more arcade-style maze.
    for _ in range(int(W * H * loop_rate)):
        x = rng.randrange(1, W - 1)
        y = rng.randrange(1, H - 1)
        if g[y][x] and (
            (not g[y][x - 1] and not g[y][x + 1])
            or (not g[y - 1][x] and not g[y + 1][x])
        ):
            g[y][x] = 0

    # Connect the spawn to the ghost house with an explicit corridor.
    for p in CRITICAL:
        g[p[1]][p[0]] = 0
    carve_path(g, START, (14, 12))
    carve_path(g, (14, 12), (13, 12))
    carve_path(g, (14, 12), (15, 12))
    return g


def repair(g):
    """Return a connected, playable copy without ever deleting open cells."""
    n = [row[:] for row in g]
    for x, y in CRITICAL:
        n[y][x] = 0
    for x in range(W):
        n[0][x] = n[H - 1][x] = 1
    for y in range(H):
        n[y][0] = n[y][W - 1] = 1
    carve_path(n, START, (14, 12))

    # Reconnect every open component to the start. This makes mutations safe.
    while True:
        seen = connected_cells(n)
        opens = [(x, y) for y in range(H) for x in range(W) if not n[y][x]]
        missing = [p for p in opens if p not in seen]
        if not missing:
            break
        target = missing[0]
        source = min(seen, key=lambda p: abs(p[0] - target[0]) + abs(p[1] - target[1]))
        carve_path(n, source, target)
    return n


def stats(g):
    opens = [(x, y) for y in range(H) for x in range(W) if not g[y][x]]
    if not opens:
        return (0.0, 0.0, 1.0, 0, 0.0)
    degrees = [
        sum(0 <= x + dx < W and 0 <= y + dy < H and not g[y + dy][x + dx] for dx, dy in DIRS)
        for x, y in opens
    ]
    junction = sum(d >= 3 for d in degrees) / len(degrees)
    dead = sum(d == 1 for d in degrees) / len(degrees)
    seen = connected_cells(g)
    far = max((abs(x - 14) + abs(y - 12) for x, y in seen), default=0)
    return len(opens) / (W * H), junction, dead, far, len(seen) / len(opens)


def score(g):
    o, j, d, f, r = stats(g)
    return 100 * (r - 0.55 * abs(o - 0.50) + 0.55 * j + 0.25 * (1 - abs(d - 0.18) * 2) + min(f, 40) / 80)


def mutate(g, rng):
    n = [row[:] for row in g]
    for _ in range(rng.randint(3, 18)):
        x = rng.randrange(1, W - 1)
        y = rng.randrange(1, H - 1)
        if (x, y) in CRITICAL:
            continue
        n[y][x] = 0 if rng.random() < 0.60 else 1
    return repair(n)


def encode(g):
    return ["".join("#" if c else "." for c in row) for row in g]


def decode(level):
    if not isinstance(level, list) or len(level) != H:
        return None
    if any(not isinstance(row, str) or len(row) != W for row in level):
        return None
    if any(c not in "#." for row in level for c in row):
        return None
    return [[1 if c == "#" else 0 for c in row] for row in level]


def fallback_level(seed=0):
    return make_maze(random.Random(seed), 0.14)


def main():
    try:
        old = json.loads(open(BRAIN, encoding="utf-8").read())
    except Exception:
        old = {}

    rng = random.Random(int(time.time_ns() ^ os.getpid()))
    candidates_per_level = max(24, int(os.environ.get("PAC_MAZE_CANDIDATES", "120")))
    level_count = max(1, int(os.environ.get("PAC_MAZE_LEVELS", "12")))
    loop_rate = float(old.get("params", {}).get("loop_rate", 0.16))

    levels = []
    best_score = float(old.get("best_score", 0.0))
    for level_index in range(level_count):
        seed = rng.randrange(1, 2**63 - 1)
        base = make_maze(random.Random(seed), loop_rate)
        if not valid_maze(base):
            base = fallback_level(seed)
        pool = [base]
        for _ in range(candidates_per_level):
            parent = max(pool, key=score)
            candidate = mutate(parent, rng)
            if valid_maze(candidate):
                pool.append(candidate)
            # Never remove the known-good parent just because a mutation failed.
            pool = sorted(pool, key=score, reverse=True)[:32]
        ranked = [g for g in pool if valid_maze(g)]
        if not ranked:
            ranked = [fallback_level(seed)]
        best = max(ranked, key=score)
        if not valid_maze(best):
            raise RuntimeError(f"internal maze validation failed at level {level_index + 1}")
        best_score = max(best_score, score(best))
        levels.append(encode(best))

    brain = {
        "version": 3,
        "algorithm": "validated-evolutionary-maze-builder",
        "generation": int(old.get("generation", 0)) + 1,
        "levels_built": len(levels),
        "best_score": round(best_score, 3),
        "params": {"open_target": 0.50, "loop_rate": loop_rate, "dead_end_target": 0.18},
        "levels": levels,
        "updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    # Round-trip validation is part of the save contract.
    for level in levels:
        if not valid_maze(decode(level)):
            raise RuntimeError("maze brain validation failed after serialization")

    tmp = BRAIN + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(brain, f, separators=(",", ":"), allow_nan=False)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    with open(tmp, encoding="utf-8") as f:
        check = json.load(f)
    if check.get("version") != 3 or len(check.get("levels", [])) != level_count:
        raise RuntimeError("maze brain serialization validation failed")
    os.replace(tmp, BRAIN)
    print(f"maze generation {brain['generation']}: built {level_count} playable levels; best={best_score:.2f}")


if __name__ == "__main__":
    main()
