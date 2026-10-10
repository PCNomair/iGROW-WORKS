import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Attach firebase to window for seamless global availability across all templates
declare global {
  interface Window {
    firebase: any;
    __firebase_loaded__?: boolean;
  }
}

(window as any).firebase = firebase;
window.__firebase_loaded__ = true;
if (typeof window.dispatchEvent === 'function') {
  window.dispatchEvent(new CustomEvent('firebase-bundle-ready'));
}
console.log('✓ Local Firebase SDK bundle initialized successfully');
