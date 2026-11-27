const setVal = `(el,v)=>{const p=Object.getPrototypeOf(el);const s=Object.getOwnPropertyDescriptor(p,'value').set;s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function run(evalJs, shot) {
  await evalJs(`(()=>{const f=document.querySelector('#auth-form')||document.querySelector('form');(${setVal})(f.querySelector('input[name=email],input[type=email]'),'owner@agmal.local');(${setVal})(f.querySelector('input[type=password]'),'TEST_EMULATOR_PASSWORD');f.querySelector('button[type=submit]').click();return 1})()`);
  for(let i=0;i<30;i++){ await sleep(1000); if(await evalJs(`!!document.querySelector('.dash-nav')`)) break; }
  await evalJs(`[...document.querySelectorAll('.dash-nav')].find(x=>x.textContent.includes('الخزينة والحسابات'))?.click();'ok'`);
  for(let i=0;i<40;i++){ await sleep(1000); if(await evalJs(`(document.querySelector('#f-form select[name=from]')?.options.length||0)>1`)) break; }
  console.log('FORM READY', await evalJs(`!!document.querySelector('#f-form')`));
  async function setKind(k){ await evalJs(`(${setVal})(document.querySelector('#f-kind'),'${k}');1`); await sleep(300); }
  await setKind('expense');
  console.log('CATS', await evalJs(`JSON.stringify([...document.querySelectorAll('#f-fields select[name=category] option')].map(o=>o.value+':'+o.textContent))`));
  console.log('NAME hidden initially', await evalJs(`document.querySelector('#f-fields [name=expenseName]').closest('label').hidden`));
  console.log('reason required (expense)', await evalJs(`document.querySelector('#f-form [name=reason]').required`));
  await evalJs(`(${setVal})(document.querySelector('#f-fields [name=category]'),'other');1`); await sleep(300);
  console.log('NAME hidden after other', await evalJs(`document.querySelector('#f-fields [name=expenseName]').closest('label').hidden`));
  await evalJs(`(${setVal})(document.querySelector('#f-fields [name=amount]'),'10');(${setVal})(document.querySelector('#f-fields [name=expenseName]'),'صيانة طابعة');1`);
  await shot('exp-form-other');
  async function submitAndSave(label){
    await evalJs(`document.querySelector('#f-form').requestSubmit();1`);
    for(let i=0;i<20;i++){ await sleep(700); if(await evalJs(`document.querySelector('#f-review')?.open`)) break; }
    console.log(label,'REVIEW open', await evalJs(`document.querySelector('#f-review')?.open`));
    console.log(label,'SUMMARY', (await evalJs(`document.querySelector('#f-summary')?.innerText||''`)).replace(/\n/g,' | ').slice(0,300));
    console.log(label,'STATUS', await evalJs(`document.body.innerText.match(/لم تحفظ[^\\n]*|يلزم[^\\n]*|خطأ[^\\n]*/)?.[0]||''`));
    await shot('exp-review-'+label);
    await evalJs(`document.querySelector('#f-save')?.click();1`);
    for(let i=0;i<20;i++){ await sleep(700); const t=await evalJs(`document.querySelector('#f-result')?.textContent||''`); if(t) {console.log(label,'RESULT',t.slice(0,200));break;} }
  }
  await submitAndSave('other-named');
  // other with no name and empty reason
  await setKind('expense');
  await evalJs(`(${setVal})(document.querySelector('#f-fields [name=category]'),'other');(${setVal})(document.querySelector('#f-fields [name=amount]'),'5');1`); await sleep(300);
  await submitAndSave('other-empty');
  await setKind('expense');
  await evalJs(`(${setVal})(document.querySelector('#f-fields [name=category]'),'transport');(${setVal})(document.querySelector('#f-fields [name=amount]'),'7');(${setVal})(document.querySelector('#f-form [name=reason]'),'شحن بضاعة');1`); await sleep(300);
  await submitAndSave('transport-reason');
  // verify docs via emulator admin REST
  const docs = await evalJs(`(async()=>{const r=await fetch('http://127.0.0.1:8181/v1/projects/agmal-el-hdaya-erp/databases/(default)/documents/phase4_finance',{headers:{Authorization:'Bearer owner'}});const j=await r.json();return JSON.stringify((j.documents||[]).map(d=>({kind:d.fields.kind?.stringValue,reason:d.fields.reason?.stringValue,details:Object.fromEntries(Object.entries(d.fields.details?.mapValue?.fields||{}).map(([k,v])=>[k,v.stringValue??v.integerValue])),expense:d.fields.expense?.integerValue})))})()`);
  console.log('DOCS', docs);
}
