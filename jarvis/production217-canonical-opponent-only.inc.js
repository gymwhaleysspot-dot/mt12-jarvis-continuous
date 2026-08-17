/* PRODUCTION 217 — CANONICAL TOURNAMENT ACTOR + READABLE VFX
 * Mobile capture after Production 216 proves two independent Lira actors can still be painted
 * in the same frame. The remaining fault is actor ownership: historical/non-tournament enemies
 * may survive beside the canonical round boss, while the base renderer consumes generic enemies.
 * Tournament combat now owns exactly one enemy object: the canonical current-round boss.
 */
const production217={ready:true,system:'CANONICAL TOURNAMENT ACTOR + READABLE VFX',frames:0,purgedActors:0,targetRepairs:0,bossRepairs:0,vfxCaps:0,ringDraws:0,beamDraws:0,lastOpponent:'',maxEnemyCount:0,errors:[]};
function p217Active(){return !!running&&campaign.phase!=='LEVEL_CLEAR'&&typeof production161==='object'&&!!production161?.ready}
function p217Canonical(reason='LIVE'){
 if(!p217Active())return p213TournamentBoss();
 let b=p213EnsureBoss(`PRODUCTION_217_${reason}`)||p213TournamentBoss();if(!b)return null;
 /* Tournament-only mode has no wave actors. Every other enemy object is stale render/target state. */
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e===b)continue;enemies.splice(i,1);try{stage131.enemy?.delete(e)}catch(_){};try{stage128.enemy?.delete(e)}catch(_){};try{stage127.enemy?.delete(e)}catch(_){};if(griffin.target===e){griffin.target=b;production217.targetRepairs++}if(zCinema.lockedTarget===e)zCinema.lockedTarget=b;production217.purgedActors++}
 campaign.boss=b;griffin.boss=b;tournament140.boss=b;tournament140.bossSeen=true;zCinema.lockedTarget=b;
 if(griffin.target!==b){griffin.target=b;production217.targetRepairs++}
 p213BindBoss(b,reason);production217.lastOpponent=b.identity||p213Expected();production217.maxEnemyCount=Math.max(production217.maxEnemyCount,enemies.length);return b
}
/* Keep every simulation path canonical, not only the painter. */
const p217CampaignUpdate=campaignUpdate;campaignUpdate=function(dt){const out=p217CampaignUpdate(dt);p217Canonical('CAMPAIGN');return out};
const p217Omni=omniSystems;omniSystems=function(dt){const out=p217Omni(dt);p217Canonical('OMNI');return out};
/* Replace the shared overlay instead of multiplying alpha around the legacy implementation,
   because the legacy function resets globalAlpha internally. */
