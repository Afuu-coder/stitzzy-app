"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getInstitutions } from "@/lib/firestore";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Institution, Product } from "@/types";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import {
  Menu, X, ArrowRight, MessageCircle, ShieldCheck, Ruler,
  Truck, Check, Star, ChevronRight, ChevronDown, Search,
  Mail
} from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";

import {
  DEPT_COLORS,
  LOGO_FULL_WHITE,
  LOGO_LOCKUP_INK,
  steps,
  faqs,
  footerLinks,
} from "@/components/landing/constants";
import { Instagram, Facebook, Twitter } from "@/components/landing/icons";




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
        const featured = insts.filter((i) => i.isFeatured);
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
          --ink: #14161B;
          --ink-muted: #4A4D57;
          --canvas: #FAF9F6;
          --canvas-2: #F0EDE6;
          --brass: #B8863B;
          --blue: #1B2A4A;
          --rust: #B23A3A;
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
          border: 1px solid rgba(20,22,27,0.08);
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 24px rgba(20,22,27,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stitch-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(20,22,27,0.08);
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
          box-shadow: 0 2px 12px rgba(20,22,27,0.06);
          border-color: rgba(20,22,27,0.12);
        }
        .faq-item { border-bottom: 1px solid rgba(20,22,27,0.12); }
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
            <a href="#how" className="flex items-center justify-center gap-2 px-5 py-3 rounded font-medium border w-full sm:w-auto transition-colors hover:bg-black/5" style={{ borderColor: "rgba(20,22,27,0.25)", color: "var(--ink)" }}>
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
              <path d="M130 0 C 100 10, 100 24, 130 30 C 160 24, 160 10, 130 0" fill="none" stroke="rgba(20,22,27,0.4)" strokeWidth="1.5" />
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
              <div className="h-px my-4" style={{ background: "rgba(20,22,27,0.15)" }} />
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
          <Link href="/institutions" className="hidden sm:flex items-center gap-1 font-mono text-xs text-brand-600 hover:underline flex-shrink-0">
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
                      <p className="font-display font-semibold text-sm group-hover:text-brand-600 transition-colors line-clamp-1">{inst.name}</p>
                      <p className="font-mono text-[10px] text-ink-muted">{inst.city || "Campus Location"}</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-ink-muted group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
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
          <Link href="/institutions" className="hidden sm:flex items-center gap-1 font-mono text-xs text-brand-600 hover:underline flex-shrink-0">
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
        <div className="rounded-lg p-8 max-w-2xl" style={{ background: "#fff", border: "1px solid rgba(20,22,27,0.1)" }}>
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

