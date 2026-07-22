"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2, Package, MapPin, Clock, MessageCircle,
  ArrowRight, AlertTriangle, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/* ── Types (match app/order/[id]/page.tsx data shape) ── */
interface OrderItem {
  productId:   string;
  productName: string;
  size:        string;
  qty:         number;
  unitPrice:   number;
}

interface Order {
  id:             string;
  trackingCode:   string;
  customerName:   string;
  customerPhone?: string;
  institution:    string;
  department:     string;
  status:         string;
  totalAmount:    number;
  address:        string;
  notes?:         string;
  createdAt:      string;
  items:          OrderItem[];
}

export default function OrderConfirmationPage() {
  const params       = useParams();
  const trackingCode = params.id as string;
  const reduce       = useReducedMotion();

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!trackingCode) return;
    (async () => {
      try {
        const res = await fetch(`/api/orders?trackingCode=${encodeURIComponent(trackingCode)}`);
        if (res.status === 404) {
          setError("Order not found");
        } else if (!res.ok) {
          setError("Could not load your order. Check your connection and try again.");
        } else {
          setOrder((await res.json()) as Order);
        }
      } catch {
        setError("Could not load your order. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [trackingCode]);

  /* WhatsApp deep link — number is a public env var, never a secret */
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waLink   = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi, I'd like to confirm my Stitzzy order ${trackingCode}.`
  )}`;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas" aria-label="Loading your confirmation" aria-busy="true">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="h-16 w-16 rounded-full bg-canvas-2 animate-pulse mx-auto mb-6" />
          <div className="h-8 w-64 bg-canvas-2 rounded animate-pulse mx-auto mb-3" />
          <div className="h-4 w-48 bg-canvas-2 rounded animate-pulse mx-auto mb-10" />
          <div className="stitch-card p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-4 bg-canvas-2 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (error || !order) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertTriangle size={32} style={{ color: "var(--danger)" }} aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">Order not found</h1>
        <p className="font-mono text-sm text-ink-muted max-w-xs">
          {error || `We couldn't find an order with tracking code: ${trackingCode}`}
        </p>
        <p className="font-mono text-xs text-ink-muted max-w-xs">
          It may take a moment for new orders to appear. Try refreshing in a few seconds, or contact support on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary font-mono text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
          >
            Refresh page
          </button>
          <Link
            href="/"
            className="btn-outline font-mono text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Navy hero strip ── */}
      <section className="bg-[var(--navy)] text-white py-14 px-6" aria-labelledby="confirmation-heading">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <CheckCircle2 size={34} style={{ color: "var(--success)" }} aria-hidden="true" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Order received
          </motion.p>
          <motion.h1
            id="confirmation-heading"
            initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-3"
          >
            Thank you, your order is placed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1 }}
            className="font-mono text-sm"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            Tracking code:{" "}
            <span className="font-medium text-white tabular-nums">{order.trackingCode}</span>
          </motion.p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-3xl mx-auto px-6 py-12">

        {/* Reassurance */}
        <div
          className="stitch-card p-5 mb-8 flex items-start gap-3"
          style={{ background: "var(--navy-100)" }}
        >
          <MessageCircle size={18} className="text-[var(--navy)] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="font-mono text-sm text-ink leading-relaxed">
            Our team will confirm your order on WhatsApp shortly. Please keep an eye on your messages
            for delivery details and confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Item summary */}
          <div className="stitch-card p-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Package size={18} className="text-[var(--navy)]" aria-hidden="true" /> Order summary
            </h2>
            <div className="space-y-4" role="list" aria-label="Ordered items">
              {order.items?.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  role="listitem"
                  className="flex justify-between items-center pb-4 border-b border-[var(--border-hairline)] last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-display font-medium text-sm">{item.productName}</p>
                    <p className="font-mono text-xs text-ink-muted tabular-nums">
                      Size: {item.size} × {item.qty}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-medium tabular-nums">
                    ₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center font-semibold">
                <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">Total</span>
                <span className="font-display text-lg text-[var(--navy)] tabular-nums">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery + timeline */}
          <div className="stitch-card p-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[var(--navy)]" aria-hidden="true" /> Delivery
            </h2>
            <dl className="space-y-3 font-mono text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">Name</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">Institution</dt>
                <dd>{order.institution} · {order.department}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">Delivery address</dt>
                <dd className="whitespace-pre-line leading-relaxed text-ink-muted">{order.address}</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] flex items-center gap-2">
              <Clock size={15} className="text-ink-muted shrink-0" aria-hidden="true" />
              <p className="font-mono text-xs text-ink-muted">
                Expected delivery: <span className="text-ink font-medium">3–5 business days</span> after confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/order/${order.trackingCode}`}
            className="btn-primary font-mono text-sm px-5 py-3 inline-flex items-center justify-center gap-2 flex-1"
          >
            Track your order <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp font-mono text-sm px-5 py-3 inline-flex items-center justify-center gap-2 flex-1"
          >
            <MessageCircle size={15} aria-hidden="true" /> Chat on WhatsApp
          </a>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Back to home
          </Link>
        </div>

      </section>
    </div>
  );
}
