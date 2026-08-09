import fs from 'node:fs';

const truth=JSON.parse(fs.readFileSync('truth/truth.json','utf8'));
const twin=JSON.parse(fs.readFileSync('michael/digital-twin.json','utf8'));
const heavy=fs.existsSync('nickelle/heavy-memory.json')?JSON.parse(fs.readFileSync('nickelle/heavy-memory.json','utf8')):{};
const refs=fs.existsSync('michael/visual/reference-metrics.json')?JSON.parse(fs.readFileSync('michael/visual/reference-metrics.json','utf8')):{};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

function build(){
  const facts=truth.visualFacts||{};
  const heavyConf=Number(heavy.confidence||heavy.lastConfidence||0);
  const evidenceCount=Object.keys(facts).length;
  const referenceViews=Object.keys(refs).filter(k=>refs[k]&&typeof refs[k]==='object').length;
  const confidence=clamp(.45+evidenceCount*.035+referenceViews*.025+heavyConf*.18);
  const belief={
    schema:1,
    engine:'NICKELLE_RECONSTRUCTION_V1',
    generatedAt:new Date().toISOString(),
    truthAuthority:'truth/truth.json',
    confidence,
    cameraRegistration:{mode:'multiview_bbox_plus_depth',referenceViews,confidence:clamp(.35+referenceViews*.08+heavyConf*.15)},
    geometryBeliefs:{
      front_grille:{truth:facts.frontGrille||null,confidence:facts.frontGrille?.confidence||.5},
      roof_scoop:{truth:facts.roofScoop||null,confidence:facts.roofScoop?.confidence||.5},
      rear_wing:{truth:facts.rearWing||null,confidence:facts.rearWing?.confidence||.5},
      front_arches:{truth:facts.frontArches||null,confidence:facts.frontArches?.confidence||.5},
      side_structure:{truth:facts.sideStructure||null,confidence:facts.sideStructure?.confidence||.5},
      wheels:{truth:facts.wheels||null,confidence:facts.wheels?.confidence||.5}
    },
    semanticParts:Object.keys(twin.parts||{}),
    heavyPerception:{cycles:heavy.cycles||0,lastRun:heavy.lastRun||null,confidence:heavyConf},
    unresolved:(truth.contradictions||[]).map(x=>({type:'truth_contradiction',detail:x}))
  };
  fs.writeFileSync('nickelle/reconstruction.json',JSON.stringify(belief,null,2)+'\n');
  console.log(JSON.stringify({confidence:belief.confidence,parts:belief.semanticParts.length,referenceViews},null,2));
}
build();
