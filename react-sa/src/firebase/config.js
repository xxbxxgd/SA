import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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

// 啟用持久化存儲
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.error('The current browser does not support all of the features required to enable persistence');
      }
    });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

export default app; 