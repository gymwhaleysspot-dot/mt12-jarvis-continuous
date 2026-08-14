import fs from 'node:fs';

const researchPath='nickelle/research/current.json';
const directPath='nickelle/research/direct-evidence.json';
const constraintsPath='nickelle/research/constraints.json';
const queuePath='nickelle/research-queue.json';
const truthPath='truth/truth.json';
const twinPath='michael/digital-twin.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const research=read(researchPath),direct=fs.existsSync(directPath)?read(directPath):null,truth=read(truthPath),twin=read(twinPath),queue=read(queuePath);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const parts=new Set(Object.keys(twin.parts||{}));
const ownerTruth=truth.visualFacts||{};
const byPart={};
const aliases={projector_left:['front_left_projector'],projector_right:['front_right_projector'],front_arches:['front_arch_left','front_arch_right'],diffuser:['rear_diffuser'],livery:['paint'],side_lower_insert:['side_lower_insert_left','side_lower_insert_right']};

function normalizePart(p){const s=String(p||'');return aliases[s]||[s]}
function componentNames(x){const raw=x?.semanticComponents||x?.components||x?.component||x?.semanticComponent||[];return(Array.isArray(raw)?raw:[raw]).filter(Boolean).flatMap(normalizePart)}
function ensurePart(p){if(!byPart[p])byPart[p]={component:p,recognized:parts.has(p),constraints:[],directVisualReferences:[],confidence:0,sourceRunId:research.runId||null};return byPart[p]}
function addConstraint(part,item,type){
  if(!part)return;const p=String(part),slot=ensurePart(p);const deterministic=type==='deterministic_lead';const ceiling=deterministic?.52:1;const confidence=Math.min(ceiling,clamp(Number(item?.confidence??.55)));
  slot.constraints.push({type,claim:item?.claim||item?.constraint||item?.description||null,value:item?.value??null,range:item?.range??null,unit:item?.unit??null,sourceIds:item?.sourceIds||[],confidence,evidenceType:item?.evidenceType||(deterministic?'deterministic_source_relevance':'research'),applicability:item?.applicability||null,testableVisualHypothesis:item?.testableVisualHypothesis||null,truthEligible:!deterministic&&confidence>=(truth.rules?.minimumConfidenceForAutomaticUse??.6)});
  slot.confidence=Math.max(slot.confidence,confidence);
}
function addDirect(part,e){const p=String(part),slot=ensurePart(p),c=clamp(Number(e.authorityConfidence||0));slot.directVisualReferences.push({evidenceId:e.id,imageUrl:e.imageUrl,sourcePage:e.sourcePage,authority:e.authority,authorityConfidence:c,viewpoint:e.viewpoint||'unknown',downloaded:!!e.downloaded,sha256:e.sha256||null,truthEligible:!!e.truthEligible});slot.confidence=Math.max(slot.confidence,c)}
for(const f of research.acceptedFindings||[])for(const p of componentNames(f))addConstraint(p,f,'finding');
for(const c of research.componentConstraints||[])for(const p of componentNames(c))addConstraint(p,c,'component_constraint');
for(const m of research.visualMeasurements||[])for(const p of componentNames(m))addConstraint(p,m,'measurement');
for(const d of research.deterministicEvidence||[])for(const p of componentNames(d))addConstraint(p,d,'deterministic_lead');
for(const img of direct?.images||[])for(const p0 of img.components||[])for(const p of normalizePart(p0))addDirect(p,img);

const protectedOwnerFacts=Object.entries(ownerTruth).map(([k,v])=>({key:k,value:v,authority:'owner_truth'}));
const gaps=[...(research.researchGaps||[])];
for(const [p,v] of Object.entries(byPart))if(!v.recognized)gaps.push({type:'semantic_mapping',component:p,request:`Map research component ${p} to Michael semantic scene graph before allowing geometry mutation.`,priority:.7});
if(!research.synthesisAvailable&&research.sources?.length)gaps.push({type:'synthesis_unavailable',request:`Revisit ${research.topic} with visual synthesis when model service is available; deterministic leads are research-priority evidence only.`,priority:.72});
for(const p of ['front_grille','front_left_projector','front_right_projector','front_arch_left','front_arch_right','roof_scoop','rear_wing','rear_diffuser','wheel_fl','wheel_fr','wheel_rl','wheel_rr'])if(!(byPart[p]?.directVisualReferences?.length))gaps.push({type:'direct_visual_evidence',component:p,request:`Find direct MJX 7303 or Citroen C3 WRC photographic evidence clearly showing ${p}.`,priority:.78});

const existing=new Set((queue.queue||[]).map(x=>String(x.request||'').toLowerCase()));const proposed=[];
for(const q of [...(research.nextQueries||[]),...gaps.map(x=>typeof x==='string'?x:x.request).filter(Boolean)]){const text=typeof q==='string'?q:q?.query||q?.request;if(!text||existing.has(text.toLowerCase()))continue;const item={id:`nr-${Buffer.from(text).toString('hex').slice(0,14)}`,request:text,priority:Number(q?.priority)||.65,status:'open',source:'nickelle_visual_research',createdAt:new Date().toISOString()};queue.queue.push(item);existing.add(text.toLowerCase());proposed.push(item)}
queue.queue=queue.queue.slice(-160);
const confidences=Object.values(byPart).map(x=>x.confidence);const output={schema:3,generatedAt:new Date().toISOString(),sourceRunId:research.runId||null,directEvidenceRunId:direct?.runId||null,authority:'Nickelle dedicated visual research + direct automotive imagery; subordinate to owner Truth',componentConstraints:byPart,measurements:research.visualMeasurements||[],contradictions:research.contradictions||[],researchGaps:gaps,nextQueries:research.nextQueries||[],protectedOwnerFacts,confidence:confidences.length?confidences.reduce((a,b)=>a+b,0)/confidences.length:0,acceptedFindingCount:(research.acceptedFindings||[]).length,deterministicLeadCount:(research.deterministicEvidence||[]).length,sourceCount:(research.sources||[]).length,directImageCount:(direct?.images||[]).length,directDownloadedCount:direct?.stats?.downloadedImages||0,directComponentCount:Object.keys(direct?.componentEvidence||{}).length,synthesisAvailable:!!research.synthesisAvailable,newQueueItems:proposed.length};
fs.writeFileSync(constraintsPath,JSON.stringify(output,null,2)+'\n');fs.writeFileSync(queuePath,JSON.stringify(queue,null,2)+'\n');console.log(JSON.stringify({runId:output.sourceRunId,directRunId:output.directEvidenceRunId,components:Object.keys(byPart).length,confidence:output.confidence,directImages:output.directImageCount,directComponents:output.directComponentCount,accepted:output.acceptedFindingCount,deterministicLeads:output.deterministicLeadCount,newQueueItems:proposed.length,ownerTruthProtected:protectedOwnerFacts.length},null,2));
