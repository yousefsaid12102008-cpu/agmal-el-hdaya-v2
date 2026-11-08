
/* AGAML EL HDAYA ERP - DIAGNOSTIC TEST */

import { auth, db } from "./config/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const loader = document.getElementById("appLoader");
const content = document.getElementById("appContent");
const errorBox = document.getElementById("appError");
const errorMessage = document.getElementById("appErrorMessage");

function showResult(message, isError = false) {
  loader.hidden = true;
  errorBox.hidden = true;
  content.hidden = false;

  content.innerHTML = `
    <div style="
      min-height:100vh;
      background:#060a13;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      direction:rtl;
      font-family:Arial;
      text-align:center;
    ">
      <div style="
        background:#101724;
        border:1px solid #e9bd72;
        border-radius:18px;
        padding:28px;
        width:100%;
        max-width:500px;
      ">
        <h2 style="color:#e9bd72">AGAML EL HDAYA ERP</h2>
        <h3>${isError ? "تعذر تشغيل الاختبار" : "اختبار الاتصال"}</h3>
        <p style="line-height:2">${message}</p>
      </div>
    </div>
  `;
}

function showError(error) {
  console.error(error);
  showResult(error?.message || "خطأ غير معروف", true);
}

try {
  if (!auth || !db) {
    throw new Error("Firebase Auth أو Firestore غير جاهز");
  }

  const timeout = setTimeout(() => {
    showResult(
      "الاتصال لم يكتمل خلال 15 ثانية. نحتاج مراجعة إعدادات Firebase وتحميل الملفات.",
      true
    );
  }, 15000);

  onAuthStateChanged(
    auth,
    user => {
      clearTimeout(timeout);

      showResult(
        user
          ? "Firebase يعمل بنجاح. يوجد حساب مسجل الدخول."
          : "Firebase يعمل بنجاح. لا يوجد حساب مسجل الدخول."
      );
    },
    error => {
      clearTimeout(timeout);
      showError(error);
    }
  );

} catch (error) {
  showError(error);
}
