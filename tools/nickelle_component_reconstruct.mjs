import fs from 'node:fs';
import path from 'node:path';

const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const research=fs.existsSync('nickelle/research/constraints.json')?JSON.parse(fs.readFileSync('nickelle/research/constraints.json','utf8')):{};
const ref=JSON.parse(fs.readFileSync('michael/visual/reference-metrics.json','utf8'));
const owner=JSON.parse(fs.readFileSync('michael/visual/owner-truth.json','utf8'));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=v=>Math.round(v*10000)/10000;
const P=genome.parameters,B=genome.bounds;
const groups={
  headlights:['projector_outer_rx','projector_outer_ry','projector_red_inner_rx','projector_red_inner_ry','projector_black_outer_rx','projector_black_outer_ry','projector_black_inner_rx','projector_black_inner_ry'],
  grille:['grille_half_bottom','grille_half_top','grille_bottom_y','grille_top_y'],
  arches:['arch_x','wheel_track_x','wheel_radius','wheel_y'],
  roof_scoop:['scoop_width','scoop_height','scoop_length','roof_y_front','roof_y_rear'],
  rear_wing:['wing_end_x','diffuser_half_bottom','diffuser_half_top']
};
const aliases={headlights:['front_left_projector','front_right_projector','projector_left','projector_right'],grille:['front_grille'],arches:['front_arch_left','front_arch_right','front_arches','wheel_fl','wheel_fr'],roof_scoop:['roof_scoop'],rear_wing:['rear_wing','rear_diffuser','diffuser']};
function evidenceScore(group){let s=0,n=0,refs=0;for(const k of aliases[group]){const x=research.componentConstraints?.[k];if(!x)continue;n++;s+=Number(x.confidence||0);refs+=x.directVisualReferences?.length||0}return{confidence:n?s/n:0,references:refs}}
function step(k,dir,scale=1){const [lo,hi]=B[k],cur=P[k],span=hi-lo,max=span*(genome.maxStepFraction||.18)*scale;return round(clamp(cur+dir*max,lo,hi))}
function target(k,t,scale=.65){const [lo,hi]=B[k],cur=P[k],max=(hi-lo)*(genome.maxStepFraction||.18)*scale;return round(clamp(cur+clamp(t-cur,-max,max),lo,hi))}
function proposal(group,variant,params,why){return{schema:2,mode:'component_reconstruction',component:group,variant,candidateParameters:{...P,...params},diagnosis:[`Nickelle component reconstruction: ${group} / ${variant}.`,why,'Only this semantic component family is intentionally changed; cameras, driving physics, track and unrelated body systems remain invariant.'],rationale:['Reconstruct one exterior component at a time from owner-reference metrics plus direct automotive evidence.','Treat generated geometry as a challenger only; existing protected visual gates must prove it better before promotion.','Owner Truth outranks research and generated inference.'],requiresVisualValidation:true,reconstruction:{component:group,evidence:evidenceScore(group),referenceSource:ref.source,ownerTruthSchema:owner.schema||1}}
}
function candidates(){const out=[];
  // Headlamps: paired aspect/scale hypotheses, preserving concentric lens/projector structure.
  out.push(proposal('headlights','wider-lower',{projector_outer_rx:step('projector_outer_rx',1,.65),projector_outer_ry:step('projector_outer_ry',-1,.55),projector_red_inner_rx:step('projector_red_inner_rx',1,.45),projector_red_inner_ry:step('projector_red_inner_ry',-1,.4),projector_black_outer_rx:step('projector_black_outer_rx',1,.45),projector_black_outer_ry:step('projector_black_outer_ry',-1,.4)},'Tests the C3 WRC lamp family as a wider, flatter assembly instead of uniformly scaling all rings.'));
  out.push(proposal('headlights','compact-projector',{projector_red_inner_rx:step('projector_red_inner_rx',-1,.55),projector_red_inner_ry:step('projector_red_inner_ry',-1,.45),projector_black_inner_rx:step('projector_black_inner_rx',-1,.55),projector_black_inner_ry:step('projector_black_inner_ry',-1,.45)},'Tests smaller internal projector/lens elements while retaining the current outer lamp envelope.'));
  // Grille: reconstruct taper and vertical occupancy independently.
  out.push(proposal('grille','tapered-opening',{grille_half_bottom:step('grille_half_bottom',1,.55),grille_half_top:step('grille_half_top',-1,.55),grille_bottom_y:step('grille_bottom_y',-1,.35),grille_top_y:step('grille_top_y',1,.35)},'Tests a more pronounced WRC trapezoidal lower opening: wider at the bottom and tighter at the top.'));
  // Arch/stance uses owner side wheel-fill target to choose direction rather than random mutation.
  const wf=ref.side?.wheelFill||0.2357,curW=.21;const wd=wf>=curW?1:-1;
  out.push(proposal('arches','wheel-arch-fit',{arch_x:step('arch_x',wd,.35),wheel_radius:step('wheel_radius',wd,.45),wheel_track_x:step('wheel_track_x',wd,.25),wheel_y:step('wheel_y',-wd,.18)},`Owner side reference wheelFill=${wf.toFixed(4)} drives a coherent wheel/arch fit hypothesis rather than independent wheel mutations.`));
  // Scoop: two proportions around width/height/length while roof stays nearly fixed.
  out.push(proposal('roof_scoop','wide-low',{scoop_width:step('scoop_width',1,.55),scoop_height:step('scoop_height',-1,.55),scoop_length:step('scoop_length',1,.3)},'Tests the roof scoop as a broader, lower aero intake while preserving roof shell placement.'));
  // Rear wing/diffuser: targeted span and taper reconstruction.
  out.push(proposal('rear_wing','wing-diffuser-balance',{wing_end_x:step('wing_end_x',1,.45),diffuser_half_bottom:step('diffuser_half_bottom',1,.4),diffuser_half_top:step('diffuser_half_top',-1,.35)},'Tests stronger rear aero width with a more tapered diffuser, isolated from body-shell and camera geometry.'));
  return out.sort((a,b)=>(b.reconstruction.evidence.confidence+b.reconstruction.evidence.references*.01)-(a.reconstruction.evidence.confidence+a.reconstruction.evidence.references*.01));
}
const [mode,outDir='/tmp/nickelle-lab']=process.argv.slice(2);if(mode!=='generate')throw Error('usage: nickelle_component_reconstruct.mjs generate OUT_DIR');fs.mkdirSync(outDir,{recursive:true});const cs=candidates();let i=0;for(const c of cs){i++;const f=path.join(outDir,`reconstruct-${String(i).padStart(2,'0')}-${c.component}.json`);fs.writeFileSync(f,JSON.stringify(c,null,2)+'\n')}const report={schema:1,engine:'NICKELLE_COMPONENT_RECONSTRUCTION',generatedAt:new Date().toISOString(),count:cs.length,components:[...new Set(cs.map(x=>x.component))],candidates:cs.map(x=>({component:x.component,variant:x.variant,evidence:x.reconstruction.evidence}))};fs.writeFileSync(path.join(outDir,'component-reconstruction-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));