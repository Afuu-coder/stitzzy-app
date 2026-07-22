"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Package, Clock, CheckCircle2, Truck, Home,
  AlertTriangle, Search, Loader2, MessageCircle, ArrowRight,
} from "lucide-react";

/* ── Types (matches /api/orders shape) ── */
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

/* ── Status steps (reused from /order/[id]) ── */
const STATUS_STEPS = [
  { id: "pending",       label: "Pending",    icon: Clock         },
  { id: "whatsapp_sent", label: "Order sent", icon: Package       },
  { id: "confirmed",     label: "Confirmed",  icon: CheckCircle2  },
  { id: "packed",        label: "Packed",     icon: Package       },
  { id: "dispatched",    label: "Dispatched", icon: Truck         },
  { id: "delivered",     label: "Delivered",  icon: Home          },
];

const STATUS_LABEL: Record<string, string> = {
  pending:       "Pending confirmation",
  whatsapp_sent: "Order sent via WhatsApp",
  confirmed:     "Confirmed by team",
  packed:        "Packed & ready to ship",
  dispatched:    "Out for delivery",
  delivered:     "Delivered",
  cancelled:     "Cancelled",
  rejected:      "Rejected",
};

const inputCls =
  "w-full px-4 py-3 rounded-lg border font-mono text-sm bg-white transition-all duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-400 " +
  "placeholder:text-ink-muted/50 border-ink/15";

