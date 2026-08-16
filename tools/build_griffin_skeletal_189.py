#!/usr/bin/env python3
"""Production 189 Griffin skeletal GLB builder.
Creates a single skinned humanoid mesh with 18-bone hierarchy, vertex weights,
vertex colors, inverse bind matrices, and five animation clips.
No external packages are required.
"""
import json, math, struct
from pathlib import Path
OUT=Path("jarvis/assets/survivor/griffin-hero-skeletal-v1.glb")
def q_axis(axis,ang):
 s=math.sin(ang/2);c=math.cos(ang/2);return[axis[0]*s,axis[1]*s,axis[2]*s,c]
def mat4_inv_t(t):return[1,0,0,0,0,1,0,0,0,0,1,0,-t[0],-t[1],-t[2],1]
P=[];N=[];C=[];J=[];W=[];I=[]
def add_vertex(p,n,c,j,w):P.extend(p);N.extend(n);C.extend(c);J.extend(j);W.extend(w);return len(P)//3-1
def rgba(h):h=h.lstrip('#');return[int(h[i:i+2],16)/255 for i in(0,2,4)]+[1.0]
SKIN=rgba('#e7a47e');SKIN_D=rgba('#9b5847');BLUE=rgba('#137ab0');NAVY=rgba('#0b2446');ORANGE=rgba('#ff7a20');HAIR=rgba('#152a42');HAIR_HI=rgba('#4d7697');WHITE=rgba('#dffaff')
def ellipsoid(center,r,segments,rings,color,joint):
 base=len(P)//3;cx,cy,cz=center;rx,ry,rz=r
 for y in range(rings+1):
  v=y/rings;ph=math.pi*v
  for x in range(segments):
   th=2*math.pi*x/segments;nx=math.sin(ph)*math.cos(th);ny=math.cos(ph);nz=math.sin(ph)*math.sin(th)
   p=[cx+rx*nx,cy+ry*ny,cz+rz*nz];nn=[nx/max(rx,1e-6),ny/max(ry,1e-6),nz/max(rz,1e-6)];l=math.sqrt(sum(a*a for a in nn))or 1
   add_vertex(p,[a/l for a in nn],color,[joint,0,0,0],[1,0,0,0])
 for y in range(rings):
  for x in range(segments):
   a=base+y*segments+x;b=base+y*segments+(x+1)%segments;c=base+(y+1)*segments+x;d=base+(y+1)*segments+(x+1)%segments;I.extend([a,c,b,b,c,d])
def tapered_limb(a,b,ra,rb,color,jointA,jointB,segments=10):
 base=len(P)//3;dx,dy,dz=[b[i]-a[i] for i in range(3)];L=math.sqrt(dx*dx+dy*dy+dz*dz)or 1;d=[dx/L,dy/L,dz/L];tmp=[0,1,0]if abs(d[1])<.9 else[1,0,0]
 u=[d[1]*tmp[2]-d[2]*tmp[1],d[2]*tmp[0]-d[0]*tmp[2],d[0]*tmp[1]-d[1]*tmp[0]];ul=math.sqrt(sum(x*x for x in u))or 1;u=[x/ul for x in u];v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];rows=5
 for r in range(rows):
  t=r/(rows-1);rad=ra+(rb-ra)*t;center=[a[i]+(b[i]-a[i])*t for i in range(3)]
  for s in range(segments):
   th=2*math.pi*s/segments;co,si=math.cos(th),math.sin(th);n=[u[i]*co+v[i]*si for i in range(3)];p=[center[i]+rad*n[i] for i in range(3)];add_vertex(p,n,color,[jointA,jointB,0,0],[1-t,t,0,0])
 for r in range(rows-1):
  for s in range(segments):
   a0=base+r*segments+s;a1=base+r*segments+(s+1)%segments;b0=base+(r+1)*segments+s;b1=base+(r+1)*segments+(s+1)%segments;I.extend([a0,b0,a1,a1,b0,b1])
def wedge(points,color,joint):
 base=len(P)//3;center=[sum(p[i]for p in points)/len(points)for i in range(3)]
 for p in points:
  n=[p[i]-center[i]for i in range(3)];l=math.sqrt(sum(x*x for x in n))or 1;add_vertex(p,[x/l for x in n],color,[joint,0,0,0],[1,0,0,0])
 for k in range(1,len(points)-1):I.extend([base,base+k,base+k+1])
