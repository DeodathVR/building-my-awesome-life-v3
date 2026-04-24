import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUpEmail = useCallback(async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    // Best-effort verification email
    try { await sendEmailVerification(cred.user); } catch { /* ignore */ }
    return cred.user;
  }, []);

  const signInEmail = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const signInGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), []);

  const sendVerification = useCallback(async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const value = {
    user,
    loading,
    isAdmin,
    signUpEmail,
    signInEmail,
    signInGoogle,
    signOut,
    resetPassword,
    sendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
