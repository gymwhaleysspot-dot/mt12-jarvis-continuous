#!/usr/bin/env python3
"""Train and persist the Pac-Marble player brain.

The player brain is a compact Q-policy trained against the persisted maze brain.
Training is bounded, terminal transitions are learned, and the saved table is
pruned/rounded so GitHub Pages can load it quickly.
"""
import json, math, os, random, time
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAIN = os.path.join(ROOT, "brain.json")
MAZE_BRAIN = os.path.join(ROOT, "maze-brain.json")
EPISODES = max(1, int(os.environ.get("PAC_EPISODES", "900")))
MAX_STEPS = max(100, int(os.environ.get("PAC_MAX_STEPS", "650")))
MAX_STATES = max(5000, int(os.environ.get("PAC_MAX_STATES", "36000")))
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))
START = (14, 26)
GHOST_START = [(13, 12), (14, 12), (15, 12)]


def load_maze_levels():
    try:
        data = json.loads(open(MAZE_BRAIN, encoding="utf-8").read())
        levels = data.get("levels", [])
        valid = []
        for rows in levels:
            if isinstance(rows, list) and len(rows) == 28 and all(isinstance(r, str) and len(r) == 28 for r in rows):
                grid = [[c == "#" for c in row] for row in rows]
                if not grid[START[1]][START[0]]:
                    valid.append(grid)
        if valid:
            return valid
    except Exception:
        pass
    # A deterministic open-field fallback guarantees training can proceed even
    # when the maze artifact is temporarily absent. It preserves a wall border
    # and leaves every interior cell reachable.
    g = [[False] * 28 for _ in range(28)]
    for i in range(28):
        g[0][i] = g[27][i] = True
        g[i][0] = g[i][27] = True
    for y in range(2, 26, 4):
        for x in range(2, 26):
            if y != 24:
                g[y][x] = True
        g[y][14] = False
    return [g]


def open_cell(g, x, y):
    return 0 <= x < 28 and 0 <= y < 28 and not g[y][x]


def distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def nearest_distance(p, items, default=9):
    return min((distance(p, k) for k in items), default=default)


def state_key(p, last, ghosts, pellets, powers, powered):
    gd = sorted(min(9, distance(p, g)) for g in ghosts)
    return f"{p[0]},{p[1]},{last[0]},{last[1]}," + "|".join(map(str, gd)) +         f",{min(9, nearest_distance(p, powers))},{min(9, nearest_distance(p, pellets))},{1 if powered else 0}"


def candidate_actions(g, p):
    return [
        i for i, (dx, dy) in enumerate(DIRS)
        if open_cell(g, p[0] + dx, p[1] + dy)
    ]


def move_ghost(g, ghost, target, flee, rng):
    options = []
    for dx, dy in DIRS:
        np = (ghost[0] + dx, ghost[1] + dy)
        if open_cell(g, *np):
            options.append(np)
    if not options:
        return ghost
    # Small randomness prevents a deterministic hunter from becoming trivial.
    return max(
        options,
        key=lambda z: ((distance(z, target) if flee else -distance(z, target)) + rng.random() * 1.4)
    )


def prune_q(q):
    if len(q) <= MAX_STATES:
        return q
    # Keep states with strong learned preferences. Stable hashing breaks ties
    # without storing another large metadata table.
    ranked = sorted(
        q.items(),
        key=lambda kv: (
            max(abs(float(v)) for v in kv[1]),
            hash(kv[0]) & 0xFFFFFFFF,
        ),
        reverse=True,
    )
    kept = dict(ranked[:MAX_STATES])
    return kept


