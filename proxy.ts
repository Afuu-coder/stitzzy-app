import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/order(.*)",
]);

// Admin routes — require admin role (checked in page/layout via Clerk metadata)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect account & checkout routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    const authObject = await auth();
    const userId = authObject.userId;
    
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    try {
      // Import clerkClient dynamically to avoid edge runtime issues if applicable,
      // or just rely on the server environment. 
      // Clerk v7 allows importing it from '@clerk/nextjs/server'.
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata?.role as string | undefined;

      if (!role || !["admin", "super_admin", "institution_staff", "support"].includes(role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error fetching user for RBAC:", error);
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

