import {renderAccountManagement} from './account-management.js';
import {watchPendingAccounts,decidePendingAccount} from '../services/approvals.service.js';
import '../styles/approvals.css';
const labels={view_sales:'عرض المبيعات',create_sales:'إنشاء فاتورة بيع',view_inventory:'عرض المخزون',manage_inventory:'إدارة المخزون',manage_customers:'إدارة العملاء',view_orders:'عرض الطلبات',manage_orders:'إدارة الطلبات',view_own_purchases:'مشترياته فقط',view_own_orders:'طلباته فقط',view_own_account:'حسابه فقط'};
const roles={customer:'عميل',employee:'موظف',cashier:'كاشير'};
const scopes={customer:['view_own_purchases','view_own_orders','view_own_account'],employee:['view_sales','create_sales','view_inventory','manage_inventory','manage_customers','view_orders','manage_orders']};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderApprovals(root,{onBack=()=>{},onLogout=()=>{},watch=watchPendingAccounts,decide=decidePendingAccount,emulator=false,preview=false}={}){
 let records=[],selected=null,loading=true,busy=false,disposed=false,stop=()=>{},stopManagement=()=>{};
 root.innerHTML=`<main class="approval-shell" dir="rtl"><header class="approval-top"><a class="approval-brand" href="#team"><img src="assets/1-shop-logo.webp" alt="شعار أجمل الهدايا"><span>أجمل الهدايا<small>مراجعة الحسابات · المالك فقط</small></span></a><div><button id="approval-back">لوحة التحكم</button><button id="approval-logout">${preview?'صفحة الدخول':'تسجيل الخروج'}</button></div></header><div class="approval-content">${preview?'<div class="approval-env">معاينة تصميم فقط · حسابات توضيحية وليست عملاء حقيقيين · الموافقة والرفض غير متاحين</div>':''}${emulator?'<div class="approval-env">اختبار محلي بالمحاكيات · الحسابات المعروضة حسابات اختبار وليست عملاء حقيقيين</div>':''}<section class="approval-heading"><div><span class="approval-kicker">الهوية والوصول الآمن</span><h1>طلبات إنشاء الحسابات</h1><p>راجع كل طلب وحدد الدور والصلاحيات قبل السماح بالدخول.</p></div><span class="approval-owner">♛ بشمهندس يوسف<br><small>مالك النظام</small></span></section><div class="approval-warning">لا تمنح الموافقة أي صلاحيات مالية أو وصولًا لوحدات لم يكتمل تنفيذها. لا يحصل أي حساب جديد على صلاحيات تلقائيًا.</div><div id="approval-status" class="approval-status" role="status" aria-live="polite"></div><div class="approval-grid"><section class="approval-list-panel"><div class="approval-section-title"><h2>في انتظار الموافقة</h2><span id="pending-count">—</span></div><p class="approval-list-note">عرض حتى ١٠٠ طلب معلق. معرّف الحساب يميّز الطلبات المتشابهة.</p><div id="approval-list" aria-live="polite"></div></section><section class="approval-detail-panel" id="approval-detail" aria-label="مراجعة الطلب"></section></div></div><dialog id="approval-confirm" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><p id="confirm-summary"></p><p id="confirm-permissions"></p><p class="approval-dialog-note">سيُسجّل القرار باسمك في سجل المراجعة.</p><div class="approval-dialog-actions"><button value="cancel">رجوع</button><button id="confirm-decision" value="default">تأكيد القرار</button></div></form></dialog></main>`;
 const $=q=>root.querySelector(q),status=text=>{$('#approval-status').textContent=text;};
 function detail(){
  const p=records.find(p=>p.uid===selected);
  if(!p){$('#approval-detail').innerHTML='<div class="approval-empty"><span>◇</span><h2>اختار طلب للمراجعة</h2><p>ستظهر هنا تفاصيل الحساب والدور والصلاحيات.</p></div>';return;}
  const role=p.requestedRole==='employee'?'employee':'customer';
  $('#approval-detail').innerHTML=`<div class="approval-detail-title"><span class="approval-avatar">◯</span><div><span class="approval-kicker">طلب جديد</span><h2>${escape(p.displayName||'حساب جديد')}</h2><p>الحساب المطلوب: ${escape(roles[p.requestedRole]||'غير معروف')}</p></div><span class="approval-pending">معلق</span></div><dl class="approval-meta"><dt>البريد المسجل</dt><dd dir="ltr">${escape(p.email||'غير متاح لهذا الطلب')}</dd><dt>حالة البريد</dt><dd>${p.emailVerified===true?'تم التحقق من البريد':'البريد غير موثق'}</dd><dt>معرّف الحساب</dt><dd dir="ltr">${escape(p.uid)}</dd><dt>تاريخ الطلب</dt><dd>${escape(p.createdAt?.toDate?new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'}).format(p.createdAt.toDate()):'غير متاح')}</dd></dl><form id="approval-form"><label class="approval-field-label" for="approval-role">الدور بعد الموافقة</label><select id="approval-role"><option value="customer">عميل</option><option value="employee">موظف</option><option value="cashier">كاشير</option></select><fieldset class="approval-permissions"><legend>الصلاحيات المختارة</legend><p>كل الصلاحيات مغلقة افتراضيًا. اختر ما يحتاجه الحساب فقط.</p><div id="permission-options"></div></fieldset><div class="approval-boundary">الأرباح والخزينة والتقارير المالية والإعدادات والنسخ الاحتياطي ليست ضمن صلاحيات الموظف أو العميل.</div><div class="approval-actions"><button id="approve-account" type="button" class="approval-primary">موافقة على الحساب ←</button><button id="reject-account" type="button" class="approval-reject">رفض الطلب</button></div></form>`;
  $('#approval-role').value=role;
  function permissions(){const r=$('#approval-role').value;$('#permission-options').innerHTML=(scopes[r]||scopes.employee).map(key=>`<label><input type="checkbox" value="${key}"><span>${labels[key]}</span></label>`).join('');}
  permissions();if(p.emailVerified!==true){$('#approve-account').disabled=true;$('#approve-account').textContent='بانتظار تأكيد البريد';}if(preview){$('#approve-account').disabled=true;$('#reject-account').disabled=true;$('#approve-account').textContent='الموافقة بعد تشغيل النظام';}
  $('#approval-role').onchange=permissions;
  $('#approve-account').onclick=()=>confirm('active');$('#reject-account').onclick=()=>confirm('rejected');
 }
 function list(){
  $('#pending-count').textContent=loading?'—':String(records.length)+(records.length===100?'+':'');
  $('#approval-list').innerHTML=loading?'<div class="approval-empty"><p>جارٍ تحميل الطلبات…</p></div>':!records.length?'<div class="approval-empty"><span>✓</span><h3>مفيش طلبات معلقة</h3><p>هتظهر الطلبات الجديدة هنا عند وصولها.</p></div>':records.map(p=>`<button type="button" class="approval-request ${p.uid===selected?'selected':''}" data-uid="${escape(p.uid)}"><span class="approval-avatar">◯</span><span><strong>${escape(p.displayName||'حساب جديد')}</strong><small>${escape(roles[p.requestedRole]||'نوع غير معروف')} · ${escape(p.uid.slice(0,12))}</small></span><span class="approval-pending">معلق</span></button>`).join('');
  root.querySelectorAll('[data-uid]').forEach(button=>{button.disabled=busy;button.onclick=()=>{selected=button.dataset.uid;list();detail();if(matchMedia('(max-width:800px)').matches)$('#approval-detail').scrollIntoView({behavior:'smooth',block:'start'});};});
 }
 function confirm(nextStatus){
  if(busy||!records.some(p=>p.uid===selected))return;
  const p=records.find(p=>p.uid===selected),role=$('#approval-role').value;
  const permissions=nextStatus==='active'?Array.from(root.querySelectorAll('#permission-options input:checked')).map(e=>e.value):[];
  const decision={uid:p.uid,status:nextStatus,role,permissions};
  $('#confirm-title').textContent=nextStatus==='active'?'تأكيد الموافقة على الحساب':'تأكيد رفض الطلب';
  $('#confirm-summary').textContent=`${p.displayName||'حساب جديد'} · ${p.email||p.uid} · ${roles[role]}`;
  $('#confirm-permissions').textContent=nextStatus==='active'?`الصلاحيات: ${permissions.length?permissions.map(k=>labels[k]).join('، '):'بدون صلاحيات'}`:'سيظل الحساب دون صلاحيات تشغيلية.';
  const dialog=$('#approval-confirm');dialog.showModal();
  $('#confirm-decision').onclick=async e=>{
   e.preventDefault();if(busy)return;dialog.close();busy=true;list();$('#approval-form')?.setAttribute('aria-busy','true');root.querySelectorAll('#approval-form button,#approval-form input,#approval-form select').forEach(e=>e.disabled=true);status('جارٍ حفظ القرار على الخادم…');
   try{await decide(decision);if(disposed)return;status(nextStatus==='active'?'تم اعتماد الحساب وتسجيل القرار.':'تم رفض الطلب وتسجيل القرار.');selected=null;detail();}
   catch(error){if(disposed)return;status(['failed-precondition','functions/failed-precondition'].includes(error.code)?'الطلب اتراجع بالفعل من جلسة أخرى. حدّث القائمة قبل اتخاذ قرار جديد.':['permission-denied','functions/permission-denied'].includes(error.code)?'لا يمكن حفظ القرار. صلاحية المالك غير متاحة.':'تعذر حفظ القرار. لم يتم تأكيد أي تغيير. حاول مرة أخرى.');detail();}
   finally{busy=false;if(!disposed)list();}
  };
 }
 $('#approval-back').onclick=onBack;$('#approval-logout').onclick=onLogout;list();detail();
 stop=watch(items=>{if(disposed)return;records=items;loading=false;if(selected&&!records.some(p=>p.uid===selected)&&!busy){selected=null;$('#approval-confirm').close();status('تم تحديث حالة الطلب في جلسة أخرى.');detail();}list();},()=>{if(disposed)return;records=[];loading=false;selected=null;$('#approval-confirm').close();list();detail();status('تعذر تحميل الطلبات أو انتهت صلاحية الوصول. لا يمكن مراجعة حسابات الآن.');});
 if(!preview)stopManagement=renderAccountManagement(root.querySelector('.approval-content').appendChild(document.createElement('div')));
 return ()=>{disposed=true;stop();stopManagement();$('#approval-confirm')?.close();};
}
