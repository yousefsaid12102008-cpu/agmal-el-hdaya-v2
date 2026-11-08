
/* =========================================
   AGAML EL HDAYA ERP
   AUTHENTICATION GUARD
   VERSION 2.0
========================================= */

import { getCurrentUser } from "./auth.service.js";

import {
  getCurrentUserProfile,
  USER_ACCOUNT_STATUS
} from "./user.service.js";

import {
  hasPermission,
  hasAllPermissions,
  hasRole
} from "./permission.service.js";

/* ---------- ROUTE ACCESS RESULT ---------- */

function createGuardResult({
  allowed = false,
  reason = "unauthorized",
  redirectTo = "/login",
  user = null,
  profile = null
} = {}) {
  return {
    allowed,
    reason,
    redirectTo,
    user,
    profile
  };
}

/* ---------- STATUS REDIRECT MAP ---------- */

function resolveStatusRedirect(status) {
  switch (status) {
    case USER_ACCOUNT_STATUS.ACTIVE:
      return {
        allowed: true,
        reason: "active",
        redirectTo: "/dashboard"
      };

    case USER_ACCOUNT_STATUS.PENDING:
      return {
        allowed: false,
        reason: "pending",
        redirectTo: "/pending-approval"
      };

    case USER_ACCOUNT_STATUS.REJECTED:
      return {
        allowed: false,
        reason: "rejected",
        redirectTo: "/account-rejected"
      };

    case USER_ACCOUNT_STATUS.DISABLED:
      return {
        allowed: false,
        reason: "disabled",
        redirectTo: "/account-disabled"
      };

    default:
      return {
        allowed: false,
        reason: "invalid_account_status",
        redirectTo: "/pending-approval"
      };
  }
}

/* ---------- AUTHENTICATION CHECK ---------- */

export async function requireAuthentication() {
  try {
    const user = getCurrentUser();

    if (!user) {
      return createGuardResult({
        reason: "not_authenticated",
        redirectTo: "/login"
      });
    }

    return createGuardResult({
      allowed: true,
      reason: "authenticated",
      redirectTo: null,
      user
    });

  } catch {
    return createGuardResult({
      reason: "auth_check_failed",
      redirectTo: "/login"
    });
  }
}

/* ---------- ACTIVE ACCOUNT CHECK ---------- */

export async function requireActiveAccount() {
  const authentication = await requireAuthentication();

  if (!authentication.allowed) {
    return authentication;
  }

  let profile;

  try {
    profile = await getCurrentUserProfile();
  } catch {
    return createGuardResult({
      reason: "profile_unavailable",
      redirectTo: "/login",
      user: authentication.user
    });
  }

  if (!profile?.exists) {
    return createGuardResult({
      reason: "pending",
      redirectTo: "/pending-approval",
      user: authentication.user
    });
  }

  const statusCheck = resolveStatusRedirect(profile.status);

  if (!statusCheck.allowed) {
    return createGuardResult({
      reason: statusCheck.reason,
      redirectTo: statusCheck.redirectTo,
      user: authentication.user,
      profile
    });
  }

  return createGuardResult({
    allowed: true,
    reason: "active_account",
    redirectTo: null,
    user: authentication.user,
    profile
  });
}

/* ---------- PERMISSION GUARD ---------- */

export async function requirePermissionAccess(permissionOrList) {
  const account = await requireActiveAccount();

  if (!account.allowed) {
    return account;
  }

  try {
    const allowed = Array.isArray(permissionOrList)
      ? await hasAllPermissions(permissionOrList)
      : await hasPermission(permissionOrList);

    if (!allowed) {
      return createGuardResult({
        reason: "permission_denied",
        redirectTo: "/unauthorized",
        user: account.user,
        profile: account.profile
      });
    }

    return createGuardResult({
      allowed: true,
      reason: "permission_granted",
      redirectTo: null,
      user: account.user,
      profile: account.profile
    });

  } catch {
    return createGuardResult({
      reason: "permission_check_failed",
      redirectTo: "/unauthorized",
      user: account.user,
      profile: account.profile
    });
  }
}

/* ---------- ROLE GUARD ---------- */

export async function requireRoleAccess(...roles) {
  const account = await requireActiveAccount();

  if (!account.allowed) {
    return account;
  }

  try {
    const allowed = await hasRole(...roles);

    if (!allowed) {
      return createGuardResult({
        reason: "role_denied",
        redirectTo: "/unauthorized",
        user: account.user,
        profile: account.profile
      });
    }

    return createGuardResult({
      allowed: true,
      reason: "role_granted",
      redirectTo: null,
      user: account.user,
      profile: account.profile
    });

  } catch {
    return createGuardResult({
      reason: "role_check_failed",
      redirectTo: "/unauthorized",
      user: account.user,
      profile: account.profile
    });
  }
}

/* ---------- GUEST GUARD ---------- */

export async function requireGuest() {
  const user = getCurrentUser();

  if (!user) {
    return createGuardResult({
      allowed: true,
      reason: "guest",
      redirectTo: null
    });
  }

  try {
    const profile = await getCurrentUserProfile();

    if (!profile?.exists) {
      return createGuardResult({
        reason: "pending",
        redirectTo: "/pending-approval",
        user
      });
    }

    const statusCheck = resolveStatusRedirect(profile.status);

    return createGuardResult({
      reason: "already_authenticated",
      redirectTo: statusCheck.redirectTo,
      user,
      profile
    });

  } catch {
    return createGuardResult({
      reason: "profile_unavailable",
      redirectTo: "/login",
      user
    });
  }
}
