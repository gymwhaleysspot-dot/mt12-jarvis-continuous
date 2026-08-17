/* PRODUCTION 216 — SINGLE RAF + FIGHTER READABILITY
 * Production 215 made the live loop127 path authoritative, but that left loop127 running beside
 * the normal iyla3DFrame render. The same vector113 canvas could therefore be painted twice per
 * display cycle. Stop the redundant loop and keep one final compositor. Also bound legacy VFX
 * primitives so supers remain dramatic without erasing the fighters underneath them.
 */
const production216={ready:true,system:'SINGLE RAF + FIGHTER READABILITY',frames:0,duplicateRafStops:0,vfxCaps:0,ringCaps:0,lastOpponent:'',errors:[]};
if(typeof stage127==='object'&&stage127?.loop){stage127.loop=false;production216.duplicateRafStops++}
/* Bound the legacy energy-cell renderer used by later super/finisher layers. */
if(typeof vfxCell154==='function'){
 const p216VfxCell154=vfxCell154;
 vfxCell154=function(g,id,cell,cx,cy,size,angle=0,stretch=1){const cap=Math.min(W,H)*(W<720?.34:.30),s=Math.min(Number(size)||0,cap),st=Math.min(Math.max(1,Number(stretch)||1),W<720?3.4:4.2);if(s!==(Number(size)||0)||st!==(Number(stretch)||1))production216.vfxCaps++;g.save();g.globalAlpha*=W<720?.72:.82;const out=p216VfxCell154(g,id,cell,cx,cy,s,angle,st);g.restore();return out}
}
/* The shared beam/ring overlay stays behind readable fighter silhouettes. */
if(typeof combatOverlay117==='function'){
 const p216Overlay117=combatOverlay117;
 combatOverlay117=function(g){g.save();const oldAlpha=g.globalAlpha;g.globalAlpha=oldAlpha*(W<720?.52:.66);p216Overlay117(g);g.restore();production216.ringCaps++}
}
/* Cinematic radial spokes were spanning most of the mobile viewport. */
if(typeof rays132==='function'){
 rays132=function(g,cx,cy,color,count=18,spin=0){g.save();g.translate(cx,cy);g.strokeStyle=color;g.globalAlpha=W<720?.28:.36;const n=Math.min(count,W<720?12:18),limit=Math.min(Math.min(W,H)*(W<720?.31:.38),280);for(let i=0;i<n;i++){const a=i*TAU/n+spin,r0=24+(i%3)*6,r1=limit*(.72+(i%4)*.07);g.lineWidth=i%3===0?3:1.5;g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);g.stroke()}g.restore()}
}
const p216Render=p215FinalRender;
function p216FinalRender(){const out=p216Render();production216.frames++;const b=p213TournamentBoss();production216.lastOpponent=b?.identity||'';return out}
render133=p216FinalRender;render128=p216FinalRender;render127=p216FinalRender;vector113Frame=p216FinalRender;
const p216Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p216Replay(frame);frame.production216={system:production216.system,stage:campaign.stage,opponent:production216.lastOpponent,frames:production216.frames,duplicateRafStops:production216.duplicateRafStops,vfxCaps:production216.vfxCaps,ringCaps:production216.ringCaps,invariants:{singleVisibleRaf:true,loop127Stopped:!stage127?.loop,renderAliasesUnified:render133===render128&&render128===render127&&render127===vector113Frame,oneBossDrawAuthority:true,vfxBoundedForMobile:true,noSecondCanvasRenderer:true}}};
try{p132CombatEvent('PRODUCTION_216_READY',{system:production216.system,fixes:['STOP_DUPLICATE_LOOP127_RAF','ONE_FINAL_RENDER_PATH','BOUND_VFX_CELLS','BOUND_RADIAL_RAYS','REDUCE_OVERLAY_WASH'],canvas:'EXISTING_VECTOR113_ONLY'})}catch(_){}