export default function TrackOrderPage() {
  const shouldReduceMotion = useReducedMotion();

  const [code,    setCode]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter your order or tracking code to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?trackingCode=${encodeURIComponent(trimmed)}`);
      if (res.status === 404) {
        setError(`We couldn't find an order with tracking code: ${trimmed}`);
      } else if (!res.ok) {
        setError("Could not load order details. Check your connection and try again.");
      } else {
        const data = (await res.json()) as Order;
        // Optional phone verification — only enforced when the caller supplies one.
        const entered = phone.trim().replace(/\D/g, "");
        if (entered && data.customerPhone) {
          const onFile = data.customerPhone.replace(/\D/g, "");
          if (!onFile.endsWith(entered) && !entered.endsWith(onFile)) {
            setError("The phone number does not match this order. Check and try again.");
            return;
          }
        }
        setOrder(data);
      }
    } catch {
      setError("Could not load order details. Check your connection and try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.id === order.status) : -1;
  const isCancelled = order ? order.status === "cancelled" || order.status === "rejected" : false;

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Navy hero strip ── */}
      <section className="bg-[var(--navy)] text-white py-14 px-6" aria-labelledby="track-heading">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Order status
          </motion.p>
          <motion.h1
            id="track-heading"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-3"
          >
            Track your order
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.1 }}
            className="font-mono text-sm max-w-xl"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            No login needed. Enter the tracking code from your order confirmation to see its current status.
          </motion.p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-3xl mx-auto px-6 py-12">

        {/* Lookup form */}
        <form onSubmit={onSubmit} className="stitch-card p-6 md:p-8 mb-8" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="tracking-code"
                className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5"
              >
                Order / tracking code
              </label>
              <input
                id="tracking-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="STZ-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputCls}
                aria-required="true"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="tracking-phone"
                className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5"
              >
                Phone number <span className="text-ink-faint normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="tracking-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Last 10 digits of your mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {error && (
            <p className="font-mono text-[11px] text-[var(--danger)] mb-4" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary font-mono text-xs uppercase tracking-wide inline-flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Looking up</>
            ) : (
              <><Search size={14} aria-hidden="true" /> Track order</>
            )}
          </button>
        </form>

        {/* Not found (no order, searched, has error) */}
        {searched && !order && error && (
          <div className="stitch-card p-8 text-center flex flex-col items-center gap-3" role="status">
            <AlertTriangle size={28} className="text-[var(--danger)] opacity-80" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold">Order not found</h2>
            <p className="font-mono text-sm text-ink-muted max-w-sm">{error}</p>
            <p className="font-mono text-xs text-ink-faint max-w-sm">
              New orders can take a moment to appear. Double-check the code, or contact us on WhatsApp if you need help.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp font-mono text-xs px-4 py-2.5 inline-flex items-center gap-1.5 mt-1"
            >
              <MessageCircle size={13} aria-hidden="true" /> Contact support
            </a>
          </div>
        )}

        {/* ── Result ── */}
        {order && (
          <div>
            <p className="font-mono text-sm text-ink-muted mb-8">
              Tracking code:{" "}
              <span className="font-medium text-ink tabular-nums" aria-label={`Tracking code: ${order.trackingCode}`}>
                {order.trackingCode}
              </span>
            </p>

            {isCancelled ? (
              <div
                className="stitch-card p-6 mb-8"
                style={{ background: "#FEF2F2", border: "1px solid rgba(178,58,58,0.2)" }}
                role="alert"
              >
                <div className="flex items-center gap-3 text-[var(--danger)] mb-2">
                  <AlertTriangle size={20} aria-hidden="true" />
                  <h2 className="font-display text-xl font-semibold">
                    Order {order.status === "cancelled" ? "cancelled" : "rejected"}
                  </h2>
                </div>
                <p className="font-mono text-sm text-[var(--danger)] opacity-80 mb-4">
                  This order cannot be fulfilled. If you believe this is an error, please contact us.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}?text=Hi%2C+my+order+${order.trackingCode}+was+cancelled.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
                >
                  <MessageCircle size={13} aria-hidden="true" /> Contact support
                </a>
              </div>
            ) : (
              <div className="stitch-card p-8 mb-8">
                <h2 className="font-display text-xl font-semibold mb-8">
                  Status:{" "}
                  <span className="text-brand-600">
                    {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, " ")}
                  </span>
                </h2>
                <div className="relative" role="list" aria-label="Order progress">
                  <div
                    className="absolute left-6 top-0 bottom-0 w-px"
                    style={{ background: "rgba(20,22,27,0.1)" }}
                    aria-hidden="true"
                  />
                  <div className="space-y-8">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = currentStepIndex >= index;
                      const isCurrent   = currentStepIndex === index;
                      return (
                        <motion.div
                          key={step.id}
                          role="listitem"
                          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                          animate={{ opacity: isCompleted ? 1 : 0.35, x: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : index * 0.06 }}
                          className="relative flex gap-6"
                          aria-current={isCurrent ? "step" : undefined}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 transition-colors ${
                              isCompleted
                                ? isCurrent
                                  ? "bg-brand-600 text-white"
                                  : "bg-brand-100 text-brand-600"
                                : "bg-white border border-ink/20 text-ink-muted"
                            }`}
                            aria-hidden="true"
                          >
                            <step.icon size={20} />
                          </div>
                          <div className="pt-3">
                            <h3 className={`font-display font-semibold ${isCompleted ? "text-ink" : "text-ink-muted"}`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <p className="font-mono text-xs text-brand-600 mt-1">Current status</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stitch-card p-6">
                <h2 className="font-display font-semibold text-lg mb-4">Order details</h2>
                <div className="space-y-4" role="list" aria-label="Ordered items">
                  {order.items?.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      role="listitem"
                      className="flex justify-between items-center pb-4 border-b border-ink/5 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-display font-medium text-sm">{item.productName}</p>
                        <p className="font-mono text-xs text-ink-muted">
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
                    <span className="font-display text-lg text-brand-600 tabular-nums">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="stitch-card p-6">
                <h2 className="font-display font-semibold text-lg mb-4">Customer info</h2>
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
                  {order.notes && (
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">Notes</dt>
                      <dd className="text-ink-muted">{order.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Full detail link */}
            <div className="mt-8">
              <Link
                href={`/order/${encodeURIComponent(order.trackingCode)}`}
                className="btn-outline font-mono text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
              >
                View full order page <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
