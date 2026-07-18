"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Mail, Check } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ── Inline SVG social icons ──────────────────────────────────────── */
function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function TwitterXIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.763l7.722-8.842L2.04 2.25h6.985l4.25 5.621 5.969-5.621Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
    </svg>
  );
}
function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971h-1.513c-1.492 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

/* ── Footer link data ─────────────────────────────────────────────── */
interface FooterLink { href: string; label: string; external?: boolean; }

const FOOTER_LINKS: Record<string, FooterLink[]> = {
  Product: [
    { href: "/uniforms",     label: "Browse uniforms" },
    { href: "/institutions", label: "Institutions" },
    { href: "/#how",         label: "How it works" },
    { href: "/cart",         label: "Your cart" },
  ],
  Company: [
    { href: "/#how",  label: "How it works" },
    { href: "/#faq",  label: "FAQ" },
  ],
  Support: [
    { href: "https://wa.me/918473083827", label: "WhatsApp support", external: true },
    { href: "/account",                   label: "My Account" },
  ],
  Legal: [
    { href: "#", label: "Privacy policy" },
    { href: "#", label: "Terms of service" },
    { href: "#", label: "Refund policy" },
  ],
};

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/stitzzy.in?igsh=cGJkNmk3aWdhZW4y", label: "Instagram", Icon: InstagramIcon },
  { href: "https://twitter.com/stitzzy",                                  label: "Twitter / X", Icon: TwitterXIcon },
  { href: "https://facebook.com/stitzzy",                                 label: "Facebook",  Icon: FacebookIcon },
];

const LOGO_FULL_WHITE = "data:image/png;base64,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";

/* ── Footer ─────────────────────────────────────────────────────────── */
export function Footer() {
  const year = new Date().getFullYear();
  const [email,       setEmail]       = useState("");
  const [subscribed,  setSubscribed]  = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email:        email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString(),
        source:       "footer",
      });
    } catch {
      // Silently succeed — user still gets confirmation
    } finally {
      setSubscribed(true);
      setSubscribing(false);
    }
  }

  return (
    <footer
      aria-label="Site footer"
      style={{ background: "var(--ink)", color: "rgba(244,246,250,0.7)" }}
    >
      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8 md:gap-10">

        {/* Brand column */}
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <Link href="/" aria-label="Stitzzy home" className="inline-block mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_FULL_WHITE} alt="Stitzzy — Stitching the future" style={{ height: "72px", width: "auto", marginBottom: "16px" }} />
          </Link>
          <p
            className="font-mono text-sm mb-5 leading-relaxed"
            style={{ color: "rgba(244,246,250,0.6)", maxWidth: "32ch" }}
          >
            Official school and college uniforms, ordered online and confirmed on WhatsApp.
          </p>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/918473083827"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs text-white px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 mb-5"
            style={{ background: "#25D366" }}
          >
            <MessageCircle size={14} />
            Chat on WhatsApp
          </a>

          {/* Social icons */}
          <div className="flex gap-2 mt-3">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <p
              className="font-mono text-[11px] uppercase tracking-wide mb-4"
              style={{ color: "var(--brass)" }}
            >
              {heading}
            </p>
            <ul className="space-y-2.5">
              {links.map(({ href, label, external }) => (
                <li key={label}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs transition-colors hover:text-white"
                      style={{ color: "rgba(244,246,250,0.65)" }}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="font-mono text-xs transition-colors hover:text-white"
                      style={{ color: "rgba(244,246,250,0.65)" }}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Newsletter bar ── */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div
          className="rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: "rgba(244,246,250,0.05)",
            border: "1px solid rgba(244,246,250,0.1)",
          }}
        >
          <div>
            <p className="font-display font-semibold text-sm mb-1" style={{ color: "#fff" }}>
              Get notified when your institution joins
            </p>
            <p className="font-mono text-xs" style={{ color: "rgba(244,246,250,0.55)" }}>
              One email, sent only when Stitzzy launches near you.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="flex gap-2 w-full sm:w-auto"
            aria-label="Newsletter signup"
          >
            <div className="newsletter-input flex items-center gap-2 px-3 rounded flex-1 sm:w-64">
              <Mail size={14} style={{ color: "rgba(244,246,250,0.5)" }} aria-hidden="true" />
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent py-2.5 text-sm flex-1 outline-none font-mono"
                style={{ color: "#fff" }}
                aria-label="Email address"
                disabled={subscribed}
              />
            </div>
            <button
              type="submit"
              disabled={subscribed || subscribing}
              className="px-4 py-2.5 rounded font-mono text-xs uppercase tracking-wide flex-shrink-0 flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ background: "var(--brass)", color: "#fff" }}
            >
              {subscribed ? (
                <><Check size={13} aria-hidden="true" /> Done!</>
              ) : subscribing ? "…" : "Notify me"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid rgba(244,246,250,0.1)" }}>
        <div
          className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between gap-4 font-mono text-xs"
          style={{ color: "rgba(244,246,250,0.5)" }}
        >
          <span>© {year} Stitzzy · Stitching the future · Made with ♥ in Assam, India</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors" style={{ color: "rgba(244,246,250,0.5)" }}>Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors" style={{ color: "rgba(244,246,250,0.5)" }}>Terms</Link>
            <a href="https://wa.me/918473083827" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: "rgba(244,246,250,0.5)" }}>Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
