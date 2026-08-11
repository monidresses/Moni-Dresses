import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { db } from "./db.js";

const auth = getAuth();
const ADMIN_ROLES = new Set(["owner", "admin", "manager"]);

export async function requireAdmin({ redirect = "admin-login.html" } = {}) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace(redirect);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "staff", user.uid));
        const role = snap.exists() ? snap.data().role : null;
        if (!ADMIN_ROLES.has(role)) {
          await signOut(auth);
          window.location.replace(`${redirect}?error=unauthorized`);
          return;
        }
        resolve({ user, role });
      } catch (error) {
        console.error("Admin authorization failed", error);
        window.location.replace(`${redirect}?error=authorization`);
      }
    });
  });
}

export async function adminLogin(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const snap = await getDoc(doc(db, "staff", credential.user.uid));
  const role = snap.exists() ? snap.data().role : null;
  if (!ADMIN_ROLES.has(role)) {
    await signOut(auth);
    throw new Error("This account does not have admin access.");
  }
  return { user: credential.user, role };
}

export function adminLogout() {
  return signOut(auth);
}
