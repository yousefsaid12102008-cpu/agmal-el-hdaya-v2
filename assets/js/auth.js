
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVT6Tlbaf0q0xFTtyE89OyS-MiWYqV-bA",
  authDomain: "agmal-el-hdaya-v2.firebaseapp.com",
  projectId: "agmal-el-hdaya-v2",
  storageBucket: "agmal-el-hdaya-v2.firebasestorage.app",
  messagingSenderId: "516493668644",
  appId: "1:516493668644:web:083aac219f6501ec4443b1",
  measurementId: "G-VY98G18Z9W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const showSignup = document.getElementById("showSignup");
const signupFields = document.getElementById("signupFields");
const signupButton = document.getElementById("signupButton");
const message = document.getElementById("message");

function showMessage(text) {
  message.textContent = text;
}

function friendlyError(error) {
  const errors = {
    "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
    "auth/user-not-found": "الحساب غير موجود.",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل.",
    "auth/weak-password": "كلمة المرور ضعيفة؛ استخدم 6 أحرف على الأقل.",
    "auth/too-many-requests": "محاولات كثيرة. حاول لاحقًا.",
    "auth/network-request-failed": "تحقق من اتصال الإنترنت.",
    "permission-denied": "تعذر الوصول إلى البيانات. راجع قواعد Firestore."
  };

  return errors[error.code] ||
    "حصل خطأ. راجع إعدادات Firebase وحاول مرة أخرى.";
}

// إظهار نموذج إنشاء الحساب
showSignup.addEventListener("click", () => {
  signupFields.hidden = !signupFields.hidden;
  showSignup.textContent = signupFields.hidden
    ? "إنشاء حساب جديد"
    : "إخفاء إنشاء الحساب";
  showMessage("");
});

// إنشاء حساب جديد: يظل معلقًا لحين موافقة المالك
signupButton.addEventListener("click", async () => {
  const name = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    showMessage("اكتب الاسم والبريد الإلكتروني وكلمة المرور أولًا.");
    return;
  }

  signupButton.disabled = true;
  showMessage("جارٍ إنشاء الحساب...");

  let credential;

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", credential.user.uid), {
      displayName: name,
      email: email,
      role: "pending",
      active: false,
      status: "pending",
      createdAt: serverTimestamp()
    });

    await signOut(auth);

    showMessage("تم إنشاء الحساب بنجاح. انتظر موافقة إدارة المكتبة قبل الدخول.");
    signupFields.hidden = true;
    showSignup.textContent = "إنشاء حساب جديد";
    loginForm.reset();
    document.getElementById("displayName").value = "";

  } catch (error) {
    if (credential?.user) {
      try {
        await signOut(auth);
      } catch (_) {}
    }

    showMessage(friendlyError(error));
  } finally {
    signupButton.disabled = false;
  }
});

// تسجيل الدخول والتحقق من الموافقة والدور
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const submitButton = loginForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;
  showMessage("جارٍ التحقق من بياناتك...");

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userDoc = await getDoc(
      doc(db, "users", credential.user.uid)
    );

    if (!userDoc.exists()) {
      await signOut(auth);
      showMessage("الحساب غير مسجل في نظام المكتبة. تواصل مع الإدارة.");
      return;
    }

    const profile = userDoc.data();

    if (profile.active !== true || profile.status !== "approved") {
      await signOut(auth);
      showMessage(
        profile.status === "rejected"
          ? "تم رفض الحساب. تواصل مع إدارة المكتبة."
          : "حسابك قيد المراجعة. انتظر موافقة الإدارة."
      );
      return;
    }

    if (!["owner", "employee", "cashier", "customer"].includes(profile.role)) {
      await signOut(auth);
      showMessage("لا يوجد دور صالح لهذا الحساب. تواصل مع الإدارة.");
      return;
    }

    // مؤقتًا: نوجّه المالك للوحة الإدارة بعد إنشاء ملفها.
    if (profile.role === "owner") {
      window.location.href = "./dashboard.html";
    } else {
      showMessage("تم التحقق من الحساب، لكن واجهة هذا الدور لم تُنشأ بعد.");
      await signOut(auth);
    }

  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    submitButton.disabled = false;
  }
});

// لو فيه جلسة سابقة، لا تسمح بالدخول اعتمادًا على الجلسة وحدها
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const profileDoc = await getDoc(doc(db, "users", user.uid));

    if (!profileDoc.exists()) {
      await signOut(auth);
      return;
    }

    const profile = profileDoc.data();

    if (
      profile.active !== true ||
      profile.status !== "approved" ||
      !["owner", "employee", "cashier", "customer"].includes(profile.role)
    ) {
      await signOut(auth);
    }
  } catch (error) {
    console.error("تعذر التحقق من الحساب:", error);
  }
});
