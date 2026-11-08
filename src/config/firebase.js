import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "ضع مفتاح Firebase هنا",
  authDomain: "agmal-el-hdaya-erp.firebaseapp.com",
  projectId: "agmal-el-hdaya-erp",
  storageBucket: "agmal-el-hdaya-erp.firebasestorage.app",
  messagingSenderId: "220694465411",
  appId: "1:220694465411:web:90ca8ae3995077792fc4b6",
  measurementId: "G-P1S2LCMWVW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
