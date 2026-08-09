import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';

const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
const model=process.env.MICHAEL_VISUAL_MODEL||'openai/gpt-4.1';
const truth=JSON.parse(fs.readFileSync('michael/visual/owner-truth.json','utf8'));
const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const state=JSON.parse(fs.readFileSync('michael/visual/state.json','utf8'));
let research='';try{research=fs.readFileSync('factory/memory/external-research.json','utf8').slice(-14000)}catch{}
const views=['front','three','side','rear','top'];
const referenceTruth=JSON.parse(fs.readFileSync('michael/visual/reference-metrics.json','utf8'));
const image=(dir,v)=>({type:'image_url',image_url:{url:`data:image/png;base64,${fs.readFileSync(path.join(dir,`${v}.png`)).toString('base64')}`}});
const extract=t=>{let s=t.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]||t,a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw Error('visual judge returned no JSON');return JSON.parse(s.slice(a,b+1))};
async function ask(content){
  if(!token)throw Error('no GitHub Models token');
  const res=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model,temperature:.1,max_tokens:6500,messages:[{role:'system',content:'You are Michael Visual Engineer. Judge only visible fidelity of the rendered MJX 7303/Citroen C3 WRC twin. Owner truth is highest authority. Never request changes to dynamics, steering, camera presets, telemetry, controller logic or licensed mesh transform. Return strict JSON only.'},{role:'user',content}]})});
  const raw=await res.text();if(!res.ok)throw Error(`GitHub Models ${res.status}: ${raw.slice(0,1200)}`);return extract(JSON.parse(raw).choices?.[0]?.message?.content||'')
}
function decode(file){const p=PNG.sync.read(fs.readFileSync(file));return{width:p.width,height:p.height,data:p.data}}
const rgb=(d,i)=>[d[i],d[i+1],d[i+2]],lum=(r,g,b)=>.2126*r+.7152*g+.0722*b;
const isRed=(r,g,b)=>r>55&&r>g*1.34&&r>b*1.22;
const isDark=(r,g,b)=>r<58&&g<62&&b<68;
const isWhite=(r,g,b)=>r>145&&g>145&&b>140&&Math.max(r,g,b)-Math.min(r,g,b)<60;
const isYellow=(r,g,b)=>r>120&&g>68&&g<205&&b<100&&r>g*1.10;
function components(mask,w,h,minArea=8){
  const seen=new Uint8Array(mask.length),out=[],q=new Int32Array(mask.length);
  for(let p=0;p<mask.length;p++){
    if(!mask[p]||seen[p])continue;
    let qh=0,qt=0;q[qt++]=p;seen[p]=1;
    let n=0,minx=w,miny=h,maxx=0,maxy=0;
    while(qh<qt){
      const u=q[qh++],x=u%w,y=(u/w)|0;n++;
      if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;
        const v=yy*w+xx;if(mask[v]&&!seen[v]){seen[v]=1;q[qt++]=v}
      }
    }
    if(n>=minArea)out.push({area:n,bbox:[minx,miny,maxx,maxy],cx:(minx+maxx)/2,cy:(miny+maxy)/2,w:maxx-minx+1,h:maxy-miny+1});
  }
  return out.sort((a,b)=>b.area-a.area);
}
function analyzeFile(file){
  const p=decode(file),w=p.width,h=p.height,d=p.data;let minx=w,miny=h,maxx=0,maxy=0,bodySeeds=0;
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4,[r,g,b]=rgb(d,i);if(isRed(r,g,b)||isYellow(r,g,b)){bodySeeds++;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}}
  if(bodySeeds<60)return{valid:false};const padX=Math.max(10,(maxx-minx)*.12),padY=Math.max(10,(maxy-miny)*.12);minx=Math.max(0,Math.floor(minx-padX));maxx=Math.min(w-1,Math.ceil(maxx+padX));miny=Math.max(0,Math.floor(miny-padY));maxy=Math.min(h-1,Math.ceil(maxy+padY));const bw=maxx-minx+1,bh=maxy-miny+1;
  let n=0,red=0,dark=0,white=0,yellow=0,edge=0,centerN=0,centerDark=0,lowerN=0,lowerDark=0,topN=0,topWhite=0,leftLum=0,rightLum=0,symN=0;
  const ww=bw,hh=bh,whiteMask=new Uint8Array(ww*hh),darkMask=new Uint8Array(ww*hh);
  for(let yy=0;yy<hh;yy++)for(let xx=0;xx<ww;xx++){const x=minx+xx,y=miny+yy,i=(y*w+x)*4,[r,g,b]=rgb(d,i);n++;const D=isDark(r,g,b),W=isWhite(r,g,b);if(isRed(r,g,b))red++;if(D)dark++;if(W)white++;if(isYellow(r,g,b))yellow++;whiteMask[yy*ww+xx]=W?1:0;darkMask[yy*ww+xx]=D?1:0;if(xx>ww*.22&&xx<ww*.78&&yy>hh*.32&&yy<hh*.82){centerN++;if(D)centerDark++}if(yy>hh*.52){lowerN++;if(D)lowerDark++}if(yy<hh*.34){topN++;if(W)topWhite++}if(xx+1<ww&&yy+1<hh){const i2=(y*w+x+1)*4,i3=((y+1)*w+x)*4,L=lum(r,g,b);if(Math.abs(L-lum(d[i2],d[i2+1],d[i2+2]))>32||Math.abs(L-lum(d[i3],d[i3+1],d[i3+2]))>32)edge++}}
  for(let yy=0;yy<hh;yy+=2)for(let xx=0;xx<Math.floor(ww/2);xx+=2){const a=((miny+yy)*w+(minx+xx))*4,b=((miny+yy)*w+(minx+ww-1-xx))*4;leftLum=lum(d[a],d[a+1],d[a+2]);rightLum=lum(d[b],d[b+1],d[b+2]);symN+=Math.abs(leftLum-rightLum)/255}
  const whites=components(whiteMask,ww,hh,18).filter(c=>c.cy>hh*.45&&c.w>hh*.08&&c.h>hh*.08).slice(0,4);const wheelLike=whites.filter(c=>{const ar=c.w/c.h;return ar>.55&&ar<1.8&&c.cy>hh*.55}).sort((a,b)=>b.area-a.area).slice(0,2);const wheelFill=wheelLike.length?wheelLike.reduce((s,c)=>s+Math.sqrt(c.w*c.h)/hh,0)/wheelLike.length:0;
  const darkComps=components(darkMask,ww,hh,28).filter(c=>c.cy>hh*.28&&c.cy<hh*.78);const pods=darkComps.filter(c=>c.cx<ww*.34||c.cx>ww*.66).filter(c=>c.w/hh>.04&&c.h/hh>.03).slice(0,4);const podAspect=pods.length?pods.reduce((s,c)=>s+c.w/Math.max(1,c.h),0)/pods.length:0;
  const darkRows=[];for(let yy=Math.floor(hh*.45);yy<Math.floor(hh*.82);yy++){let lo=ww,hi=-1;for(let xx=0;xx<ww;xx++)if(darkMask[yy*ww+xx]){lo=Math.min(lo,xx);hi=Math.max(hi,xx)}if(hi>=lo)darkRows.push((hi-lo+1)/ww)}const darkSpan=darkRows.length?darkRows.sort((a,b)=>a-b)[Math.floor(darkRows.length*.75)]:0;
  return{valid:true,red:red/n,dark:dark/n,white:white/n,yellow:yellow/n,bbox:[minx,miny,maxx,maxy],bboxAspect:bw/bh,centerDark:centerN?centerDark/centerN:0,lowerDark:lowerN?lowerDark/lowerN:0,topWhite:topN?topWhite/topN:0,edgeDensity:edge/n,symmetryError:symN/Math.max(1,(Math.ceil(hh/2)*Math.ceil(ww/4))),wheelFill,podAspect,darkSpan,whiteComponents:whites.slice(0,3).map(c=>({w:c.w/ww,h:c.h/hh,cx:c.cx/ww,cy:c.cy/hh})),darkComponents:darkComps.slice(0,5).map(c=>({w:c.w/ww,h:c.h/hh,cx:c.cx/ww,cy:c.cy/hh}))};
}
function localAnalyze(dir){const s={};for(const v of views)s[v]=analyzeFile(path.join(dir,`${v}.png`));return s}
const refStats={three:referenceTruth.three||{},side:referenceTruth.side||{}};
const closeness=(a,b,tol)=>Number.isFinite(a)&&Number.isFinite(b)?Math.max(0,1-Math.abs(a-b)/tol):0;
function scoreParts(s){if(!s.front?.valid||!s.side?.valid||!s.three?.valid)return{total:0,parts:{}};const rs=refStats.side||{},rt=refStats.three||{};const parts={
  grille:closeness(s.front.centerDark,Math.max(.16,rt.centerDark||.20),.18),
  grilleSpan:closeness(s.front.darkSpan,Math.max(.45,rt.darkSpan||.55),.28),
  sideSilhouette:closeness(s.side.bboxAspect,rs.bboxAspect||2.0,.55),
  threeSilhouette:closeness(s.three.bboxAspect,rt.bboxAspect||1.55,.48),
  sideDark:closeness(s.side.lowerDark,rs.lowerDark||.22,.18),
  wheelFill:closeness(s.side.wheelFill,rs.wheelFill||.20,.12),
  roofWhite:closeness(s.side.topWhite,rs.topWhite||.16,.16),
  liveryYellow:closeness(s.side.yellow,rs.yellow||.008,.015),
  edgeDetail:(closeness(s.side.edgeDensity,rs.edgeDensity||.14,.12)+closeness(s.three.edgeDensity,rt.edgeDensity||.15,.12))/2,
  projectorShape:closeness(s.front.podAspect,1.28,.70),
  frontSymmetry:closeness(s.front.symmetryError,.10,.22),
  rearMass:closeness(s.rear?.lowerDark||0,.22,.20)
};const weights={grille:1.4,grilleSpan:1.1,sideSilhouette:1.2,threeSilhouette:1,wheelFill:1.4,sideDark:1.2,roofWhite:.8,liveryYellow:.7,edgeDetail:1.2,projectorShape:1.1,frontSymmetry:.7,rearMass:.7};let sum=0,w=0;for(const [k,v] of Object.entries(parts)){sum+=v*weights[k];w+=weights[k]}return{total:Math.round(sum/w*10000)/100,parts:Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,Math.round(v*1000)/10]))}}
function bounded(k,v){if(!genome.bounds[k])return genome.parameters[k];const [lo,hi]=genome.bounds[k],old=genome.parameters[k],max=(hi-lo)*(genome.maxStepFraction||.18);return Math.round(Math.max(old-max,Math.min(old+max,Math.max(lo,Math.min(hi,v))))*10000)/10000}
function localProposal(dir,why){const s=localAnalyze(dir),sc=scoreParts(s),c={},d=[],rs=refStats.side||{},rt=refStats.three||{};
  const targetCenter=Math.max(.16,rt.centerDark||.20);if(s.front.centerDark<targetCenter-.025){c.grille_half_bottom=bounded('grille_half_bottom',genome.parameters.grille_half_bottom+.025);c.grille_half_top=bounded('grille_half_top',genome.parameters.grille_half_top+.018);c.grille_top_y=bounded('grille_top_y',genome.parameters.grille_top_y+.012);d.push(`Front grille center-dark geometry is too small (${s.front.centerDark.toFixed(3)} vs ${targetCenter.toFixed(3)} reference-derived target).`)}else if(s.front.centerDark>targetCenter+.04){c.grille_half_bottom=bounded('grille_half_bottom',genome.parameters.grille_half_bottom-.018);c.grille_half_top=bounded('grille_half_top',genome.parameters.grille_half_top-.014);d.push('Front grille occupies too much of the center mask.')}
  const targetSide=rs.lowerDark||.22;if(s.side.lowerDark<targetSide-.025){c.door_black_top=bounded('door_black_top',genome.parameters.door_black_top+.018);c.door_black_bottom=bounded('door_black_bottom',genome.parameters.door_black_bottom-.008);d.push('Lower-door carbon/black region is smaller than owner-side reference.')}else if(s.side.lowerDark>targetSide+.035){c.door_black_top=bounded('door_black_top',genome.parameters.door_black_top-.015);d.push('Lower-door black region is too dominant against owner-side reference.')}
  const targetYellow=rs.yellow||.008;if(s.side.yellow<targetYellow*.72){c.skirt_y_top=bounded('skirt_y_top',genome.parameters.skirt_y_top+.008);d.push('Yellow skirt accent is thinner/less visible than owner-side reference.')}
  if(s.front.podAspect&&s.front.podAspect>1.48){c.projector_black_outer_rx=bounded('projector_black_outer_rx',genome.parameters.projector_black_outer_rx-.006);c.projector_black_outer_ry=bounded('projector_black_outer_ry',genome.parameters.projector_black_outer_ry+.004);d.push(`Projector pod mask is too horizontally stretched (aspect ${s.front.podAspect.toFixed(2)}).`)}else if(s.front.podAspect&&s.front.podAspect<1.08){c.projector_black_outer_rx=bounded('projector_black_outer_rx',genome.parameters.projector_black_outer_rx+.005);d.push('Projector pod mask is too narrow/tall.')}
  if(rs.wheelFill&&s.side.wheelFill<rs.wheelFill*.82)d.push(`Wheel/arch fill is visibly low (${s.side.wheelFill.toFixed(3)} vs owner ${rs.wheelFill.toFixed(3)}); current genome has no wheel-size authority, so do not fake this with another overlay.`)
  if(Math.abs(s.side.bboxAspect-(rs.bboxAspect||s.side.bboxAspect))>.22)d.push('Side silhouette/body proportion differs materially from the owner photo; prefer native renderer/body authority rather than cosmetic overlays.')
  if(!Object.keys(c).length){const weakest=Object.entries(sc.parts).sort((a,b)=>a[1]-b[1])[0]?.[0];if(weakest==='roofWhite'){c.roof_y_front=bounded('roof_y_front',genome.parameters.roof_y_front+.006);c.roof_y_rear=bounded('roof_y_rear',genome.parameters.roof_y_rear+.006)}else if(weakest==='rearMass'){c.diffuser_half_bottom=bounded('diffuser_half_bottom',genome.parameters.diffuser_half_bottom+.012);c.diffuser_half_top=bounded('diffuser_half_top',genome.parameters.diffuser_half_top+.010)}else{c.projector_black_outer_rx=bounded('projector_black_outer_rx',genome.parameters.projector_black_outer_rx-.004)}d.push(`No gross color error found; conservative mutation targets weakest measured geometry subsystem: ${weakest}.`)}
  return{score:sc.total,subsystemScores:{front:Math.round((sc.parts.grille*.35+sc.parts.grilleSpan*.25+sc.parts.projectorShape*.25+sc.parts.frontSymmetry*.15)*10)/10,side:Math.round((sc.parts.sideSilhouette*.25+sc.parts.sideDark*.25+sc.parts.wheelFill*.30+sc.parts.edgeDetail*.20)*10)/10,rear:sc.parts.rearMass,top:Math.round((sc.parts.roofWhite*.6+sc.parts.edgeDetail*.4)*10)/10,stance:sc.parts.wheelFill,livery:Math.round((sc.parts.sideDark*.45+sc.parts.liveryYellow*.25+sc.parts.roofWhite*.30)*10)/10},diagnosis:[...d,`Geometry-aware deterministic critic used: ${why}`],candidateParameters:c,rationale:['Reference-image feature matching uses owner photos for silhouette, wheel fill, lower-body treatment, color distribution and edge/detail density; front canonical view adds grille span, pod shape and symmetry constraints.'],geometryMetrics:s,referenceMetrics:refStats,scoreParts:sc.parts,fallback:true,criticVersion:2}}
