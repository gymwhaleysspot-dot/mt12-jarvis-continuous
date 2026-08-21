import {chromium,webkit} from 'playwright';
import fs from 'node:fs';

const engine=process.argv[2]||'chromium',browser=await({chromium,webkit}[engine]).launch({headless:true}),page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto(process.env.SURVIVOR_PS2_URL||'http://127.0.0.1:4173/survivor-ps2.html',{waitUntil:'networkidle'});
await page.click('#deploy');await page.waitForFunction(()=>globalThis.JarvisPS2?.getState()?.phase==='FIGHT');
await page.keyboard.down('KeyD');await page.waitForTimeout(450);await page.keyboard.up('KeyD');await page.keyboard.press('KeyJ');await page.waitForTimeout(350);
const result=await page.evaluate(()=>({api:globalThis.JarvisPS2.features,state:globalThis.JarvisPS2.getState(),events:globalThis.JarvisPS2.getReplay().events.length,canvas:document.querySelectorAll('canvas').length,startHidden:document.querySelector('#start').hidden}));
if(result.canvas!==1||!result.startHidden||result.state.level!==1||result.state.hero.name!=='GRIFFIN'||result.state.boss.name!=='LIRA'||result.events<2||!result.api.gamepad||!result.api.cinematicFinishers||errors.length)throw Error(JSON.stringify({result,errors},null,2));
const out=process.env.SURVIVOR_PS2_OUT;if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:`${out}/${engine}.png`,fullPage:true});fs.writeFileSync(`${out}/${engine}.json`,JSON.stringify({result,errors},null,2))}
console.log(JSON.stringify({engine,game:'survivor-ps2',battle:result.state.level,opponent:result.state.boss.name,events:result.events,result:'PASS'}));await browser.close();
