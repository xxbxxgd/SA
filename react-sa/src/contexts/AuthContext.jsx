import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 註冊新用戶
  const signup = async (email, password, name) => {
    try {
      // 在開始註冊前先清除任何舊的錯誤
      setError('');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 更新用戶資料
      await updateProfile(user, {
        displayName: name
      });
      
      // 將用戶資料存入Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        createdAt: serverTimestamp(), // 使用服務器時間戳
        lastLogin: serverTimestamp(),
        role: 'user', // 預設角色
        status: 'active', // 用戶狀態
        phoneNumber: '',
        photoURL: '',
        school: '輔仁大學', // 預設學校
        department: '', // 科系
        studentId: '', // 學號
        dormitory: '', // 宿舍資訊
        address: '', // 地址
      });
      
      console.log('用戶資料已成功存入Firestore');
      
      // 註冊後立即登出用戶，防止自動登入
      await signOut(auth);
      
      return user;
    } catch (error) {
      console.error('註冊失敗:', error);
      setError(error.message || '註冊過程中發生錯誤');
      throw error;
    }
  };

  // 登入
  const login = async (email, password) => {
    try {
      // 在開始登入前清除錯誤
      setError('');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 更新最後登入時間
      try {
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (updateError) {
        console.error('更新登入時間失敗:', updateError);
      }
      
      return user;
    } catch (error) {
      setError(error.message || '登入過程中發生錯誤');
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      setError(error.message || '登出過程中發生錯誤');
      throw error;
    }
  };

  // 重設密碼
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // 獲取用戶資料
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // 更新用戶資料
  const updateUserData = async (uid, data) => {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // 監聽用戶登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData,
    updateUserData,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 