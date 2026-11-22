// Print-only, local DOM measurement. No account, product or network writes.
(()=>{
 if(window.agmalLabelsPrintFit)return;
 function inspect(){
  const source=document.querySelector('.labels-workbench');
  if(!source?.querySelector('.product-label'))return {ok:false,reason:'empty'};
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-20000px;top:0;width:190mm;pointer-events:none;z-index:-1';
  const shadow=host.attachShadow({mode:'closed'}),style=document.createElement('style');
  try{
   const rules=[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules].filter(rule=>rule.type!==CSSRule.FONT_FACE_RULE&&rule.type!==CSSRule.IMPORT_RULE).map(rule=>rule.cssText));
   style.textContent=rules.join('\n').replace(/@media\s+print\b/g,'@media all');
   const clone=source.cloneNode(true);clone.querySelectorAll('.labels-print-fit-alert').forEach(e=>e.remove());shadow.append(style,clone);document.body.append(host);
   const failures=[];
   for(const [i,label]of [...shadow.querySelectorAll('.product-label')].entries()){
    const box=label.getBoundingClientRect(),parts=[...label.children].filter(c=>getComputedStyle(c).display!=='none').map(c=>({el:c,box:c.getBoundingClientRect()})).sort((a,b)=>a.box.top-b.box.top);
    for(const p of parts){const b=p.box;if(b.top<box.top+1||b.bottom>box.bottom-1||b.left<box.left||b.right>box.right||p.el.scrollHeight>p.el.clientHeight+2)failures.push(i);}
    for(let j=1;j<parts.length;j++)if(parts[j-1].box.bottom>parts[j].box.top+.5)failures.push(i);
    const footer=getComputedStyle(label,'::after');
    if(footer.content&&footer.content!=='none'&&footer.content!=='normal'){
     const last=parts.at(-1)?.box.bottom??box.top,fh=parseFloat(footer.height),margin=parseFloat(footer.marginTop)||0;
     if(!Number.isFinite(fh)||last+margin+fh>box.bottom-1)failures.push(i);
    }
   }
   return {ok:failures.length===0,reason:failures.length?'overflow':null,labels:shadow.querySelectorAll('.product-label').length,failures:[...new Set(failures)]};
  }catch{return {ok:false,reason:'unverifiable'};}finally{host.remove();}
 }
 const message='المحتوى لا يتسع بوضوح داخل المقاس المختار. قلّل الملاحظات أو اختر ملصقاً أكبر / صفوفاً أقل ثم حدّث المعاينة. لم يتغير مقاس الورق أو الباركود تلقائياً.';
 function mark(result){const status=document.querySelector('#labels-status');if(status){status.textContent=message;status.dataset.printFit=result.reason||'overflow';}}
 window.agmalLabelsPrintFit=inspect;
 document.addEventListener('click',event=>{if(!event.target.closest?.('#labels-print'))return;const result=inspect();if(!result.ok){event.preventDefault();event.stopImmediatePropagation();mark(result);}},true);
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'&&document.querySelector('.labels-workbench')){const result=inspect();if(!result.ok){event.preventDefault();event.stopImmediatePropagation();mark(result);}}},true);
 window.addEventListener('beforeprint',()=>{if(!document.querySelector('.labels-workbench'))return;const result=inspect();if(result.ok)return;mark(result);document.body.classList.add('labels-print-overflow');let alert=document.querySelector('.labels-print-fit-alert');if(!alert){alert=document.createElement('p');alert.className='labels-print-fit-alert';document.querySelector('.labels-workbench').prepend(alert);}alert.textContent=message;});
 window.addEventListener('afterprint',()=>document.body.classList.remove('labels-print-overflow'));
})();
