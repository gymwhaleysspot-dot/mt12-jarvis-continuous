#!/usr/bin/env python3
"""Persistent Pac-Marble maze builder.

Builds only rectangular, connected 28x28 mazes and persists 12 playable
levels. Invalid legacy maze-brain data is ignored rather than poisoning the
next generation.
"""
import json
import os
import random
import time
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAIN = os.path.join(ROOT, "maze-brain.json")
W = H = 28
START = (14, 26)
GHOST_CELLS = {(13, 12), (14, 12), (15, 12)}
CRITICAL = GHOST_CELLS | {(14, 24), (14, 25), START}
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def carve_to(g, a, b):
    x, y = a
    tx, ty = b
    while (x, y) != (tx, ty):
        if x < tx: x += 1
        elif x > tx: x -= 1
        elif y < ty: y += 1
        else: y -= 1
        g[y][x] = 0


def connected(g):
    if len(g) != H or any(len(row) != W for row in g):
        return False
    opens = {(x, y) for y in range(H) for x in range(W) if g[y][x] == 0}
    if START not in opens:
        return False
    seen = {START}
    q = deque([START])
    while q:
        x, y = q.popleft()
        for dx, dy in DIRS:
            p = (x + dx, y + dy)
            if p in opens and p not in seen:
                seen.add(p); q.append(p)
    return seen == opens


def valid_maze(g):
    if len(g) != H or any(len(row) != W for row in g):
        return False
    if any(g[0][x] == 0 or g[H-1][x] == 0 for x in range(W)):
        return False
    if any(g[y][0] == 0 or g[y][W-1] == 0 for y in range(H)):
        return False
    if any(g[y][x] not in (0, 1) for y in range(H) for x in range(W)):
        return False
    if any(g[y][x] != 0 for x, y in CRITICAL):
        return False
    ratio = sum(cell == 0 for row in g for cell in row) / (W * H)
    return 0.35 <= ratio <= 0.70 and connected(g)


def make_maze(rng, loop_rate=0.16):
    g = [[1] * W for _ in range(H)]
    stack = [(1, 1)]
    g[1][1] = 0
    while stack:
        x, y = stack[-1]
        choices = []
        for dx, dy in ((2,0),(-2,0),(0,2),(0,-2)):
            nx, ny = x + dx, y + dy
            if 1 <= nx < W-1 and 1 <= ny < H-1 and g[ny][nx]:
                choices.append((nx, ny, dx, dy))
        if not choices:
            stack.pop(); continue
        nx, ny, dx, dy = rng.choice(choices)
        g[y + dy//2][x + dx//2] = 0
        g[ny][nx] = 0
        stack.append((nx, ny))
    for _ in range(int(W * H * loop_rate)):
        x, y = rng.randrange(1, W-1), rng.randrange(1, H-1)
        if g[y][x] and ((not g[y][x-1] and not g[y][x+1]) or
                        (not g[y-1][x] and not g[y+1][x])):
            g[y][x] = 0
    for x, y in CRITICAL:
        g[y][x] = 0
    carve_to(g, START, (14, 12))
    return g


def stats(g):
    opens = [(x,y) for y in range(H) for x in range(W) if g[y][x] == 0]
    degrees = [sum(0 <= x+dx < W and 0 <= y+dy < H and g[y+dy][x+dx] == 0
                   for dx,dy in DIRS) for x,y in opens]
    junction = sum(d >= 3 for d in degrees) / max(1, len(degrees))
    dead = sum(d == 1 for d in degrees) / max(1, len(degrees))
    q, seen, far = deque([START]), {START}, 0
    while q:
        x,y = q.popleft(); far = max(far, abs(x-14)+abs(y-12))
        for dx,dy in DIRS:
            p = (x+dx,y+dy)
            if 0 <= p[0] < W and 0 <= p[1] < H and g[p[1]][p[0]] == 0 and p not in seen:
                seen.add(p); q.append(p)
    return len(opens)/(W*H), junction, dead, far, len(seen)/max(1,len(opens))


def score(g):
    o,j,d,f,r = stats(g)
    return 100 * (r - .52*abs(o-.52) + .45*j +
                  .25*(1-abs(d-.18)*2) + min(f,40)/80)


def mutate(g, rng):
    n = [row[:] for row in g]
    for _ in range(rng.randint(3,14)):
        x,y = rng.randrange(1,W-1), rng.randrange(1,H-1)
        if (x,y) in CRITICAL: continue
        n[y][x] = 0 if rng.random() < .62 else 1
    for x,y in CRITICAL: n[y][x] = 0
    carve_to(n, START, (14,12))
    return n


def level_strings(g):
    return ["".join("#" if c else "." for c in row) for row in g]


def parse_level(value):
    if not isinstance(value,list) or len(value) != H: return None
    if not all(isinstance(row,str) and len(row) == W for row in value): return None
    if any(c not in "#." for row in value for c in row): return None
    g = [[1 if c == "#" else 0 for c in row] for row in value]
    return g if valid_maze(g) else None


def load_previous():
    try:
        data = json.loads(open(BRAIN,encoding="utf-8").read())
        out = []
        for level in data.get("levels",[]):
            parsed = parse_level(level)
            if parsed is not None: out.append(parsed)
        return out
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return []


def save(brain):
    tmp = BRAIN + ".tmp"
    with open(tmp,"w",encoding="utf-8") as f:
        json.dump(brain,f,separators=(",",":"),allow_nan=False,sort_keys=True)
        f.write("\n"); f.flush(); os.fsync(f.fileno())
    check = json.loads(open(tmp,encoding="utf-8").read())
    levels = check.get("levels",[])
    if check.get("version") != 3 or len(levels) != 12 or not all(parse_level(x) for x in levels):
        raise RuntimeError("maze brain serialization validation failed")
    os.replace(tmp,BRAIN)


def build_level(rng, candidates, existing):
    pool = [make_maze(rng) for _ in range(max(10,candidates//12))]
    pool.extend(existing[:4])
    pool = [g for g in pool if valid_maze(g)]
    if not pool: raise RuntimeError("maze generator produced no valid seed")
    for _ in range(candidates):
        parent = max(pool,key=score)
        child = mutate(parent,rng)
        if valid_maze(child): pool.append(child)
        if len(pool) > 24:
            pool.sort(key=score,reverse=True); pool = pool[:24]
    return max(pool,key=score)


def main():
    rng = random.Random(int(time.time_ns() ^ os.getpid()))
    candidates = max(40,int(os.environ.get("PAC_MAZE_CANDIDATES","120")))
    count = max(1,int(os.environ.get("PAC_MAZE_LEVELS","12")))
    previous = load_previous()
    levels, best_score = [], 0.0
    for i in range(count):
        best = build_level(rng,candidates,previous[i:i+1])
        levels.append(level_strings(best))
        best_score = max(best_score,score(best))
    brain = {
        "version":3,
        "algorithm":"validated-evolutionary-maze-builder",
        "generation":int(time.time()),
        "levels_built":len(levels),
        "best_score":round(best_score,3),
        "dimensions":[W,H],
        "seed":rng.getstate()[1][0],
        "updated":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
        "levels":levels,
    }
    save(brain)
    print(f"maze generation {brain['generation']}: built {len(levels)} valid levels; best={best_score:.2f}")


if __name__ == "__main__":
    main()
