import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/order(.*)",
]);

// Admin routes — require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect account & checkout routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protect admin routes — require an admin role.
  if (isAdminRoute(req)) {
    // Let Clerk handle the "not signed in" redirect. It resolves the correct
    // PUBLIC domain from forwarded headers / the publishable key, avoiding the
    // internal Cloud Run host (0.0.0.0:8080) leaking into redirect_url.
    await auth.protect();

    // Signed in — now check the role from the JWT session claims.
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role;

    const ADMIN_ROLES = ["admin", "super_admin", "institution_staff", "support"];
    if (!role || !ADMIN_ROLES.includes(role)) {
      // Signed in but not an admin — send home. Build the URL from the public
      // forwarded host so we never redirect to the internal Cloud Run address.
      const proto = req.headers.get("x-forwarded-proto") ?? "https";
      const host  = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      const base  = host ? `${proto}://${host}` : req.url;
      return NextResponse.redirect(new URL("/", base));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk auto-proxy path (required for Next.js 15+)
    "/__clerk/:path*",
  ],
};

