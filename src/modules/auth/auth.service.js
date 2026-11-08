
/* =========================================
   AGAML EL HDAYA ERP
   AUTHENTICATION SERVICE
========================================= */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { auth } from "../../config/firebase.js";

/* ---------- GOOGLE PROVIDER ---------- */

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

/* ---------- VALIDATION ---------- */

function validateCredentials(email, password) {
  if (!email || !password) {
    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("البريد الإلكتروني غير صحيح");
  }

  if (password.length < 6) {
    throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف");
  }

  return normalizedEmail;
}

/* ---------- ERROR MESSAGES ---------- */

function getAuthErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use":
      "هذا البريد الإلكتروني مسجل بالفعل",

    "auth/invalid-email":
      "البريد الإلكتروني غير صحيح",

    "auth/weak-password":
      "كلمة المرور ضعيفة",

    "auth/invalid-credential":
      "بيانات الدخول غير صحيحة",

    "auth/user-disabled":
      "هذا الحساب موقوف",

    "auth/too-many-requests":
      "محاولات كثيرة، حاول مرة أخرى لاحقًا",

    "auth/network-request-failed":
      "تعذر الاتصال بالإنترنت",

    "auth/popup-closed-by-user":
      "تم إغلاق نافذة تسجيل الدخول"
  };

  return messages[error.code] || "حدث خطأ أثناء تنفيذ العملية";
}

/* ---------- CREATE ACCOUNT ---------- */

export async function registerWithEmail({
  email,
  password,
  fullName
}) {
  try {
    const normalizedEmail = validateCredentials(
      email,
      password
    );

    if (!fullName || fullName.trim().length < 3) {
      throw new Error("يرجى إدخال الاسم بالكامل");
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    await updateProfile(credential.user, {
      displayName: fullName.trim()
    });

    /*
      Important:
      Account creation does not grant any role or permissions.
      Owner approval and user profile creation will be handled
      securely by Cloud Functions in a later module.
    */

    return {
      success: true,
      user: credential.user,
      message: "تم إنشاء الحساب، ويحتاج إلى مراجعة واعتماد الإدارة"
    };

  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/* ---------- EMAIL LOGIN ---------- */

export async function loginWithEmail({
  email,
  password
}) {
  try {
    const normalizedEmail = validateCredentials(
      email,
      password
    );

    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    return {
      success: true,
      user: credential.user
    };

  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/* ---------- GOOGLE LOGIN ---------- */

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    return {
      success: true,
      user: result.user,
      isNewUser: result._tokenResponse?.isNewUser === true
    };

  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/* ---------- LOGOUT ---------- */

export async function logout() {
  try {
    await signOut(auth);

    return {
      success: true,
      message: "تم تسجيل الخروج بنجاح"
    };

  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/* ---------- PASSWORD RESET ---------- */

export async function resetPassword(email) {
  try {
    if (!email || !email.trim()) {
      throw new Error("يرجى إدخال البريد الإلكتروني");
    }

    const normalizedEmail = email.trim().toLowerCase();

    await sendPasswordResetEmail(
      auth,
      normalizedEmail
    );

    return {
      success: true,
      message: "إذا كان البريد مسجلًا، ستصلك رسالة استعادة كلمة المرور"
    };

  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/* ---------- AUTH STATE ---------- */

export function observeAuthState(callback) {
  if (typeof callback !== "function") {
    throw new Error("يجب توفير دالة لمتابعة حالة الحساب");
  }

  return onAuthStateChanged(auth, callback);
}

/* ---------- CURRENT USER ---------- */

export function getCurrentUser() {
  return auth.currentUser;
}
