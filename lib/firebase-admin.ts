import { cert, getApps, initializeApp, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK — server-side only.
 * Uses modular v12+ API (firebase-admin/app etc.)
 * Never import this in client components.
 *
 * Always uses explicit service account credentials via env vars.
 * This avoids the ADC "invalid_grant: account not found" error on Cloud Run.
 */

function createAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.warn(
      "⚠️ Firebase Admin SDK is disabled: FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PROJECT_ID is missing."
    );
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Handle both escaped (\n) and literal newlines in the private key
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  });
}

const adminApp = createAdminApp();

export const adminDb      = adminApp ? getFirestore(adminApp) : ({} as ReturnType<typeof getFirestore>);
export const adminStorage = adminApp ? getStorage(adminApp) : ({} as ReturnType<typeof getStorage>);
export const adminAuth    = adminApp ? getAuth(adminApp) : ({} as ReturnType<typeof getAuth>);
export default adminApp;
