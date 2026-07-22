"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronRight, Building2, MessageCircle } from "lucide-react";
import { getInstitutions } from "@/lib/firestore";
import type { Institution } from "@/types";

const TYPE_LABELS: Record<Institution["type"], string> = {
  university: "University",
  college:    "College",
  school:     "School",
  coaching:   "Coaching",
};

const DEPT_COLORS = [
  "#1B2A4A", "#B8863B", "#B23A3A", "#1F7A4D", "#3A4E7A", "#5B6478",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="stitch-card p-5 animate-pulse" aria-hidden="true">
      <div className="w-full h-28 rounded bg-canvas-2 mb-4" />
      <div className="h-4 bg-canvas-2 rounded w-3/4 mb-2" />
      <div className="h-3 bg-canvas-2 rounded w-1/2 mb-4" />
      <div className="h-3 bg-canvas-2 rounded w-1/3" />
    </div>
  );
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    getInstitutions()
      .then((data) => {
        setInstitutions(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.city?.toLowerCase().includes(search.toLowerCase()) ||
      i.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Hero strip ── */}
      <section className="bg-ink text-white py-14 px-6" aria-labelledby="institutions-heading">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Official uniform platform
          </motion.p>
          <motion.h1
            id="institutions-heading"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-6"
          >
            Find your institution
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative max-w-xl"
          >
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(244,246,250,0.45)" }}
              aria-hidden="true"
            />
            <label htmlFor="institution-search" className="sr-only">
              Search institutions by name, city or state
            </label>
            <input
              id="institution-search"
              type="search"
              placeholder="Search by name, city or state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3 rounded-lg font-mono text-sm bg-white/10 border border-white/20
                         text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30
                         transition-all duration-200"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* Error state */}
        {error && !loading && (
          <div className="stitch-card p-8 text-center mb-8" role="alert">
            <p className="font-display font-semibold mb-2">Could not load institutions</p>
            <p className="font-mono text-xs text-ink-muted mb-4">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => { setError(false); setLoading(true); getInstitutions().then(setInstitutions).catch(() => setError(true)).finally(() => setLoading(false)); }}
              className="btn-primary font-mono text-xs px-4 py-2"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          /* Skeleton grid */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            aria-label="Loading institutions"
            aria-busy="true"
          >
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="text-center py-24" role="status">
            <Building2 size={40} className="mx-auto text-ink-muted mb-4 opacity-50" aria-hidden="true" />
            <p className="font-display text-xl font-semibold mb-2">
              {search ? "No institutions match your search" : "No institutions yet"}
            </p>
            <p className="font-mono text-sm text-ink-muted">
              {search
                ? "Try a different search term"
                : "We are onboarding institutions soon. Check back shortly."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 font-mono text-xs text-brand-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : !error ? (
          <>
            <p
              className="font-mono text-xs text-ink-muted mb-6"
              role="status"
              aria-live="polite"
            >
              {filtered.length} institution{filtered.length !== 1 ? "s" : ""} found
            </p>

            <motion.div
              variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {filtered.map((inst, idx) => (
                <motion.div key={inst.id} variants={fadeUp}>
                  <Link
                    href={`/institutions/${inst.slug}`}
                    className="stitch-card p-5 flex flex-col group hover:shadow-md transition-shadow duration-200 h-full"
                    aria-label={`${inst.name}, ${inst.type} in ${[inst.city, inst.state].filter(Boolean).join(", ")}`}
                  >
                    {/* Banner / logo */}
                    <div
                      className="w-full h-32 rounded mb-4 flex items-center justify-center overflow-hidden relative bg-cover bg-center"
                      style={{ 
                        ...(inst.coverImageUrl 
                             ? { backgroundImage: `url(${inst.coverImageUrl})` } 
                             : { background: DEPT_COLORS[idx % DEPT_COLORS.length] + "18" }
                           ),
                        border: inst.coverImageUrl ? 'none' : `1px solid ${DEPT_COLORS[idx % DEPT_COLORS.length]}30` 
                      }}
                    >
                      {inst.coverImageUrl ? (
                        <div className="absolute inset-0 bg-black/5" />
                      ) : (
                        <span
                          className="font-display text-3xl font-bold opacity-50"
                          style={{ color: DEPT_COLORS[idx % DEPT_COLORS.length] }}
                          aria-hidden="true"
                        >
                          {inst.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <span className="badge badge-official mb-2 inline-block">
                        {TYPE_LABELS[inst.type]}
                      </span>
                      <p className="font-display font-semibold mb-1 group-hover:text-brand-600 transition-colors">
                        {inst.name}
                      </p>
                      {(inst.city || inst.state) && (
                        <p className="font-mono text-xs text-ink-muted flex items-center gap-1">
                          <MapPin size={10} aria-hidden="true" />
                          {[inst.city, inst.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-1 font-mono text-xs text-brand-600 group-hover:gap-2 transition-all">
                      Browse uniforms <ChevronRight size={12} aria-hidden="true" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : null}

        {/* Contact / onboarding CTA */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-12 stitch-card p-6 text-center"
          >
            <p className="eyebrow mb-2">More coming soon</p>
            <p className="font-display font-semibold text-ink">
              Is your institution not listed?
            </p>
            <p className="font-mono text-xs text-ink-muted mt-1 mb-4">
              We&apos;re onboarding new colleges every week. Contact us to get yours added.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}?text=Hi%2C%20I%27d%20like%20to%20add%20my%20institution%20to%20Stitzzy.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
            >
              <MessageCircle size={14} aria-hidden="true" />
              Contact us on WhatsApp
            </a>
          </motion.div>
        )}
      </section>
    </div>
  );
}
