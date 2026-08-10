#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const cfg=JSON.parse(fs.readFileSync('nickelle/direct-evidence-config.json','utf8'));
const outDir='/tmp/nickelle-direct-images';
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync('nickelle/research',{recursive:true});
const now=()=>new Date().toISOString();
const runId=`nickelle-direct-${Date.now()}`;
const ua='Nickelle-Direct-Visual-Evidence/1.0 (+github-actions; automotive visual research)';
const pages=[],images=[],rejected=[],activity=[],seenPages=new Set(),seenImages=new Set();
const h=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,24);
const clean=s=>String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:amp|quot|apos|lt|gt|nbsp);/gi,' ').replace(/\s+/g,' ').trim();
const log=(phase,message,extra={})=>activity.push({at:now(),phase,message,...extra});
const abs=(u,b)=>{try{return new URL(u,b).href}catch{return null}};
const domain=u=>{try{return new URL(u).hostname.toLowerCase().replace(/^www\./,'')}catch{return''}};

function authorityFor(u){const d=domain(u);for(const x of cfg.officialDomains||[])if(d===x.domain||d.endsWith('.'+x.domain))return x.authority;return 'community_reference'}
function authorityConfidence(a){return Number(cfg.authority?.[a]??.4)}
function components(text){const t=String(text||'').toLowerCase(),out=[];for(const [part,terms] of Object.entries(cfg.componentPatterns||{}))if(terms.some(x=>t.includes(String(x).toLowerCase())))out.push(part);return [...new Set(out)]}
function viewpoint(text){const t=String(text||'').toLowerCase();if(/rear|back view|from behind/.test(t))return'rear';if(/side|profile|lateral/.test(t))return'side';if(/top|overhead|roof view/.test(t))return'top';if(/three.?quarter|3\/4|oblique/.test(t))return'three';if(/front|nose|head.?on/.test(t))return'front';return'unknown'}
function vehicleMatch(text){const t=String(text||'').toLowerCase();return /citro[eë]n\s*c3\s*wrc|c3\s*wrc|mjx.{0,20}7303|hyper\s*go.{0,20}7303/.test(t)}
function imageCandidate(u){return !!u&&!/^data:|^blob:/i.test(u)&&!(/\.svg(?:\?|$)/i.test(u));}
async function fetchText(u){const r=await fetch(u,{redirect:'follow',headers:{'User-Agent':ua,Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5'}});if(!r.ok)throw Error(`${r.status} ${u}`);const ct=r.headers.get('content-type')||'';if(!/text|xml|html|json/i.test(ct))throw Error(`non-text ${ct}`);return await r.text()}

async function bingDiscover(q,officialOnly=false){const qq=officialOnly?`${q} (${(cfg.officialDomains||[]).map(x=>`site:${x.domain}`).join(' OR ')})`:q;const u='https://www.bing.com/search?format=rss&q='+encodeURIComponent(qq);try{const xml=await fetchText(u);for(const m of xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/gi)){const title=clean(m[1]),url=clean(m[2]),description=clean(m[3]);if(!url||seenPages.has(url))continue;const a=authorityFor(url);if(officialOnly&&a==='community_reference')continue;seenPages.add(url);pages.push({id:h(url),url,title,description,authority:a,authorityConfidence:authorityConfidence(a),discoveredBy:'bing_rss',query:q,retrievedAt:now()})}}catch(e){log('WARNING','Bing discovery failed',{query:q,error:e.message})}}

async function ddgDiscover(q){const u='https://html.duckduckgo.com/html/?q='+encodeURIComponent(q);try{const html=await fetchText(u);for(const m of html.matchAll(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)){let raw=m[1];try{const x=new URL(raw,'https://duckduckgo.com');const uddg=x.searchParams.get('uddg');if(uddg)raw=decodeURIComponent(uddg)}catch{}const url=abs(raw,'https://duckduckgo.com');if(!url||seenPages.has(url))continue;const title=clean(m[2]),a=authorityFor(url);if(a==='community_reference'&&!vehicleMatch(title))continue;seenPages.add(url);pages.push({id:h(url),url,title,description:'',authority:a,authorityConfidence:authorityConfidence(a),discoveredBy:'duckduckgo_html',query:q,retrievedAt:now()})}}catch(e){log('WARNING','DuckDuckGo discovery failed',{query:q,error:e.message})}}

async function commonsDiscover(q){const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch='+encodeURIComponent(q)+'&prop=imageinfo&iiprop=url|mime|size|extmetadata&format=json&origin=*';try{const j=JSON.parse(await fetchText(api));for(const p of Object.values(j.query?.pages||{})){const ii=p.imageinfo?.[0];if(!ii?.url||seenImages.has(ii.url))continue;const meta=ii.extmetadata||{},title=String(p.title||'').replace(/^File:/,'');const context=[title,meta.ImageDescription?.value,meta.Categories?.value].map(clean).join(' ');if(!vehicleMatch(context))continue;const comps=components(context);seenImages.add(ii.url);images.push({id:h(ii.url),imageUrl:ii.url,sourcePage:ii.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,pageTitle:title,alt:title,caption:clean(meta.ImageDescription?.value||''),authority:'high_quality_photography',authorityConfidence:authorityConfidence('high_quality_photography'),components:comps,viewpoint:viewpoint(context),vehicleMatched:true,width:ii.width||null,height:ii.height||null,bytes:ii.size||null,mime:ii.mime||null,license:clean(meta.LicenseShortName?.value||''),creator:clean(meta.Artist?.value||''),provider:'Wikimedia Commons',query:q,retrievedAt:now(),truthEligible:false})}}catch(e){log('WARNING','Commons image discovery failed',{query:q,error:e.message})}}

async function inspectPage(p){try{const html=await fetchText(p.url);const title=clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||p.title);const desc=clean(html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i)?.[1]||p.description);const pageText=clean(html).slice(0,12000);const context=`${title} ${desc} ${pageText}`;if(!vehicleMatch(context)&&p.authority==='community_reference'){rejected.push({type:'page',url:p.url,reason:'no target vehicle evidence'});return}p.title=title;p.description=desc;p.vehicleMatched=vehicleMatch(context);p.components=components(context);p.viewpoint=viewpoint(context);p.inspectedAt=now();
 const found=[];
 for(const re of [/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/gi,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/gi])for(const m of html.matchAll(re))found.push({src:m[1],alt:title,kind:'og_image'});
 for(const m of html.matchAll(/<img\b([^>]+)>/gi)){const tag=m[1];const src=tag.match(/(?:src|data-src|data-original)=["']([^"']+)/i)?.[1];if(!src)continue;const altText=clean(tag.match(/alt=["']([^"']*)/i)?.[1]||'');found.push({src,alt:altText,kind:'img'})}
 for(const f of found.slice(0,24)){const u=abs(f.src,p.url);if(!imageCandidate(u)||seenImages.has(u))continue;const localContext=`${title} ${desc} ${f.alt}`;if(!vehicleMatch(localContext)&&!p.vehicleMatched)continue;const comps=components(localContext+' '+pageText.slice(0,2500));seenImages.add(u);images.push({id:h(u),imageUrl:u,sourcePage:p.url,pageTitle:title,alt:f.alt,caption:desc,authority:p.authority,authorityConfidence:p.authorityConfidence,components:comps,viewpoint:viewpoint(localContext),vehicleMatched:p.vehicleMatched,provider:'direct_web',query:p.query,retrievedAt:now(),truthEligible:['mjx_official','citroen_wrc_official','competition_official','manufacturer_media'].includes(p.authority),discoveryKind:f.kind})}
 }catch(e){p.inspectError=e.message;log('WARNING','Page inspection failed',{url:p.url,error:e.message})}}
}

async function downloadImage(img){try{const r=await fetch(img.imageUrl,{redirect:'follow',headers:{'User-Agent':ua,Accept:'image/*,*/*;q=.5'}});if(!r.ok)throw Error(`${r.status}`);const ct=(r.headers.get('content-type')||'').toLowerCase();if(!ct.startsWith('image/'))throw Error(`not image ${ct}`);const ab=await r.arrayBuffer();const b=Buffer.from(ab);if(b.length<cfg.minimumImageBytes)throw Error(`too small ${b.length}`);if(b.length>cfg.maxDownloadBytes)throw Error(`too large ${b.length}`);let ext=(ct.split('/')[1]||'img').replace('jpeg','jpg').replace(/[^a-z0-9]/g,'');if(!ext)ext='img';const fp=path.join(outDir,`${img.id}.${ext}`);fs.writeFileSync(fp,b);img.downloaded=true;img.bytes=b.length;img.mime=ct;img.sha256=crypto.createHash('sha256').update(b).digest('hex');img.artifactName=path.basename(fp);return true}catch(e){img.downloaded=false;img.downloadError=e.message;return false}}

log('START','Nickelle direct automotive visual evidence acquisition started');
for(const q of cfg.discoveryQueries||[]){await bingDiscover(q,true);await ddgDiscover(q)}
for(const q of cfg.imageQueries||[])await commonsDiscover(q);
pages.sort((a,b)=>b.authorityConfidence-a.authorityConfidence);
for(const p of pages.slice(0,cfg.maxPages))await inspectPage(p);
images.sort((a,b)=>(b.authorityConfidence-a.authorityConfidence)+(Number(b.vehicleMatched)-Number(a.vehicleMatched))*.2+(b.components?.length||0)-(a.components?.length||0));
const selected=images.slice(0,cfg.maxImages);let downloaded=0;for(const img of selected)if(await downloadImage(img))downloaded++;
const componentEvidence={};for(const img of selected){for(const part of img.components||[]){if(!componentEvidence[part])componentEvidence[part]=[];componentEvidence[part].push({evidenceId:img.id,imageUrl:img.imageUrl,sourcePage:img.sourcePage,authority:img.authority,authorityConfidence:img.authorityConfidence,viewpoint:img.viewpoint,truthEligible:img.truthEligible,downloaded:img.downloaded,sha256:img.sha256||null})}}
for(const arr of Object.values(componentEvidence))arr.sort((a,b)=>b.authorityConfidence-a.authorityConfidence);
const report={schema:1,identity:cfg.identity,runId,generatedAt:now(),pages:pages.slice(0,cfg.maxPages),images:selected,componentEvidence,stats:{discoveredPages:pages.length,inspectedPages:Math.min(pages.length,cfg.maxPages),discoveredImages:images.length,selectedImages:selected.length,downloadedImages:downloaded,rejected:rejected.length,components:Object.keys(componentEvidence).length},rejected:rejected.slice(0,80),activity};
fs.writeFileSync('nickelle/research/direct-evidence.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('nickelle/research/direct-evidence-state.json',JSON.stringify({schema:1,status:'COMPLETE',runId,updatedAt:now(),...report.stats},null,2)+'\n');
console.log(JSON.stringify({runId,...report.stats,authorities:Object.fromEntries(Object.entries(cfg.authority).map(([k])=>[k,selected.filter(x=>x.authority===k).length]))},null,2));
