import {renderInvoicePreview} from './pages/invoice-preview.js';
import {renderApprovals} from './pages/approvals.js';
import {renderDashboard} from './pages/dashboard.js';
import {designPreviewRole} from './router.js';
import {footerContact} from './config/contact.js';
import {renderStore} from './pages/storefront.js';
import './styles/main.css';
import './styles/cinematic.css';
import {auth,configured} from './config/firebase.js';
import {login,requestAccount,googleLogin,watchAuth,ensureProfile,logout,resetPassword,sendVerification,recheckVerification} from './services/auth.service.js';
import {watchProfile} from './services/user.service.js';
import {formatDate} from './utils/formatters.js';
const root=document.querySelector('#app');
let mode='login',busy=false,unwatch=()=>{},viewStop=()=>{},ownerPage='dashboard';
let theme='dark';
try{theme=localStorage.getItem('agaml-theme')==='light'?'light':'dark';}catch{}
document.documentElement.dataset.theme=theme;
function themeButton(){return `<button class="edition theme-toggle" id="theme-toggle" type="button" aria-label="${theme==='dark'?'تفعيل الوضع النهاري':'تفعيل الوضع الليلي'}" aria-pressed="${theme==='dark'}"><span aria-hidden="true">${theme==='dark'?'☾':'☀'}</span><span>${theme==='dark'?'الوضع الليلي':'الوضع النهاري'}</span></button>`;}
function toggleTheme(){
 theme=theme==='dark'?'light':'dark';
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem('agaml-theme',theme);}catch{}
 const button=document.querySelector('#theme-toggle');
 button.setAttribute('aria-pressed',String(theme==='dark'));
 button.setAttribute('aria-label',theme==='dark'?'تفعيل الوضع النهاري':'تفعيل الوضع الليلي');
 button.innerHTML=`<span aria-hidden="true">${theme==='dark'?'☾':'☀'}</span><span>${theme==='dark'?'الوضع الليلي':'الوضع النهاري'}</span>`;
}

