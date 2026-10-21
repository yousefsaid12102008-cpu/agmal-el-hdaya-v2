
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc
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

const welcome = document.getElementById("welcome");
const logoutBtn = document.getElementById("logoutBtn");
const pendingUsers = document.getElementById("pendingUsers");
const dashboardMessage = document.getElementById("dashboardMessage");

function showMessage(text) {
  dashboardMessage.textContent = text;
}

function makeCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text || "—";
  return cell;
}

function makeButton(text, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn ${className}`;
  button.style.width = "auto";
  button.style.minHeight = "38px";
  button.style.padding = "7px 12px";
  button.textContent = text;
  button.addEventListener("click", action);
  return button;
}

async function loadPendingUsers() {
  pendingUsers.replaceChildren();

  try {
    const usersQuery = query(
      collection(db, "users"),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.className = "empty-state";
      cell.textContent = "لا توجد حسابات تنتظر الموافقة حاليًا.";
      row.appendChild(cell);
      pendingUsers.appendChild(row);
      return;
    }

    snapshot.forEach((userSnapshot) => {
      const user = userSnapshot.data();
      const row = document.createElement("tr");

      row.appendChild(makeCell(user.displayName));
      row.appendChild(makeCell(user.email));
      row.appendChild(makeCell("بانتظار الموافقة"));

      const actionsCell = document.createElement("td");

      const roleSelect = document.createElement("select");
      roleSelect.className = "input";
      roleSelect.style.minHeight = "38px";
      roleSelect.style.marginBottom = "8px";
      roleSelect.setAttribute("aria-label", "الدور بعد الموافقة");

      const roles = [
        ["employee", "موظف"],
        ["cashier", "كاشير"],
        ["customer", "عميل"]
      ];

      roles.forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        roleSelect.appendChild(option);
      });

      const approveButton = makeButton(
        "موافقة",
        "btn-gold",
        async () => {
          if (!confirm(`هل توافق على حساب ${user.displayName || user.email}؟`)) {
            return;
          }

          approveButton.disabled = true;

          try {
            await updateDoc(doc(db, "users", userSnapshot.id), {
              role: roleSelect.value,
              active: true,
              status: "approved"
            });

            showMessage("تم اعتماد الحساب بنجاح.");
            await loadPendingUsers();
          } catch (error) {
            console.error(error);
            showMessage("تعذر اعتماد الحساب. تحقق من صلاحيات Firestore.");
            approveButton.disabled = false;
          }
        }
      );

      const rejectButton = makeButton(
        "رفض",
        "btn-secondary",
        async () => {
          if (!confirm(`هل تريد رفض حساب ${user.displayName || user.email}؟`)) {
            return;
          }

          rejectButton.disabled = true;

          try {
            await updateDoc(doc(db, "users", userSnapshot.id), {
              role: "rejected",
              active: false,
              status: "rejected"
            });

            showMessage("تم رفض الحساب.");
            await loadPendingUsers();
          } catch (error) {
            console.error(error);
            showMessage("تعذر رفض الحساب. تحقق من صلاحيات Firestore.");
            rejectButton.disabled = false;
          }
        }
      );

      actionsCell.appendChild(roleSelect);
      actionsCell.appendChild(document.createElement("br"));
      actionsCell.appendChild(approveButton);
      actionsCell.appendChild(rejectButton);
      row.appendChild(actionsCell);
      pendingUsers.appendChild(row);
    });

  } catch (error) {
    console.error(error);
    showMessage(
      "تعذر تحميل الحسابات. تأكد من نشر قواعد Firestore وإنشاء حساب المالك."
    );
  }
}

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("./index.html");
  } catch (error) {
    showMessage("تعذر تسجيل الخروج. حاول مرة أخرى.");
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("./index.html");
    return;
  }

  try {
    const profileSnapshot = await getDoc(doc(db, "users", user.uid));

    if (!profileSnapshot.exists()) {
      await signOut(auth);
      window.location.replace("./index.html");
      return;
    }

    const profile = profileSnapshot.data();

    if (
      profile.role !== "owner" ||
      profile.active !== true ||
      profile.status !== "approved"
    ) {
      await signOut(auth);
      window.location.replace("./index.html");
      return;
    }

    welcome.textContent = `أهلًا، ${profile.displayName || "بشمهندس يوسف"}`;
    await loadPendingUsers();

  } catch (error) {
    console.error(error);
    showMessage("حدث خطأ أثناء التحقق من صلاحيات المالك.");
  }
});
