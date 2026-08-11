import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const out=process.argv[2]||'/tmp/michael-visual';
const url=process.env.MICHAEL_URL||'http://127.0.0.1:4173/racing-mjx7303-michael-v39.html';
const size=Math.max(320,Math.min(1200,Number(process.env.MICHAEL_CAPTURE_SIZE||900)));
const navTimeout=Math.max(5000,Number(process.env.MICHAEL_NAV_TIMEOUT_MS||20000));
const readyTimeout=Math.max(5000,Number(process.env.MICHAEL_READY_TIMEOUT_MS||20000));
const shotTimeout=Math.max(5000,Number(process.env.MICHAEL_SCREENSHOT_TIMEOUT_MS||15000));
const all=['front','three','side','rear','top'];
const requested=(process.env.MICHAEL_CAPTURE_VIEWS||all.join(',')).split(',').map(x=>x.trim()).filter(x=>all.includes(x));
const views=requested.length?requested:all;
fs.mkdirSync(out,{recursive:true});
const started=Date.now();
const log=m=>console.log(`[capture +${((Date.now()-started)/1000).toFixed(1)}s] ${m}`);
let browser;
try{
  log(`launch chromium size=${size} views=${views.join(',')}`);
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-sandbox']});
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
  page.setDefaultTimeout(shotTimeout);
  page.on('pageerror',e=>console.error(`[pageerror] ${e?.stack||e}`));
  page.on('console',m=>{if(m.type()==='error')console.error(`[browser console] ${m.text()}`)});
  log('navigate');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:navTimeout});
  log('wait MICHAEL_READY');
  await page.waitForFunction(()=>window.__MICHAEL_READY===true,{timeout:readyTimeout});
  await page.waitForTimeout(350);
  for(const view of views){
    log(`view ${view}`);
    const button=page.locator(`[data-view="${view}"]`);
    await button.waitFor({state:'visible',timeout:shotTimeout});
    await button.click({timeout:shotTimeout});
    await page.waitForTimeout(size<600?120:220);
    await page.locator('#raceCanvas').screenshot({path:path.join(out,`${view}.png`),timeout:shotTimeout});
  }
  const metrics=await page.evaluate(()=>{const g=window.__MICHAEL_GRAPHICS||null;return{
    graphics:g,body:window.__MICHAEL_BODY_AUTHORITY||null,refinement:window.__MICHAEL_REFINEMENT||null,
    ready:window.__MICHAEL_READY===true,v39:window.__V39_READY===true,
    frameMs:Number(g?.physicalFrameMs||g?.frameMs||16.7),michaelFrameMs:Number(g?.michaelFrameMs||0),
    drawables:Number(g?.drawables||g?.drawCalls||0),quality:Number(g?.quality||0),
    scale:document.querySelector('#scale')?.textContent||''
  }});
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({...metrics,captureSize:size,views,captureMs:Date.now()-started},null,2)+'\n');
  log(`complete ${Date.now()-started}ms`);
  console.log(JSON.stringify({out,url,size,views,metrics,captureMs:Date.now()-started},null,2));
}catch(err){
  console.error(`[capture failed +${((Date.now()-started)/1000).toFixed(1)}s] ${err?.stack||err}`);
  process.exitCode=1;
}finally{
  if(browser){
    try{await Promise.race([browser.close(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('browser close timeout')),5000))])}
    catch(e){console.error(`[capture cleanup] ${e?.message||e}`)}
  }
}
