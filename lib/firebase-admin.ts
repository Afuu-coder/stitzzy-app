import { cert, getApps, initializeApp, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK — server-side only.
 * Uses modular v12+ API (firebase-admin/app etc.)
 * Never import this in client components.
 */

function createAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApp();
  }

  // Gracefully return null if keys are missing (prevents build crash)
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    console.warn("⚠️ FIREBASE_ADMIN_PRIVATE_KEY is missing. Admin SDK is disabled.");
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      // Replace escaped newlines in env variable
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  });
}

const adminApp = createAdminApp();

export const adminDb      = adminApp ? getFirestore(adminApp) : ({} as ReturnType<typeof getFirestore>);
export const adminStorage = adminApp ? getStorage(adminApp) : ({} as ReturnType<typeof getStorage>);
export const adminAuth    = adminApp ? getAuth(adminApp) : ({} as ReturnType<typeof getAuth>);
export default adminApp;
