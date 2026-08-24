import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const release=JSON.parse(fs.readFileSync(path.resolve('michael/release/current.json'),'utf8'));
const out=process.argv[2]||'/tmp/michael-visual';
const url=process.env.MICHAEL_URL||`http://127.0.0.1:4173/${release.live.page}`;
const expectedVersion=process.env.MICHAEL_EXPECT_VERSION||release.version;
const expectedIdentity=process.env.MICHAEL_EXPECT_IDENTITY||release.identity;
const expectedOccupants=Number(release.contracts.occupantCount||2);
const all=[...release.contracts.canonicalViews];
const size=Math.max(320,Math.min(1200,Number(process.env.MICHAEL_CAPTURE_SIZE||700)));
const navTimeout=Math.max(3000,Number(process.env.MICHAEL_NAV_TIMEOUT_MS||15000));
const readyTimeout=Math.max(3000,Number(process.env.MICHAEL_READY_TIMEOUT_MS||18000));
const opTimeout=Math.max(3000,Number(process.env.MICHAEL_SCREENSHOT_TIMEOUT_MS||12000));
const requested=(process.env.MICHAEL_CAPTURE_VIEWS||all.join(',')).split(',').map(x=>x.trim()).filter(x=>all.includes(x));
const views=requested.length?requested:all;
const started=Date.now();
const log=m=>console.log(`[capture +${((Date.now()-started)/1000).toFixed(1)}s] ${m}`);
fs.mkdirSync(out,{recursive:true});
let browser;const missing=[];
try{
  log(`launch chromium size=${size} views=${views.join(',')} expect=${expectedVersion}/${expectedIdentity}`);
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
  page.setDefaultTimeout(opTimeout);
  page.on('console',m=>console.log(`[browser ${m.type()}] ${m.text()}`));
  page.on('pageerror',e=>console.log(`[browser pageerror] ${e.message}`));
  page.on('response',r=>{if(r.status()===404){missing.push(r.url());console.log(`[browser 404] ${r.url()}`)}});
  page.on('requestfailed',r=>console.log(`[request failed] ${r.url()} :: ${r.failure()?.errorText||'unknown'}`));
  log('navigate');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:navTimeout});
  log('wait runtime contract');
  await page.waitForFunction(()=>window.__MICHAEL_READY===true,{timeout:readyTimeout});
  await page.waitForFunction(()=>window.__MICHAEL_MODEL===true,{timeout:readyTimeout});
  await page.waitForFunction(({version,identity,occupants})=>{
    const g=window.__MICHAEL_GRAPHICS||{},c=window.__MICHAEL_CONTRACT||{};
    const id=typeof g.c3Identity==='string'?g.c3Identity:g.c3Identity?.identity;
    return c.version===version&&c.identity===identity&&c.ready===true&&c.model===true&&g.version===version&&id===identity&&g.topologySanity===true&&Number(g.malformedTopologyCount||0)===0&&g.driverPresent===true&&g.navigatorPresent===true&&Number(g.occupantCount)===occupants;
  },{version:expectedVersion,identity:expectedIdentity,occupants:expectedOccupants},{timeout:readyTimeout});
  await page.waitForFunction(()=>{const c=document.querySelector('#raceCanvas');return !!c&&c.width>0&&c.height>0&&c.getBoundingClientRect().width>16&&c.getBoundingClientRect().height>16},{timeout:readyTimeout});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  for(const view of views){
    log(`view ${view}`);
    await page.locator(`[data-view="${view}"]`).click({force:true,noWaitAfter:true,timeout:opTimeout});
    await page.waitForFunction(view=>document.querySelector(`[data-view="${view}"]`)?.classList.contains('active'),view,{timeout:opTimeout});
    const data=await page.evaluate(async()=>{await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const c=document.querySelector('#raceCanvas');if(!c||c.width<16||c.height<16)throw new Error('invalid raceCanvas');return c.toDataURL('image/png')});
    const comma=data.indexOf(',');if(comma<0)throw new Error(`invalid canvas data URL for ${view}`);
    const png=Buffer.from(data.slice(comma+1),'base64');
    if(png.length<1000||png.subarray(1,4).toString()!=='PNG')throw new Error(`invalid/empty PNG for ${view}: ${png.length} bytes`);
    fs.writeFileSync(path.join(out,`${view}.png`),png);log(`saved ${view} ${png.length} bytes`);
  }
  const metrics=await page.evaluate(()=>{const g=window.__MICHAEL_GRAPHICS||{},contract=window.__MICHAEL_CONTRACT||{},c=document.querySelector('#raceCanvas'),gl=c?.getContext('webgl2')||c?.getContext('webgl');return{graphics:g,contract,ready:window.__MICHAEL_READY===true,model:window.__MICHAEL_MODEL===true,error:window.__MICHAEL_ERROR||null,frameMs:Number(g?.physicalFrameMs||g?.frameMs||16.7),drawables:Number(g?.drawables||g?.drawCalls||0),quality:Number(g?.quality||0),version:g?.version||null,topologySanity:g?.topologySanity===true,malformedTopologyCount:Number(g?.malformedTopologyCount||0),driverPresent:g?.driverPresent===true,navigatorPresent:g?.navigatorPresent===true,occupantCount:Number(g?.occupantCount||0),c3Identity:g?.c3Identity||null,canvas:{width:c?.width||0,height:c?.height||0,clientWidth:c?.clientWidth||0,clientHeight:c?.clientHeight||0},webgl:!!gl}});
  const unique404=[...new Set(missing)];
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({...metrics,release,captureSize:size,views,missing404:unique404},null,2)+'\n');
  if(!metrics.ready||!metrics.model||!metrics.webgl)throw new Error(`Michael renderer not capture-ready: ${JSON.stringify(metrics)}`);
  if(metrics.version!==expectedVersion||!metrics.topologySanity||metrics.malformedTopologyCount!==0)throw new Error(`Michael runtime contract failed: ${JSON.stringify(metrics)}`);
  const id=typeof metrics.c3Identity==='string'?metrics.c3Identity:metrics.c3Identity?.identity;
  if(id!==expectedIdentity)throw new Error(`Michael identity contract failed: expected ${expectedIdentity}, got ${id}`);
  if(!metrics.driverPresent||!metrics.navigatorPresent||metrics.occupantCount!==expectedOccupants)throw new Error(`Michael cockpit incomplete: driver=${metrics.driverPresent} navigator=${metrics.navigatorPresent} occupants=${metrics.occupantCount}`);
  const critical404=unique404.filter(u=>/\.(?:js|mjs|glb|wasm)(?:\?|$)/i.test(u));
  if(critical404.length)throw new Error(`critical Michael resources returned 404: ${critical404.join(', ')}`);
  log(`done; ${metrics.version} identity=${id} crew=${metrics.occupantCount} 404=${unique404.length}`);
  console.log(JSON.stringify({out,url,size,views,metrics,missing404:unique404},null,2));
}catch(e){console.error(`[capture failed +${((Date.now()-started)/1000).toFixed(1)}s] ${e?.stack||e}`);process.exitCode=1}finally{if(browser)await browser.close().catch(()=>{})}
