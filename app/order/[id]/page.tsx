"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Package, Clock, CheckCircle2, Truck, Home,
  AlertTriangle, ArrowLeft, Loader2, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Types ── */
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

/* ── Status steps ── */
const STATUS_STEPS = [
  { id: "pending",       label: "Pending",    icon: Clock         },
  { id: "whatsapp_sent", label: "Order Sent", icon: Package       },
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

export default function OrderTrackingPage() {
  const params        = useParams();
  const trackingCode  = params.id as string;

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!trackingCode) return;
    (async () => {
      try {
        const q    = query(collection(db, "orders"), where("trackingCode", "==", trackingCode));
        const snap = await getDocs(q);
        if (snap.empty) {
          setError("Order not found");
        } else {
          setOrder({ id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Order, "id">) });
        }
      } catch {
        setError("Could not load order details. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [trackingCode]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center" aria-label="Loading order details">
        <Loader2 size={28} className="animate-spin text-ink-muted" aria-hidden="true" />
      </div>
    );
  }

  /* ── Error / not found ── */
  if (error || !order) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertTriangle size={32} className="text-red-500 opacity-80" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">Order not found</h1>
        <p className="font-mono text-sm text-ink-muted max-w-xs">
          {error || `We couldn't find an order with tracking code: ${trackingCode}`}
        </p>
        <Link
          href="/"
          className="btn-outline font-mono text-xs px-4 py-2.5 mt-2 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} aria-hidden="true" /> Back to home
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status);
  const isCancelled      = order.status === "cancelled" || order.status === "rejected";

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back link */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to home
          </Link>
        </nav>

        <h1 className="font-display text-3xl font-semibold mb-1">Order tracking</h1>
        <p className="font-mono text-sm text-ink-muted mb-8">
          Tracking code:{" "}
          <span className="font-medium text-ink" aria-label={`Tracking code: ${order.trackingCode}`}>
            {order.trackingCode}
          </span>
        </p>

        {/* ── Cancelled / Rejected ── */}
        {isCancelled ? (
          <div
            className="stitch-card p-6 mb-8"
            style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.2)" }}
            role="alert"
          >
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle size={20} aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold">
                Order {order.status === "cancelled" ? "Cancelled" : "Rejected"}
              </h2>
            </div>
            <p className="font-mono text-sm text-red-600/80 mb-4">
              This order cannot be fulfilled. If you believe this is an error, please contact us.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "91XXXXXXXXXX"}?text=Hi%2C+my+order+${order.trackingCode}+was+cancelled.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
            >
              <MessageCircle size={13} aria-hidden="true" /> Contact support
            </a>
          </div>
        ) : (
          /* ── Status timeline ── */
          <div className="stitch-card p-8 mb-8">
            <h2 className="font-display text-xl font-semibold mb-8">
              Status:{" "}
              <span className="text-blue-600">
                {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, " ")}
              </span>
            </h2>
            <div className="relative" role="list" aria-label="Order progress">
              {/* Vertical connector */}
              <div
                className="absolute left-6 top-0 bottom-0 w-px"
                style={{ background: "rgba(18,32,58,0.1)" }}
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isCompleted ? 1 : 0.35, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="relative flex gap-6"
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 transition-colors ${
                          isCompleted
                            ? isCurrent
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-600"
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
                          <p className="font-mono text-xs text-blue-600 mt-1">
                            Current status
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Order info grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Items */}
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
                  <p className="font-mono text-sm font-medium">
                    ₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center font-semibold">
                <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">Total</span>
                <span className="font-display text-lg text-blue-600">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Customer info */}
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

      </div>
    </div>
  );
}