def train(brain, levels, rng):
    q = brain.setdefault("q", {})
    alpha = min(.30, max(.06, float(brain.get("alpha", .16))))
    gamma = min(.99, max(.80, float(brain.get("gamma", .94))))
    epsilon = min(.30, max(.035, float(brain.get("epsilon", .18))))
    wins = 0
    losses = 0

    for ep in range(EPISODES):
        g = levels[ep % len(levels)]
        p = START
        last = (0, 0)
        powered = 0
        pellets = {
            (x, y)
            for y in range(28)
            for x in range(28)
            if open_cell(g, x, y) and not (x == 14 and y >= 24)
        }
        powers = [
            k for k in ((1, 1), (26, 1), (1, 26), (26, 26))
            if open_cell(g, *k)
        ]
        ghosts = [list(x) for x in GHOST_START]
        ghosts = [p0 if open_cell(g, *p0) else [14, 12] for p0 in ghosts]
        total = 0.0

        for _step in range(MAX_STEPS):
            s = state_key(p, last, [tuple(x) for x in ghosts], pellets, powers, powered)
            vals = q.setdefault(s, [0.0, 0.0, 0.0, 0.0])
            moves = candidate_actions(g, p)
            if not moves:
                losses += 1
                break

            if rng.random() < epsilon:
                action = rng.choice(moves)
            else:
                action = max(moves, key=lambda i: float(vals[i]))

            dx, dy = DIRS[action]
            np = (p[0] + dx, p[1] + dy)
            reward = -0.10

            if np in pellets:
                pellets.remove(np)
                reward += 7.0
            if np in powers:
                powers.remove(np)
                powered = 70
                reward += 22.0

            # Reward progress while also encouraging escape from nearby hunters.
            old_food = nearest_distance(p, pellets)
            new_food = nearest_distance(np, pellets)
            reward += 0.35 if new_food < old_food else -0.08
            old_danger = min((distance(p, tuple(gp)) for gp in ghosts), default=9)
            new_danger = min((distance(np, tuple(gp)) for gp in ghosts), default=9)
            if not powered and new_danger < old_danger:
                reward -= 0.8

            next_ghosts = []
            for gp in ghosts:
                ng = move_ghost(g, tuple(gp), np, bool(powered), rng)
                next_ghosts.append(list(ng))
            ghosts = next_ghosts
            p = np
            last = (dx, dy)
            if powered:
                powered -= 1

            done = False
            if any(tuple(gp) == p for gp in ghosts):
                if powered:
                    reward += 32.0
                    for i, gp in enumerate(ghosts):
                        if tuple(gp) == p:
                            ghosts[i] = [14, 12]
                else:
                    reward -= 85.0
                    losses += 1
                    done = True

            if not pellets:
                reward += 280.0
                wins += 1
                done = True

            total += reward
            if done:
                target = reward
            else:
                ns = state_key(p, last, [tuple(x) for x in ghosts], pellets, powers, powered)
                nq = q.setdefault(ns, [0.0, 0.0, 0.0, 0.0])
                target = reward + gamma * max(float(v) for v in nq)

            vals[action] = float(vals[action]) + alpha * (target - float(vals[action]))
            if done:
                break

        # Decay gently so scheduled runs continue to explore new states.
        epsilon = max(.035, epsilon * .99985)

    brain["epsilon"] = round(epsilon, 6)
    brain["episodes"] = int(brain.get("episodes", 0)) + EPISODES
    brain["games"] = int(brain.get("games", 0)) + EPISODES
    brain["wins"] = int(brain.get("wins", 0)) + wins
    brain["losses"] = int(brain.get("losses", 0)) + losses
    brain["updated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    brain["states_before_prune"] = len(q)

    q = prune_q(q)
    # Round values for a smaller, deterministic browser artifact.
    brain["q"] = {k: [round(float(v), 4) for v in vals] for k, vals in q.items()}
    brain["states"] = len(brain["q"])
    brain["version"] = 3
    brain["algorithm"] = "bounded-self-play-q-learning"
    brain["maze_levels_used"] = len(levels)
    return total


def main():
    try:
        brain = json.loads(open(BRAIN, encoding="utf-8").read())
    except Exception:
        brain = {}
    levels = load_maze_levels()
    rng = random.Random(int(time.time_ns() ^ os.getpid()))
    train(brain, levels, rng)

    tmp = BRAIN + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(brain, f, separators=(",", ":"), sort_keys=True, allow_nan=False)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    with open(tmp, encoding="utf-8") as f:
        check = json.load(f)
    if check.get("version") != 3 or not isinstance(check.get("q"), dict) or not isinstance(check.get("states"), int):
        raise RuntimeError("player brain serialization validation failed")
    if check["states"] > MAX_STATES:
        raise RuntimeError("player brain state cap violated")
    os.replace(tmp, BRAIN)
    print(
        f"trained {EPISODES} episodes; states={brain['states']} "
        f"total_episodes={brain['episodes']} epsilon={brain['epsilon']} "
        f"wins_this_run={brain['wins']}"
    )


if __name__ == "__main__":
    main()
