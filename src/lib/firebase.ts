import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoFallbackKeyForMilestoneApp2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-milestone.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-milestone',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-milestone.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let authInstance: ReturnType<typeof getAuth>;
try {
  authInstance = getAuth(app);
} catch (err) {
  console.warn('Firebase Auth initialization fallback:', err);
  // Re-init with demo key if apiKey was invalid
  const fallbackApp = initializeApp({ ...firebaseConfig, apiKey: 'AIzaSyDemoFallbackKeyForMilestoneApp2026' }, 'demo-fallback');
  authInstance = getAuth(fallbackApp);
}

let dbInstance: ReturnType<typeof getFirestore>;
try {
  dbInstance = getFirestore(app);
} catch (err) {
  console.warn('Firebase Firestore initialization fallback:', err);
  const fallbackApp = initializeApp({ ...firebaseConfig, apiKey: 'AIzaSyDemoFallbackKeyForMilestoneApp2026' }, 'demo-fallback-db');
  dbInstance = getFirestore(fallbackApp);
}

export const auth = authInstance;
export const db = dbInstance;

export const isEmulatorMode = import.meta.env.VITE_USE_EMULATOR === 'true';

if (isEmulatorMode && auth && db) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch {
    // Emulator already connected
  }
}
