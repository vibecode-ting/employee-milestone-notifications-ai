import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isEmulatorMode } from '../lib/firebase';
import type { AppUser, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  loginDemo: (role?: Role) => void;
  switchDemoPlan: (role: Role) => void;
  updatePhotoURL: (url: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordlessLink: (email: string) => Promise<void>;
  signInWithEmailLinkCallback: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  appUser: null,
  loading: true,
  isDemo: false,
  loginDemo: () => {},
  switchDemoPlan: () => {},
  updatePhotoURL: async () => {},
  loginWithGoogle: async () => {},
  sendPasswordlessLink: async () => {},
  signInWithEmailLinkCallback: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const DEMO_KEY = 'demo_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initDemo = (parsed: AppUser) => {
    setUser({ uid: parsed.uid, email: parsed.email } as User);
    setAppUser(parsed);
    setLoading(false);
  };

  useEffect(() => {
    const demo = localStorage.getItem(DEMO_KEY);
    if (demo) {
      try {
        const parsed = JSON.parse(demo) as AppUser;
        initDemo(parsed);
        return;
      } catch {
        localStorage.removeItem(DEMO_KEY);
      }
    }

    try {
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (!firebaseUser) {
          setAppUser(null);
          setLoading(false);
          return;
        }

        try {
          const ref = doc(db, 'users', firebaseUser.uid);

          if (isEmulatorMode) {
            const roleOverride = (localStorage.getItem(`demo_role_${firebaseUser.uid}`) as Role) || 'user';
            setAppUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              role: roleOverride,
              photoURL: firebaseUser.photoURL || null,
              createdAt: null as unknown as AppUser['createdAt'],
            });
            setLoading(false);
            return;
          }

          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as AppUser;
            const effectivePhoto = firebaseUser.photoURL || data.photoURL || null;
            if (firebaseUser.photoURL && data.photoURL !== firebaseUser.photoURL) {
              updateDoc(ref, { photoURL: firebaseUser.photoURL }).catch(() => {});
            }
            setAppUser({ ...data, photoURL: effectivePhoto });
          } else {
            const newUser: Omit<AppUser, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              role: 'user',
              photoURL: firebaseUser.photoURL || null,
              createdAt: serverTimestamp(),
            };
            await setDoc(ref, newUser);
            setAppUser({ ...newUser, createdAt: null as unknown as AppUser['createdAt'] });
          }
        } catch {
          // Fallback if firestore unconfigured
          setAppUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            role: 'user',
            photoURL: firebaseUser.photoURL || null,
            createdAt: null as unknown as AppUser['createdAt'],
          });
        } finally {
          setLoading(false);
        }
      }, () => {
        setLoading(false);
      });

      return unsub;
    } catch {
      setLoading(false);
    }
  }, []);

  const isDemo = Boolean(localStorage.getItem(DEMO_KEY)) || appUser?.uid === 'demo-uid' || Boolean(appUser?.uid?.startsWith('demo'));

  const switchDemoPlan = (role: Role) => {
    if (!appUser) return;
    const updated: AppUser = { ...appUser, role };
    setAppUser(updated);
    localStorage.setItem(DEMO_KEY, JSON.stringify(updated));
  };

  const updatePhotoURL = async (url: string) => {
    if (!appUser) return;
    const updated: AppUser = { ...appUser, photoURL: url };
    setAppUser(updated);
    if (isDemo) {
      localStorage.setItem(DEMO_KEY, JSON.stringify(updated));
    } else {
      try {
        await updateDoc(doc(db, 'users', appUser.uid), { photoURL: url });
      } catch (err) {
        console.error('Failed to update photoURL in Firestore', err);
      }
    }
  };

  const loginDemo = (role: Role = 'admin') => {
    const demoUser: AppUser = {
      uid: 'demo-uid',
      email: 'demo@milestone.app',
      role,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      createdAt: null as unknown as AppUser['createdAt'],
    };
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser));
    initDemo(demoUser);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const sendPasswordlessLink = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem('emailForSignIn', email);
  };

  const signInWithEmailLinkCallback = async (email: string) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem('emailForSignIn');
    }
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_KEY);
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        isDemo,
        loginDemo,
        switchDemoPlan,
        updatePhotoURL,
        loginWithGoogle,
        sendPasswordlessLink,
        signInWithEmailLinkCallback,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
