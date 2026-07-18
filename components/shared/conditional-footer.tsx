"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/shared/footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  // Hide footer only on admin, auth pages, and checkout (checkout has its own flow)
  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/checkout");

  if (hidden) return null;
  return <Footer />;
}

