/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  role: 'user' | 'admin';
  disabled: boolean;
  score?: number; // QCM points score
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isEmailSent: boolean;
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Synchronize or create Firestore profile for a logged-in user with standard retry logic to allow token sync
  const syncUserProfile = async (firebaseUser: User, maxRetries = 3): Promise<boolean> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const path = `users/${firebaseUser.uid}`;

    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const isBootstrapAdmin = firebaseUser.email === 'bouallimohamed8@gmail.com';
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم جديد',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            role: isBootstrapAdmin ? 'admin' : 'user', // "bouallimohamed8@gmail.com" acts as bootstrap Admin
            disabled: false,
            score: 0,
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userDoc.data() as UserProfile);
        }
        return true;
      } catch (err: any) {
        attempts++;
        console.warn(`Sync profile attempt ${attempts}/${maxRetries} failed:`, err);
        if (attempts >= maxRetries) {
          handleFirestoreError(err, OperationType.GET, path);
        }
        // Wait 500_ms for credentials propagation before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return false;
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      
      // Clear previous sub to prevent unauthorized snapshot errors on logout/switch
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);

        // Ensure user profile document exists first via retry sync
        try {
          await syncUserProfile(firebaseUser, 3);
        } catch (syncErr) {
          console.warn("Silent profile sync bypass inside auth transition:", syncErr);
        }

        // Susbcribe snapshot securely
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const path = `users/${firebaseUser.uid}`;

        if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
          unsubscribeProfile = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data() as UserProfile;
              if (data.disabled) {
                // Sign out suspended users instantly
                setError('عذراً، لقد تم تجميد حسابك من قبل إدارة الموقع.');
                signOut(auth);
                setProfile(null);
              } else {
                setProfile(data);
              }
            }
            setLoading(false);
          }, (err) => {
            console.warn("Profile listener error:", err);
            setLoading(false);
          });
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const registerWithEmail = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    setIsEmailSent(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // Update name inside firebase auth profile
      await updateProfile(createdUser, { displayName: fullName });

      // Send verification link in background (fails silently if Firebase template is unconfigured)
      try {
        await sendEmailVerification(createdUser);
        setIsEmailSent(true);
      } catch (vErr) {
        console.warn("Verification email dispatch failed silently:", vErr);
      }
      
      // Auto synchronize / create user profile directly
      const syncSuccess = await syncUserProfile(createdUser, 3);
      return syncSuccess;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل بحساب آخر.');
      } else if (err.code === 'auth/weak-password') {
        setError('الرمز السري ضعيف جداً، يجب أن يتكون من 6 أحرف على الأقل.');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('عذراً، خيار التسجيل بالبريد السري الإلكتروني غير مفعل في مشروع Firebase الحالي الخاص بك. يرجى تفعيل (Email/Password) كـ Sign-in provider من لوحة تحكم فيسبوك (Firebase Console) على الرابط التالي: https://console.firebase.google.com/project/gen-lang-client-0066747491/authentication/providers');
      } else {
        setError(err.message || 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتاً بسبب تكرار الدخول بشكل خاطئ.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('عذراً، خيار تسجيل الدخول بالبريد الإلكتروني غير مفعل في مشروع Firebase الحالي. يمكنك تفعيله بسهولة بالانتقال إلى: https://console.firebase.google.com/project/gen-lang-client-0066747491/authentication/providers');
      } else {
        setError(err.message || 'فشل تسجيل الدخول، يرجى المحاولة لاحقاً.');
      }
      await signOut(auth);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('البريد المعتمد مسجل بالفعل عبر مزود آخر للهوية (جوجل/فيسبوك/البريد السري).');
      } else {
        setError(err.message || 'فشل تسجيل الدخول عبر Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('البريد المعتمد مسجل بالفعل عبر مزود آخر للهوية (جوجل/فيسبوك/البريد السري).');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('عذراً، خيار تسجيل الدخول عبر فيسبوك غير مفعل بعد في مشروع Firebase هذا. يمكنك تفعيله من: https://console.firebase.google.com/project/gen-lang-client-0066747491/authentication/providers');
      } else {
        setError(err.message || 'فشل تسجيل الدخول عبر Facebook.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('لا يوجد مستخدم مسجل بهذا البريد الإلكتروني.');
      } else {
        setError(err.message || 'فشل إرسال رابط إعادة التعيين.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        isEmailSent,
        registerWithEmail,
        loginWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        logout,
        resetPassword,
        clearError,
        resendVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
