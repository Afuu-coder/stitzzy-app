import { auth } from "@clerk/nextjs/server";

/**
 * Server-side admin authorization guard.
 *
 * Reads the role from Clerk session claims (publicMetadata embedded in the JWT),
 * mirroring the check in proxy.ts for admin *pages*. This is the ONLY thing
 * standing between the public internet and the Admin SDK routes, so it must
 * check the actual role — not merely that someone is signed in.
 */
export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "institution_staff",
  "support",
] as const;

export async function verifyAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Returns the authenticated Clerk userId, or null if the request is anonymous.
 * Use in API routes that read/write a user's own protected data.
 */
export async function requireUser(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}
