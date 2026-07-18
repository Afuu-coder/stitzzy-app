"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { SizeChartModal } from "@/components/shared/size-chart-modal";
import type { Product } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = product.discountPrice ?? product.basePrice;
  const original = product.discountPrice ? product.basePrice : null;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigating if wrapped in a link accidentally
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      qty: 1,
      unitPrice: price,
      imageUrl: product.images?.[0]?.url || product.imageUrls?.[0],
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="stitch-card p-5 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      {/* Product image — links to detail page */}
      <Link href={`/products/${product.id}`} className="block" tabIndex={0}>
        <div className="w-full h-48 rounded mb-4 flex items-center justify-center overflow-hidden bg-canvas-2 relative group">
          {product.imageUrls?.[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted">
              <Package size={24} className="mb-2 opacity-40" aria-hidden="true" />
              <span className="font-mono text-[10px]">No image</span>
            </div>
          )}
          {/* Hover overlay */}
          <div
            className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors rounded
                       flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="bg-white/90 text-ink px-3 py-1 rounded-full font-mono text-[10px]
                             uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity
                             backdrop-blur-sm">
              Quick View
            </span>
          </div>
        </div>
      </Link>

      {/* Name */}
      <Link
        href={`/products/${product.id}`}
        className="hover:text-blue-600 transition-colors"
      >
        <p className="font-display font-semibold text-sm mb-0.5 line-clamp-1">{product.name}</p>
      </Link>
      <p className="font-mono text-[10px] text-ink-muted mb-3">SKU: {product.sku || "N/A"}</p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-lg font-semibold text-blue-600">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {original && (
          <span className="font-mono text-xs text-ink-muted line-through">
            ₹{original.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Size selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p
            id={`size-label-${product.id}`}
            className="font-mono text-[10px] uppercase tracking-widest text-ink-muted"
          >
            Select size
          </p>
          <button
            onClick={() => setIsSizeChartOpen(true)}
            className="font-mono text-[10px] text-blue-600 hover:underline"
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
          {(product.sizes?.length ? product.sizes : SIZES).map((sz) => (
            <button
              key={sz}
              role="radio"
              aria-checked={selectedSize === sz}
              onClick={() => setSelectedSize(sz)}
              className={`font-mono text-xs px-2.5 py-1 rounded border transition-all duration-150
                ${selectedSize === sz
                  ? "bg-ink text-white border-ink"
                  : "border-ink/20 text-ink hover:border-ink/60"
                }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!selectedSize}
        aria-label={selectedSize ? `Add ${product.name} size ${selectedSize} to cart` : `Select a size for ${product.name}`}
        className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded font-mono text-xs
                    uppercase tracking-wide transition-all duration-200
          ${selectedSize
            ? added
              ? "bg-green-600 text-white"
              : "btn-primary"
            : "bg-canvas-2 text-ink-muted cursor-not-allowed opacity-60"
          }`}
      >
        <ShoppingBag size={14} aria-hidden="true" />
        {added ? "Added ✓" : selectedSize ? "Add to cart" : "Select a size"}
      </button>

      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category || "Shirt"}
        gender={product.gender || "Unisex"}
      />
    </div>
  );
}
