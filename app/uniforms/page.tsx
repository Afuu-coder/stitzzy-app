"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Package,
  ChevronDown, ShoppingBag, ArrowLeft,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/shared/product-card";
import type { Product, Institution } from "@/types";

/* ── Animation variants ── */
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const CATEGORIES = ["All", "Shirt", "Trouser", "Skirt", "Blazer", "Tie", "Belt", "Shoes", "Socks", "Other"];
const GENDERS    = ["All", "Male", "Female", "Unisex"];
const SORT_OPTIONS = [
  { label: "Name (A–Z)",     value: "name-asc" },
  { label: "Name (Z–A)",     value: "name-desc" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Newest First",   value: "newest" },
];

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="stitch-card p-5 animate-pulse">
      <div className="w-full h-48 rounded bg-canvas-2 mb-4" />
      <div className="h-4 bg-canvas-2 rounded w-3/4 mb-2" />
      <div className="h-3 bg-canvas-2 rounded w-1/3 mb-4" />
      <div className="h-5 bg-canvas-2 rounded w-1/2 mb-4" />
      <div className="flex gap-1.5 mb-4">
        {[...Array(4)].map((_, i) => <div key={i} className="w-10 h-8 bg-canvas-2 rounded" />)}
      </div>
      <div className="h-9 bg-canvas-2 rounded" />
    </div>
  );
}

