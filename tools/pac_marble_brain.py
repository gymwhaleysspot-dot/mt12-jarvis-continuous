#!/usr/bin/env python3
"""Persistent Pac-Marble player brain trainer with safe maze ingestion."""
import json, os, random, re, time
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"marble-pacman.html"
BRAIN=ROOT/"brain.json"
MAZE_BRAIN=ROOT/"maze-brain.json"
W=H=28
DIRS=((1,0),(-1,0),(0,1),(0,-1))
MAX_STATES=max(10000,int(os.environ.get("PAC_MAX_STATES","60000")))


def parse_fallback():
    text=HTML.read_text(encoding="utf-8")
    m=re.search(r"const FALLBACK_ROWS=\[(.*?)\]\.map",text,re.S)
    if not m: raise RuntimeError("maze definition not found")
    rows=re.findall(r'"([# .]+)"',m.group(1))
    if len(rows)!=H or any(len(row)!=W for row in rows):
        raise RuntimeError("fallback maze must be exactly 28x28")
    return [[1 if c=="#" else 0 for c in row] for row in rows]


def grid_from_level(level):
    if not isinstance(level,list) or len(level)!=H: return None
    if not all(isinstance(row,str) and len(row)==W for row in level): return None
    if any(c not in "#." for row in level for c in row): return None
    return [[1 if c=="#" else 0 for c in row] for row in level]


def load_levels(fallback):
    try:
        data=json.loads(MAZE_BRAIN.read_text(encoding="utf-8"))
        parsed=[grid_from_level(x) for x in data.get("levels",[])]
        parsed=[g for g in parsed if g is not None]
        if parsed: return parsed
    except (OSError,ValueError,TypeError,json.JSONDecodeError):
        pass
    return [fallback]


def open_cell(g,x,y):
    return 0 <= x < W and 0 <= y < H and g[y][x] == 0


def dist(a,b):
    return abs(a[0]-b[0])+abs(a[1]-b[1])


def state(p,last,ghosts,pellets,powers,powered):
    gd="|".join(str(min(9,d)) for d in sorted(dist(p,g) for g in ghosts))
    pd=min((dist(p,k) for k in powers),default=9)
    food=min((dist(p,k) for k in pellets),default=9)
    return f"{p[0]},{p[1]},{last[0]},{last[1]},{gd},{min(9,pd)},{min(9,food)},{1 if powered else 0}"


def train_episode(q,g,epsilon,alpha,gamma,rng):
    p=(14,26); last=(0,0); powered=0
    pellets={(x,y) for y in range(H) for x in range(W)
             if open_cell(g,x,y) and not (x==14 and y>=24)}
    powers={p for p in ((1,1),(W-2,1),(1,H-2),(W-2,H-2)) if open_cell(g,*p)}
    ghosts=[p for p in ((13,12),(14,12),(15,12)) if open_cell(g,*p)]
    if not ghosts: ghosts=[(14,12)]
    for _ in range(750):
        s=state(p,last,ghosts,pellets,powers,powered)
        vals=q.setdefault(s,[0.0,0.0,0.0,0.0])
        moves=[i for i,d in enumerate(DIRS) if open_cell(g,p[0]+d[0],p[1]+d[1])]
        if not moves: return False
        ai=rng.choice(moves) if rng.random()<epsilon else max(moves,key=lambda i:vals[i])
        d=DIRS[ai]; np=(p[0]+d[0],p[1]+d[1]); reward=-0.12
        if np in pellets: pellets.remove(np); reward+=8.0
        if np in powers: powers.remove(np); powered=85; reward+=28.0
        for gi,ghost in enumerate(ghosts):
            opts=[(ghost[0]+dx,ghost[1]+dy) for dx,dy in DIRS
                  if open_cell(g,ghost[0]+dx,ghost[1]+dy)]
            if opts:
                ghosts[gi]=(max if powered else min)(
                    opts,key=lambda z:(dist(z,np)+rng.random()*1.5))
        p=np; last=d
        if powered: powered-=1
        if p in ghosts:
            if powered:
                reward+=35.0; ghosts[ghosts.index(p)]=(14,12)
            else:
                reward-=90.0
                vals[ai]+=alpha*(reward-vals[ai])
                return False
        if not pellets:
            reward+=300.0
            vals[ai]+=alpha*(reward-vals[ai])
            return True
        ns=state(p,last,ghosts,pellets,powers,powered)
        nq=q.setdefault(ns,[0.0,0.0,0.0,0.0])
        vals[ai]+=alpha*(reward+gamma*max(nq)-vals[ai])
    return False


def load_brain():
    try: brain=json.loads(BRAIN.read_text(encoding="utf-8"))
    except (OSError,ValueError,TypeError,json.JSONDecodeError): brain={}
    raw=brain.get("q",{})
    q={}
    if isinstance(raw,dict):
        for k,v in raw.items():
            if isinstance(k,str) and isinstance(v,list) and len(v)==4:
                try: q[k]=[float(x) for x in v]
                except (TypeError,ValueError): pass
    brain.update({
        "version":3,"algorithm":"q-learning-self-play",
        "alpha":max(.05,min(.35,float(brain.get("alpha",.16)))),
        "gamma":max(.80,min(.99,float(brain.get("gamma",.94)))),
        "epsilon":max(.05,min(.35,float(brain.get("epsilon",.18)))),
        "q":q})
    return brain


def trim_q(q):
    if len(q)<=MAX_STATES: return
    ranked=sorted(q.items(),key=lambda item:max(map(abs,item[1])),reverse=True)
    q.clear(); q.update(ranked[:MAX_STATES])


def save_brain(brain):
    tmp=BRAIN.with_suffix(".json.tmp")
    with tmp.open("w",encoding="utf-8") as f:
        json.dump(brain,f,separators=(",",":"),sort_keys=True,allow_nan=False)
        f.write("\n"); f.flush(); os.fsync(f.fileno())
    check=json.loads(tmp.read_text(encoding="utf-8"))
    if check.get("version")!=3 or not isinstance(check.get("q"),dict):
        raise RuntimeError("player brain serialization validation failed")
    tmp.replace(BRAIN)


def main():
    rng=random.Random(int(time.time_ns() ^ os.getpid()))
    episodes=max(1,int(os.environ.get("PAC_EPISODES","900")))
    fallback=parse_fallback()
    levels=load_levels(fallback)
    brain=load_brain(); q=brain["q"]
    alpha,gamma,epsilon=brain["alpha"],brain["gamma"],brain["epsilon"]
    wins=0
    for episode in range(episodes):
        if train_episode(q,levels[episode%len(levels)],epsilon,alpha,gamma,rng): wins+=1
        epsilon=max(.05,epsilon*.99992)
        if len(q)>MAX_STATES+2000: trim_q(q)
    trim_q(q)
    brain["epsilon"]=round(epsilon,6)
    brain["episodes"]=int(brain.get("episodes",0))+episodes
    brain["games"]=int(brain.get("games",0))+episodes
    brain["wins"]=int(brain.get("wins",0))+wins
    brain["win_rate"]=round(wins/max(1,episodes),6)
    brain["states"]=len(q)
    brain["maze_levels_used"]=len(levels)
    brain["updated"]=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
    save_brain(brain)
    print(f"trained {episodes} episodes; states={len(q)} total_episodes={brain['episodes']} epsilon={brain['epsilon']} wins={wins} maze_levels={len(levels)}")


if __name__=="__main__":
    main()
