import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const out=process.argv[2]||'/tmp/michael-visual';
const url=process.env.MICHAEL_URL||'http://127.0.0.1:4173/racing-mjx7303-michael-v39.html';
const size=Math.max(320,Math.min(1200,Number(process.env.MICHAEL_CAPTURE_SIZE||700)));
const navTimeout=Math.max(3000,Number(process.env.MICHAEL_NAV_TIMEOUT_MS||15000));
const readyTimeout=Math.max(3000,Number(process.env.MICHAEL_READY_TIMEOUT_MS||18000));
const opTimeout=Math.max(3000,Number(process.env.MICHAEL_SCREENSHOT_TIMEOUT_MS||12000));
const all=['front','three','side','rear','top'];
const requested=(process.env.MICHAEL_CAPTURE_VIEWS||all.join(',')).split(',').map(x=>x.trim()).filter(x=>all.includes(x));
const views=requested.length?requested:all;
const started=Date.now(), log=m=>console.log(`[capture +${((Date.now()-started)/1000).toFixed(1)}s] ${m}`);
fs.mkdirSync(out,{recursive:true});
let browser;
const missing=[];
try{
  log(`launch chromium size=${size} views=${views.join(',')}`);
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
  page.setDefaultTimeout(opTimeout);
  page.on('console',m=>{if(m.type()==='error')console.log(`[browser console] ${m.text()}`)});
  page.on('response',r=>{if(r.status()===404){missing.push(r.url());console.log(`[browser 404] ${r.url()}`)}});
  page.on('requestfailed',r=>console.log(`[request failed] ${r.url()} :: ${r.failure()?.errorText||'unknown'}`));
  log('navigate');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:navTimeout});
  log('wait MICHAEL_READY');
  await page.waitForFunction(()=>window.__MICHAEL_READY===true,{timeout:readyTimeout});
  await page.waitForFunction(()=>{const c=document.querySelector('#raceCanvas');return !!c&&c.width>0&&c.height>0&&c.getBoundingClientRect().width>16&&c.getBoundingClientRect().height>16},{timeout:readyTimeout});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  for(const view of views){
    log(`view ${view}`);
    await page.locator(`[data-view="${view}"]`).click({timeout:opTimeout});
    const data=await page.evaluate(async()=>{
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const c=document.querySelector('#raceCanvas');
      if(!c||c.width<16||c.height<16)throw new Error('invalid raceCanvas');
      return c.toDataURL('image/png');
    });
    const comma=data.indexOf(',');
    if(comma<0)throw new Error(`invalid canvas data URL for ${view}`);
    const png=Buffer.from(data.slice(comma+1),'base64');
    if(png.length<1000||png.subarray(1,4).toString()!=='PNG')throw new Error(`invalid/empty PNG for ${view}: ${png.length} bytes`);
    fs.writeFileSync(path.join(out,`${view}.png`),png);
    log(`saved ${view} ${png.length} bytes`);
  }
  const metrics=await page.evaluate(()=>{const g=window.__MICHAEL_GRAPHICS||null,c=document.querySelector('#raceCanvas'),gl=c?.getContext('webgl2')||c?.getContext('webgl');return{
    graphics:g,body:window.__MICHAEL_BODY_AUTHORITY||null,refinement:window.__MICHAEL_REFINEMENT||null,
    ready:window.__MICHAEL_READY===true,v39:window.__V39_READY===true,model:window.__MICHAEL_MODEL,error:window.__MICHAEL_ERROR||null,polyglot:window.__MICHAEL_POLYGLOT||null,
    frameMs:Number(g?.physicalFrameMs||g?.frameMs||16.7),michaelFrameMs:Number(g?.michaelFrameMs||0),
    drawables:Number(g?.drawables||g?.drawCalls||0),quality:Number(g?.quality||0),scale:document.querySelector('#scale')?.textContent||'',
    canvas:{width:c?.width||0,height:c?.height||0,clientWidth:c?.clientWidth||0,clientHeight:c?.clientHeight||0},webgl:!!gl
  }});
  const unique404=[...new Set(missing)];
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({...metrics,captureSize:size,views,missing404:unique404},null,2)+'\n');
  if(!metrics.ready||!metrics.webgl)throw new Error(`Michael renderer not capture-ready: ${JSON.stringify(metrics)}`);
  const critical404=unique404.filter(u=>/\.(?:js|mjs|glb|wasm)(?:\?|$)/i.test(u));
  if(critical404.length)throw new Error(`critical Michael resources returned 404: ${critical404.join(', ')}`);
  log(`done; 404=${unique404.length} critical404=${critical404.length}`);
  console.log(JSON.stringify({out,url,size,views,metrics,missing404:unique404},null,2));
}catch(e){
  console.error(`[capture failed +${((Date.now()-started)/1000).toFixed(1)}s] ${e?.stack||e}`);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
}
