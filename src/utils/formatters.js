
const CURRENCY = "EGP";
const LOCALE = "ar-EG";
const TIMEZONE = "Africa/Cairo";

// تنسيق المبالغ بالجنيه المصري
export function formatMoney(amountInPiastres = 0) {
  const amount = Number(amountInPiastres) / 100;

  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2
  }).format(amount);
}

// تنسيق التاريخ
export function formatDate(date) {
  if (!date) return "—";

  const value = date?.toDate
    ? date.toDate()
    : new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

// تنسيق الوقت
export function formatTime(date) {
  if (!date) return "—";

  const value = date?.toDate
    ? date.toDate()
    : new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(value);
}

// تنسيق التاريخ والوقت معًا
export function formatDateTime(date) {
  if (!date) return "—";

  return `${formatDate(date)} - ${formatTime(date)}`;
}

// تحويل الجنيه إلى قروش صحيحة
export function toPiastres(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    throw new Error("قيمة مالية غير صحيحة");
  }

  return Math.round((value + Number.EPSILON) * 100);
}

// التحقق من صحة المبلغ
export function isValidMoney(amount) {
  return Number.isSafeInteger(amount) && amount >= 0;
}