bones=[('root',-1,[0,0,0]),('hips',0,[0,1.02,0]),('spine',1,[0,1.27,0]),('chest',2,[0,1.58,0]),('neck',3,[0,1.83,0]),('head',4,[0,2.02,0]),('upperArmL',3,[-.30,1.68,0]),('lowerArmL',6,[-.58,1.50,0]),('handL',7,[-.78,1.31,0]),('upperArmR',3,[.30,1.68,0]),('lowerArmR',9,[.58,1.50,0]),('handR',10,[.78,1.31,0]),('upperLegL',1,[-.17,.92,0]),('lowerLegL',12,[-.20,.48,0]),('footL',13,[-.21,.10,.11]),('upperLegR',1,[.17,.92,0]),('lowerLegR',15,[.20,.48,0]),('footR',16,[.21,.10,.11])]
ellipsoid([0,1.47,0],[.34,.43,.19],14,9,BLUE,3);ellipsoid([0,1.02,0],[.30,.25,.18],12,7,NAVY,1);ellipsoid([0,1.98,0],[.22,.27,.20],14,9,SKIN,5);ellipsoid([0,1.80,0],[.11,.13,.10],10,6,SKIN_D,4);ellipsoid([-.075,2.02,.185],[.034,.018,.012],8,4,WHITE,5);ellipsoid([[.075,2.02,.185][0],[.075,2.02,.185][1],[.075,2.02,.185][2]],[.034,.018,.012],8,4,WHITE,5)
tapered_limb([-.28,1.65,0],[-.56,1.48,0],.13,.11,SKIN,6,7);tapered_limb([-.56,1.48,0],[-.78,1.29,.02],.11,.085,NAVY,7,8);ellipsoid([-.80,1.27,.02],[.09,.10,.09],9,5,SKIN,8);tapered_limb([.28,1.65,0],[.56,1.48,0],.13,.11,SKIN,9,10);tapered_limb([.56,1.48,0],[.78,1.29,.02],.11,.085,NAVY,10,11);ellipsoid([.80,1.27,.02],[.09,.10,.09],9,5,SKIN,11);tapered_limb([-.16,.95,0],[-.20,.49,0],.17,.14,NAVY,12,13);tapered_limb([-.20,.49,0],[-.21,.12,.05],.14,.11,NAVY,13,14);ellipsoid([-.22,.10,.15],[.14,.09,.23],10,5,NAVY,14);tapered_limb([.16,.95,0],[.20,.49,0],.17,.14,NAVY,15,16);tapered_limb([.20,.49,0],[.21,.12,.05],.14,.11,NAVY,16,17);ellipsoid([.22,.10,.15],[.14,.09,.23],10,5,NAVY,17);ellipsoid([0,1.12,.02],[.34,.085,.20],12,5,ORANGE,1)
for x0,y0,z0,xt,yt,zt in[(-.18,2.16,-.03,-.29,2.48,-.02),(-.09,2.18,-.05,-.13,2.57,-.02),(0,2.18,-.06,.02,2.64,-.01),(.09,2.18,-.05,.16,2.56,-.01),(.18,2.15,-.03,.31,2.46,0)]:wedge([[x0-.075,y0,z0-.07],[x0+.075,y0,z0-.07],[x0+.06,y0,z0+.10],[x0-.06,y0,z0+.10],[xt,yt,zt]],HAIR,5)
for x,sgn in[(-.22,-1),(.22,1)]:wedge([[x,2.05,-.08],[x,2.23,-.05],[x+sgn*.18,2.34,0],[x+sgn*.08,2.03,.08]],HAIR_HI,5)
binbuf=bytearray();views=[];accessors=[]
def align4():
 while len(binbuf)%4:binbuf.append(0)
def add_data(data,fmt,ctype,typ,count,target=None,minv=None,maxv=None):
 align4();off=len(binbuf);raw=struct.pack('<'+fmt*len(data),*data);binbuf.extend(raw);vi=len(views);v={'buffer':0,'byteOffset':off,'byteLength':len(raw)}
 if target:v['target']=target
 views.append(v);ai=len(accessors);a={'bufferView':vi,'componentType':ctype,'count':count,'type':typ}
 if minv is not None:a['min']=minv
 if maxv is not None:a['max']=maxv
 accessors.append(a);return ai
