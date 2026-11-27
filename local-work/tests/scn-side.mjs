const setVal = `(el,v)=>{const p=Object.getPrototypeOf(el);const s=Object.getOwnPropertyDescriptor(p,'value').set;s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function run(evalJs, shot) {
  await evalJs(`(()=>{const f=document.querySelector('#auth-form');(${setVal})(f.querySelector('input[name=email]'),'owner@agmal.local');(${setVal})(f.querySelector('input[name=password]'),'TEST_EMULATOR_PASSWORD');f.querySelector('button[type=submit]').click();return 1})()`);
  for(let i=0;i<30;i++){ await sleep(1000); if(await evalJs(`!!document.querySelector('.dash-nav')`)) break; }
  console.log('NAV', await evalJs(`JSON.stringify([...document.querySelectorAll('.dash-nav')].filter(x=>x.textContent.includes('المصروفات')).map(x=>x.outerHTML.slice(0,200)))`));
  await evalJs(`[...document.querySelectorAll('.dash-nav')].find(x=>x.textContent.includes('المصروفات'))?.click();1`);
  for(let i=0;i<40;i++){ await sleep(1000); if(await evalJs(`document.querySelector('#f-kind')?.value==='expense'`)) break; }
  console.log('KIND', await evalJs(`document.querySelector('#f-kind')?.value`));
  await evalJs(`(${setVal})(document.querySelector('#f-fields [name=category]'),'other');(${setVal})(document.querySelector('#f-fields [name=amount]'),'12');(${setVal})(document.querySelector('#f-fields [name=expenseName]'),'ورق تغليف');1`);
  await sleep(300);
  await evalJs(`document.querySelector('#f-form').requestSubmit();1`);
  await sleep(3000);
  console.log('SUM', (await evalJs(`document.querySelector('#f-summary')?.innerText||''`)).replace(/\n/g,' | ').slice(0,260));
  await shot('exp-sidebar-review');
}
