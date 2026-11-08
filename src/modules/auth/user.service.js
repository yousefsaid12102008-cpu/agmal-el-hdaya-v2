
/* =========================================
   AGAML EL HDAYA ERP
   USER PROFILE SERVICE
========================================= */

import {
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import { db } from "../../config/firebase.js";
import { getCurrentUser } from "./auth.service.js";

/* ---------- USER COLLECTION ---------- */

const USERS_COLLECTION = "users";

/* ---------- USER DOCUMENT ---------- */

function getUserDocumentReference(uid) {
  if (!uid) {
    throw new Error("معرّف المستخدم غير موجود");
  }

  return doc(db, USERS_COLLECTION, uid);
}

/* ---------- ACCOUNT STATUS ---------- */

export const USER_ACCOUNT_STATUS = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
  DISABLED: "disabled"
});

/* ---------- GET CURRENT PROFILE ---------- */

export async function getCurrentUserProfile() {
  try {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      throw new Error("يجب تسجيل الدخول أولًا");
    }

    const userRef = getUserDocumentReference(
      currentUser.uid
    );

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return {
        exists: false,
        uid: currentUser.uid,
        status: USER_ACCOUNT_STATUS.PENDING,
        message: "ملف الحساب لم يُنشأ أو لم يُعتمد بعد"
      };
    }

    return {
      exists: true,
      uid: currentUser.uid,
      ...snapshot.data()
    };

  } catch (error) {
    throw new Error(
      error.message || "تعذر تحميل بيانات المستخدم"
    );
  }
}

/* ---------- WATCH USER PROFILE ---------- */

export function watchCurrentUserProfile(callback) {
  if (typeof callback !== "function") {
    throw new Error("يجب توفير دالة لمتابعة بيانات المستخدم");
  }

  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error("يجب تسجيل الدخول أولًا");
  }

  const userRef = getUserDocumentReference(
    currentUser.uid
  );

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          exists: false,
          uid: currentUser.uid,
          status: USER_ACCOUNT_STATUS.PENDING
        });

        return;
      }

      callback({
        exists: true,
        uid: currentUser.uid,
        ...snapshot.data()
      });
    },
    (error) => {
      callback({
        exists: false,
        error: error.message
      });
    }
  );
}

/* ---------- CHECK ACCOUNT STATUS ---------- */

export async function checkAccountStatus() {
  const profile = await getCurrentUserProfile();

  if (!profile.exists) {
    return {
      allowed: false,
      status: USER_ACCOUNT_STATUS.PENDING,
      message: "حسابك في انتظار مراجعة الإدارة"
    };
  }

  switch (profile.status) {
    case USER_ACCOUNT_STATUS.ACTIVE:
      return {
        allowed: true,
        status: USER_ACCOUNT_STATUS.ACTIVE,
        profile
      };

    case USER_ACCOUNT_STATUS.REJECTED:
      return {
        allowed: false,
        status: USER_ACCOUNT_STATUS.REJECTED,
        message: "لم تتم الموافقة على طلب إنشاء الحساب"
      };

    case USER_ACCOUNT_STATUS.DISABLED:
      return {
        allowed: false,
        status: USER_ACCOUNT_STATUS.DISABLED,
        message: "تم إيقاف الحساب، يرجى مراجعة الإدارة"
      };

    default:
      return {
        allowed: false,
        status: USER_ACCOUNT_STATUS.PENDING,
        message: "حسابك في انتظار موافقة الإدارة"
      };
  }
}
