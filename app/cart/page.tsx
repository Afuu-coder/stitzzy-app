"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  Package, ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/cart";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function CartPage() {
  const { items, removeItem, updateQty, totalAmount, subTotal, discountAmount, clearCart } = useCartStore();
  const sub = subTotal();
  const discount = discountAmount();
  const total = totalAmount();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <section className="bg-ink text-white py-10 px-6" aria-labelledby="cart-heading">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest mb-3"
             style={{ color: "rgba(244,246,250,0.5)" }}>
            Your selection
          </p>
          <h1 id="cart-heading" className="font-display text-3xl font-semibold flex items-center gap-3">
            <ShoppingBag size={28} aria-hidden="true" />
            Cart
            {items.length > 0 && (
              <span
                className="font-mono text-sm bg-white/10 px-3 py-1 rounded-full"
                aria-label={`${items.reduce((s, i) => s + i.qty, 0)} items in cart`}
              >
                {items.reduce((s, i) => s + i.qty, 0)} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="stitch-card p-16 text-center"
            role="status"
          >
            <Package size={48} className="mx-auto text-ink-muted mb-5 opacity-40" aria-hidden="true" />
            <p className="font-display text-xl font-semibold mb-2">Your cart is empty</p>
            <p className="font-mono text-sm text-ink-muted mb-8">
              Browse institutions and find your official uniform.
            </p>
            <Link
              href="/institutions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded btn-primary font-mono text-sm uppercase tracking-wide"
            >
              Find your institution <ArrowRight size={15} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Items list ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="font-mono text-xs uppercase tracking-widest text-ink-muted"
                  role="status"
                  aria-live="polite"
                >
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={clearCart}
                  className="font-mono text-xs text-ink-muted hover:text-danger transition-colors flex items-center gap-1"
                  aria-label="Remove all items from cart"
                >
                  <Trash2 size={11} aria-hidden="true" /> Clear all
                </button>
              </div>

              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    layout
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    className="stitch-card p-5 flex gap-4"
                  >
                    {/* Image / placeholder */}
                    <div
                      className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: "var(--canvas-2)" }}
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag size={22} className="text-ink-muted" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm truncate mb-1">
                        {item.productName}
                      </p>
                      <p className="font-mono text-xs text-ink-muted mb-3">
                        Size: <span className="text-ink font-medium">{item.size}</span>
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border rounded-lg overflow-hidden"
                             style={{ borderColor: "rgba(20,22,27,0.15)" }}>
                          <button
                            onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                            disabled={item.qty <= 1}
                            aria-label={`Decrease quantity of ${item.productName}`}
                            className="px-2.5 py-1.5 hover:bg-canvas-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={12} aria-hidden="true" />
                          </button>
                          <span
                            className="font-mono text-sm px-2 min-w-[2ch] text-center"
                            aria-label={`Quantity: ${item.qty}`}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                            aria-label={`Increase quantity of ${item.productName}`}
                            className="px-2.5 py-1.5 hover:bg-canvas-2 transition-colors"
                          >
                            <Plus size={12} aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-ink-muted hover:text-danger transition-colors p-1"
                          aria-label={`Remove ${item.productName} (size ${item.size}) from cart`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-semibold text-brand-600">
                        ₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}
                      </p>
                      {item.qty > 1 && (
                        <p className="font-mono text-[10px] text-ink-muted">
                          ₹{item.unitPrice.toLocaleString("en-IN")} each
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stitch-card p-6 sticky top-24"
              >
                <h2 className="font-display font-semibold text-lg mb-5">Order summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-mono text-xs text-ink-muted truncate max-w-[160px]">
                        {item.productName} × {item.qty} ({item.size})
                      </span>
                      <span className="font-mono text-xs text-ink flex-shrink-0 ml-2">
                        ₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px mb-5" style={{ background: "rgba(20,22,27,0.08)" }} />

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="font-mono text-xs text-ink-muted">Subtotal</span>
                    <span className="font-mono text-ink">₹{sub.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-baseline text-sm text-success">
                      <span className="font-mono text-xs">Combo Discount</span>
                      <span className="font-mono font-medium">-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline mb-6 pt-4 border-t border-ink/10">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">Total</span>
                  <span className="font-display text-2xl font-semibold text-brand-600">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                             btn-primary font-mono text-sm uppercase tracking-wide"
                >
                  Proceed to checkout <ChevronRight size={15} />
                </Link>

                <p className="font-mono text-[10px] text-ink-muted text-center mt-4 leading-relaxed">
                  Order confirmed via WhatsApp — no card required
                </p>
              </motion.div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
