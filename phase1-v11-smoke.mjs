import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4175']);let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4175')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.setViewportSize({width:1440,height:1080});
 for(const role of ['owner','employee','customer']){
  await page.goto(`http://127.0.0.1:4175/#review/${role}`);await page.evaluate(()=>document.fonts.ready);await page.locator('.review-banner').waitFor();
  if(role!=='owner')assert.equal(await page.getByText('أرصدة الحسابات',{exact:true}).count(),0);
  if(role==='customer')assert.equal(await page.getByText('المنتجات والمخزون',{exact:true}).count(),0);
  await page.screenshot({path:`/downloads/agaml-dashboard-${role}-v10.png`,fullPage:true});
 }
 await page.goto('http://127.0.0.1:4175/#review/owner');
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/downloads/agaml-dashboard-mobile-v10.png',fullPage:true});
 await page.locator('#dash-menu').click();assert.equal(await page.locator('#erp-side').isVisible(),true);await page.locator('#dash-menu').click();assert.equal(await page.locator('#erp-side').isVisible(),false);
 await page.locator('#dash-exit').click();await page.locator('#auth-form').waitFor();
 assert.equal(await page.locator('.primary').isDisabled(),true);
 await page.locator('#tab-register').click();await page.getByRole('heading',{name:'إنشاء حساب جديد.'}).waitFor();assert.equal(await page.locator('.primary').isDisabled(),true);
 assert.equal(await page.locator('input[name=accountType]').count(),2);await page.locator('input[value=employee]').check();assert.equal(await page.locator('input[value=employee]').isChecked(),true);
 await page.setViewportSize({width:1440,height:1100});await page.screenshot({path:'/downloads/agaml-signup-desktop-v11.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/downloads/agaml-signup-mobile-v11.png',fullPage:true});
 await page.locator('#tab-login').click();await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/downloads/agaml-login-desktop-v10.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/downloads/agaml-login-mobile-v10.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS dashboard role previews, mobile menu, 320/390/768 overflow, login modes, no browser errors.');
}finally{await browser?.close();server.kill();}
