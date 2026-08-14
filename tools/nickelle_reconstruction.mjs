import fs from 'node:fs';

const truth=JSON.parse(fs.readFileSync('truth/truth.json','utf8'));
const twin=JSON.parse(fs.readFileSync('michael/digital-twin.json','utf8'));
const heavy=fs.existsSync('nickelle/heavy-memory.json')?JSON.parse(fs.readFileSync('nickelle/heavy-memory.json','utf8')):{};
const refs=fs.existsSync('michael/visual/reference-metrics.json')?JSON.parse(fs.readFileSync('michael/visual/reference-metrics.json','utf8')):{};
const research=fs.existsSync('nickelle/research/constraints.json')?JSON.parse(fs.readFileSync('nickelle/research/constraints.json','utf8')):{};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

function researchFor(part){return research.componentConstraints?.[part]||null}
function truthConfidence(v){return Number(v?.confidence||.5)}
function belief(part,truthFact){
  const r=researchFor(part),tc=truthConfidence(truthFact),rc=Number(r?.confidence||0);
  return {truth:truthFact||null,research:r,confidence:truthFact?Math.max(tc,Math.min(tc+.12,tc+rc*.08)):Math.max(.35,rc*.72),authority:truthFact?'owner_truth_over_research':'nickelle_research'};
}
function build(){
  const facts=truth.visualFacts||{};
  const heavyConf=Number(heavy.confidence||heavy.lastConfidence||0);
  const evidenceCount=Object.keys(facts).length;
  const referenceViews=Object.keys(refs).filter(k=>refs[k]&&typeof refs[k]==='object').length;
  const researchConf=Number(research.confidence||0),researchParts=Object.keys(research.componentConstraints||{}).length;
  const confidence=clamp(.42+evidenceCount*.035+referenceViews*.025+heavyConf*.16+researchConf*.10+Math.min(.06,researchParts*.008));
  const beliefs={
    front_grille:belief('front_grille',facts.frontGrille),
    projector_left:belief('projector_left',facts.projectors||facts.frontLights),
    projector_right:belief('projector_right',facts.projectors||facts.frontLights),
    roof_scoop:belief('roof_scoop',facts.roofScoop),
    rear_wing:belief('rear_wing',facts.rearWing),
    front_arches:belief('front_arches',facts.frontArches),
    side_structure:belief('side_structure',facts.sideStructure),
    wheels:belief('wheels',facts.wheels),
    diffuser:belief('diffuser',facts.diffuser),
    livery:belief('livery',facts.livery)
  };
  const unresolved=[...(truth.contradictions||[]).map(x=>({type:'truth_contradiction',detail:x})),...(research.contradictions||[]).map(x=>({type:'research_contradiction',detail:x})),...(research.researchGaps||[]).map(x=>({type:'research_gap',detail:x}))];
  const out={schema:2,engine:'NICKELLE_RECONSTRUCTION_V2_RESEARCH_FUSED',generatedAt:new Date().toISOString(),truthAuthority:'truth/truth.json',researchAuthority:'nickelle/research/constraints.json',confidence,cameraRegistration:{mode:'multiview_bbox_plus_depth_plus_research',referenceViews,confidence:clamp(.35+referenceViews*.08+heavyConf*.15+researchConf*.05)},geometryBeliefs:beliefs,semanticParts:Object.keys(twin.parts||{}),heavyPerception:{cycles:heavy.cycles||0,lastRun:heavy.lastRun||null,confidence:heavyConf},researchPerception:{sourceRunId:research.sourceRunId||null,sourceCount:research.sourceCount||0,acceptedFindingCount:research.acceptedFindingCount||0,components:researchParts,confidence:researchConf},protectedOwnerFacts:research.protectedOwnerFacts||[],unresolved};
  fs.writeFileSync('nickelle/reconstruction.json',JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({confidence:out.confidence,parts:out.semanticParts.length,referenceViews,researchParts,researchConfidence:researchConf},null,2));
}
build();
