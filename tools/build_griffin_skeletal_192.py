#!/usr/bin/env python3
"""Production 192: detailed computer-generated Griffin GLB.
Creates a denser original humanoid fighter with an 18-bone skin, multiple sculptural surface groups,
vertex colors, weighted articulation, facial volumes, layered hair, armor, boots, gloves, and combat clips.
No external dependencies.
"""
import json, math, struct
from pathlib import Path
OUT=Path('jarvis/assets/survivor/griffin-hero-skeletal-v1.glb')
P=[];N=[];C=[];J=[];W=[];I=[]
def rgba(h):
 h=h.lstrip('#');return [int(h[i:i+2],16)/255 for i in (0,2,4)]+[1.0]
SKIN=rgba('#d98d6c');SKIN_L=rgba('#ffc7a0');SKIN_D=rgba('#744036');DARK=rgba('#040712');NAVY=rgba('#071a34');BLUE=rgba('#0c6f9d');CYAN=rgba('#45dffc');ORANGE=rgba('#f36d18');HAIR=rgba('#08111f');HAIR_HI=rgba('#315d7f');WHITE=rgba('#f2fbff');EYE=rgba('#33ddff')
def vtx(p,n,c,j,w):P.extend(p);N.extend(n);C.extend(c);J.extend(j);W.extend(w);return len(P)//3-1
def ellipsoid(center,r,color,joint,seg=20,rings=12):
 base=len(P)//3;cx,cy,cz=center;rx,ry,rz=r
 for y in range(rings+1):
  ph=math.pi*y/rings
  for x in range(seg):
   th=2*math.pi*x/seg;nx=math.sin(ph)*math.cos(th);ny=math.cos(ph);nz=math.sin(ph)*math.sin(th)
   p=[cx+rx*nx,cy+ry*ny,cz+rz*nz];nn=[nx/max(rx,1e-6),ny/max(ry,1e-6),nz/max(rz,1e-6)];L=math.sqrt(sum(q*q for q in nn)) or 1;vtx(p,[q/L for q in nn],color,[joint,0,0,0],[1,0,0,0])
 for y in range(rings):
  for x in range(seg):
   a=base+y*seg+x;b=base+y*seg+(x+1)%seg;c=base+(y+1)*seg+x;d=base+(y+1)*seg+(x+1)%seg;I.extend([a,c,b,b,c,d])
def limb(a,b,ra,rb,color,ja,jb,seg=16,rows=7):
 base=len(P)//3;d=[b[i]-a[i] for i in range(3)];L=math.sqrt(sum(q*q for q in d)) or 1;d=[q/L for q in d];tmp=[0,1,0] if abs(d[1])<.9 else [1,0,0]
 u=[d[1]*tmp[2]-d[2]*tmp[1],d[2]*tmp[0]-d[0]*tmp[2],d[0]*tmp[1]-d[1]*tmp[0]];UL=math.sqrt(sum(q*q for q in u)) or 1;u=[q/UL for q in u];vv=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
 for r in range(rows):
  t=r/(rows-1);rad=ra+(rb-ra)*t;cen=[a[i]+d[i]*L*t for i in range(3)]
  for s in range(seg):
   th=2*math.pi*s/seg;co,si=math.cos(th),math.sin(th);n=[u[i]*co+vv[i]*si for i in range(3)];p=[cen[i]+rad*n[i] for i in range(3)];vtx(p,n,color,[ja,jb,0,0],[1-t,t,0,0])
 for r in range(rows-1):
  for s in range(seg):
   a0=base+r*seg+s;a1=base+r*seg+(s+1)%seg;b0=base+(r+1)*seg+s;b1=base+(r+1)*seg+(s+1)%seg;I.extend([a0,b0,a1,a1,b0,b1])
def wedge(points,color,joint):
 base=len(P)//3;cen=[sum(p[i] for p in points)/len(points) for i in range(3)]
 for p in points:
  n=[p[i]-cen[i] for i in range(3)];L=math.sqrt(sum(q*q for q in n)) or 1;vtx(p,[q/L for q in n],color,[joint,0,0,0],[1,0,0,0])
 for k in range(1,len(points)-1):I.extend([base,base+k,base+k+1])
