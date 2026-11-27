import{_ as collection,y as doc,f as setDoc,w as serverTimestamp,a as getDocsFromServer}from"./49-pv2f-index.esm-CnELAr16.js";
const DAY=864e5,PERIOD=15,SOON=3;
const esc=s=>String(s??``).replace(/[&<>"']/g,c=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`}[c]));
const money=n=>(Number(n||0)/100).toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2});
const ms=v=>v?.toMillis?v.toMillis():(v instanceof Date?v.getTime():(typeof v===`number`?v:0));
export function waLink(phone,name,due){
  let d=String(phone||``).replace(/\D/g,``);
  if(!d)return``;
  if(d.startsWith(`00`))d=d.slice(2);else if(d.startsWith(`0`))d=`20`+d.slice(1);
  const text=`أهلًا ${name}، تذكير ودّي من مكتبة أجمل الهدايا: المتبقي عليك ${money(due)} ج.م. شكرًا لك.`;
  return`https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
export function classify(customers,collections,reminders,now=Date.now()){
  const lastPay={},lastRem={};
  for(const c of collections){const t=ms(c.at);if(c.customer&&t>(lastPay[c.customer]||0))lastPay[c.customer]=t}
  for(const r of reminders){const t=ms(r.at);if(r.customer&&t>(lastRem[r.customer]||0))lastRem[r.customer]=t}
  return customers.filter(c=>c.active!==false&&Number(c.due)>0).map(c=>{
    const p=lastPay[c.id]||0,r=lastRem[c.id]||0,ref=Math.max(p,r);
    const nextAt=ref?ref+PERIOD*DAY:0;
    const daysLate=ref?Math.floor((now-nextAt)/DAY):0;
    const daysLeft=ref?Math.ceil((nextAt-now)/DAY):0;
    const state=!ref||nextAt<=now?`now`:(nextAt-now<=SOON*DAY?`soon`:`ok`);
    return{id:c.id,name:c.name||c.id,phone:c.phone||``,due:Number(c.due),lastPay:p,lastRem:r,state,daysLate,daysLeft};
  }).sort((a,b)=>(a.state===b.state?b.due-a.due:({now:0,soon:1,ok:2}[a.state]-{now:0,soon:1,ok:2}[b.state])));
}
const ago=t=>{if(!t)return null;const d=Math.floor((Date.now()-t)/DAY);return d<=0?`اليوم`:`منذ ${d} يومًا`};
const CSS=`.rm{direction:rtl;color:#f3ead2;font-family:inherit;padding:8px}.rm h2{color:#e8c36a;margin:0 0 4px}.rm .sub{color:#9a8f72;font-size:13px;margin-bottom:16px}
.rm .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px}.rm .card{background:#14110a;border:1px solid #2a2314;border-radius:14px;padding:14px}
.rm .card small{color:#9a8f72;display:block;margin-bottom:6px}.rm .card b{font-size:22px;color:#e8c36a}.rm .card b.late{color:#e8876f}
.rm .tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}.rm .tabs button{background:transparent;color:#9a8f72;border:1px solid #2a2314;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit}
.rm .tabs button.on{color:#e8c36a;border-color:#e8c36a;background:#1d1708}.rm .wrap{overflow-x:auto;background:#14110a;border:1px solid #2a2314;border-radius:14px}
.rm table{width:100%;border-collapse:collapse;min-width:720px}.rm th{color:#9a8f72;font-weight:500;text-align:right;padding:12px;border-bottom:1px solid #2a2314;font-size:13px}.rm td{padding:12px;border-bottom:1px solid #1f1a0e;font-size:14px}
.rm .act{display:flex;gap:6px;flex-wrap:wrap}.rm .act a,.rm .act button{border-radius:8px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer;text-decoration:none;border:1px solid #2a2314;color:#e8c36a;background:transparent}
.rm .act .call{background:linear-gradient(#e8c36a,#c9a14a);color:#1a1405;border:0;font-weight:700}.rm .act .wa{background:#173222;color:#9ee0b4;border-color:#245238}.rm .act .na{opacity:.4;pointer-events:none}
.rm .badge{border-radius:999px;padding:3px 10px;font-size:12px}.rm .badge.now{background:#3a1510;color:#f0897a}.rm .badge.soon{background:#33280c;color:#e8c36a}.rm .badge.ok{background:#12301e;color:#8fdba8}
.rm .msg{color:#9a8f72;padding:18px;text-align:center}.rm .err{color:#f0897a;padding:12px}`;
export async function mountReminders(root,{db,uid}){
  let tab=`now`,rows=[],busy=false,err=``,loaded=false;
  const rd=async n=>(await getDocsFromServer(collection(db,n))).docs.map(d=>({id:d.id,...d.data()}));
  async function load(keep){
    if(!keep)err=``;
    try{const[c,p,r]=await Promise.all([rd(`phase3_customers`),rd(`phase4_collections`),rd(`phase4_reminders`)]);rows=classify(c,p,r);loaded=true}catch(e){err=`تعذر تحميل البيانات من الخادم. لم يتغير شيء.`;loaded=true}
    draw();
  }
  function draw(){
    const now=rows.filter(r=>r.state===`now`),soon=rows.filter(r=>r.state===`soon`),ok=rows.filter(r=>r.state===`ok`);
    const list=tab===`now`?now:tab===`soon`?soon:ok;
    const total=now.reduce((s,r)=>s+r.due,0);
    root.innerHTML=`<style>${CSS}</style><div class="rm" id="rm-root"><h2>تذكيرات العملاء</h2><div class="sub">تذكير كل ${PERIOD} يومًا للعملاء المدينين. الإرسال يدوي: تفتح واتساب ثم تضغط «تم التذكير».</div>
    <div class="cards"><div class="card"><small>متأخرون عن التذكير</small><b class="late" id="rm-n-now">${now.length} عميل</b></div><div class="card"><small>يستحقون خلال ${SOON} أيام</small><b id="rm-n-soon">${soon.length} عميل</b></div><div class="card"><small>إجمالي ديون من يستحقون التذكير</small><b id="rm-total">${money(total)} ج.م</b></div></div>
    <div class="tabs"><button data-t="now" class="${tab===`now`?`on`:``}">مستحق الآن</button><button data-t="soon" class="${tab===`soon`?`on`:``}">قريبًا</button><button data-t="ok" class="${tab===`ok`?`on`:``}">تمت متابعته</button></div>
    ${err?`<div class="err">${esc(err)}</div>`:``}
    <div class="wrap">${!loaded?`<div class="msg">جارٍ التحميل…</div>`:list.length?`<table><thead><tr><th>العميل</th><th>الهاتف</th><th>المتبقي عليه</th><th>آخر دفعة</th><th>آخر تذكير</th><th>الحالة</th><th></th></tr></thead><tbody>${list.map(r=>{const wl=waLink(r.phone,r.name,r.due);const dg=String(r.phone).replace(/\D/g,``);
      return`<tr data-id="${esc(r.id)}"><td>${esc(r.name)}</td><td>${esc(r.phone)||`—`}</td><td>${money(r.due)}</td><td>${ago(r.lastPay)||`لا توجد`}</td><td>${ago(r.lastRem)||`لم يُذكَّر`}</td><td><span class="badge ${r.state}">${r.state===`now`?(r.lastPay||r.lastRem?`متأخر ${Math.max(r.daysLate,0)} يوم`:`لم يُذكَّر بعد`):r.state===`soon`?`بعد ${r.daysLeft} أيام`:`لا يحتاج`}</span></td><td><div class="act">${r.state===`ok`?``:`<a class="call ${dg?``:`na`}" href="${dg?`tel:+${dg.startsWith(`0`)?`20`+dg.slice(1):dg}`:`#`}">اتصال</a><a class="wa ${wl?``:`na`}" target="_blank" rel="noopener" href="${wl||`#`}">واتساب</a><button data-done="${esc(r.id)}" ${busy?`disabled`:``}>تم التذكير</button>`}</div></td></tr>`}).join(``)}</tbody></table>`:`<div class="msg">لا يوجد عملاء في هذه القائمة.</div>`}</div></div>`;
    root.querySelectorAll(`[data-t]`).forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
    root.querySelectorAll(`[data-done]`).forEach(b=>b.onclick=async()=>{
      if(busy)return;busy=true;draw();
      try{const id=`rem-${b.dataset.done}-${Date.now().toString(36)}`.replace(/[^A-Za-z0-9_-]/g,`-`).slice(0,80);
        await setDoc(doc(db,`phase4_reminders`,id),{customer:b.dataset.done,actor:uid(),at:serverTimestamp(),channel:`manual`});
      }catch(e){err=`لم يُسجَّل التذكير. حاول مرة أخرى.`;window.__remErr=String(e&&e.code||e)+" uid="+String(uid())+" msg="+String(e&&e.message).slice(0,160)}
      busy=false;await load(!!err);
    });
  }
  draw();await load();
}
