/**
 * Firebase initialization — modular Web SDK v10+
 * This file is safe to import in the browser bundle.
 * It only uses VITE_ public environment variables.
 *
 * IMPORTANT: API keys from Firebase are safe in the browser.
 * Sensitive operations (image upload, admin verification) are
 * handled in server functions (src/server-functions/) which
 * access Cloudflare Worker secrets — never exposed to the browser.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};

// Singleton — prevents re-initialization on HMR
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  auth = getAuth(app);
  db = getFirestore(app);

  // Persist authentication across page reloads
  if (typeof window !== "undefined") {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("[Firebase] Auth persistence error:", err);
    });
  }

  // Connect to emulators in local dev if configured
  if (
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    import.meta.env["VITE_USE_FIREBASE_EMULATOR"] === "true"
  ) {
    connectFirestoreEmulator(db, "localhost", 8080);
  }

  return { app, auth, db };
}

// Initialize immediately (safe in both SSR and browser — Firestore/Auth
// are no-ops on the server side, actual calls are client-only)
const firebase = initFirebase();

export { firebase };
export const getFirebaseApp = () => firebase.app;
export const getFirebaseAuth = () => firebase.auth;
export const getFirebaseDb = () => firebase.db;

// Convenience re-exports used throughout the codebase
export { app, auth, db };