const friendly=error=>({'auth/invalid-credential':'البريد أو كلمة المرور غير صحيحة.','auth/weak-password':'استخدم كلمة مرور أقوى.','auth/email-already-in-use':'هذا البريد مسجل بالفعل.','auth/invalid-email':'تحقق من البريد الإلكتروني.','auth/popup-closed-by-user':'تم إغلاق نافذة تسجيل الدخول.','auth/network-request-failed':'تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.','auth/too-many-requests':'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.','permission-denied':'لا تملك صلاحية إتمام الطلب.','failed-precondition':'تمت مراجعة الطلب بالفعل. حدّث الصفحة.'}[error.code]||'تعذر إتمام الطلب. حاول مجددًا أو تواصل مع المالك.');
function icon(name){
 const paths={sales:'M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h4',stock:'m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4 M12 11v10 M7 5l10 4',money:'M3 6h18v13H3z M3 10h18 M7 15h3 M16 3v3',print:'M7 8V3h10v5 M7 17H3V8h18v9h-4 M7 14h10v7H7z M17 11h1',lock:'M6 10h12v11H6z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',mail:'M3 5h18v14H3z m0 0 9 8 9-8',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z m-4 9 3 3 5-6',link:'m9 15 6-6 M7 10l-2 2a4 4 0 0 0 6 6l2-2 M11 8l2-2a4 4 0 0 1 6 6l-2 2'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.lock}"/></svg>`;
}
function authView(){
 viewStop();viewStop=()=>{};ownerPage='dashboard';
 if(location.hash==='#preview/invoice'&&(import.meta.env.DEV||import.meta.env.VITE_REVIEW_PREVIEWS==='true')){renderInvoicePreview(root);return;}
 if(location.hash==='#preview/accounts'&&!configured){
  const examples=[{uid:'example-employee',displayName:'طلب موظف توضيحي',email:'employee@example.test',emailVerified:false,requestedRole:'employee'},{uid:'example-customer',displayName:'طلب عميل توضيحي',email:'customer@example.test',emailVerified:false,requestedRole:'customer'}];
  viewStop=renderApprovals(root,{preview:true,watch:next=>{queueMicrotask(()=>next(examples));return ()=>{};},onBack:()=>location.hash='#team',onLogout:()=>location.hash='#team'});return;
 }
 const previewRole=designPreviewRole();if(previewRole){renderDashboard(root,{role:previewRole,preview:true});return;}
 if(['#store','#collection','#printing','#how','#contact'].includes(location.hash)){renderStore(root);return;}
 root.innerHTML=`<main class="entry entry-v2 entry-v4 entry-v5"><section class="story"><div class="story-top"><div class="brand"><img class="shop-logo-small" src="assets/1-shop-logo.webp" alt="شعار أجمل الهدايا"><div>أجمل الهدايا<small>نظام الإدارة المتكامل</small></div></div>${themeButton()}</div><div class="cinema-scene" aria-hidden="true"><div class="bookcase case-left">${Array.from({length:4},(_,row)=>`<div class="shelf">${Array.from({length:11},(_,i)=>`<i style="--book:${i};--row:${row}"></i>`).join('')}</div>`).join('')}</div><div class="bookcase case-back">${Array.from({length:4},(_,row)=>`<div class="shelf">${Array.from({length:9},(_,i)=>`<i style="--book:${i};--row:${row}"></i>`).join('')}</div>`).join('')}</div><div class="wall-sign"><img src="assets/1-shop-logo.webp" alt=""><div>أجمل الهدايا</div><span>مكتبة · طباعة · تصوير · خدمات متكاملة</span><p>أكثر من مكتبة... عالم من الإبداع</p></div><div class="desk"><div class="book-stack"><i></i><i></i><i></i><i></i><i></i></div><div class="desk-cup"><span>AGAML<br>EL HDAYA</span></div><div class="desk-printer"><div class="receipt"></div><i></i></div></div><div class="ceiling-light light-one"></div><div class="ceiling-light light-two"></div></div><div class="cinema-caption">تصور بصري CSS · يمكن استبداله بخلفية مصورة</div><footer>${footerContact()}<span class="footer-line"></span><span>هوية واحدة · فريق واحد · نظام واحد</span><span class="footer-meta">CAIRO / EGP</span></footer></section><section class="entry-form"><div class="form-top"><span class="pill"><span class="dot"></span>نسخة قيد التطوير</span>${!configured?'<a class="store-return" href="#preview/accounts">معاينة موافقات الحسابات ↗</a>':''}<a class="store-return" href="#store">استكشف المكتبة ↗</a></div><div class="login-panel"><div class="panel-heading"><span class="lock-badge crown-badge">♛</span><span class="panel-index">01 / ACCESS</span></div><div class="eyebrow">مرحبًا بك في نظام</div><h2>${mode==='login'?'أجمل الهدايا':'إنشاء حساب جديد.'}</h2><p class="form-intro">${mode==='login'?'إدارة ذكية. لبداية ونجاح أكبر.':'حدد نوع الحساب المطلوب. الوصول بعد مراجعة المالك فقط.'}</p><div class="mode-row" aria-label="نوع الدخول"><button type="button" id="tab-login" class="${mode==='login'?'chosen':''}" aria-pressed="${mode==='login'}">تسجيل الدخول</button><button type="button" id="tab-register" class="${mode!=='login'?'chosen':''}" aria-pressed="${mode!=='login'}">إنشاء حساب</button></div>${!configured?'<div class="notice setup-notice"><span class="notice-icon">'+icon('link')+'</span><div><strong>في انتظار ربط Firebase</strong><p>تسجيل الدخول مقفول لحد اكتمال إعداد المشروع.</p></div></div>':''}<form id="auth-form">${mode==='register'?'<fieldset class="account-type"><legend>نوع الحساب المطلوب</legend><label><input type="radio" name="accountType" value="customer" checked> عميل</label><label><input type="radio" name="accountType" value="employee"> موظف</label><p>اختيارك طلب فقط. كل الحسابات تنتظر موافقة المالك دون صلاحيات.</p></fieldset>':''}<label for="email">البريد الإلكتروني</label><div class="input-wrap"><span class="input-icon">${icon('mail')}</span><input id="email" name="email" type="email" autocomplete="email" dir="ltr" placeholder="name@example.com" required></div><div class="password-label"><label for="password">كلمة المرور</label><button type="button" id="reset" class="text-button" ${!configured?'disabled':''}>نسيت كلمة المرور؟</button></div><div class="input-wrap"><span class="input-icon">${icon('lock')}</span><input id="password" name="password" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="8" required placeholder="أدخل كلمة المرور"><button id="show-password" type="button" class="show-password" aria-label="إظهار كلمة المرور" aria-pressed="false">${icon('eye')}</button></div><button class="primary" type="submit" ${!configured?'disabled':''}>${mode==='login'?'تسجيل الدخول':'إنشاء حساب'} <span aria-hidden="true">←</span></button></form><div class="divider"><span>أو باستخدام حسابك</span></div><button id="google" class="secondary google-button" ${!configured?'disabled':''}><span class="google-mark" aria-hidden="true">G</span> المتابعة باستخدام Google</button><p class="switch-copy">${mode==='login'?'لسه معندكش حساب؟':'عندك حساب بالفعل؟'} <button id="switch" class="text-button">${mode==='login'?'إنشاء حساب':'تسجيل الدخول'}</button></p><p id="status" class="status" role="status" aria-live="polite"></p><div class="panel-foot">${icon('shield')}<span>صلاحيات واضحة. وصول بموافقة المالك فقط.</span></div></div><div class="security-note"><span class="gold-tick">✧</span> AGAML EL HDAYA <span>نظام الإدارة المتكامل</span></div></section></main>`;
 document.querySelector('#theme-toggle').onclick=toggleTheme;
 document.querySelector('#tab-login').onclick=()=>{mode='login';authView();};
 document.querySelector('#tab-register').onclick=()=>{mode='register';authView();};
 document.querySelector('#show-password').onclick=e=>{const input=document.querySelector('#password');const visible=input.type==='password';input.type=visible?'text':'password';e.currentTarget.setAttribute('aria-pressed',String(visible));e.currentTarget.setAttribute('aria-label',visible?'إخفاء كلمة المرور':'إظهار كلمة المرور');};
 document.querySelector('#switch').onclick=()=>{mode=mode==='login'?'register':'login';authView();};
 document.querySelector('#auth-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);run(async()=>{if(mode==='login')await login(data.get('email'),data.get('password'));else await requestAccount(data.get('email'),data.get('password'),data.get('accountType'));});};
 document.querySelector('#google').onclick=()=>run(()=>googleLogin(document.querySelector('input[name=accountType]:checked')?.value||'customer'));
 document.querySelector('#reset').onclick=()=>run(async()=>{const input=document.querySelector('#email');if(!input.reportValidity()||!input.value)return;await resetPassword(input.value);document.querySelector('#status').textContent='لو البريد مسجل، هيوصلك رابط استعادة كلمة المرور.';});
}
async function run(action){if(busy)return;busy=true;root.setAttribute('aria-busy','true');root.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(error){const status=document.querySelector('#status');if(status)status.textContent=friendly(error);}finally{busy=false;root.removeAttribute('aria-busy');if(document.querySelector('#verify-check'))root.querySelectorAll('button').forEach(b=>b.disabled=false);if(document.querySelector('#auth-form'))root.querySelectorAll('button').forEach(b=>b.disabled=!configured&&b.id!=='switch');}}
function sessionView(profile){
 viewStop();viewStop=()=>{};
 if(auth?.currentUser && !auth.currentUser.emailVerified){
  root.innerHTML=`<main class="workspace" dir="rtl"><section class="welcome"><span class="eyebrow">أجمل الهدايا · تأكيد البريد</span><h1>أكد بريدك الإلكتروني</h1><p>افتح رسالة التأكيد في بريدك واضغط الرابط، ثم ارجع واضغط «تحققت من بريدي». راجع الرسائل غير المرغوب فيها أيضًا.</p><div class="notice"><strong>لن يعمل الحساب قبل تأكيد البريد وموافقة المالك.</strong><p>تأكيد البريد لا يمنحك أي صلاحيات تلقائيًا.</p></div><button class="primary" id="verify-check">تحققت من بريدي</button><button class="secondary" id="verify-resend">إعادة إرسال رسالة التأكيد</button><button class="text-button" id="logout">تسجيل الخروج</button><p id="status" role="status"></p></section></main>`;
  document.querySelector('#verify-check').onclick=()=>run(async()=>{if(await recheckVerification())sessionView(null);else document.querySelector('#status').textContent='البريد لم يتأكد بعد. افتح رابط الرسالة أولًا.';});
  document.querySelector('#verify-resend').onclick=()=>run(async()=>{await sendVerification();document.querySelector('#status').textContent='تم إرسال رسالة التأكيد. انتظر قليلًا قبل طلب رسالة أخرى.';});
  document.querySelector('#logout').onclick=()=>run(logout);return;
 }
 const active=profile?.status==='active';
 if(active){
  if(profile.role==='owner'&&ownerPage==='accounts'){
   viewStop=renderApprovals(root,{onBack:()=>{ownerPage='dashboard';sessionView(profile);},onLogout:()=>run(logout),emulator:import.meta.env.DEV&&import.meta.env.VITE_FIREBASE_USE_EMULATORS==='true'});return;
  }
  renderDashboard(root,{role:profile.role,onLogout:()=>run(logout),onAccounts:profile.role==='owner'?()=>{ownerPage='accounts';sessionView(profile);}:null});return;
 }
 root.innerHTML=`<div class="workspace"><aside id="sidebar"><div class="brand"><img class="shop-logo-small" src="assets/1-shop-logo.webp" alt="شعار أجمل الهدايا"><div>أجمل الهدايا<small>نظام الإدارة المتكامل</small></div></div><nav><span class="nav-selected">مساحة العمل</span><p>الوحدات التشغيلية هتظهر هنا بعد تنفيذها واختبارها.</p></nav><div class="sidebar-foot">المرحلة الأولى</div></aside><main class="work-main"><header><button id="menu" class="secondary" aria-controls="sidebar" aria-expanded="true">القائمة</button><span class="muted">${formatDate(new Date())}</span><button id="logout" class="text-button">تسجيل الخروج</button></header><section class="welcome"><span class="eyebrow">مساحة العمل</span><h1></h1><p>${!profile?'جار تحميل حالة الحساب...':active?'تم اعتماد حسابك. الوحدات المالية والمخزنية لم تُنفذ بعد.':profile?.status==='suspended'?'الحساب موقوف. تواصل مع المالك.':profile?.status==='rejected'?'إنشاء حساب غير معتمد. تواصل مع المالك.':'طلبك قيد المراجعة. مفيش صلاحيات تشغيلية قبل موافقة المالك.'}</p><div class="notice"><strong>${active?'الأساس جاهز للتطوير':'مراجعة المالك مطلوبة'}</strong><p>لا توجد أرقام تجريبية أو عمليات مالية متاحة في هذه المرحلة.</p></div><p id="status" role="status"></p></section></main></div>`;
 document.querySelector('h1').textContent=active?(profile.role==='owner'?'أهلًا، بشمهندس يوسف':`أهلًا، ${profile.displayName||'عضو الفريق'}`):'حالة الحساب';
 document.querySelector('#logout').onclick=()=>run(logout);
 document.querySelector('#menu').onclick=e=>{const collapsed=document.querySelector('.workspace').classList.toggle('collapsed');e.target.setAttribute('aria-expanded',String(!collapsed));};
}
window.addEventListener('hashchange',()=>{if(designPreviewRole()||['','#team','#store','#preview/accounts'].includes(location.hash)||document.querySelector('.entry'))authView();});
authView();
watchAuth(async user=>{unwatch();if(!user){authView();return;}sessionView(null);try{unwatch=watchProfile(user.uid,sessionView,()=>{sessionView(null);document.querySelector('#status').textContent='تعذر تحميل حالة الحساب. لا توجد صلاحيات تشغيلية متاحة.';});}catch(error){const status=document.querySelector('#status');if(status)status.textContent=friendly(error);}});
