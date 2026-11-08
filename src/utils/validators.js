
// التحقق من البريد الإلكتروني
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
}

// التحقق من رقم الهاتف المصري
export function isValidEgyptianPhone(phone) {
  return /^01[0125][0-9]{8}$/.test(
    String(phone || "").replace(/\s/g, "")
  );
}

// التحقق من اسم المنتج أو العميل
export function isValidName(name) {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 150
  );
}

// التحقق من السعر بالقروش
export function isValidPrice(price) {
  return (
    Number.isSafeInteger(price) &&
    price >= 0
  );
}

// التحقق من الكمية
export function isValidQuantity(quantity) {
  return (
    Number.isFinite(quantity) &&
    quantity > 0 &&
    quantity <= 1000000
  );
}

// التحقق من الباركود
export function isValidBarcode(barcode) {
  return (
    typeof barcode === "string" &&
    /^[0-9A-Za-z-]{3,64}$/.test(barcode.trim())
  );
}

// التحقق من وجود قيمة
export function isRequired(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

// التحقق من تاريخ صالح
export function isValidDate(date) {
  const value = new Date(date);
  return !Number.isNaN(value.getTime());
}
