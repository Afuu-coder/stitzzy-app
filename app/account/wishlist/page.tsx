"use client";

import { useWishlistStore } from "@/store/wishlist";
import { Heart, ShoppingBag, Trash2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`Removed "${productName}" from wishlist`);
  };

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold mb-1">My wishlist</h1>
          <p className="font-mono text-sm text-ink-muted">
            Items you&apos;ve saved — tap a product to pick your size and add to cart.
          </p>
        </header>

        {items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="stitch-card p-16 flex flex-col items-center justify-center text-center"
            role="status"
          >
            <div className="w-16 h-16 bg-canvas-2 rounded-full flex items-center justify-center mb-4 text-ink-muted">
              <Heart size={28} aria-hidden="true" />
            </div>
            <h2 className="font-display font-semibold text-lg mb-2">Your wishlist is empty</h2>
            <p className="font-mono text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
              Save items you like while browsing and they will appear here.
            </p>
            <Link
              href="/institutions"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-wide"
            >
              Browse institutions <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </motion.div>
        ) : (
          /* ── Wishlist grid ── */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            role="list"
            aria-label="Wishlist items"
          >
            <AnimatePresence>
              {items.map((product, i) => {
                const imageUrl =
                  product.images?.[0]
                    ? typeof product.images[0] === "string"
                      ? product.images[0]
                      : (product.images[0] as { url?: string }).url ?? ""
                    : product.imageUrls?.[0] ?? "";

                return (
                  <motion.div
                    key={product.id}
                    layout
                    role="listitem"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="stitch-card flex flex-col overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-canvas-2 overflow-hidden">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={product.name ?? "Product image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted gap-2">
                          <Package size={28} className="opacity-30" aria-hidden="true" />
                          <span className="font-mono text-[10px] opacity-40">No image</span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id, product.name ?? "Item")}
                        aria-label={`Remove ${product.name ?? "item"} from wishlist`}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full
                                   flex items-center justify-center text-red-500 hover:bg-red-500
                                   hover:text-white transition-colors shadow-sm"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">
                        {product.category ?? "Uniform"}
                      </p>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-display font-semibold text-sm hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug"
                      >
                        {product.name ?? "Unknown product"}
                      </Link>
                      <p className="font-mono text-sm text-blue-600 font-medium mb-4">
                        ₹{(product.discountPrice ?? product.basePrice)?.toLocaleString("en-IN")}
                        {product.discountPrice && product.basePrice && (
                          <span className="line-through text-ink-muted ml-2 text-xs">
                            ₹{product.basePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </p>

                      {/* CTA — go to product page to pick size properly */}
                      <div className="mt-auto pt-3 border-t" style={{ borderColor: "rgba(18,32,58,0.07)" }}>
                        <Link
                          href={`/products/${product.id}`}
                          className="w-full btn-primary py-2 text-xs font-mono uppercase tracking-wide
                                     flex items-center justify-center gap-2"
                          aria-label={`View ${product.name} and select size`}
                        >
                          <ShoppingBag size={14} aria-hidden="true" />
                          Select size &amp; add to cart
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
