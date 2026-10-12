import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
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

// 1. Authoritative Modular App Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Authoritative Auth Initialization
const modularAuth = getAuth(app);

// Auth compatibility wrapper for legacy script calls
const authAdapter: any = {
  get currentUser() {
    return modularAuth.currentUser;
  },
  onAuthStateChanged: (cb: (user: any) => void) => onAuthStateChanged(modularAuth, cb),
  signOut: () => signOut(modularAuth),
  signInWithEmailAndPassword: (email: string, pass: string) => signInWithEmailAndPassword(modularAuth, email, pass),
  createUserWithEmailAndPassword: (email: string, pass: string) => createUserWithEmailAndPassword(modularAuth, email, pass),
  _delegate: modularAuth
};

// 3. Authoritative Firestore Initialization with Custom Database ID
// CRITICAL: Connecting to the specific cloud database ID is required for live sync!
const rawFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

function createDocRef(docRef: any): any {
  return {
    id: docRef.id,
    path: docRef.path,
    collection: (subCol: string) => createCollectionRef(collection(docRef, subCol)),
    set: (data: any, opts?: any) => setDoc(docRef, data, opts || {}),
    update: (data: any) => updateDoc(docRef, data),
    delete: () => deleteDoc(docRef),
    get: async () => {
      const snap = await getDoc(docRef);
      return {
        id: snap.id,
        exists: snap.exists(),
        data: () => snap.data()
      };
    },
    onSnapshot: (onNext: (snap: any) => void, onError?: (err: any) => void) => {
      return onSnapshot(docRef, (snap) => {
        onNext({
          id: snap.id,
          exists: snap.exists(),
          data: () => snap.data()
        });
      }, onError);
    }
  };
}

function createQueryRef(q: any): any {
  return {
    where: (f: string, op: any, v: any) => createQueryRef(query(q, where(f, op, v))),
    orderBy: (f: string, dir?: 'asc' | 'desc') => createQueryRef(query(q, orderBy(f, dir || 'asc'))),
    limit: (n: number) => createQueryRef(query(q, limit(n))),
    get: async () => {
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({
        id: d.id,
        data: () => d.data()
      }));
      return {
        size: snap.size,
        empty: snap.empty,
        docs: docs,
        forEach: (fn: (doc: any) => void) => docs.forEach(fn)
      };
    },
    onSnapshot: (onNext: (snap: any) => void, onError?: (err: any) => void) => {
      return onSnapshot(q, (snap: any) => {
        const docs = snap.docs ? snap.docs.map((d: any) => ({
          id: d.id,
          data: () => d.data()
        })) : [];
        onNext({
          size: snap.size || docs.length,
          empty: snap.empty ?? (docs.length === 0),
          docs: docs,
          forEach: (fn: (doc: any) => void) => docs.forEach(fn)
        });
      }, onError);
    }
  };
}

function createCollectionRef(colRef: any): any {
  const qObj = createQueryRef(colRef);
  return {
    ...qObj,
    id: colRef.id,
    path: colRef.path,
    doc: (docId: string) => createDocRef(doc(colRef, docId)),
    add: async (data: any) => {
      const d = doc(colRef);
      await setDoc(d, data);
      return createDocRef(d);
    }
  };
}

const firestoreAdapter: any = {
  _rawDb: rawFirestore,
  collection: (colPath: string) => createCollectionRef(collection(rawFirestore, colPath)),
  doc: (path: string) => createDocRef(doc(rawFirestore, path))
};

// Expose globals so all inline script functions can safely reference them
(window as any).firebase = {
  apps: [app],
  app: () => app,
  auth: () => authAdapter,
  firestore: () => firestoreAdapter
};
(window as any).auth = authAdapter;
(window as any).db = firestoreAdapter;
(window as any).__firebase_loaded__ = true;

// Google Sign-In helper
(window as any).signInWithGoogle = async function () {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return signInWithPopup(modularAuth, provider);
};

if (typeof window.dispatchEvent === 'function') {
  window.dispatchEvent(new CustomEvent('firebase-bundle-ready', { detail: { app, auth: authAdapter, db: firestoreAdapter } }));
}
console.log('✓ Firebase SDK initialized cleanly to Cloud Firestore database:', firebaseConfig.firestoreDatabaseId);
