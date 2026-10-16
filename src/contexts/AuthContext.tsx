import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isEmulatorMode } from '../lib/firebase';
import type { AppUser, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  loginDemo: (role?: Role) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  appUser: null,
  loading: true,
  loginDemo: () => {},
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
              createdAt: null as unknown as AppUser['createdAt'],
            });
            setLoading(false);
            return;
          }

          const snap = await getDoc(ref);
          if (snap.exists()) {
            setAppUser(snap.data() as AppUser);
          } else {
            const newUser: Omit<AppUser, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              role: 'user',
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

  const loginDemo = (role: Role = 'admin') => {
    const demoUser: AppUser = {
      uid: 'demo-uid',
      email: 'demo@milestone.app',
      role,
      createdAt: null as unknown as AppUser['createdAt'],
    };
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser));
    initDemo(demoUser);
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
    <AuthContext.Provider value={{ user, appUser, loading, loginDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
