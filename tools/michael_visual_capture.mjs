import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const out=process.argv[2]||'/tmp/michael-visual';
const url=process.env.MICHAEL_URL||'http://127.0.0.1:4173/racing-mjx7303-michael-v39.html';
const size=Math.max(320,Math.min(1200,Number(process.env.MICHAEL_CAPTURE_SIZE||900)));
const all=['front','three','side','rear','top'];
const requested=(process.env.MICHAEL_CAPTURE_VIEWS||all.join(',')).split(',').map(x=>x.trim()).filter(x=>all.includes(x));
const views=requested.length?requested:all;
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
await page.goto(url,{waitUntil:'networkidle',timeout:60000});
await page.waitForFunction(()=>window.__MICHAEL_READY===true,{timeout:60000});
await page.waitForTimeout(900);
for(const view of views){
  await page.locator(`[data-view="${view}"]`).click();
  await page.waitForTimeout(size<600?180:350);
  await page.locator('#raceCanvas').screenshot({path:path.join(out,`${view}.png`)});
}
const metrics=await page.evaluate(()=>{const g=window.__MICHAEL_GRAPHICS||null;return{
  graphics:g,body:window.__MICHAEL_BODY_AUTHORITY||null,refinement:window.__MICHAEL_REFINEMENT||null,
  ready:window.__MICHAEL_READY===true,v39:window.__V39_READY===true,
  frameMs:Number(g?.physicalFrameMs||g?.frameMs||16.7),michaelFrameMs:Number(g?.michaelFrameMs||0),
  drawables:Number(g?.drawables||g?.drawCalls||0),quality:Number(g?.quality||0),
  scale:document.querySelector('#scale')?.textContent||''
}});
fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({...metrics,captureSize:size,views},null,2)+'\n');
await browser.close();
console.log(JSON.stringify({out,url,size,views,metrics},null,2));
