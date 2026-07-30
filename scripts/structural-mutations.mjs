const variants={
 trait:[
  {id:'trait-confidence-rate',summary:'Rebuild personality learning rate around confidence and disagreement',apply:s=>s.replace(/local function trait\(old,score,rate\)[^\n]*/,`local function trait(old,score,rate)old=clamp(old or 50,0,99);score=clamp(score or 50,0,99);local d=score-old;local c=clamp((V[638]or 50)/100,.2,.8);local r=(rate or .015)*(.72+c*.76)*(1+clamp(m_abs(d)/60,0,.35));return clamp(old+d*r,0,99)end`)},
  {id:'trait-stability-zone',summary:'Add a stability zone so tiny personality noise learns slowly and large evidence learns faster',apply:s=>s.replace(/local function trait\(old,score,rate\)[^\n]*/,`local function trait(old,score,rate)old=clamp(old or 50,0,99);score=clamp(score or 50,0,99);local d=score-old;local z=m_abs(d)<3 and .35 or m_abs(d)>24 and 1.28 or 1;local r=(rate or .015)*z*clamp(.8+(V[638]or 50)/125,.9,1.45);return clamp(old+d*r,0,99)end`)}
 ],
 md:[
  {id:'meta-trend-verifier',summary:'Rebuild meta-learning verification with direction, magnitude and adaptive baseline speed',apply:s=>s.replace(/local function md\(j,x,b\)[^\n]*/,`local function md(j,x,b)local old=V[b]or x;local d=x-old;local prior=(V[j]or 50)-50;local same=prior*d>0 and 1 or 0;local mag=clamp(m_abs(d)*5,0,49);V[j]=trait(V[j],50+(d>=0 and mag or -mag),.24);local a=m_abs(d)>12 and .42 or .26;V[b]=clamp(old+(x-old)*a,0,99);return same end`)},
  {id:'meta-hysteresis-verifier',summary:'Add hysteresis to meta-learning so one noisy sample cannot reverse a learned trend',apply:s=>s.replace(/local function md\(j,x,b\)[^\n]*/,`local function md(j,x,b)local old=V[b]or x;local d=x-old;local p=(V[j]or 50)-50;local same=p*d>0 and 1 or 0;local target=m_abs(d)<2 and 50 or clamp(50+d*3.5,0,99);V[j]=trait(V[j],target,m_abs(d)>10 and .31 or .18);V[b]=clamp(old*.74+x*.26,0,99);return same end`)}
 ],
 lerp:[
  {id:'bounded-ease-blend',summary:'Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions',apply:s=>s.replace(/local function lerp\(a,b,t\)[^\n]*/,`local function lerp(a,b,t)t=clamp(t,0,1);t=t*t*(3-2*t);return a+(b-a)*t end`)},
  {id:'adaptive-linear-blend',summary:'Keep linear response near center while softening only the ends of state transitions',apply:s=>s.replace(/local function lerp\(a,b,t\)[^\n]*/,`local function lerp(a,b,t)t=clamp(t,0,1);local u=t<.2 and t*(.8+t)or t>.8 and 1-(1-t)*(.8+1-t)or t;return a+(b-a)*clamp(u,0,1)end`)}
 ],
 q:[
  {id:'safe-quantizer',summary:'Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding',apply:s=>s.replace(/local function q\(x,a,b\)[^\n]*/,`local function q(x,a,b)a=a or 0;b=b or 99;if bad(x)then return a end;x=clamp(x,a,b);return x>=0 and m_floor(x+.5)or-m_floor(-x+.5)end`)},
  {id:'sentinel-aware-quantizer',summary:'Preserve loud invalid telemetry sentinel behavior while making range handling explicit',apply:s=>s.replace(/local function q\(x,a,b\)[^\n]*/,`local function q(x,a,b)a=a or 0;b=b or 99;if bad(x)then return 0 end;local y=clamp(x,a,b);return m_floor(y+.5)end`)}
 ],
 i9:[
  {id:'saturating-session-counter',summary:'Rebuild persistent session counter as explicit saturating arithmetic',apply:s=>s.replace(/local function i9\(x\)[^\n]*/,`local function i9(x)x=tonumber(x)or 0;if x<0 then x=0 end;if x>=99 then return 99 end;return x+1 end`)}
 ]
};
export function structuralMutate(source,family,slot,rnd){
 const plans={monday:['lerp','q'],tuesday:['lerp','i9'],cloud:['trait','md'],html:['q','i9','trait']};
 const keys=plans[family]||Object.keys(variants),key=keys[Math.floor(rnd()*keys.length)],list=variants[key],v=list[(slot+Math.floor(rnd()*list.length))%list.length],out=v.apply(source);
 if(out===source)throw Error(`Structural mutation ${v.id} did not match parent source`);
 return{source:out,change:{kind:'function',function:key,variant:v.id,label:`${key} function rewrite`,summary:v.summary,from:'parent implementation',to:v.id}};
}
