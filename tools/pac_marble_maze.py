#!/usr/bin/env python3
"""Persistent AI maze builder for Pac-Marble.
Generates, evaluates, mutates and persists distinct playable mazes.
Runs headlessly in CI; it does not need the HTML page to be open.
"""
import json, os, random, re, time
from collections import deque

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML=os.path.join(ROOT,"marble-pacman.html")
BRAIN=os.path.join(ROOT,"maze-brain.json")
W=H=28

def make_maze(rng, loop_rate=0.16):
    g=[[1]*W for _ in range(H)]
    # Keep a solid border and carve an odd-cell maze, then open selected loops.
    stack=[(1,1)]; g[1][1]=0
    while stack:
        x,y=stack[-1]
        choices=[]
        for dx,dy in ((2,0),(-2,0),(0,2),(0,-2)):
            nx,ny=x+dx,y+dy
            if 1<=nx<W-2 and 1<=ny<H-2 and g[ny][nx]:
                choices.append((nx,ny,dx,dy))
        if not choices:
            stack.pop(); continue
        nx,ny,dx,dy=rng.choice(choices)
        g[y+dy//2][x+dx//2]=0
        g[ny][nx]=0
        stack.append((nx,ny))
    # Add loops around the maze to make it Pac-Man-like rather than a pure tree.
    for _ in range(int(W*H*loop_rate)):
        x=rng.randrange(1,W-1); y=rng.randrange(1,H-1)
        if g[y][x] and ((not g[y][x-1] and not g[y][x+1]) or (not g[y-1][x] and not g[y+1][x])):
            g[y][x]=0
    # Ensure the player start and ghost chamber are open.
    for x,y in ((14,26),(13,12),(14,12),(15,12),(14,25),(14,24)):
        g[y][x]=0
    # Ensure a route from player start to center and all carved cells are connected.
    carve_to(g,(14,26),(14,12))
    return g

def carve_to(g,a,b):
    x,y=a; tx,ty=b
    while (x,y)!=(tx,ty):
        if x<tx: x+=1
        elif x>tx: x-=1
        elif y<ty: y+=1
        else: y-=1
        g[y][x]=0

def stats(g):
    opens=[(x,y) for y in range(H) for x in range(W) if not g[y][x]]
    open_ratio=len(opens)/(W*H)
    deg=[]
    for x,y in opens:
        deg.append(sum(0<=x+dx<W and 0<=y+dy<H and not g[y+dy][x+dx] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))))
    junction=sum(d>=3 for d in deg)/max(1,len(deg))
    dead=sum(d==1 for d in deg)/max(1,len(deg))
    start=(14,26); q=deque([start]); seen={start}; far=0
    while q:
        x,y=q.popleft()
        far=max(far,abs(x-14)+abs(y-12))
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            p=(x+dx,y+dy)
            if 0<=p[0]<W and 0<=p[1]<H and not g[p[1]][p[0]] and p not in seen:
                seen.add(p); q.append(p)
    reachable=len(seen)/max(1,len(opens))
    return open_ratio,junction,dead,far,reachable

def score(g):
    o,j,d,f,r=stats(g)
    return 100*(r-.52*abs(o-.52)+.45*j+.25*(1-abs(d-.18)*2)+min(f,40)/80)

def mutate(g,rng):
    n=[row[:] for row in g]
    for _ in range(rng.randint(3,14)):
        x=rng.randrange(1,W-1); y=rng.randrange(1,H-1)
        if (x,y) in {(14,26),(14,25),(14,24),(13,12),(14,12),(15,12)}: continue
        n[y][x]=0 if rng.random()<.62 else 1
    # Repair the critical route after mutations.
    carve_to(n,(14,26),(14,12))
    return n

def main():
    with open(HTML,encoding="utf-8") as f: html=f.read()
    m=re.search(r'const FALLBACK_ROWS=([\s\S]*?);',html)
    # The builder is intentionally independent of the browser's current state.
    try:
        with open(BRAIN,encoding="utf-8") as f: brain=json.load(f)
    except Exception:
        brain={"version":1,"algorithm":"evolutionary-maze-builder","generation":0,"levels_built":0,"best_score":0,"params":{"open_target":.52,"loop_rate":.16,"dead_end_target":.18},"levels":[]}
    rng=random.Random()
    seed=int(time.time_ns() ^ os.getpid())
    rng.seed(seed)
    episodes=int(os.environ.get("PAC_MAZE_CANDIDATES","120"))
    levels=int(os.environ.get("PAC_MAZE_LEVELS","12"))
    existing=brain.get("levels",[])
    new_levels=[]
    total_best=float(brain.get("best_score",0))
    for level in range(1,levels+1):
        pool=[make_maze(rng,brain.get("params",{}).get("loop_rate",.16)) for _ in range(max(8,episodes//12))]
        for _ in range(episodes):
            parent=max(pool,key=score)
            pool.append(mutate(parent,rng))
            if len(pool)>24:
                pool.sort(key=score,reverse=True); pool=pool[:24]
        best=max(pool,key=score); s=score(best)
        total_best=max(total_best,s)
        new_levels.append(["".join("#" if c else "." for c in row) for row in best])
    brain["generation"]=int(brain.get("generation",0))+1
    brain["levels_built"]=len(new_levels)
    brain["best_score"]=round(total_best,3)
    brain["levels"]=new_levels
    brain["seed"]=seed
    brain["updated"]=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
    with open(BRAIN,"w",encoding="utf-8") as f:
        json.dump(brain,f,separators=(",",":"))
        f.write("\n")
    print(f"maze generation {brain['generation']}: built {levels} distinct levels; best={total_best:.2f}")

if __name__=="__main__":
    main()
