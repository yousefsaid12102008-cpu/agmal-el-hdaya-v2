const setVal = `(el,v)=>{const p=Object.getPrototypeOf(el);const s=Object.getOwnPropertyDescriptor(p,'value').set;s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function run(evalJs, shot) {
  await evalJs(`(()=>{const f=document.querySelector('#auth-form');(${setVal})(f.querySelector('input[name=email]'),'owner@agmal.local');(${setVal})(f.querySelector('input[name=password]'),'TEST_EMULATOR_PASSWORD');f.querySelector('button[type=submit]').click();return 1})()`);
  for(let i=0;i<30;i++){ await sleep(1000); if(await evalJs(`!!document.querySelector('.dash-nav')`)) break; }
  console.log('NAV', await evalJs(`!![...document.querySelectorAll('.dash-nav')].find(x=>x.textContent.includes('تذكيرات العملاء'))`));
  await evalJs(`[...document.querySelectorAll('.dash-nav')].find(x=>x.textContent.includes('تذكيرات العملاء'))?.click();1`);
  for(let i=0;i<20;i++){ await sleep(700); if(await evalJs(`!!document.querySelector('#rm-root tbody tr')`)) break; }
  console.log('STATS', await evalJs(`['#rm-n-now','#rm-n-soon','#rm-total'].map(s=>document.querySelector(s)?.textContent).join(' | ')`));
  console.log('ROWS now', await evalJs(`[...document.querySelectorAll('#rm-root tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' ').slice(0,120)).join(' // ')`));
  console.log('WA', await evalJs(`decodeURIComponent(document.querySelector('#rm-root a.wa')?.href||'')`));
  await shot('rem-now');
  await evalJs(`document.querySelector('[data-t=soon]').click();1`); await sleep(300);
  console.log('SOON rows', await evalJs(`[...document.querySelectorAll('#rm-root tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' ').slice(0,100)).join(' // ')`));
  await evalJs(`document.querySelector('[data-t=now]').click();1`); await sleep(300);
  await evalJs(`document.querySelector('[data-done]').click();1`);
  await sleep(3000);
  console.log('REMERR', await evalJs('window.__remErr')); console.log('AFTER done', await evalJs(`['#rm-n-now','#rm-n-soon'].map(s=>document.querySelector(s)?.textContent).join(' | ')+' err='+(document.querySelector('#rm-root .err')?.textContent||'')`));
  await evalJs(`document.querySelector('[data-t=ok]').click();1`); await sleep(300);
  console.log('OK rows', await evalJs(`[...document.querySelectorAll('#rm-root tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' ').slice(0,100)).join(' // ')`));
  await shot('rem-ok');
}
