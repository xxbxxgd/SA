import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzhzNbaXc5dnKWurJNgN_BtRWKvbZtIGM",
  authDomain: "sasb-f7ff8.firebaseapp.com",
  projectId: "sasb-f7ff8",
  storageBucket: "sasb-f7ff8.firebasestorage.app",
  messagingSenderId: "119413315811",
  appId: "1:119413315811:web:a2d97bbfe2af011b558dd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 