function localVerdict(base,cand,why){const bs=localAnalyze(base),cs=localAnalyze(cand),bp=scoreParts(bs),cp=scoreParts(cs),gain=cp.total-bp.total,reg=[];if(!cs.front?.valid||!cs.side?.valid||!cs.top?.valid)reg.push('Candidate render lost detectable body silhouette');for(const k of ['wheelFill','sideSilhouette','projectorShape','grille'])if((cp.parts[k]??100)<(bp.parts[k]??0)-5)reg.push(`${k} regressed ${(bp.parts[k]-cp.parts[k]).toFixed(1)} points`);return{baselineScore:bp.total,candidateScore:cp.total,promote:gain>=genome.minimumPromotionGain&&!reg.length,regressions:reg,improvements:gain>0?[`Geometry-aware owner-reference score improved ${gain.toFixed(2)} points`]:[],reason:`Geometry-aware local critic used because ${why}`,fallback:true,criticVersion:2,baselineParts:bp.parts,candidateParts:cp.parts,baselineStats:bs,candidateStats:cs,referenceMetrics:refStats}}
async function robust(content,fallback){try{return await ask(content)}catch(e){console.warn('External visual judge unavailable; using geometry-aware deterministic fallback:',e.message);return fallback(e.message)}}
const mode=process.argv[2];
if(mode==='propose'){
  const dir=process.argv[3],out=process.argv[4]||'/tmp/michael-proposal.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nCURRENT VISUAL GENOME:\n${JSON.stringify(genome)}\n\nPERSISTENT STATE:\n${JSON.stringify(state)}\n\nRECENT EXTERNAL RESEARCH:\n${research}\n\nInspect the five renders. Score 0-100. Explicitly assess silhouette, wheel/arch fill, grille bounding geometry, projector-pod aspect/placement, roof scoop/roof mass, wing/rear silhouette, symmetry and livery placement. Propose at most 6 conservative parameter values using only genome keys and bounds. Return {score,subsystemScores,diagnosis,candidateParameters,rationale}.`}];for(const v of views)content.push({type:'text',text:`VIEW ${v.toUpperCase()}`},image(dir,v));
  const result=await robust(content,e=>localProposal(dir,e));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else if(mode==='compare'){
  const base=process.argv[3],cand=process.argv[4],proposal=JSON.parse(fs.readFileSync(process.argv[5],'utf8')),out=process.argv[6]||'/tmp/michael-verdict.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nPROPOSED MUTATION:\n${JSON.stringify(proposal)}\n\nCompare BASELINE and CANDIDATE pairs. Explicitly compare silhouette, wheel/arch fill, grille, projector pods, roof/scoop, wing/rear geometry, symmetry and livery. Return {baselineScore,candidateScore,promote,regressions,improvements,reason}. Candidate must be visibly closer and have no meaningful regression.`}];for(const v of views)content.push({type:'text',text:`${v.toUpperCase()} BASELINE`},image(base,v),{type:'text',text:`${v.toUpperCase()} CANDIDATE`},image(cand,v));
  const result=await robust(content,e=>localVerdict(base,cand,e));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else throw Error('usage: node tools/michael_visual_judge.mjs propose <renderDir> <out.json> | compare <baselineDir> <candidateDir> <proposal.json> <out.json>');