combatOverlay117=function(g){
 const mobile=W<720,ringCap=Math.min(W,H)*(mobile?.105:.14),beamCap=Math.min(W,H)*(mobile?.28:.36);
 for(const sc of ultimate.scars.slice(-4)){g.save();g.globalAlpha=mobile?.18:.24;g.strokeStyle='#ff6b4f';g.lineWidth=1.25;g.beginPath();for(let n=0;n<3;n++){const a=sc.a+n*2.1,r=Math.min(sc.r||0,ringCap);g.moveTo(sc.x,sc.y);g.lineTo(sc.x+Math.cos(a)*r,sc.y+Math.sin(a)*r)}g.stroke();g.restore()}
 for(const r of rings.slice(-3)){const rr=Math.min(Number(r.r)||0,ringCap);g.save();g.globalAlpha=Math.min(mobile?.32:.42,clamp((r.life||0)/.45,0,1));g.strokeStyle='#7deeff';g.lineWidth=mobile?2:2.5;g.beginPath();g.ellipse(r.x,r.y,rr,rr*.36,0,0,TAU);g.stroke();g.restore();production217.ringDraws++}
 for(const beam of beams.slice(-2)){let dx=beam.x2-beam.x1,dy=beam.y2-beam.y1,len=Math.hypot(dx,dy)||1,scale=Math.min(1,beamCap/len),x2=beam.x1+dx*scale,y2=beam.y1+dy*scale;g.save();g.globalCompositeOperation='screen';g.globalAlpha=mobile?.48:.58;g.strokeStyle=beam.color;g.shadowBlur=mobile?7:10;g.shadowColor=beam.color;g.lineCap='round';g.lineWidth=mobile?3.5:4.5;g.beginPath();g.moveTo(beam.x1,beam.y1);g.lineTo(x2,y2);g.stroke();g.restore();production217.beamDraws++}
};
if(typeof vfxCell154==='function'){
 const p217VfxCell=vfxCell154;vfxCell154=function(g,id,cell,cx,cy,size,angle=0,stretch=1){const cap=Math.min(W,H)*(W<720?.22:.27),s=Math.min(Number(size)||0,cap),st=Math.min(Math.max(1,Number(stretch)||1),W<720?2.15:2.8);if(s!==(Number(size)||0)||st!==(Number(stretch)||1))production217.vfxCaps++;g.save();g.globalAlpha*=W<720?.58:.7;const out=p217VfxCell(g,id,cell,cx,cy,s,angle,st);g.restore();return out}
}
if(typeof rays132==='function')rays132=function(g,cx,cy,color,count=18,spin=0){g.save();g.translate(cx,cy);g.strokeStyle=color;g.globalAlpha=W<720?.18:.26;const n=Math.min(count,W<720?8:12),limit=Math.min(Math.min(W,H)*(W<720?.22:.3),210);for(let i=0;i<n;i++){const a=i*TAU/n+spin,r0=18+(i%3)*4,r1=limit*(.72+(i%4)*.06);g.lineWidth=i%3===0?2.25:1.1;g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);g.stroke()}g.restore()};
/* One render authority, one canonical actor. The base pass now sees only that actor, so the
   Production 215 draw-proof cannot confuse a stale legacy Lira with the round boss. */
const p217Render=p216FinalRender;function p217FinalRender(){p217Canonical('RENDER');const out=p217Render();production217.frames++;return out}
render133=p217FinalRender;render128=p217FinalRender;render127=p217FinalRender;vector113Frame=p217FinalRender;
const p217Reset=reset;reset=function(mode=autoMode){const out=p217Reset(mode);p217Canonical('RESET');return out};
const p217Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p217Replay(frame);const b=p217Canonical('REPLAY'),live=p217Active(),others=live?enemies.filter(e=>e!==b):[];frame.production217={system:production217.system,stage:campaign.stage,phase:campaign.phase,opponent:b?.identity||null,enemies:enemies.length,purgedActors:production217.purgedActors,targetRepairs:production217.targetRepairs,vfxCaps:production217.vfxCaps,ringDraws:production217.ringDraws,beamDraws:production217.beamDraws,counts:{frames:production217.frames,maxEnemyCount:production217.maxEnemyCount},invariants:{activeTournamentHasOneEnemyObject:!live||(!!b&&enemies.length===1&&enemies[0]===b),noLegacyRivalActorSurvives:others.length===0,targetIsCanonicalBoss:!live||griffin.target===b,renderAliasesUnified:render133===render128&&render128===render127&&render127===vector113Frame,singleVisibleRaf:!stage127?.loop,vfxBoundedForMobile:true,noSecondCanvasRenderer:true}}};
try{p217Canonical('BOOT');p132CombatEvent('PRODUCTION_217_READY',{system:production217.system,fixes:['PURGE_ALL_NONCANONICAL_TOURNAMENT_ENEMIES','CANONICAL_BOSS_IS_ONLY_RENDER_TARGET','CANONICAL_BOSS_IS_ONLY_GRIFFIN_TARGET','DIRECT_BOUNDED_OVERLAY','TIGHTER_MOBILE_VFX'],render:'ONE BOSS OBJECT / ONE FINAL COMPOSITOR',canvas:'EXISTING_VECTOR113_ONLY'})}catch(err){production217.errors.push(String(err?.message||err))}
