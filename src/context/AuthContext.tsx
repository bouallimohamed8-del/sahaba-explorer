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
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

  // Synchronize or create Firestore profile for a logged-in user
  const syncUserProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const path = `users/${firebaseUser.uid}`;

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
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);

        // Enforce Email Verification for Password Provider before activating account
        const isPasswordProvider = firebaseUser.providerData.some(p => p.providerId === 'password');
        if (isPasswordProvider && !firebaseUser.emailVerified) {
          // Keep loading false, let component render email verification screen
          setProfile(null);
          setLoading(false);
          return;
        }

        // For Google/Facebook or block verified email, listen to public profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const path = `users/${firebaseUser.uid}`;

        // Ensure user document exists first
        await syncUserProfile(firebaseUser);

        const unsubscribeProfile = onSnapshot(userDocRef, (docSnapshot) => {
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
          handleFirestoreError(err, OperationType.GET, path);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const registerWithEmail = async (email: string, password: string, fullName: string) => {
    setError(null);
    setLoading(true);
    setIsEmailSent(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // Update name inside firebase auth profile
      await updateProfile(createdUser, { displayName: fullName });

      // Send verification link
      await sendEmailVerification(createdUser);
      setIsEmailSent(true);
      // Explicitly sign out until they activate email
      await signOut(auth);
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
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;

      if (!loggedUser.emailVerified) {
        // Trigger verification email and sign out
        await sendEmailVerification(loggedUser);
        await signOut(auth);
        setError('يرجى تفعيل حسابك أولاً عن طريق النقر على الرابط المرسل لبريدك الإلكتروني، لقد أعدنا إرسال رسالة التفعيل.');
      }
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

  const resetPassword = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('لا يوجد مستخدم مسجل بهذا البريد الإلكتروني.');
      } else {
        setError(err.message || 'فشل إرسال رابط إعادة التعيين.');
      }
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
