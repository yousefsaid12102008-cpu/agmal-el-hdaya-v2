export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  CASHIER: "cashier",
  EMPLOYEE: "employee"
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",

  VIEW_SALES: "view_sales",
  CREATE_SALES: "create_sales",
  CANCEL_SALES: "cancel_sales",

  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",
  MANAGE_PRICES: "manage_prices",

  MANAGE_CUSTOMERS: "manage_customers",
  MANAGE_SUPPLIERS: "manage_suppliers",

  MANAGE_TREASURY: "manage_treasury",
  VIEW_REPORTS: "view_reports",

  MANAGE_EMPLOYEES: "manage_employees",
  APPROVE_TRANSACTIONS: "approve_transactions",

  EXPORT_DATA: "export_data",
  MANAGE_BACKUP: "manage_backup"
};

export const OWNER_PERMISSIONS = Object.values(PERMISSIONS);

export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.OWNER]: OWNER_PERMISSIONS,

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD
  ]
};
