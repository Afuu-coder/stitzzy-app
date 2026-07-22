"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronRight, ShoppingBag, Ruler,
  ArrowLeft, Loader2, Sparkles, Star,
  Shield, Truck, MessageCircle, Package,
} from "lucide-react";
import { getProductById, getProductReviews } from "@/lib/firestore";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import type { Product, Review } from "@/types";

/* ── Static size chart (Stitzzy shirt/T-shirt chart — real measurements) ── */
const DEFAULT_SIZE_CHART = [
  { size: "XS",  chest: '36"', shoulder: '25"', length: '7"'   },
  { size: "S",   chest: '38"', shoulder: '26"', length: '7"'   },
  { size: "M",   chest: '40"', shoulder: '27"', length: '7.5"' },
  { size: "L",   chest: '42"', shoulder: '28"', length: '8"'   },
  { size: "XL",  chest: '44"', shoulder: '29"', length: '8.5"' },
  { size: "XXL", chest: '46"', shoulder: '30"', length: '9"'   },
];

const DEFAULT_SIZES = DEFAULT_SIZE_CHART.map((r) => r.size);

type Tab = "description" | "size-chart" | "reviews";

/* ── Star rating ── */
function Stars({
  rating, size = 14, label,
}: { rating: number; size?: number; label?: string }) {
  return (
    <div
      className="flex gap-0.5"
      style={{ color: "var(--brass)" }}
      aria-label={label ?? `${rating} out of 5 stars`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n} size={size}
          fill={n <= rating ? "currentColor" : "none"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ── Image gallery with hover-to-zoom + tap-to-zoom for touch ── */
function ImageGallery({ product }: { product: Product }) {
  const allUrls: string[] = product.images ?? [];
  const [active,    setActive]    = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos,   setZoomPos]   = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  /* Separate touch vs mouse — avoids double-fire on mobile */
  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => { setIsZooming(false); setZoomPos({ x: 50, y: 50 }); };
  const handleTouchToggle = (e: React.TouchEvent) => {
    // Only handle single-tap on touch; prevents conflict with scroll
    if (e.cancelable) e.preventDefault();
    setIsZooming((z) => !z);
    setZoomPos({ x: 50, y: 50 });
  };

  if (allUrls.length === 0) {
    return (
      <div
        className="aspect-square rounded-xl bg-canvas-2 flex flex-col items-center justify-center gap-3"
        aria-label="No product image available"
      >
        <Package size={40} className="text-ink-muted opacity-40" aria-hidden="true" />
        <p className="font-mono text-xs text-ink-muted">No image yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchToggle}
        className="aspect-square rounded-xl overflow-hidden bg-white relative cursor-crosshair"
        role="img"
        aria-label={`${product.title} — image ${active + 1} of ${allUrls.length}. ${isZooming ? "Zoomed in." : "Hover or tap to zoom."}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={allUrls[active]}
          alt={product.title}
          className={`w-full h-full object-contain transition-transform duration-200 ${
            isZooming ? "scale-[2.2]" : "scale-100"
          }`}
          style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          draggable={false}
        />
        {/* Zoom hint badge */}
        <div
          className={`absolute bottom-4 right-4 flex items-center gap-1.5 bg-ink/70 text-white
                      px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wide
                      backdrop-blur-sm transition-opacity duration-200 pointer-events-none
                      ${isZooming ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <Ruler size={12} />
          <span className="hidden sm:inline">Hover</span>
          <span className="sm:hidden">Tap</span>
          {" "}to zoom
        </div>
      </div>

      {/* Thumbnails */}
      {allUrls.length > 1 && (
        <div className="flex gap-2 flex-wrap" role="list" aria-label="Product images">
          {allUrls.map((url, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => { setActive(i); setIsZooming(false); }}
              aria-label={`View image ${i + 1}`}
              aria-pressed={active === i}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                active === i
                  ? "border-brand-600 ring-2 ring-brand-600/20"
                  : "border-ink/10 hover:border-ink/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ── */
export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id     = params.id;
  const router = useRouter();

  const [product,      setProduct]      = useState<Product | null>(null);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<Tab>("description");
  const [added,        setAdded]        = useState(false);
  const [showSmartSize, setShowSmartSize] = useState(false);
  const [hw, setHw] = useState({ height: "", weight: "" });
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [prod, revs] = await Promise.all([
          getProductById(id),
          getProductReviews(id),
        ]);
        if (!prod) { setNotFound(true); return; }
        setProduct(prod);
        setReviews(revs);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hw.height);
    const w = parseInt(hw.weight);
    if (!h || !w) return;
    let rec = "M";
    if (h < 160 || w < 50)      rec = "S";
    else if (h < 170 && w < 65) rec = "M";
    else if (h < 180 && w < 80) rec = "L";
    else if (h < 190 && w < 95) rec = "XL";
    else                         rec = "XXL";
    setRecommendedSize(rec);
    setSelectedSize(rec);
  };

  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAddToCart() {
    if (!product || !selectedSize) return;
    addItem({
      productId:   product.id,
      productName: product.title,
      size:        selectedSize,
      qty:         1,
      unitPrice:   product.price,
      imageUrl:    product.images?.[0],
      category:    product.category,
    });
    setAdded(true);
    toast.success(`${product.title} (${selectedSize}) added to cart`);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2500);

  }

  function handleOrderNow() {
    if (!product || !selectedSize) return;
    addItem({
      productId:   product.id,
      productName: product.title,
      size:        selectedSize,
      qty:         1,
      unitPrice:   product.price,
      imageUrl:    product.images?.[0],
      category:    product.category,
    });
    router.push("/checkout");
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center" aria-label="Loading product">
        <Loader2 size={32} className="animate-spin text-ink-muted" aria-hidden="true" />
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Package size={40} className="text-ink-muted opacity-40" aria-hidden="true" />
        <p className="font-display text-xl font-semibold">Product not found</p>
        <p className="font-mono text-xs text-ink-muted max-w-xs">
          This product may no longer be available. Browse your institution to find the right uniform.
        </p>
        <Link href="/institutions" className="btn-outline font-mono text-xs px-4 py-2.5 mt-2 inline-flex items-center gap-1.5">
          <ArrowLeft size={13} aria-hidden="true" />
          Browse institutions
        </Link>
      </div>
    );
  }

  const price      = product.price;
  const original   = product.mrp > product.price ? product.mrp : null;
  const avgRating  = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  /* Safe access for optional fields */
  const genderLabel = product.gender
    ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1)
    : "—";
  const tagsLabel = product.tags?.length ? product.tags.join(", ") : "—";

  // Dedupe size labels — duplicate rows would render duplicate size buttons
  // with the same key and trip React's unique-key warning.
  const sizes = product.sizes?.length
    ? [...new Set(product.sizes.map((s) => s.size))]
    : DEFAULT_SIZES;

  const TABS: { key: Tab; label: string }[] = [
    { key: "description", label: "Description"              },
    { key: "size-chart",  label: "Size chart"               },
    { key: "reviews",     label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── JSON-LD Product Schema (SEO rich snippet) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description ?? `Official uniform — ${product.category ?? "Uniform"}`,
            sku: product.sizes?.[0]?.sku ?? product.slug,
            brand: { "@type": "Brand", name: "Stitzzy" },
            image: product.images?.[0] ?? "",
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: price,
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "Stitzzy" },
            },
            ...(avgRating
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: avgRating.toFixed(1),
                    reviewCount: reviews.length,
                  },
                }
              : {}),
          }),
        }}
      />

      {/* ── Breadcrumb ── */}
      <nav
        className="border-b"
        style={{ borderColor: "rgba(20,22,27,0.08)" }}
        aria-label="Breadcrumb"
      >
        <ol className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 font-mono text-xs text-ink-muted flex-wrap">
          <li>
            <Link href="/institutions" className="hover:text-ink transition-colors flex items-center gap-1">
              <ArrowLeft size={12} aria-hidden="true" /> Institutions
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={11} /></li>
          <li>
            {product.institutionId ? (
              <Link href={`/institutions`} className="hover:text-ink transition-colors">
                Institution
              </Link>
            ) : (
              <span>Institution</span>
            )}
          </li>
          <li aria-hidden="true"><ChevronRight size={11} /></li>
          <li
            className="text-ink truncate max-w-[180px] sm:max-w-xs"
            aria-current="page"
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left: Image gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ImageGallery product={product} />
        </motion.div>

        {/* Right: Info + purchase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="flex flex-col gap-5"
        >
          {/* Official badge */}
          <span className="badge badge-official w-fit">
            Institution-verified · Official
          </span>

          {/* Product name + rating */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">
              {product.title}
            </h1>
            {avgRating && (
              <div className="flex items-center gap-2">
                <Stars
                  rating={Math.round(avgRating)}
                  label={`${avgRating.toFixed(1)} out of 5 stars from ${reviews.length} reviews`}
                />
                <span className="font-mono text-xs text-ink-muted">
                  {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3" aria-label={`Price: ₹${price.toLocaleString("en-IN")}`}>
            <span className="font-display text-3xl font-semibold text-brand-600">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {original && (
              <>
                <span className="font-mono text-sm text-ink-muted line-through" aria-label={`Original price: ₹${original.toLocaleString("en-IN")}`}>
                  ₹{original.toLocaleString("en-IN")}
                </span>
                <span className="font-mono text-xs text-success font-medium">
                  {Math.round(((original - price) / original) * 100)}% off
                </span>
              </>
            )}
          </div>

          <div className="h-px" style={{ background: "rgba(20,22,27,0.08)" }} aria-hidden="true" />

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p
                id="size-selector-label"
                className="font-mono text-xs uppercase tracking-widest text-ink-muted"
              >
                Select size
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSmartSize((s) => !s)}
                  className="font-mono text-xs text-brand-600 hover:underline flex items-center gap-1"
                  aria-expanded={showSmartSize}
                  aria-controls="smart-size-panel"
                >
                  <Sparkles size={11} aria-hidden="true" /> Find my size
                </button>
                <button
                  onClick={() => setActiveTab("size-chart")}
                  className="font-mono text-xs text-brand-600 hover:underline flex items-center gap-1"
                  aria-label="View size guide chart below"
                >
                  <Ruler size={11} aria-hidden="true" /> Size guide
                </button>
              </div>
            </div>

            {/* Smart size recommender */}
            <AnimatePresence>
              {showSmartSize && (
                <motion.div
                  id="smart-size-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-4 rounded-xl border bg-brand-50 border-brand-100">
                    <p className="font-display font-medium text-sm text-brand-900 mb-3">
                      ✨ Smart Sizing Assistant
                    </p>
                    <form onSubmit={calculateSize} className="flex flex-col sm:flex-row gap-2">
                      <label htmlFor="smart-height" className="sr-only">Height in centimetres</label>
                      <input
                        id="smart-height"
                        type="number" placeholder="Height (cm)" required
                        min={100} max={250}
                        value={hw.height}
                        onChange={(e) => setHw({ ...hw, height: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-brand-200 bg-white text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                      />
                      <label htmlFor="smart-weight" className="sr-only">Weight in kilograms</label>
                      <input
                        id="smart-weight"
                        type="number" placeholder="Weight (kg)" required
                        min={30} max={200}
                        value={hw.weight}
                        onChange={(e) => setHw({ ...hw, weight: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-brand-200 bg-white text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                      />
                      <button
                        type="submit"
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg font-mono text-xs
                                   uppercase tracking-wide hover:bg-brand-700 transition-colors whitespace-nowrap"
                      >
                        Calculate
                      </button>
                    </form>
                    {recommendedSize && (
                      <p className="mt-3 font-mono text-xs text-brand-700" role="status" aria-live="polite">
                        We recommend size <strong className="text-sm">{recommendedSize}</strong> for a perfect fit.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Size buttons */}
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-labelledby="size-selector-label"
            >
              {sizes.map((sz) => (
                <button
                  key={sz}
                  role="radio"
                  aria-checked={selectedSize === sz}
                  onClick={() => setSelectedSize(sz === selectedSize ? null : sz)}
                  className={`font-mono text-sm px-4 py-2 rounded-lg border-2 transition-all duration-150
                    ${selectedSize === sz
                      ? "bg-ink text-white border-ink scale-105"
                      : "border-ink/20 text-ink hover:border-ink/50"
                    }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              whileTap={selectedSize ? { scale: 0.97 } : {}}
              aria-label={
                selectedSize
                  ? `Add ${product.title} size ${selectedSize} to cart`
                  : "Select a size to add to cart"
              }
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-sm
                          uppercase tracking-wide transition-all duration-200 border
                ${selectedSize
                  ? added
                    ? "bg-success text-white border-success"
                    : "btn-outline"
                  : "bg-canvas-2 text-ink-muted border-transparent cursor-not-allowed opacity-60"
                }`}
            >
              {added ? (
                <><Check size={16} aria-hidden="true" /> Added!</>
              ) : (
                <><ShoppingBag size={16} aria-hidden="true" /> Add to cart</>
              )}
            </motion.button>

            <motion.button
              onClick={handleOrderNow}
              disabled={!selectedSize}
              whileTap={selectedSize ? { scale: 0.97 } : {}}
              aria-label={
                selectedSize
                  ? `Order ${product.title} size ${selectedSize} now`
                  : "Select a size to order now"
              }
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-sm
                          uppercase tracking-wide transition-all duration-200 border border-transparent
                ${selectedSize
                  ? "btn-primary bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg"
                  : "bg-canvas-2 text-ink-muted cursor-not-allowed opacity-60"
                }`}
            >
              Order Now <ChevronRight size={16} aria-hidden="true" />
            </motion.button>
          </div>

          {/* WhatsApp note */}
          <div
            className="flex items-start gap-3 rounded-lg p-4 bg-canvas-2"
            role="note"
          >
            <MessageCircle size={16} className="text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="font-mono text-xs text-ink-muted leading-relaxed">
              Orders are confirmed via WhatsApp. Once you add items and checkout,
              a pre-formatted message is sent to our team.
            </p>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-1" aria-label="Product guarantees">
            {[
              { icon: Shield, label: "Official uniform" },
              { icon: Ruler,  label: "Size guide"       },
              { icon: Truck,  label: "Order tracking"   },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center bg-canvas-2"
              >
                <Icon size={16} className="text-brand-600" aria-hidden="true" />
                <span className="font-mono text-[10px] text-ink-muted leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Product details"
          className="flex gap-0 border-b mb-8"
          style={{ borderColor: "rgba(20,22,27,0.1)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors
                ${activeTab === tab.key ? "text-ink" : "text-ink-muted hover:text-ink"}`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              role="tabpanel"
              id="panel-description"
              aria-labelledby="tab-description"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              <p className="text-base text-ink leading-relaxed mb-6">
                {product.description ?? "No description available for this product."}
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Fabric",  value: product.fabricDetails    || "—" },
                  { label: "Care",    value: product.careInstructions || "—" },
                  { label: "Gender",  value: genderLabel                     },
                  { label: "Tags",    value: tagsLabel                       },
                ].map(({ label, value }) => (
                  <div key={label} className="stitch-card p-4">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">{label}</dt>
                    <dd className="font-display font-medium text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}

          {activeTab === "size-chart" && (
            <motion.div
              key="size-chart"
              role="tabpanel"
              id="panel-size-chart"
              aria-labelledby="tab-size-chart"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >
              <p className="font-mono text-xs text-ink-muted mb-6 max-w-lg">
                All measurements are in inches. Measure your chest circumference and
                compare below for the best fit.
              </p>
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(20,22,27,0.1)" }}>
                <table className="w-full text-sm border-collapse" aria-label="Size chart">
                  <thead>
                    <tr className="bg-ink text-canvas">
                      {["Size", "Chest", "Length", "Sleeve"].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="font-mono text-xs uppercase tracking-widest px-5 py-3 text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_SIZE_CHART.map((row, i) => (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          selectedSize === row.size
                            ? "bg-brand-50"
                            : i % 2 === 0 ? "bg-white" : "bg-canvas"
                        }`}
                        style={{ borderBottom: "1px solid rgba(20,22,27,0.06)" }}
                        aria-selected={selectedSize === row.size}
                      >
                        <td className="font-mono font-semibold text-sm px-5 py-3 text-ink">
                          {row.size}
                          {selectedSize === row.size && (
                            <span className="ml-2 text-brand-600 text-[10px]" aria-label="Your selected size">
                              ← your size
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-xs px-5 py-3 text-ink-muted">{row.chest}</td>
                        <td className="font-mono text-xs px-5 py-3 text-ink-muted">{row.shoulder}</td>
                        <td className="font-mono text-xs px-5 py-3 text-ink-muted">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              role="tabpanel"
              id="panel-reviews"
              aria-labelledby="tab-reviews"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              {reviews.length === 0 ? (
                <div className="stitch-card p-10 text-center">
                  <Star size={28} className="mx-auto text-ink-muted mb-3 opacity-40" aria-hidden="true" />
                  <p className="font-display font-semibold mb-1">No reviews yet</p>
                  <p className="font-mono text-xs text-ink-muted">
                    Be the first to review this product after purchasing.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Rating summary */}
                  {avgRating && (
                    <div className="flex items-center gap-6 stitch-card p-5 mb-6">
                      <div className="text-center">
                        <p className="font-display text-4xl font-semibold text-ink" aria-label={`Average rating: ${avgRating.toFixed(1)}`}>
                          {avgRating.toFixed(1)}
                        </p>
                        <Stars rating={Math.round(avgRating)} />
                        <p className="font-mono text-[10px] text-ink-muted mt-1">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5" aria-label="Rating breakdown">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((r) => r.rating === star).length;
                          const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-ink-muted w-3">{star}</span>
                              <Star size={10} fill="currentColor" style={{ color: "var(--brass)" }} aria-hidden="true" />
                              <div className="flex-1 h-1.5 rounded-full bg-canvas-2 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${star} stars: ${count} reviews`}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, background: "var(--brass)" }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-ink-muted w-4">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Individual reviews */}
                  {reviews.map((review, i) => (
                    <motion.article
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="stitch-card p-5"
                      aria-label={`Review by ${review.userName}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-display font-semibold text-sm">{review.userName}</p>
                          <time
                            dateTime={review.createdAt}
                            className="font-mono text-[10px] text-ink-muted"
                          >
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </time>
                        </div>
                        <Stars rating={review.rating} size={12} label={`${review.rating} out of 5 stars`} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-ink-muted leading-relaxed">{review.comment}</p>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
