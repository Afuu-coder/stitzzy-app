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

  // Protect admin routes — use sessionClaims (JWT) so no external API call needed
  if (isAdminRoute(req)) {
    const authObject = await auth();
    const userId = authObject.userId;

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Read role from the JWT session claims (publicMetadata is embedded here)
    // This avoids calling clerkClient.users.getUser() which needs CLERK_SECRET_KEY
    const role = (authObject.sessionClaims?.metadata as Record<string, string> | undefined)?.role;

    const ADMIN_ROLES = ["admin", "super_admin", "institution_staff", "support"];
    if (!role || !ADMIN_ROLES.includes(role)) {
      // Not an admin — redirect home instead of looping
      return NextResponse.redirect(new URL("/", req.url));
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