mins=[min(P[i::3])for i in range(3)];maxs=[max(P[i::3])for i in range(3)];a_pos=add_data(P,'f',5126,'VEC3',len(P)//3,34962,mins,maxs);a_nor=add_data(N,'f',5126,'VEC3',len(N)//3,34962);a_col=add_data(C,'f',5126,'VEC4',len(C)//4,34962);a_j=add_data(J,'B',5121,'VEC4',len(J)//4,34962);a_w=add_data(W,'f',5126,'VEC4',len(W)//4,34962);index_ctype=5123 if max(I)<65536 else 5125;a_i=add_data(I,'H'if index_ctype==5123 else'I',index_ctype,'SCALAR',len(I),34963,[min(I)],[max(I)])
nodes=[]
for i,(name,parent,world)in enumerate(bones):
 local=world if parent<0 else[world[k]-bones[parent][2][k]for k in range(3)];nodes.append({'name':name,'translation':local})
for i,(_,parent,_)in enumerate(bones):
 if parent>=0:nodes[parent].setdefault('children',[]).append(i)
mesh_node=len(nodes);nodes.append({'name':'GriffinMesh','mesh':0,'skin':0});ibm=[]
for _,_,world in bones:ibm.extend(mat4_inv_t(world))
a_ibm=add_data(ibm,'f',5126,'MAT4',len(bones));animations=[]
def add_anim(name,tracks):
 samplers=[];channels=[]
 for node,path,times,vals in tracks:
  ai=add_data(times,'f',5126,'SCALAR',len(times),None,[min(times)],[max(times)]);size=4 if path=='rotation'else 3;ao=add_data([v for row in vals for v in row],'f',5126,'VEC4'if size==4 else'VEC3',len(vals));samplers.append({'input':ai,'output':ao,'interpolation':'LINEAR'});channels.append({'sampler':len(samplers)-1,'target':{'node':node,'path':path}})
 animations.append({'name':name,'samplers':samplers,'channels':channels})
def Q(axis,deg):return q_axis(axis,math.radians(deg))
add_anim('Idle',[(3,'rotation',[0,1,2],[Q([0,0,1],-2),Q([0,0,1],2),Q([0,0,1],-2)]),(5,'rotation',[0,1,2],[Q([0,1,0],-3),Q([0,1,0],4),Q([0,1,0],-3)])]);add_anim('Guard',[(6,'rotation',[0,.35,.8],[Q([0,0,1],0),Q([0,0,1],-34),Q([0,0,1],-18)]),(9,'rotation',[0,.35,.8],[Q([0,0,1],0),Q([0,0,1],34),Q([0,0,1],18)]),(7,'rotation',[0,.35,.8],[Q([1,0,0],0),Q([1,0,0],-48),Q([1,0,0],-24)]),(10,'rotation',[0,.35,.8],[Q([1,0,0],0),Q([1,0,0],-48),Q([1,0,0],-24)])]);add_anim('Jab',[(9,'rotation',[0,.18,.36,.62],[Q([0,0,1],10),Q([0,1,0],-18),Q([0,1,0],-8),Q([0,0,1],10)]),(10,'rotation',[0,.18,.36,.62],[Q([1,0,0],0),Q([1,0,0],-75),Q([1,0,0],-45),Q([1,0,0],0)]),(3,'rotation',[0,.18,.62],[Q([0,1,0],0),Q([0,1,0],-14),Q([0,1,0],0)])]);add_anim('Kick',[(15,'rotation',[0,.25,.52,.9],[Q([1,0,0],0),Q([1,0,0],-65),Q([1,0,0],24),Q([1,0,0],0)]),(16,'rotation',[0,.25,.52,.9],[Q([1,0,0],0),Q([1,0,0],52),Q([1,0,0],-18),Q([1,0,0],0)]),(1,'rotation',[0,.25,.9],[Q([0,0,1],0),Q([0,0,1],-7),Q([0,0,1],0)])]);add_anim('PowerUp',[(1,'translation',[0,.55,1.1,1.55],[[0,1.02,0],[0,1.06,0],[0,1.02,0],[0,1.05,0]]),(6,'rotation',[0,.55,1.1,1.55],[Q([0,0,1],-8),Q([0,0,1],-24),Q([0,0,1],-8),Q([0,0,1],-20)]),(9,'rotation',[0,.55,1.1,1.55],[Q([0,0,1],8),Q([0,0,1],24),Q([0,0,1],8),Q([0,0,1],20)]),(5,'rotation',[0,.55,1.1,1.55],[Q([1,0,0],0),Q([1,0,0],-9),Q([1,0,0],0),Q([1,0,0],-6)])])
doc={'asset':{'version':'2.0','generator':'Jarvis Griffin Production 189 skeletal authoring pipeline'},'scene':0,'scenes':[{'nodes':[0,mesh_node]}],'nodes':nodes,'meshes':[{'name':'GriffinHeroMesh','primitives':[{'attributes':{'POSITION':a_pos,'NORMAL':a_nor,'COLOR_0':a_col,'JOINTS_0':a_j,'WEIGHTS_0':a_w},'indices':a_i,'mode':4}]}],'skins':[{'name':'GriffinHumanoidSkin','inverseBindMatrices':a_ibm,'joints':list(range(len(bones))),'skeleton':0}],'animations':animations,'buffers':[{'byteLength':len(binbuf)}],'bufferViews':views,'accessors':accessors};js=json.dumps(doc,separators=(',',':')).encode()
while len(js)%4:js+=b' '
while len(binbuf)%4:binbuf.append(0)
total=12+8+len(js)+8+len(binbuf);glb=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binbuf),b'BIN\0')+binbuf;OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_bytes(glb);print(json.dumps({'production':189,'path':str(OUT),'bytes':len(glb),'vertices':len(P)//3,'triangles':len(I)//3,'bones':len(bones),'clips':[a['name']for a in animations]}))
