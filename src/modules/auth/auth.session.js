
/* =========================================
   AGAML EL HDAYA ERP
   AUTH SESSION MANAGER
   VERSION 1.0
========================================= */

import {
  observeAuthState,
  getCurrentUser,
  logout
} from "./auth.service.js";

import {
  watchCurrentUserProfile,
  USER_ACCOUNT_STATUS
} from "./user.service.js";

/* ---------- SESSION STATE ---------- */

let currentSession = {
  authenticated: false,
  initialized: false,
  user: null,
  profile: null,
  status: "guest"
};

let authUnsubscribe = null;
let profileUnsubscribe = null;

const listeners = new Set();

/* ---------- NOTIFY LISTENERS ---------- */

function notifyListeners() {
  const snapshot = getSession();

  listeners.forEach(callback => {
    try {
      callback(snapshot);
    } catch (error) {
      console.error("Session listener error:", error);
    }
  });
}

/* ---------- SESSION SNAPSHOT ---------- */

export function getSession() {
  return {
    ...currentSession,
    user: currentSession.user,
    profile: currentSession.profile
  };
}

/* ---------- UPDATE SESSION ---------- */

function updateSession(updates) {
  currentSession = {
    ...currentSession,
    ...updates
  };

  notifyListeners();
}

/* ---------- STOP PROFILE LISTENER ---------- */

function stopProfileListener() {
  if (profileUnsubscribe) {
    profileUnsubscribe();
    profileUnsubscribe = null;
  }
}

/* ---------- RESET SESSION ---------- */

function resetSession() {
  stopProfileListener();

  updateSession({
    authenticated: false,
    initialized: true,
    user: null,
    profile: null,
    status: "guest"
  });
}

/* ---------- PROFILE STATUS ---------- */

function resolveProfileStatus(profile) {
  if (!profile?.exists) {
    return USER_ACCOUNT_STATUS.PENDING;
  }

  const validStatuses = Object.values(
    USER_ACCOUNT_STATUS
  );

  if (!validStatuses.includes(profile.status)) {
    return USER_ACCOUNT_STATUS.PENDING;
  }

  return profile.status;
}

/* ---------- START PROFILE WATCH ---------- */

function startProfileListener() {
  stopProfileListener();

  try {
    profileUnsubscribe = watchCurrentUserProfile(profile => {
      if (!currentSession.authenticated) {
        return;
      }

      const status = resolveProfileStatus(profile);

      updateSession({
        profile,
        status
      });
    });

  } catch (error) {
    updateSession({
      profile: null,
      status: "profile_unavailable"
    });

    console.error("Profile listener error:", error);
  }
}

/* ---------- INITIALIZE SESSION ---------- */

export function initializeSession() {
  if (authUnsubscribe) {
    return authUnsubscribe;
  }

  authUnsubscribe = observeAuthState(user => {
    if (!user) {
      resetSession();
      return;
    }

    stopProfileListener();

    updateSession({
      authenticated: true,
      initialized: true,
      user,
      profile: null,
      status: "loading"
    });

    startProfileListener();
  });

  return authUnsubscribe;
}

/* ---------- SUBSCRIBE TO SESSION ---------- */

export function subscribeToSession(callback) {
  if (typeof callback !== "function") {
    throw new Error("يجب توفير دالة لمتابعة الجلسة");
  }

  listeners.add(callback);

  callback(getSession());

  return () => {
    listeners.delete(callback);
  };
}

/* ---------- CHECK SESSION ---------- */

export function isAuthenticated() {
  return Boolean(
    currentSession.initialized &&
    currentSession.authenticated &&
    currentSession.user
  );
}

/* ---------- CHECK ACTIVE SESSION ---------- */

export function isActiveSession() {
  return Boolean(
    isAuthenticated() &&
    currentSession.status === USER_ACCOUNT_STATUS.ACTIVE
  );
}

/* ---------- SESSION LOGOUT ---------- */

export async function endSession() {
  try {
    await logout();
    resetSession();

    return {
      success: true,
      message: "تم إنهاء الجلسة بنجاح"
    };

  } catch (error) {
    throw new Error(
      error.message || "تعذر تسجيل الخروج"
    );
  }
}

/* ---------- DESTROY SESSION MANAGER ---------- */

export function destroySessionManager() {
  stopProfileListener();

  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }

  listeners.clear();

  currentSession = {
    authenticated: false,
    initialized: false,
    user: null,
    profile: null,
    status: "guest"
  };
}