def q(axis,deg):
 a=math.radians(deg)/2;s=math.sin(a);return [axis[0]*s,axis[1]*s,axis[2]*s,math.cos(a)]
def inv_t(t):return [1,0,0,0,0,1,0,0,0,0,1,0,-t[0],-t[1],-t[2],1]
bones=[('root',-1,[0,0,0]),('hips',0,[0,1.02,0]),('spine',1,[0,1.30,0]),('chest',2,[0,1.60,0]),('neck',3,[0,1.88,0]),('head',4,[0,2.12,0]),('upperArmL',3,[-.38,1.72,0]),('lowerArmL',6,[-.69,1.52,.02]),('handL',7,[-.91,1.34,.08]),('upperArmR',3,[.38,1.72,0]),('lowerArmR',9,[.69,1.52,.02]),('handR',10,[.91,1.34,.08]),('upperLegL',1,[-.19,.94,0]),('lowerLegL',12,[-.22,.49,.01]),('footL',13,[-.23,.10,.18]),('upperLegR',1,[.19,.94,0]),('lowerLegR',15,[.22,.49,.01]),('footR',16,[.23,.10,.18])]
ellipsoid([0,1.57,0],[.40,.48,.24],BLUE,3,28,16);ellipsoid([0,1.34,.06],[.33,.31,.22],NAVY,2,24,14);ellipsoid([-.18,1.72,.08],[.22,.24,.18],BLUE,3,18,10);ellipsoid([.18,1.72,.08],[.22,.24,.18],BLUE,3,18,10);ellipsoid([0,1.10,0],[.34,.23,.21],DARK,1,22,12);ellipsoid([0,1.12,.03],[.38,.075,.23],ORANGE,1,20,8)
ellipsoid([0,2.12,0],[.245,.29,.225],SKIN,5,28,18);ellipsoid([0,2.02,.045],[.19,.12,.19],SKIN_D,5,24,12);ellipsoid([-.235,2.12,0],[.048,.078,.035],SKIN_D,5,12,8);ellipsoid([.235,2.12,0],[.048,.078,.035],SKIN_D,5,12,8)
wedge([[-.035,2.13,.215],[.035,2.13,.215],[.018,2.04,.255],[-.018,2.04,.255]],SKIN_L,5)
for sx in (-1,1):ellipsoid([sx*.082,2.16,.211],[.045,.018,.012],WHITE,5,12,6);ellipsoid([sx*.082,2.158,.225],[.014,.014,.009],EYE,5,10,5);wedge([[sx*.135,2.205,.22],[sx*.04,2.195,.228],[sx*.045,2.215,.23],[sx*.14,2.225,.22]],HAIR,5)
wedge([[-.09,1.995,.215],[.09,1.995,.215],[.07,1.975,.226],[-.07,1.975,.226]],SKIN_D,5);ellipsoid([0,1.96,.12],[.13,.07,.11],SKIN_D,5,16,8);ellipsoid([0,1.88,0],[.14,.16,.13],SKIN_D,4,18,10)
limb([-.34,1.69,0],[-.66,1.50,.02],.145,.125,SKIN,6,7);limb([-.66,1.50,.02],[-.90,1.32,.07],.13,.105,NAVY,7,8);ellipsoid([-.92,1.30,.08],[.115,.12,.105],SKIN,8,16,10);limb([.34,1.69,0],[.66,1.50,.02],.145,.125,SKIN,9,10);limb([.66,1.50,.02],[.90,1.32,.07],.13,.105,NAVY,10,11);ellipsoid([.92,1.30,.08],[.115,.12,.105],SKIN,11,16,10)
limb([-.18,.96,0],[-.22,.50,.02],.19,.16,NAVY,12,13,18,8);limb([-.22,.50,.02],[-.23,.13,.08],.16,.125,DARK,13,14,18,8);ellipsoid([-.24,.105,.22],[.16,.10,.27],DARK,14,18,10);limb([.18,.96,0],[.22,.50,.02],.19,.16,NAVY,15,16,18,8);limb([.22,.50,.02],[.23,.13,.08],.16,.125,DARK,16,17,18,8);ellipsoid([.24,.105,.22],[.16,.10,.27],DARK,17,18,10);ellipsoid([-.21,.54,.08],[.18,.13,.17],BLUE,13,16,8);ellipsoid([.21,.54,.08],[.18,.13,.17],BLUE,16,16,8)
wedge([[-.34,1.78,.22],[0,1.86,.27],[.34,1.78,.22],[.28,1.48,.26],[0,1.37,.29],[-.28,1.48,.26]],CYAN,3);wedge([[-.44,1.77,.04],[-.30,1.90,.03],[-.12,1.80,.16],[-.28,1.61,.17]],NAVY,3);wedge([[.44,1.77,.04],[.30,1.90,.03],[.12,1.80,.16],[.28,1.61,.17]],NAVY,3)
spikes=[(-.19,2.29,-.02,-.36,2.63,.00),(-.10,2.31,-.04,-.16,2.78,.02),(0,2.32,-.05,.01,2.86,.03),(.10,2.31,-.04,.18,2.77,.02),(.19,2.29,-.02,.38,2.62,.00),(-.24,2.22,-.01,-.48,2.47,.02),(.24,2.22,-.01,.48,2.47,.02)]
for x,y,z,tx,ty,tz in spikes:wedge([[x-.09,y,z-.10],[x+.09,y,z-.10],[x+.075,y,z+.11],[x-.075,y,z+.11],[tx,ty,tz]],HAIR,5)
for x,y,z,tx,ty,tz in spikes[1:-1]:wedge([[x-.045,y+.015,z+.09],[x+.045,y+.015,z+.09],[tx,ty,tz+.025]],HAIR_HI,5)
binbuf=bytearray();views=[];accs=[]
def align4():
 while len(binbuf)%4:binbuf.append(0)
