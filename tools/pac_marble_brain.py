#!/usr/bin/env python3
"""Persistent Pac-Marble brain trainer.
Runs headlessly in CI so the AI can evolve while the HTML page is closed.
State is persisted in brain.json; no player identity or external data is collected.
"""
import json, os, random, re, time
from collections import deque

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML=os.path.join(ROOT,"marble-pacman.html")
BRAIN=os.path.join(ROOT,"brain.json")
EPISODES=int(os.environ.get("PAC_EPISODES","900"))
random.seed()

html=open(HTML,encoding="utf-8").read()
m=re.search(r'const FALLBACK_ROWS=\[(.*?)\]\.map',html,re.S)
if not m: raise SystemExit("maze definition not found: expected FALLBACK_ROWS in marble-pacman.html")
rows=re.findall(r'"([# .]+)"',m.group(1))
T=len(rows); W=len(rows[0])
walls={(x,y) for y,row in enumerate(rows) for x,c in enumerate(row) if c=="#"}
def open_cell(x,y): return 0<=x<W and 0<=y<T and (x,y) not in walls
dirs=((1,0),(-1,0),(0,1),(0,-1))
def norm(dx,dy): return (dx,dy) if (dx,dy) in dirs else (0,0)
def dist(a,b): return abs(a[0]-b[0])+abs(a[1]-b[1])
def danger(p, ghosts):
    return sum(max(0,6-dist(p,g)) for g in ghosts)

def state(p,last,ghosts,pellets,powers,powered):
    near=sorted((dist(p,g),g) for g in ghosts)
    gd="|".join(str(min(9,d)) for d,_ in near)
    pd=min([dist(p,k) for k in powers] or [9])
    food=min([dist(p,k) for k in pellets] or [9])
    return f"{p[0]},{p[1]},{last[0]},{last[1]},{gd},{min(9,pd)},{min(9,food)},{1 if powered else 0}"

def train(brain):
    q=brain.setdefault("q",{})
    alpha=float(brain.get("alpha",.16)); gamma=float(brain.get("gamma",.94))
    epsilon=float(brain.get("epsilon",.18))
    wins=0
    for ep in range(EPISODES):
        p=(14,26); last=(0,0); powered=0
        pellets={(x,y) for y in range(T) for x in range(W) if open_cell(x,y) and not (x==14 and y>=24)}
        powers={(1,1),(W-2,1),(1,T-2),(W-2,T-2)}
        ghosts=[(13,12),(14,12),(15,12)]
        total=0
        for step in range(750):
            s=state(p,last,ghosts,pellets,powers,powered)
            vals=q.setdefault(s,[0.0,0.0,0.0,0.0])
            moves=[]
            for i,d in enumerate(dirs):
                np=(p[0]+d[0],p[1]+d[1])
                if open_cell(*np): moves.append(i)
            if not moves: break
            if random.random()<epsilon: ai=random.choice(moves)
            else: ai=max(moves,key=lambda i:vals[i])
            d=dirs[ai]; np=(p[0]+d[0],p[1]+d[1])
            reward=-0.12
            if np in pellets:
                pellets.remove(np); reward+=8
            if np in powers:
                powers.remove(np); powered=85; reward+=28
            if dist(np,(14,26))<dist(p,(14,26)): reward+=0.02
            for gi,g in enumerate(ghosts):
                opts=[(g[0]+dx,g[1]+dy) for dx,dy in dirs if open_cell(g[0]+dx,g[1]+dy)]
                if opts:
                    # Hunters chase when normal; scatter from the player while powered.
                    ghosts[gi]=max(opts,key=lambda z:(dist(z,np) if powered else -dist(z,np))+random.random()*1.5)
            p=np; last=d
            if powered: powered-=1
            if p in ghosts:
                if powered:
                    reward+=35
                    ghosts[ghosts.index(p)]=(14,12)
                else:
                    reward-=90
                    total+=reward
                    break
            if not pellets:
                reward+=300; wins+=1; total+=reward; break
            ns=state(p,last,ghosts,pellets,powers,powered)
            nq=q.setdefault(ns,[0.0,0.0,0.0,0.0])
            target=reward+gamma*max(nq)
            vals[ai]+=alpha*(target-vals[ai])
            total+=reward
        epsilon=max(.035,epsilon*.99935)
    brain["epsilon"]=round(epsilon,6)
    brain["episodes"]=int(brain.get("episodes",0))+EPISODES
    brain["games"]=int(brain.get("games",0))+EPISODES
    brain["wins"]=int(brain.get("wins",0))+wins
    brain["updated"]=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
    brain["states"]=len(q)

def main():
    with open(BRAIN,encoding="utf-8") as f: brain=json.load(f)
    train(brain)
    tmp=BRAIN+".tmp"
    with open(tmp,"w",encoding="utf-8") as f: json.dump(brain,f,separators=(",",":"),sort_keys=True)
    os.replace(tmp,BRAIN)
    print(f"trained {EPISODES} episodes; states={brain['states']} total_episodes={brain['episodes']} epsilon={brain['epsilon']} wins_this_run={brain['wins']}")

if __name__=="__main__": main()
