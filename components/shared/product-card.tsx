"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Package, Heart, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { SizeChartModal } from "@/components/shared/size-chart-modal";
import type { Product } from "@/types";

const FALLBACK_SIZES = ["S", "M", "L", "XL"];

export function ProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = product.price;
  const original = product.mrp > product.price ? product.mrp : null;
  const discountPct =
    product.discountPercent ??
    (original ? Math.round(((original - price) / original) * 100) : null);

  // The product detail route (/products/[id]) resolves via getProductById — a
  // Firestore *document ID* lookup — so always link by id, never slug, or the
  // page 404s for any product that has a slug set.
  const href = `/products/${product.id}`;

  // Size objects carry their own stock — drive the selector and stock chips.
  const sizeRows = product.sizes?.length ? product.sizes : null;
  // Dedupe: a product may carry multiple rows for the same size label, which
  // would render duplicate <button key={sz}> and trip React's unique-key warning.
  const sizes = sizeRows
    ? [...new Set(sizeRows.map((s) => s.size))]
    : FALLBACK_SIZES;
  const stockBySize: Record<string, number> | null = sizeRows
    ? Object.fromEntries(sizeRows.map((s) => [s.size, s.stock]))
    : null;

  const thumbnail = product.images?.[0];

  // Total stock across known sizes — drives the "N left" badge.
  const knownStock = stockBySize
    ? Object.values(stockBySize).reduce((a, b) => a + b, 0)
    : null;
  const lowStock = knownStock != null && knownStock > 0 && knownStock <= 3;

  const tag = [product.institutionName, product.departmentName]
    .filter(Boolean)
    .join(" · ");

  function isOut(sz: string) {
    return stockBySize ? (stockBySize[sz] ?? 0) <= 0 : false;
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      productName: product.title,
      size: selectedSize,
      qty: 1,
      unitPrice: price,
      imageUrl: thumbnail,
      category: product.category,
    });
    setAdded(true);
    toast.success(`Added to cart · ${product.title} (${selectedSize})`);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <motion.div
      className="stitch-card flex flex-col h-full overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Image (3:4) ── */}
      <div className="relative">
        <Link href={href} className="block group" tabIndex={0}>
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-canvas-2">
            {thumbnail ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={thumbnail}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-ink-faint">
                <Package size={28} className="mb-2 opacity-40" aria-hidden="true" />
                <span className="font-mono text-[10px]">No image</span>
              </div>
            )}
          </div>
        </Link>

        {/* Top-left badges: verified (gold) / low-stock */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isVerified && (
            <span className="badge badge-verified">
              <ShieldCheck size={11} aria-hidden="true" />
              Verified
            </span>
          )}
          {lowStock && (
            <span
              className="badge"
              style={{ background: "var(--gold-100)", color: "var(--gold)" }}
            >
              {knownStock} left
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => {
            setWished((w) => !w);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                     bg-white/90 backdrop-blur-sm border border-[var(--border-hairline)]
                     transition-colors hover:bg-white"
        >
          <Heart
            size={16}
            className={wished ? "text-danger" : "text-ink-muted"}
            fill={wished ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {tag && (
          <p className="font-mono text-[11px] text-ink-muted mb-1.5 line-clamp-1">
            {tag}
          </p>
        )}

        <Link href={href} className="transition-colors hover:text-[var(--navy)]">
          <h3 className="font-display font-semibold text-[15px] leading-snug mb-2 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1.5 tnum">
          <span className="font-display text-lg font-semibold text-ink">
            ₹{price?.toLocaleString("en-IN") ?? 0}
          </span>
          {original && (
            <span className="font-mono text-xs text-ink-faint line-through">
              ₹{original.toLocaleString("en-IN")}
            </span>
          )}
          {discountPct != null && (
            <span className="font-mono text-xs font-medium text-success">
              {discountPct}% off
            </span>
          )}
        </div>

        {/* Rating */}
        {product.ratingAvg != null && product.ratingCount != null && (
          <div className="flex items-center gap-1.5 mb-3 tnum">
            <Star size={13} className="text-brass" fill="currentColor" aria-hidden="true" />
            <span className="font-mono text-xs text-ink">
              {product.ratingAvg.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-ink-faint">
              ({product.ratingCount})
            </span>
          </div>
        )}

        {/* Size selector */}
        <div className="mb-4 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <p
              id={`size-label-${product.id}`}
              className="font-mono text-[10px] uppercase tracking-widest text-ink-muted"
            >
              Select size
            </p>
            <button
              onClick={() => setIsSizeChartOpen(true)}
              className="font-mono text-[10px] text-[var(--navy)] hover:underline"
              aria-label="Open size chart"
            >
              Size chart
            </button>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-labelledby={`size-label-${product.id}`}
          >
            {sizes.map((sz) => {
              const out = isOut(sz);
              const active = selectedSize === sz;
              return (
                <button
                  key={sz}
                  role="radio"
                  aria-checked={active}
                  disabled={out}
                  onClick={() => !out && setSelectedSize(sz)}
                  className={`font-mono text-xs w-9 h-9 rounded-md border transition-all duration-150 tnum
                    ${
                      out
                        ? "border-[var(--border-hairline)] text-ink-faint line-through cursor-not-allowed opacity-50"
                        : active
                        ? "border-[var(--navy)] bg-[var(--navy-100)] text-[var(--navy)] font-semibold"
                        : "border-[var(--border-hairline)] text-ink hover:border-[rgba(27,42,74,0.5)]"
                    }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={!selectedSize}
          aria-label={
            selectedSize
              ? `Add ${product.title} size ${selectedSize} to cart`
              : `Select a size for ${product.title}`
          }
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
            ${
              !selectedSize
                ? "bg-canvas-2 text-ink-faint cursor-not-allowed"
                : added
                ? "bg-success text-white"
                : "btn-primary"
            }`}
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category || "Shirt"}
        gender={product.gender === "women" ? "women" : "men"}
      />
    </motion.div>
  );
}