def add(data,fmt,ctype,typ,count,target=None,minv=None,maxv=None):
 align4();off=len(binbuf);raw=struct.pack('<'+fmt*len(data),*data);binbuf.extend(raw);vi=len(views);bv={'buffer':0,'byteOffset':off,'byteLength':len(raw)}
 if target:bv['target']=target
 views.append(bv);a={'bufferView':vi,'componentType':ctype,'count':count,'type':typ}
 if minv is not None:a['min']=minv
 if maxv is not None:a['max']=maxv
 accs.append(a);return len(accs)-1
mins=[min(P[i::3]) for i in range(3)];maxs=[max(P[i::3]) for i in range(3)];aP=add(P,'f',5126,'VEC3',len(P)//3,34962,mins,maxs);aN=add(N,'f',5126,'VEC3',len(N)//3,34962);aC=add(C,'f',5126,'VEC4',len(C)//4,34962);aJ=add(J,'B',5121,'VEC4',len(J)//4,34962);aW=add(W,'f',5126,'VEC4',len(W)//4,34962);ctype=5123 if max(I)<65536 else 5125;aI=add(I,'H' if ctype==5123 else 'I',ctype,'SCALAR',len(I),34963,[min(I)],[max(I)])
nodes=[]
for i,(name,parent,world) in enumerate(bones):local=world if parent<0 else [world[k]-bones[parent][2][k] for k in range(3)];nodes.append({'name':name,'translation':local})
for i,(_,parent,_) in enumerate(bones):
 if parent>=0:nodes[parent].setdefault('children',[]).append(i)
meshNode=len(nodes);nodes.append({'name':'GriffinHeroHDMesh','mesh':0,'skin':0});ibm=[]
for _,_,world in bones:ibm.extend(inv_t(world))
aIBM=add(ibm,'f',5126,'MAT4',18);anims=[]
def clip(name,tracks):
 sam=[];ch=[]
 for node,path,times,vals in tracks:
  ai=add(times,'f',5126,'SCALAR',len(times),None,[min(times)],[max(times)]);size=4 if path=='rotation' else 3;ao=add([x for row in vals for x in row],'f',5126,'VEC4' if size==4 else 'VEC3',len(vals));sam.append({'input':ai,'output':ao,'interpolation':'LINEAR'});ch.append({'sampler':len(sam)-1,'target':{'node':node,'path':path}})
 anims.append({'name':name,'samplers':sam,'channels':ch})
clip('Idle',[(3,'rotation',[0,.8,1.6],[q([0,0,1],-2),q([0,0,1],2),q([0,0,1],-2)]),(5,'rotation',[0,.8,1.6],[q([0,1,0],-4),q([0,1,0],5),q([0,1,0],-4)])]);clip('Guard',[(6,'rotation',[0,.3,.7],[q([0,0,1],0),q([0,0,1],-38),q([0,0,1],-20)]),(9,'rotation',[0,.3,.7],[q([0,0,1],0),q([0,0,1],38),q([0,0,1],20)]),(7,'rotation',[0,.3,.7],[q([1,0,0],0),q([1,0,0],-58),q([1,0,0],-25)]),(10,'rotation',[0,.3,.7],[q([1,0,0],0),q([1,0,0],-58),q([1,0,0],-25)])]);clip('Jab',[(9,'rotation',[0,.12,.24,.5],[q([0,0,1],10),q([0,1,0],-28),q([0,1,0],-10),q([0,0,1],10)]),(10,'rotation',[0,.12,.24,.5],[q([1,0,0],0),q([1,0,0],-88),q([1,0,0],-48),q([1,0,0],0)]),(3,'rotation',[0,.12,.5],[q([0,1,0],0),q([0,1,0],-18),q([0,1,0],0)])]);clip('Kick',[(15,'rotation',[0,.22,.45,.82],[q([1,0,0],0),q([1,0,0],-72),q([1,0,0],28),q([1,0,0],0)]),(16,'rotation',[0,.22,.45,.82],[q([1,0,0],0),q([1,0,0],58),q([1,0,0],-20),q([1,0,0],0)]),(1,'rotation',[0,.22,.82],[q([0,0,1],0),q([0,0,1],-9),q([0,0,1],0)])]);clip('PowerUp',[(1,'translation',[0,.45,.9,1.35],[[0,1.02,0],[0,1.08,0],[0,1.02,0],[0,1.06,0]]),(6,'rotation',[0,.45,.9,1.35],[q([0,0,1],-8),q([0,0,1],-28),q([0,0,1],-8),q([0,0,1],-22)]),(9,'rotation',[0,.45,.9,1.35],[q([0,0,1],8),q([0,0,1],28),q([0,0,1],8),q([0,0,1],22)])])
doc={'asset':{'version':'2.0','generator':'Jarvis Production 192 Detailed Computer Generated Griffin'},'scene':0,'scenes':[{'nodes':[0,meshNode]}],'nodes':nodes,'meshes':[{'name':'GriffinHeroHD','primitives':[{'attributes':{'POSITION':aP,'NORMAL':aN,'COLOR_0':aC,'JOINTS_0':aJ,'WEIGHTS_0':aW},'indices':aI,'mode':4}]}],'skins':[{'name':'GriffinHumanoidSkin','inverseBindMatrices':aIBM,'joints':list(range(18)),'skeleton':0}],'animations':anims,'accessors':accs,'bufferViews':views,'buffers':[{'byteLength':len(binbuf)}]}
js=json.dumps(doc,separators=(',',':')).encode();js+=b' ' *((4-len(js)%4)%4);align4();bb=bytes(binbuf);total=12+8+len(js)+8+len(bb);out=bytearray(struct.pack('<4sII',b'glTF',2,total));out+=struct.pack('<I4s',len(js),b'JSON')+js;out+=struct.pack('<I4s',len(bb),b'BIN\0')+bb;OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_bytes(out);print({'output':str(OUT),'bytes':len(out),'vertices':len(P)//3,'triangles':len(I)//3,'bones':18,'clips':[a['name'] for a in anims]})
