import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Prevent duplicate app initialization in Next.js dev mode (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ── Firestore with persistent offline cache ─────────────────────────────────
// This means: first load hits network, subsequent loads (or offline) use the
// IndexedDB cache on-device. Multi-tab manager keeps tabs in sync.
let db: ReturnType<typeof getFirestore>;

try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  db = getFirestore(app);
}

export { db };

// ── Lazy singletons — imported only where needed ─────────────────────────────
// Storage and Auth are NOT initialized here to avoid loading them on every
// page. Import them lazily from their own files.
export default app;
