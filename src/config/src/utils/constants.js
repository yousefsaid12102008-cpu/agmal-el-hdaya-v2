
export const PAYMENT_METHODS = {
  CASH: "cash",
  WALLET: "wallet",
  ACCOUNT: "account",
  CREDIT: "credit",
  MIXED: "mixed"
};

export const INVOICE_STATUS = {
  PAID: "paid",
  PARTIAL: "partial",
  UNPAID: "unpaid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
};

export const ORDER_STATUS = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};

export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DISABLED: "disabled"
};

export const STOCK_MOVEMENT_TYPES = {
  PURCHASE: "purchase",
  SALE: "sale",
  RETURN: "return",
  ADJUSTMENT: "adjustment",
  WASTE: "waste",
  TRANSFER: "transfer"
};

export const PRODUCT_UNITS = [
  "piece",
  "box",
  "dozen",
  "carton",
  "ream",
  "sheet"
];

export const LABEL_SETTINGS = {
  PAPER: "A4",
  DEFAULT_COLUMNS: 3,
  DEFAULT_ROWS: 8,
  SHOW_PRODUCT_NAME: true,
  SHOW_PRICE: true,
  SHOW_BARCODE: true,
  SHOW_QR: false
};

export const DATE_SETTINGS = {
  TIMEZONE: "Africa/Cairo",
  LOCALE: "ar-EG"
};
