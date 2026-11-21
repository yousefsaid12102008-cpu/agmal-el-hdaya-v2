import {accountPage,accountTotal,setAccountAccess,loginActivity} from '../services/accounts.service.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=t=>t?.toDate?new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'}).format(t.toDate()):'غير متاح';
const state={pending:'بانتظار الموافقة',active:'نشط',suspended:'موقوف',rejected:'غير معتمد'};
export function renderAccountManagement(host){
 let disposed=false,cursor=null,items=[],busy=false;
 host.innerHTML=`<section class="approval-list-panel account-management"><div class="approval-section-title"><h2>الحسابات وإدارة الوصول</h2><button id="accounts-refresh">تحديث</button></div><div class="account-stats"><div><span>الحسابات المسجلة</span><strong id="accounts-total">—</strong></div><div><span>زوار الموقع</span><strong>غير متاح بعد</strong><small>لن نعرض رقمًا تقديريًا أو مزيفًا.</small></div></div><p>تجميد أو إيقاف الحساب يمنع وصوله للنظام، ولا يحذف حساب Google أو يعطّل هوية الدخول. حسابات المالك محمية ولا تتغير من هذه الشاشة.</p><p id="accounts-status" role="status"></p><div id="accounts-list"></div><button id="accounts-more" hidden>عرض ٥٠ حسابًا إضافيًا</button><dialog id="access-confirm"><h2 id="access-title"></h2><p id="access-target"></p><p>سيُسجّل القرار باسمك. التفعيل يعيد الصلاحيات المعروضة للحساب.</p><div class="approval-dialog-actions"><button id="access-cancel">رجوع</button><button id="access-save">تأكيد القرار</button></div></dialog></section>`;
 const $=s=>host.querySelector(s),status=t=>{$('#accounts-status').textContent=t;};
 function draw(){
  $('#accounts-list').innerHTML=items.map(p=>`<article class="account-row"><div><strong>${escape(p.displayName||'حساب جديد')}</strong><small dir="ltr">${escape(p.email||p.uid)}</small><small>${escape(state[p.status]||'غير معروف')} · ${escape(p.role)} · ${p.emailVerified?'بريد مؤكد':'بريد غير مؤكد'}</small><small>تاريخ التسجيل: ${escape(date(p.createdAt))}</small><small>آخر تسجيل دخول: ${escape(date(p.activity?.lastSignInAt))}</small><small>الجهاز: ${escape(p.activity?.deviceLabel||'غير متاح')} · بيانات يرسلها المتصفح، الموديل الدقيق قد لا يتاح</small><small>الصلاحيات: ${escape((p.permissions||[]).join('، ')||'بدون صلاحيات')}</small></div>${p.role!=='owner'&&['active','suspended'].includes(p.status)?`<button data-access="${escape(p.uid)}" ${busy?'disabled':''}>${p.status==='active'?'تجميد / إيقاف':'إعادة تفعيل'}</button>`:`<span>${p.role==='owner'?'حساب مالك محمي':p.status==='pending'?'تتم مراجعة الطلب أعلاه':'لا يوجد إجراء متاح'}</span>`}</article>`).join('')||'<p>لا توجد حسابات.</p>';
  host.querySelectorAll('[data-access]').forEach(button=>button.onclick=()=>confirm(items.find(p=>p.uid===button.dataset.access)));
 }
 function confirm(p){
  if(busy||!p)return;const next=p.status==='active'?'suspended':'active',dialog=$('#access-confirm');
  $('#access-title').textContent=next==='suspended'?'تأكيد إيقاف الحساب':'تأكيد إعادة التفعيل';$('#access-target').textContent=(p.email||p.uid)+' · '+p.uid;dialog.showModal();
  $('#access-cancel').onclick=()=>dialog.close();$('#access-save').onclick=async()=>{dialog.close();busy=true;draw();status('جار حفظ القرار...');try{await setAccountAccess(p,next);if(disposed)return;status('تم حفظ القرار وتسجيله.');await load(true);}catch{if(!disposed)status('تعذر حفظ القرار. قد تكون الحالة تغيرت أو انتهت صلاحيتك. حدّث القائمة.');}finally{busy=false;if(!disposed)draw();}};
 }
 async function load(reset=false){
  try{const [page,total]=await Promise.all([accountPage(reset?null:cursor),accountTotal()]);await Promise.all(page.items.map(async p=>{try{p.activity=await loginActivity(p.uid);}catch{p.activity=null;}}));if(disposed)return;items=reset?page.items:[...items,...page.items];cursor=page.cursor;$('#accounts-total').textContent=String(total);$('#accounts-more').hidden=!page.more;draw();}catch{if(!disposed)status('تعذر تحميل الحسابات. هذه البيانات متاحة للمالك فقط.');}
 }
 $('#accounts-refresh').onclick=()=>load(true);$('#accounts-more').onclick=()=>load();load(true);
 return ()=>{disposed=true;$('#access-confirm')?.close();};
}
