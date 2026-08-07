import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBZdG23Io-oMElZ5XVmhVLd87-sq136dhY",
    authDomain: "moni-dresses-db.firebaseapp.com",
    projectId: "moni-dresses-db",
    storageBucket: "moni-dresses-db.firebasestorage.app",
    messagingSenderId: "24076547918",
    appId: "1:24076547918:web:6cae50157f9c6749ff501f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