/* ── Filter chip ── */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
        active
          ? "bg-ink text-white border-ink"
          : "border-ink/20 text-ink-muted hover:border-ink/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export default function UniformsPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading,      setLoading]      = useState(true);

  /* Filters */
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [gender,      setGender]      = useState("All");
  const [institution, setInstitution] = useState("All");
  const [sort,        setSort]        = useState("name-asc");
  const [showFilters, setShowFilters] = useState(false);

  /* Load all active products + institutions */
  useEffect(() => {
    async function load() {
      try {
        const [pSnap, iSnap] = await Promise.all([
          getDocs(query(collection(db, "products"), where("isActive", "==", true))),
          getDocs(query(collection(db, "institutions"), where("isActive", "==", true))),
        ]);
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        setInstitutions(iSnap.docs.map(d => ({ id: d.id, ...d.data() } as Institution)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter(p => p.category === category);
    if (gender   !== "All") list = list.filter(p => p.gender?.toLowerCase() === gender.toLowerCase());
    if (institution !== "All") list = list.filter(p => p.institutionId === institution);

    list.sort((a, b) => {
      switch (sort) {
        case "name-asc":   return a.name.localeCompare(b.name);
        case "name-desc":  return b.name.localeCompare(a.name);
        case "price-asc":  return (a.discountPrice ?? a.basePrice) - (b.discountPrice ?? b.basePrice);
        case "price-desc": return (b.discountPrice ?? b.basePrice) - (a.discountPrice ?? a.basePrice);
        default:           return 0;
      }
    });

    return list;
  }, [products, search, category, gender, institution, sort]);

  const activeFilterCount = [
    category !== "All",
    gender !== "All",
    institution !== "All",
    search.trim() !== "",
  ].filter(Boolean).length;

  function clearAllFilters() {
    setSearch("");
    setCategory("All");
    setGender("All");
    setInstitution("All");
    setSort("name-asc");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)", color: "var(--ink)" }}>

      {/* ── Page header ── */}
      <div style={{ background: "var(--ink)", color: "#fff" }} className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs mb-6 transition-opacity hover:opacity-70"
            style={{ color: "rgba(244,246,250,0.6)" }}
          >
            <ArrowLeft size={13} /> Back to home
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>
            All Uniforms
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            Browse every uniform
          </h1>
          <p className="font-mono text-sm" style={{ color: "rgba(244,246,250,0.6)", maxWidth: "52ch" }}>
            Filter by institution, category, or gender. Add to cart and check out via WhatsApp in minutes.
          </p>
          {/* Stats bar */}
          {!loading && (
            <p className="font-mono text-xs mt-4" style={{ color: "rgba(244,246,250,0.45)" }}>
              {filtered.length} of {products.length} uniforms
              {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Search + filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search uniforms, SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-ink-muted/50"
              style={{ borderColor: "rgba(18,32,58,0.15)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-xs uppercase tracking-wide transition-colors"
            style={{
              borderColor: "rgba(18,32,58,0.15)",
              background: showFilters ? "var(--ink)" : "#fff",
              color: showFilters ? "#fff" : "var(--ink)",
            }}
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              style={{ borderColor: "rgba(18,32,58,0.15)", color: "var(--ink)" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted" />
          </div>
        </div>

        {/* ── Expanded filters panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="stitch-card p-5 mb-6 space-y-4">
                {/* Category */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2.5">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                    ))}
                  </div>
                </div>
                {/* Gender */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2.5">Gender</p>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map(g => (
                      <Chip key={g} label={g} active={gender === g} onClick={() => setGender(g)} />
                    ))}
                  </div>
                </div>
                {/* Institution */}
                {institutions.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2.5">Institution</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip label="All" active={institution === "All"} onClick={() => setInstitution("All")} />
                      {institutions.map(i => (
                        <Chip key={i.id} label={i.name} active={institution === i.id} onClick={() => setInstitution(i.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Clear */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="font-mono text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 mt-1"
                  >
                    <X size={12} /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active filter chips (quick remove) ── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {search.trim() && (
              <span className="flex items-center gap-1 bg-ink/5 border border-ink/10 px-2.5 py-1 rounded-full font-mono text-xs">
                Search: {search}
                <button onClick={() => setSearch("")} className="ml-1 text-ink-muted hover:text-red-500"><X size={11} /></button>
              </span>
            )}
            {category !== "All" && (
              <span className="flex items-center gap-1 bg-ink/5 border border-ink/10 px-2.5 py-1 rounded-full font-mono text-xs">
                {category}
                <button onClick={() => setCategory("All")} className="ml-1 text-ink-muted hover:text-red-500"><X size={11} /></button>
              </span>
            )}
            {gender !== "All" && (
              <span className="flex items-center gap-1 bg-ink/5 border border-ink/10 px-2.5 py-1 rounded-full font-mono text-xs">
                {gender}
                <button onClick={() => setGender("All")} className="ml-1 text-ink-muted hover:text-red-500"><X size={11} /></button>
              </span>
            )}
            {institution !== "All" && (
              <span className="flex items-center gap-1 bg-ink/5 border border-ink/10 px-2.5 py-1 rounded-full font-mono text-xs">
                {institutions.find(i => i.id === institution)?.name || "Institution"}
                <button onClick={() => setInstitution("All")} className="ml-1 text-ink-muted hover:text-red-500"><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Products grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Package size={40} className="text-ink-muted opacity-30 mb-4" />
            <p className="font-display font-semibold text-lg mb-2">
              {products.length === 0 ? "No uniforms yet" : "No matching uniforms"}
            </p>
            <p className="font-mono text-xs text-ink-muted mb-6 max-w-xs">
              {products.length === 0
                ? "Your admin hasn't added any products yet. Check back soon!"
                : "Try adjusting your filters or search term."}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="font-mono text-xs btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <X size={13} /> Clear filters
              </button>
            )}
            {products.length === 0 && (
              <Link href="/institutions" className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1">
                Browse institutions
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filtered.map(p => (
              <motion.div key={p.id} variants={fadeUp}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && filtered.length > 0 && (
          <div className="mt-16 text-center">
            <p className="font-mono text-xs text-ink-muted mb-4">
              Looking for a specific institution&apos;s uniforms?
            </p>
            <Link
              href="/institutions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wide btn-primary"
            >
              <ShoppingBag size={13} /> Browse by institution
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
