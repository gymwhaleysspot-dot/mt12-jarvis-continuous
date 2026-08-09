import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const out=process.argv[2]||'/tmp/michael-visual';
const url=process.env.MICHAEL_URL||'http://127.0.0.1:4173/racing-mjx7303-michael-v39.html';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:900,height:900},deviceScaleFactor:1});
await page.goto(url,{waitUntil:'networkidle',timeout:60000});
await page.waitForFunction(()=>window.__MICHAEL_READY===true,{timeout:60000});
await page.waitForTimeout(1200);
const views=['front','three','side','rear','top'];
for(const view of views){
  await page.locator(`[data-view="${view}"]`).click();
  await page.waitForTimeout(350);
  await page.locator('#raceCanvas').screenshot({path:path.join(out,`${view}.png`)});
}
const metrics=await page.evaluate(()=>({
  graphics:window.__MICHAEL_GRAPHICS||null,
  body:window.__MICHAEL_BODY_AUTHORITY||null,
  refinement:window.__MICHAEL_REFINEMENT||null,
  ready:window.__MICHAEL_READY===true,
  v39:window.__V39_READY===true,
  frameMs:Number(document.querySelector('#frame')?.textContent?.replace(/[^0-9.]/g,'')||0),
  scale:document.querySelector('#scale')?.textContent||''
}));
fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(metrics,null,2)+'\n');
await browser.close();
console.log(JSON.stringify({out,url,views,metrics},null,2));
