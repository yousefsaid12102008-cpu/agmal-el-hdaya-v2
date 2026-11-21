import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const remote=process.env.PREVIEW_URL;
const server=remote?null:spawn('python3',['-m','http.server','4177','--directory','dist']);
let browser;
try{
 const url=remote||'http://127.0.0.1:4177/';
 if(!remote)for(let i=0;i<40;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(url);await page.evaluate(()=>{localStorage.removeItem('agaml-theme')});await page.reload();
  await page.locator('#theme-toggle').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.locator('#email').fill('test@example.com');await page.locator('#password').fill('preview-only');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.locator('#email').inputValue(),'test@example.com');
  assert.equal(await page.locator('#password').inputValue(),'preview-only');
  assert(await page.locator('.primary').isDisabled());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width!==320)await page.screenshot({path:`/downloads/theme-light-${width}.png`,fullPage:true});
  await page.locator('#tab-register').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.locator('#theme-toggle').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert(await page.locator('.primary').isDisabled());
 }
 assert.deepEqual(errors,[]);console.log('PASS dark/light toggle, form preservation, signup, persistent choice, keyboard, mobile widths and disabled auth');
}finally{await browser?.close();server?.kill();}
