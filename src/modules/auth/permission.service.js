
/* =========================================
   AGAML EL HDAYA ERP
   PERMISSION SERVICE
   VERSION 2.0
========================================= */

import { getCurrentUserProfile } from "./user.service.js";

import {
  ROLES,
  PERMISSIONS
} from "../../config/permissions.js";

/* ---------- CONSTANTS ---------- */

const VALID_PERMISSIONS = Object.freeze(
  Object.values(PERMISSIONS)
);

const VALID_ROLES = Object.freeze(
  Object.values(ROLES).map(role => String(role).toUpperCase())
);

/* ---------- ROLE NORMALIZATION ---------- */

function normalizeRole(role) {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toUpperCase();

  return VALID_ROLES.includes(normalized)
    ? normalized
    : null;
}

/* ---------- PROFILE VALIDATION ---------- */

function isActiveProfile(profile) {
  return Boolean(
    profile &&
    profile.exists === true &&
    profile.status === "active"
  );
}

/* ---------- PERMISSION EXTRACTION ---------- */

function extractPermissionsFromProfile(profile) {
  if (!isActiveProfile(profile)) {
    return [];
  }

  const role = normalizeRole(profile.role);

  /*
    Owner role is recognized here for UI presentation only.
    Real owner privileges must be verified by the backend.
  */

  if (role === normalizeRole(ROLES.OWNER)) {
    return [...VALID_PERMISSIONS];
  }

  if (!Array.isArray(profile.permissions)) {
    return [];
  }

  return [
    ...new Set(
      profile.permissions.filter(permission =>
        typeof permission === "string" &&
        VALID_PERMISSIONS.includes(permission)
      )
    )
  ];
}

/* ---------- GET USER ROLE ---------- */

export async function getUserRole() {
  const profile = await getCurrentUserProfile();

  if (!isActiveProfile(profile)) {
    return null;
  }

  return normalizeRole(profile.role);
}

/* ---------- GET USER PERMISSIONS ---------- */

export async function getUserPermissions() {
  const profile = await getCurrentUserProfile();

  return extractPermissionsFromProfile(profile);
}

/* ---------- CHECK ONE PERMISSION ---------- */

export async function hasPermission(permission) {
  if (
    typeof permission !== "string" ||
    !VALID_PERMISSIONS.includes(permission)
  ) {
    return false;
  }

  const permissions = await getUserPermissions();

  return permissions.includes(permission);
}

/* ---------- CHECK ALL PERMISSIONS ---------- */

export async function hasAllPermissions(required = []) {
  if (
    !Array.isArray(required) ||
    required.length === 0 ||
    !required.every(permission =>
      VALID_PERMISSIONS.includes(permission)
    )
  ) {
    return false;
  }

  const permissions = await getUserPermissions();

  return required.every(permission =>
    permissions.includes(permission)
  );
}

/* ---------- CHECK ANY PERMISSION ---------- */

export async function hasAnyPermission(required = []) {
  if (
    !Array.isArray(required) ||
    required.length === 0
  ) {
    return false;
  }

  const validRequired = required.filter(permission =>
    VALID_PERMISSIONS.includes(permission)
  );

  if (validRequired.length === 0) {
    return false;
  }

  const permissions = await getUserPermissions();

  return validRequired.some(permission =>
    permissions.includes(permission)
  );
}

/* ---------- CHECK USER ROLE ---------- */

export async function hasRole(...allowedRoles) {
  const role = await getUserRole();

  if (!role) {
    return false;
  }

  const normalizedRoles = allowedRoles
    .flat()
    .map(normalizeRole)
    .filter(Boolean);

  return normalizedRoles.includes(role);
}

/* ---------- GET ACCESS SUMMARY ---------- */

export async function getAccessSummary() {
  const profile = await getCurrentUserProfile();

  if (!profile?.exists) {
    return {
      authenticated: Boolean(profile?.uid),
      active: false,
      status: "pending",
      role: null,
      permissions: []
    };
  }

  const role = normalizeRole(profile.role);

  if (!isActiveProfile(profile)) {
    return {
      authenticated: true,
      active: false,
      status: profile.status || "pending",
      role,
      permissions: []
    };
  }

  return {
    authenticated: true,
    active: true,
    status: "active",
    role,
    permissions: extractPermissionsFromProfile(profile)
  };
}

/* ---------- REQUIRE PERMISSION ---------- */

export async function requirePermission(permission) {
  const allowed = await hasPermission(permission);

  if (!allowed) {
    throw new Error("ليس لديك صلاحية لتنفيذ هذه العملية");
  }

  return true;
}

/* ---------- REQUIRE ROLE ---------- */

export async function requireRole(...allowedRoles) {
  const allowed = await hasRole(...allowedRoles);

  if (!allowed) {
    throw new Error("هذا القسم غير متاح لحسابك");
  }

  return true;
}
