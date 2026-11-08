
<script type="module">
  const firebaseStatus = document.getElementById("firebaseStatus");
  const authStatus = document.getElementById("authStatus");
  const firestoreStatus = document.getElementById("firestoreStatus");

  function show(id, message, success) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.className = success ? "status-success" : "status-error";
  }

  try {
    show("firebaseStatus", "● Firebase: جاري التحميل...", true);

    const firebase = await import("./src/config/firebase.js");

    if (!firebase.app || !firebase.auth || !firebase.db) {
      throw new Error("Firebase exports are missing");
    }

    show("firebaseStatus", "● Firebase: تم التهيئة بنجاح", true);
    show("authStatus", "● Authentication: تم تحميل الخدمة", true);
    show("firestoreStatus", "● Firestore: تم تحميل الخدمة", true);

  } catch (error) {
    console.error("Firebase test error:", error);

    show(
      "firebaseStatus",
      "● Firebase: فشل الاتصال - " + error.message,
      false
    );

    show("authStatus", "● Authentication: لم يتم التحميل", false);
    show("firestoreStatus", "● Firestore: لم يتم التحميل", false);
  }
</script>
