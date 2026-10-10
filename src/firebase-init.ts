import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from '../firebase-applet-config.json';

declare global {
  interface Window {
    firebase: any;
    auth: any;
    db: any;
    __firebase_loaded__?: boolean;
    signInWithGoogle?: () => Promise<any>;
  }
}

// Single authoritative initialization of Firebase SDK
let app: any = null;
try {
  app = firebase.apps && firebase.apps.length 
    ? firebase.app() 
    : firebase.initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase app init warning:', e);
}

let auth: any = null;
try {
  auth = firebase.auth();
} catch (e) {
  console.warn('Firebase auth init warning:', e);
}

let db: any = null;
try {
  db = (firebase as any).firestore(app, (firebaseConfig as any).firestoreDatabaseId);
} catch (e) {
  try {
    db = (firebase as any).firestore(app);
  } catch (e2) {
    console.warn('Firestore fallback init:', e2);
  }
}

// Expose globals so all inline script functions can safely reference them
(window as any).firebase = firebase;
(window as any).auth = auth;
(window as any).db = db;
(window as any).__firebase_loaded__ = true;

// Dedicated Google Sign-In helper that guarantees single-SDK provider instance
(window as any).signInWithGoogle = async function () {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized yet.');
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

if (typeof window.dispatchEvent === 'function') {
  window.dispatchEvent(new CustomEvent('firebase-bundle-ready', { detail: { app, auth, db } }));
}
console.log('✓ Firebase SDK initialized cleanly from unified Vite bundle');
