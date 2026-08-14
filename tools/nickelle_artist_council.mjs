import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const round=v=>Math.round(v*10000)/10000;
const VIEWS=['front','three','side','rear','top'];
const director=load('michael/art/ultra-art-director.json');
const brain=load('nickelle/artist-brain.json');
const negatives=fs.existsSync('nickelle/visual-negatives.json')?load('nickelle/visual-negatives.json'):{};
function features(file){const p=PNG.sync.read(fs.readFileSync(file)),d=p.data,w=p.width,h=p.height;let body=0,dark=0,white=0,yellow=0,glass=0,edge=0,flat=0,clip=0,fg=0;let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=.2126*r+.7152*g+.0722*b;const bg=r>180&&g>180&&b>180&&mx-mn<32;if(!bg){fg++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}if(r>65&&r>g*1.35&&r>b*1.25)body++;if(r<58&&g<62&&b<68)dark++;if(r>150&&g>150&&b>145&&mx-mn<55)white++;if(r>125&&g>70&&g<210&&b<110)yellow++;if(b>r*1.12&&b>g*1.03&&b>65)glass++;if(mx>250)clip++;if(x+1<w&&y+1<h){const j=(y*w+x+1)*4,k=((y+1)*w+x)*4,lx=.2126*d[j]+.7152*d[j+1]+.0722*d[j+2],ly=.2126*d[k]+.7152*d[k+1]+.0722*d[k+2],e=(Math.abs(l-lx)+Math.abs(l-ly))/510;if(e>.18)edge++;if(e<.012)flat++}}const total=w*h,aspect=fg?((x1-x0+1)/Math.max(1,y1-y0+1)):1;return{body:body/total,dark:dark/total,white:white/total,yellow:yellow/total,glass:glass/total,edge:edge/total,flat:flat/total,clip:clip/total,coverage:fg/total,aspect}}
function set(dir){const out={};for(const v of VIEWS){const f=path.join(dir,`${v}.png`);if(fs.existsSync(f))out[v]=features(f)}return out}
const mean=(o,k)=>{const a=Object.values(o).map(x=>x[k]).filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:0};
const delta=(a,b,k)=>Math.abs(mean(a,k)-mean(b,k));
function score(base,cand){const aspectSpread=o=>{const a=Object.values(o).map(x=>x.aspect);return a.length?Math.max(...a)-Math.min(...a):9},coverageSpread=o=>{const a=Object.values(o).map(x=>x.coverage);return a.length?Math.max(...a)-Math.min(...a):9};
 const ownerIdentity=clamp(1-(Math.max(0,.12-mean(cand,'dark'))*2.2+Math.max(0,.025-mean(cand,'white'))*3+Math.max(0,.004-mean(cand,'yellow'))*2.2+Math.max(0,.012-mean(cand,'glass'))*2.6));
 const silhouette=clamp(1-aspectSpread(cand)*.16-coverageSpread(cand)*.85);
 const sculpture=clamp(.72+mean(cand,'edge')*2.1-mean(cand,'flat')*.5);
 const topology=clamp(.76+mean(cand,'edge')*1.5-delta(base,cand,'coverage')*.9);
 const materials=clamp(.72+mean(cand,'dark')*.55+mean(cand,'white')*.7+mean(cand,'glass')*.75-mean(cand,'clip')*2.4);
 const livery=clamp(.65+mean(cand,'white')*1.5+mean(cand,'yellow')*2.2+mean(cand,'dark')*.45);
 const photography=clamp(.80+mean(cand,'edge')*.8-mean(cand,'clip')*2.2-Math.max(0,mean(cand,'flat')-.70)*.5);
 const restoration=ownerIdentity;
 const engineering=clamp(.88-delta(base,cand,'aspect')*.10-delta(base,cand,'coverage')*.5);
 const restraint=clamp(.93-Math.max(0,mean(cand,'edge')-mean(base,'edge')-.045)*3-Math.max(0,mean(cand,'yellow')-mean(base,'yellow')-.025)*4);
 const critics={automotiveDesigner:(silhouette+.5*engineering)/1.5,sculptor:sculpture,hardSurfaceModeler:topology,materialArtist:materials,liveryArtist:livery,productPhotographer:photography,cinematographer:(photography+silhouette)/2,restorationArtist:restoration,rallyEngineer:engineering,restraintCritic:restraint};
 const floor=director.promotion||{},passThreshold=.72,passes=Object.fromEntries(Object.entries(critics).map(([k,v])=>[k,v>=passThreshold]));const passFraction=Object.values(passes).filter(Boolean).length/Object.keys(passes).length;const identityPass=ownerIdentity>=Number(floor.identityFloor||.92),silhouettePass=silhouette>=Number(floor.silhouetteFloor||.94),materialPass=materials>=Number(floor.materialFloor||.88),continuityPass=(1-coverageSpread(cand))>=Number(floor.continuityFloor||.93);const knownNegativeRisk=(!restraint||restraint<.72)||ownerIdentity<.72;const promote=passFraction>=Number(floor.minimumCouncilPassFraction||.8)&&identityPass&&silhouettePass&&materialPass&&continuityPass&&!knownNegativeRisk;return{schema:1,engine:'NICKELLE_ULTRA_ARTIST_COUNCIL_X10',brain:brain.name,director:director.name,critics:Object.fromEntries(Object.entries(critics).map(([k,v])=>[k,round(v)])),passes,passFraction:round(passFraction),floors:{ownerIdentity:round(ownerIdentity),silhouette:round(silhouette),materials:round(materials),continuity:round(1-coverageSpread(cand))},floorPass:{identityPass,silhouettePass,materialPass,continuityPass},knownNegativeRisk,promote,negativeMemoryFamilies:Object.keys(negatives.failures||negatives.families||{}),reason:promote?'Artist Council approves challenger':'Artist Council rejects challenger: artistic/identity floor not met'}}
const [cmd,baseDir,candDir,out='/tmp/michael-artist-council.json']=process.argv.slice(2);if(cmd!=='judge')throw Error('usage: nickelle_artist_council.mjs judge BASE_DIR CAND_DIR OUT');const report=score(set(baseDir),set(candDir));fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.promote)process.exitCode=2;