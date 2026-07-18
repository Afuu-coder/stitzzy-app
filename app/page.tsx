"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getInstitutions } from "@/lib/firestore";
import { collection, getDocs, query, where, limit, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Institution, Product } from "@/types";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import {
  Menu, X, ArrowRight, MessageCircle, ShieldCheck, Ruler,
  Truck, Check, Star, ChevronRight, ChevronDown, Search,
  Mail
} from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";

const DEPT_COLORS = [
  "#3E63E0", "#B8892E", "#C1502E", "#2E8B57", "#7C3AED", "#0891B2",
];

/* ── Inline SVG social icons ────── */
function Instagram({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function Twitter({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.763l7.722-8.842L2.04 2.25h6.985l4.25 5.621 5.969-5.621Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
    </svg>
  );
}
function Facebook({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971h-1.513c-1.492 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

const LOGO_LOCKUP_INK = "data:image/png;base64,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";
const LOGO_FULL_WHITE = "data:image/png;base64,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";


const steps = [
  { n: "01", t: "Select your institution", d: "Find Dibrugarh University in seconds" },
  { n: "02", t: "Pick department & size", d: "Filtered to exactly what you need" },
  { n: "03", t: "Add to cart", d: "Review items and total before ordering" },
  { n: "04", t: "Order via WhatsApp", d: "One tap sends it, admin confirms fast" },
];

const faqs = [
  { q: "Is this the exact uniform my college approved?", a: "Yes — every product listed for Dibrugarh University is checked against the official uniform code before it goes live on the site." },
  { q: "How do I pay for my order?", a: "There's no card or online payment. You review your cart, then send it as a formatted message on WhatsApp — the admin confirms it and payment is handled as agreed in that chat." },
  { q: "What if I order the wrong size?", a: "Check the size chart on the product page before ordering. If it still doesn't fit, message the admin on WhatsApp with your order code to arrange an exchange." },
  { q: "How long does delivery take?", a: "Most orders are confirmed within a few hours and delivered within 3–5 working days after confirmation." },
  { q: "Is my information safe?", a: "Your order details are only shared with the admin on WhatsApp to process your order — nothing is sold or shared with anyone else." },
];

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Browse uniforms",  href: "/institutions" },
    { label: "Institutions",     href: "/institutions" },
    { label: "Size guide",       href: "/institutions" },
    { label: "Track an order",   href: "/account" },
  ],
  Company: [
    { label: "About us",         href: "/#how" },
    { label: "How it works",     href: "/#how" },
    { label: "Blog",             href: "#" },
    { label: "Careers",          href: "#" },
  ],
  Support: [
    { label: "FAQ",              href: "/#faq" },
    { label: "Contact us",       href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}` },
    { label: "WhatsApp support", href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}` },
    { label: "Returns & exchanges", href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}` },
  ],
  Legal: [
    { label: "Privacy policy",   href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Refund policy",    href: "#" },
  ],
};

export default function StitzzyLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const [dbInstitutions, setDbInstitutions] = useState<Institution[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const insts = await getInstitutions();
        // Show featured institutions first, then fallback to active ones
        const featured = insts.filter((i: any) => i.isFeatured);
        setDbInstitutions(featured.length > 0 ? featured.slice(0, 4) : insts.slice(0, 4));

        // Fetch featured products first, fallback to any active ones
        const featuredPq = query(collection(db, "products"), where("isFeatured", "==", true), where("isActive", "==", true), limit(4));
        const featuredSnap = await getDocs(featuredPq);
        if (featuredSnap.docs.length > 0) {
          setDbProducts(featuredSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        } else {
          const pq = query(collection(db, "products"), where("isActive", "==", true), limit(4));
          const pSnap = await getDocs(pq);
          setDbProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="stitzzy-app" style={{ background: "var(--canvas)", color: "var(--ink)" }}>

      {/* ── JSON-LD Organization + WebSite schema (SEO) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Stitzzy",
              url: "https://stitzzy.com",
              logo: "https://stitzzy.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi", "Assamese"],
              },
              sameAs: [
                "https://www.instagram.com/stitzzy.in",
                "https://twitter.com/stitzzy",
                "https://facebook.com/stitzzy",
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Stitzzy",
              url: "https://stitzzy.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://stitzzy.com/uniforms?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .stitzzy-app {
          --ink: #12203A;
          --ink-muted: #5B6478;
          --canvas: #F4F6FA;
          --canvas-2: #EAEDF3;
          --brass: #B8892E;
          --blue: #3E63E0;
          --rust: #C1502E;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }
        .stitzzy-app .font-display { font-family: 'Bricolage Grotesque', sans-serif; }
        .stitzzy-app .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass);
        }
        .stitch-card {
          position: relative;
          border: 1px solid rgba(18,32,58,0.08);
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 24px rgba(18,32,58,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stitch-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(18,32,58,0.1);
        }
        .stitch-card::before {
          content: "";
          position: absolute;
          top: 12px; left: 12px;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--canvas);
          border: 1px solid rgba(18,32,58,0.15);
        }
        .tag-hang { animation: tagSway 5s ease-in-out infinite; transform-origin: top center; }
        @keyframes tagSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tag-hang { animation: none; }
        }
        .btn-primary {
          background: var(--ink);
          color: #fff;
          transition: background .15s ease;
        }
        .btn-primary:hover { background: var(--blue); }
        .btn-primary:focus-visible, a:focus-visible, button:focus-visible, input:focus-visible {
          outline: 2px solid var(--blue);
          outline-offset: 2px;
        }
        .navbar {
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        .navbar.scrolled {
          box-shadow: 0 2px 12px rgba(18,32,58,0.06);
          border-color: rgba(18,32,58,0.12);
        }
        .faq-item { border-bottom: 1px solid rgba(18,32,58,0.12); }
        .faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 18px 4px; text-align: left; }
        .faq-chevron { transition: transform .2s ease; }
        .faq-chevron.open { transform: rotate(180deg); }
        .newsletter-input {
          background: rgba(244,246,250,0.06);
          border: 1px solid rgba(244,246,250,0.18);
          color: #fff;
        }
        .newsletter-input::placeholder { color: rgba(244,246,250,0.4); }
        .social-icon {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(244,246,250,0.08);
          color: rgba(244,246,250,0.8);
          transition: background .15s ease;
        }
        .social-icon:hover { background: var(--blue); color: #fff; }
      `}</style>

      {/* ANNOUNCEMENT BAR */}
      <div className="font-mono text-xs text-center py-2 px-4" style={{ background: "var(--ink)", color: "#F4F6FA" }}>
        🎓 Now live for Dibrugarh University — find your uniform and order in under 2 minutes
      </div>


      {/* HERO */}
      <section id="top" className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow mb-4">Official uniform platform</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Stitzzy | Your Campus. Your Style. Your Uniform.
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--ink-muted)", maxWidth: "46ch" }}>
            A thoughtfully designed platform to help students discover institution-specific uniforms with ease. Browse collections, select the perfect fit, and complete your order through a seamless WhatsApp experience.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-10">
            <Link href="/institutions" className="flex items-center justify-center gap-2 px-5 py-3 rounded font-medium btn-primary w-full sm:w-auto">
              <Search size={16} /> Find your institution
            </Link>
            <a href="#how" className="flex items-center justify-center gap-2 px-5 py-3 rounded font-medium border w-full sm:w-auto transition-colors hover:bg-black/5" style={{ borderColor: "rgba(18,32,58,0.25)", color: "var(--ink)" }}>
              See how it works
            </a>
          </div>
          <div className="flex gap-8 font-mono text-xs" style={{ color: "var(--ink-muted)" }}>
            <div><span className="font-display text-lg block" style={{ color: "var(--ink)" }}>1</span>university live</div>
            <div><span className="font-display text-lg block" style={{ color: "var(--ink)" }}>0%</span>payment friction</div>
            <div><span className="font-display text-lg block" style={{ color: "var(--ink)" }}>&lt;2min</span>to order</div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="tag-hang" style={{ width: "260px" }}>
            <svg width="260" height="34" viewBox="0 0 260 34" aria-hidden="true">
              <path d="M130 0 C 100 10, 100 24, 130 30 C 160 24, 160 10, 130 0" fill="none" stroke="rgba(18,32,58,0.4)" strokeWidth="1.5" />
            </svg>
            <div className="stitch-card p-6" style={{ marginTop: "-6px" }}>
              <div className="flex justify-between items-start mb-8">
                <img src={LOGO_FULL_WHITE} alt="Stitzzy" style={{ height: "28px", width: "auto", filter: "brightness(0)" }} />
                <span className="font-mono text-[10px] px-2 py-1 rounded" style={{ background: "var(--canvas-2)", color: "var(--brass)" }}>OFFICIAL</span>
              </div>
              <p className="font-mono text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-muted)" }}>Institution</p>
              <p className="font-display font-semibold mb-4" style={{ color: "var(--ink)" }}>
                {dbInstitutions[0]?.name || "Your Institution"}
              </p>
              <div className="h-px my-4" style={{ background: "rgba(18,32,58,0.15)" }} />
              <p className="font-mono text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-muted)" }}>Order method</p>
              <p className="font-mono text-sm flex items-center gap-2" style={{ color: "var(--ink)" }}>
                <MessageCircle size={14} style={{ color: "var(--blue)" }} /> WhatsApp checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONS */}
      <section id="institutions" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Institutions on Stitzzy</p>
            <h2 className="font-display text-2xl font-semibold">Built for one campus today, thousands tomorrow</h2>
          </div>
          <Link href="/institutions" className="hidden sm:flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline flex-shrink-0">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {loadingData ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stitch-card p-5 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-canvas-2 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-canvas-2 rounded w-3/4" />
                    <div className="h-2.5 bg-canvas-2 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {dbInstitutions.slice(0, 4).map((inst, idx) => (
                <Link href={`/institutions/${inst.slug}`} key={inst.id} className="stitch-card p-5 flex items-center justify-between group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white overflow-hidden" style={{ border: `1px solid ${DEPT_COLORS[idx % DEPT_COLORS.length]}40` }}>
                      {inst.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={inst.logoUrl} alt={inst.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="font-mono text-sm font-semibold" style={{ color: DEPT_COLORS[idx % DEPT_COLORS.length] }}>
                          {inst.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{inst.name}</p>
                      <p className="font-mono text-[10px] text-ink-muted">{inst.city || "Campus Location"}</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-ink-muted group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                </Link>
              ))}
              {Array.from({ length: Math.max(0, 4 - dbInstitutions.length) }).map((_, idx) => (
                <div key={`empty-inst-${idx}`} className="stitch-card p-5 flex flex-col items-center justify-center text-center border-2 border-dashed border-ink/10 opacity-60">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-1">Coming Soon</span>
                  <p className="font-display font-semibold text-xs text-ink/60">More institutions adding soon</p>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-16">
        <p className="eyebrow mb-2">Popular right now</p>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold">Uniforms students are ordering</h2>
          <Link href="/institutions" className="hidden sm:flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline flex-shrink-0">
            Browse all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {loadingData ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stitch-card p-5 animate-pulse">
                  <div className="w-full h-48 rounded bg-canvas-2 mb-4" />
                  <div className="h-4 bg-canvas-2 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-canvas-2 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-canvas-2 rounded w-1/2 mb-4" />
                  <div className="flex gap-1.5 mb-4">
                    {[...Array(4)].map((_, j) => <div key={j} className="w-10 h-8 bg-canvas-2 rounded" />)}
                  </div>
                  <div className="h-9 bg-canvas-2 rounded" />
                </div>
              ))}
            </>
          ) : (
            <>
              {dbProducts.slice(0, 4).map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - dbProducts.length) }).map((_, idx) => (
                <div key={`empty-prod-${idx}`} className="stitch-card p-4 block opacity-60 border-2 border-dashed border-ink/10 cursor-default">
                  <div className="w-full aspect-[4/5] rounded-lg mb-4 flex flex-col items-center justify-center bg-canvas border border-dashed border-ink/10">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Coming Soon</span>
                  </div>
                  <div className="px-1">
                    <div className="h-4 bg-canvas-2 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-canvas-2 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-canvas-2 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-16">
        <p className="eyebrow mb-2">The process</p>
        <h2 className="font-display text-2xl font-semibold mb-10">Four steps, no payment gateway</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs mb-4" style={{ background: "var(--brass)", color: "#fff" }}>
                {s.n}
              </div>
              <p className="font-display font-semibold mb-1">{s.t}</p>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>



      {/* TRUST STRIP */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, t: "Institution-verified", d: "Only the exact uniform your college has approved" },
          { icon: Ruler, t: "Size guide included", d: "Every product has a full measurement chart" },
          { icon: Truck, d: "Tracked from confirmation to delivery", t: "Order tracking" },
        ].map((f, i) => (
          <div key={i}>
            <f.icon size={20} style={{ color: "var(--blue)" }} className="mb-3" />
            <p className="font-display font-semibold mb-1">{f.t}</p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{f.d}</p>
          </div>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-lg p-8 max-w-2xl" style={{ background: "#fff", border: "1px solid rgba(18,32,58,0.1)" }}>
          <div className="flex gap-1 mb-4" style={{ color: "var(--brass)" }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <p className="font-display text-lg mb-4">
            "I found my exact department's uniform in under a minute and just messaged
            the order in. No signup, no card."
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--ink-muted)" }}>— B.Com student, Dibrugarh University</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
        <p className="eyebrow mb-2">Questions</p>
        <h2 className="font-display text-2xl font-semibold mb-8">Frequently asked</h2>
        <div>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span className="font-display font-semibold text-sm pr-4">{f.q}</span>
                <ChevronDown size={16} className={`faq-chevron flex-shrink-0 ${openFaq === i ? "open" : ""}`} style={{ color: "var(--ink-muted)" }} />
              </button>
              {openFaq === i && (
                <p className="text-sm pb-5 pr-8" style={{ color: "var(--ink-muted)" }}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 overflow-hidden relative" style={{ background: "var(--canvas-2)" }}>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10 animate-fade-in-up">
          <h2 className="font-display text-2xl md:text-4xl font-semibold mb-6">Find your uniform in under two minutes</h2>
          <Link href="/institutions" className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium transition-transform hover:scale-105 shadow-sm" style={{ background: "var(--ink)", color: "#fff" }}>
            Find your institution <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

