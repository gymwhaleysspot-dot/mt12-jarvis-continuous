from pathlib import Path
import subprocess,sys,tempfile
parent=Path(sys.argv[1]);out=Path(sys.argv[2])
with tempfile.TemporaryDirectory() as d:
 t=Path(d)/'jrw6d.lua'
 subprocess.run(['python3','tools/build_jrw6d_from_artifact.py',str(parent),str(t)],check=True)
 s=t.read_text()
 start=s.find('local function bb_line(g,dv,ev,gg,sc)')
 if start<0: raise SystemExit('bb_line not found')
 end=s.find('\nlocal function xd(',start)
 if end<0: raise SystemExit('bb_line end not found')
 block=s[start:end+1]
 s=s[:start]+s[end+1:]
 anchor=s.find('local function update(gps,e,st,sats,thrAbs,th,btl,rq)')
 if anchor<0: raise SystemExit('update not found')
 s=s[:anchor]+block+s[anchor:]
 s=s.replace('--jrw6d defended observability evolution','--jrw6e defended observability scope fix',1)
 s=s.replace('T(2,1,"JRW6D"','T(2,1,"JRW6E"',1)
 if s.find('local function bb_line(g,dv,ev,gg,sc)')>s.find('local function update(gps,e,st,sats,thrAbs,th,btl,rq)'):
  raise SystemExit('bb_line still after update')
 out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(s)
 print({'sourceBytes':len(s.encode()),'bbBeforeUpdate':True})
