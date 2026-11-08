
const ERROR_MESSAGES = {
  "auth/user-not-found": "الحساب غير موجود",
  "auth/wrong-password": "كلمة المرور غير صحيحة",
  "auth/invalid-credential": "بيانات تسجيل الدخول غير صحيحة",
  "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
  "auth/weak-password": "كلمة المرور ضعيفة",
  "auth/invalid-email": "البريد الإلكتروني غير صالح",
  "permission-denied": "ليس لديك صلاحية لتنفيذ هذه العملية",
  "unavailable": "الخادم غير متاح حاليًا",
  "network-request-failed": "تحقق من اتصال الإنترنت",
  "not-found": "البيانات المطلوبة غير موجودة"
};

export function getErrorMessage(error) {
  const code = error?.code || "";

  if (ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (code.startsWith("auth/")) {
    return "حدثت مشكلة في تسجيل الدخول، راجع البيانات وحاول مرة أخرى";
  }

  return "حدث خطأ غير متوقع، حاول مرة أخرى";
}

export function handleError(error, context = "") {
  console.error(`[SYSTEM ERROR] ${context}`, error);

  return {
    success: false,
    message: getErrorMessage(error),
    code: error?.code || "unknown"
  };
}

export function createSuccessResponse(data = null, message = "تمت العملية بنجاح") {
  return {
    success: true,
    message,
    data
  };
}
