
/* =========================================
   AGAML EL HDAYA ERP
   USERS MANAGEMENT SERVICE
   VERSION 1.0
========================================= */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import { db } from "../../config/firebase.js";

import { getCurrentUser } from "../auth/auth.service.js";

import {
  USER_ACCOUNT_STATUS
} from "../auth/user.service.js";

import {
  ROLES
} from "../../config/permissions.js";

/* ---------- COLLECTION ---------- */

const USERS_COLLECTION = "users";

const MAX_USERS_PER_PAGE = 50;

/* ---------- CURRENT USER ---------- */

function requireCurrentUser() {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("يجب تسجيل الدخول أولًا");
  }

  return user;
}

/* ---------- DOCUMENT REFERENCE ---------- */

function userDocument(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("معرّف المستخدم غير صحيح");
  }

  return doc(db, USERS_COLLECTION, uid);
}

/* ---------- SAFE USER DATA ---------- */

function formatUser(snapshot) {
  const data = snapshot.data();

  return {
    uid: snapshot.id,
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    role: data.role || null,
    status: data.status || USER_ACCOUNT_STATUS.PENDING,
    permissions: Array.isArray(data.permissions)
      ? data.permissions
      : [],
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    lastLoginAt: data.lastLoginAt || null
  };
}

/* ---------- GET USER BY ID ---------- */

export async function getUserById(uid) {
  requireCurrentUser();

  const snapshot = await getDoc(userDocument(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return formatUser(snapshot);
}

/* ---------- GET USERS ---------- */

export async function getUsers({
  status = null,
  role = null,
  pageSize = 50
} = {}) {
  requireCurrentUser();

  const safePageSize = Math.min(
    Math.max(Number(pageSize) || 50, 1),
    MAX_USERS_PER_PAGE
  );

  const constraints = [];

  if (status) {
    constraints.push(where("status", "==", status));
  }

  if (role) {
    constraints.push(where("role", "==", role));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(safePageSize));

  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    ...constraints
  );

  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map(formatUser);
}

/* ---------- GET PENDING USERS ---------- */

export async function getPendingUsers() {
  return getUsers({
    status: USER_ACCOUNT_STATUS.PENDING
  });
}

/* ---------- GET ACTIVE EMPLOYEES ---------- */

export async function getActiveEmployees() {
  return getUsers({
    status: USER_ACCOUNT_STATUS.ACTIVE
  });
}

/* ---------- WATCH USERS ---------- */

export function watchUsers(callback, {
  status = null,
  role = null,
  pageSize = 50
} = {}) {
  requireCurrentUser();

  if (typeof callback !== "function") {
    throw new Error("دالة متابعة المستخدمين غير صحيحة");
  }

  const safePageSize = Math.min(
    Math.max(Number(pageSize) || 50, 1),
    MAX_USERS_PER_PAGE
  );

  const constraints = [];

  if (status) {
    constraints.push(where("status", "==", status));
  }

  if (role) {
    constraints.push(where("role", "==", role));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(safePageSize));

  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    ...constraints
  );

  return onSnapshot(
    usersQuery,
    snapshot => {
      callback(
        snapshot.docs.map(formatUser)
      );
    },
    error => {
      console.error("Users listener error:", error);
    }
  );
}

/* ---------- USER STATISTICS ---------- */

export async function getUserStatistics() {
  const users = await getUsers({
    pageSize: MAX_USERS_PER_PAGE
  });

  return {
    total: users.length,

    pending: users.filter(
      user => user.status === USER_ACCOUNT_STATUS.PENDING
    ).length,

    active: users.filter(
      user => user.status === USER_ACCOUNT_STATUS.ACTIVE
    ).length,

    rejected: users.filter(
      user => user.status === USER_ACCOUNT_STATUS.REJECTED
    ).length,

    disabled: users.filter(
      user => user.status === USER_ACCOUNT_STATUS.DISABLED
    ).length
  };
}

/* ---------- VALIDATE USER ROLE ---------- */

export function isValidUserRole(role) {
  return Object.values(ROLES).includes(role);
}
