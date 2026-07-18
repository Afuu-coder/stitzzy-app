"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

/* ── Real logo assets (extracted from SVG, two colorways) ─────────── */
const LOGO_FULL_WHITE = "data:image/png;base64,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";

const NAV_LINKS = [
  { href: "/institutions", label: "Institutions" },
  { href: "/#how",         label: "How it works" },
  { href: "/uniforms",     label: "Uniforms" },
  { href: "/#faq",         label: "FAQ" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const pathname   = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global navbar shown on all pages except admin
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-sm transition-shadow duration-200"
      style={{
        borderBottom: "1px solid rgba(18,32,58,0.1)",
        boxShadow: scrolled ? "0 2px 16px rgba(18,32,58,0.07)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center" aria-label="Stitzzy home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_FULL_WHITE}
            alt="Stitzzy"
            className="h-7 md:h-9 w-auto"
            style={{ filter: "brightness(0)" }}
          />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === href : pathname.startsWith(href.split("#")[0]);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "font-mono text-xs uppercase tracking-wide transition-colors duration-150",
                  isActive
                    ? "text-ink font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">

          <Link
            href="/institutions"
            aria-label="Browse uniforms"
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg
                       text-ink-muted hover:text-ink hover:bg-canvas-2 transition-colors"
          >
            <Search size={17} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart — ${mounted ? totalItems : 0} item${(mounted ? totalItems : 0) !== 1 ? "s" : ""}`}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg
                       text-ink-muted hover:text-ink hover:bg-canvas-2 transition-colors"
          >
            <ShoppingBag size={17} />
            {mounted && totalItems > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center
                           font-mono font-medium text-white rounded-full"
                style={{ background: "#C1502E", fontSize: "9px", width: "18px", height: "18px" }}
                aria-hidden="true"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="hidden md:inline-flex font-mono text-xs uppercase tracking-wide
                                 px-4 py-2 rounded-lg text-ink hover:bg-canvas-2
                                 border border-ink/15 transition-colors duration-150">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden md:inline-flex font-mono text-xs uppercase tracking-wide
                                 px-4 py-2 rounded-lg btn-primary transition-colors duration-150">
                Get started
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-brand-500/30" } }}
              userProfileMode="navigation"
              userProfileUrl="/account"
            />
          </Show>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                       text-ink hover:bg-canvas-2 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t px-6 py-5 flex flex-col gap-4 bg-canvas overflow-hidden"
            style={{ borderColor: "rgba(18,32,58,0.08)" }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-ink hover:text-blue-600 transition-colors"
              >
                {label}
              </Link>
            ))}
            {/* Cart link for mobile */}
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={13} />
              Cart {mounted && totalItems > 0 && (
                <span className="bg-rust text-white rounded-full font-mono text-[9px] w-4 h-4 flex items-center justify-center" style={{ background: "#C1502E" }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "rgba(18,32,58,0.08)" }}>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="flex-1 font-mono text-xs uppercase tracking-wide
                                     py-2.5 rounded-lg border border-ink/15 text-ink
                                     hover:bg-canvas-2 transition-colors text-center">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 font-mono text-xs uppercase tracking-wide
                                     py-2.5 rounded-lg btn-primary text-center">
                    Get started
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 font-mono text-xs uppercase tracking-wide py-2.5 rounded-lg border border-ink/15 text-ink hover:bg-canvas-2 transition-colors text-center"
                  >
                    My Account
                  </Link>
                  <UserButton />
                </div>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
