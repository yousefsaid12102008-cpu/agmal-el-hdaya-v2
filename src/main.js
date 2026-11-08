
/* =========================================
   AGAML EL HDAYA ERP
   MAIN APPLICATION ENTRY POINT
   VERSION 1.0
========================================= */

import { app, auth, db } from "./config/firebase.js";

import { observeAuthState } from "./modules/auth/auth.service.js";

import {
  watchCurrentUserProfile,
  USER_ACCOUNT_STATUS
} from "./modules/auth/user.service.js";

/* ---------- DOM ELEMENTS ---------- */

const appLoader = document.getElementById("appLoader");
const appContent = document.getElementById("appContent");
const appError = document.getElementById("appError");
const appErrorMessage = document.getElementById("appErrorMessage");

/* ---------- APPLICATION STATE ---------- */

const state = {
  initialized: false,
  user: null,
  profile: null,
  authUnsubscribe: null,
  profileUnsubscribe: null
};

/* ---------- UI HELPERS ---------- */

function showLoader(message = "جاري تشغيل النظام...") {
  appLoader.hidden = false;

  const messageElement = appLoader.querySelector(
    ".app-loader-message"
  );

  if (messageElement) {
    messageElement.textContent = message;
  }

  appContent.hidden = true;
  appError.hidden = true;
}

function showError(error) {
  console.error("AGAML ERP ERROR:", error);

  appLoader.hidden = true;
  appContent.hidden = true;
  appError.hidden = false;

  appErrorMessage.textContent =
    error?.message || "حدث خطأ أثناء تشغيل النظام.";
}

/* ---------- RENDER APPLICATION ---------- */

function renderWelcome() {
  appContent.innerHTML = `
    <section style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      box-sizing:border-box;
    ">

      <div style="
        width:100%;
        max-width:650px;
        padding:35px;
        text-align:center;
        background:#101724;
        border:1px solid #e9bd7240;
        border-radius:22px;
        box-sizing:border-box;
      ">

        <div style="
          color:#e9bd72;
          font-size:28px;
          font-weight:900;
        ">
          AGAML EL HDAYA
        </div>

        <h1 style="
          color:#ffffff;
          font-size:25px;
          margin:20px 0 10px;
        ">
          نظام إدارة المكتبة
        </h1>

        <p style="
          color:#aab2c0;
          line-height:1.9;
        ">
          تم تشغيل التطبيق بنجاح.
          <br>
          جاري تجهيز وحدات النظام.
        </p>

        <div style="
          margin-top:25px;
          padding:15px;
          background:#182333;
          border-radius:12px;
          color:#62d69a;
        ">
          ● التطبيق يعمل
        </div>

        <div style="
          margin-top:12px;
          color:#aab2c0;
          font-size:13px;
        ">
          ${state.user ? "تم تسجيل الدخول" : "لم يتم تسجيل الدخول بعد"}
        </div>

      </div>

    </section>
  `;

  appLoader.hidden = true;
  appError.hidden = true;
  appContent.hidden = false;
}

/* ---------- AUTH STATE ---------- */

function handleAuthChange(user) {
  state.user = user || null;

  if (state.profileUnsubscribe) {
    state.profileUnsubscribe();
    state.profileUnsubscribe = null;
  }

  if (!user) {
    state.profile = null;
    renderWelcome();
    return;
  }

  showLoader("جاري تحميل بيانات الحساب...");

  try {
    state.profileUnsubscribe = watchCurrentUserProfile(
      profile => {
        state.profile = profile;

        if (!profile || profile.exists === false) {
          renderWelcome();
          return;
        }

        if (profile.status === USER_ACCOUNT_STATUS.PENDING) {
          renderWelcome();
          return;
        }

        if (
          profile.status === USER_ACCOUNT_STATUS.REJECTED ||
          profile.status === USER_ACCOUNT_STATUS.DISABLED
        ) {
          renderWelcome();
          return;
        }

        renderWelcome();
      }
    );
  } catch (error) {
    showError(error);
  }
}

/* ---------- INITIALIZE APPLICATION ---------- */

function initializeApplication() {
  if (state.initialized) return;

  state.initialized = true;

  try {
    if (!app || !auth || !db) {
      throw new Error("Firebase لم يتم تهيئته بشكل صحيح.");
    }

    showLoader("جاري الاتصال بخدمات النظام...");

    state.authUnsubscribe = observeAuthState(
      handleAuthChange,
      error => showError(error)
    );

  } catch (error) {
    showError(error);
  }
}

/* ---------- START ---------- */

initializeApplication();

/* ---------- CLEANUP ---------- */

window.addEventListener("beforeunload", () => {
  state.authUnsubscribe?.();
  state.profileUnsubscribe?.();
});
