import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 輔助函數：等待認證狀態初始化
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// 輔助函數：獲取當前用戶的最新認證令牌
export const getCurrentUserIdToken = async () => {
  if (!auth.currentUser) return null;
  
  try {
    // 強制刷新令牌以確保最新狀態
    return await auth.currentUser.getIdToken(true);
  } catch (error) {
    console.error('獲取用戶認證令牌時出錯:', error);
    return null;
  }
};

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