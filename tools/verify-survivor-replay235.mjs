import fs from 'node:fs';
import assert from 'node:assert/strict';

const file=process.argv[2];
if(!file)throw new Error('Usage: node tools/verify-survivor-replay235.mjs <replay.json>');
const replay=JSON.parse(fs.readFileSync(file,'utf8'));
const frames=Array.isArray(replay.frames)?replay.frames:[];
const events=Array.isArray(replay.events)?replay.events:[];
const expected=new Map([[1,'LIRA'],[2,'KAIROX'],[3,'SOLENNE'],[4,'MIREYA'],[5,'ZEPHYRA'],[6,'ORUN'],[7,'MORDREN'],[8,'SABLE'],[9,'KRAKEN']]);
const stages=new Set();
let p235Frames=0;
for(const frame of frames){
 const p=frame?.production235;
 if(!p)continue;
 p235Frames++;
 assert.equal(p.runtime,235,'production235.runtime must equal 235');
 const a=p.authority||{};
 const stage=Number(a.stage||0);
 if(!stage)continue;
 stages.add(stage);
 assert.equal(a.opponent,expected.get(stage),`stage ${stage}: opponent mismatch`);
 assert.equal(a.bossIdentity,a.opponent,`stage ${stage}: boss identity mismatch`);
 assert.equal(a.targetIdentity,a.opponent,`stage ${stage}: Griffin target mismatch`);
 assert.equal(p.invariants?.oneBossActor,true,`stage ${stage}: multiple boss actors`);
 assert.equal(p.invariants?.opponentMatchesBoss,true,`stage ${stage}: boss/opponent mismatch`);
 assert.equal(p.invariants?.targetMatchesBoss,true,`stage ${stage}: target mismatch`);
 assert.equal(p.invariants?.bossArenaMatchesScene,true,`stage ${stage}: arena mismatch`);
 assert.equal(p.invariants?.tournamentMatchesScene,true,`stage ${stage}: tournament authority mismatch`);
 assert.deepEqual(p.errors||[],[],`stage ${stage}: Production 235 runtime errors`);
}
assert(p235Frames>0,'replay contains no Production 235 frames');
for(const event of events){
 const type=event?.type||event?.event||'';
 const stage=Number(event?.stage||event?.data?.stage||0);
 if(type==='KRAKEN_ENTERED'&&stage>0&&stage<9)throw new Error(`legacy Kraken leak before stage 9: ${JSON.stringify(event)}`);
}
const integrity=replay?.summary?.integrity||{};
for(const [key,label] of [['nonFinite','non-finite actors'],['escaped','escaped actors'],['invalidTargets','invalid targets']])if(key in integrity)assert.equal(Number(integrity[key]||0),0,label);
const coverage=replay?.summary?.coverage||{};
if('dropped' in coverage)assert.equal(Number(coverage.dropped||0),0,'dropped replay frames');
console.log(JSON.stringify({production:235,p235Frames,stages:[...stages].sort((a,b)=>a-b),result:'PASS'}));
