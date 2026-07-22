"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Building2, Users, Package,
  TrendingUp, AlertTriangle, Clock, CheckCircle2,
} from "lucide-react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="stitch-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{label}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
             style={{ background: `${color}15` }} aria-hidden="true">
          <Icon size={16} style={{ color }} aria-hidden="true" />
        </div>
      </div>
      <p className="font-display text-3xl font-semibold text-ink" aria-label={`${label}: ${value}`}>{value}</p>
      {sub && <p className="font-mono text-[11px] text-ink-muted">{sub}</p>}
    </motion.div>
  );
}

/* ── Recent order row ────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  pending:       "#B8892E",
  whatsapp_sent: "#3E63E0",
  confirmed:     "#2E8B57",
  packed:        "#7C3AED",
  dispatched:    "#0891B2",
  delivered:     "#16A34A",
  cancelled:     "#C1502E",
  rejected:      "#DC2626",
};

/* ── Page ───────────────────────────────────────────────── */
export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    orders: 0, revenue: 0, institutions: 0, products: 0,
  });

  useEffect(() => {
    Promise.allSettled([
      // Orders go through the Admin SDK route (Firestore rules deny client reads)
      fetch("/api/admin/orders").then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        const data = (await r.json()) as { orders: Array<Record<string, unknown>> };
        return data.orders ?? [];
      }),
      getDocs(query(collection(db, "institutions"), where("isActive", "==", true))),
      getDocs(query(collection(db, "products"), where("isActive", "==", true))),
    ]).then(([ordersRes, instsRes, prodsRes]) => {
      const orders = ordersRes.status === "fulfilled" ? ordersRes.value : [];
      const insts  = instsRes.status  === "fulfilled" ? instsRes.value.docs  : [];
      const prods  = prodsRes.status  === "fulfilled" ? prodsRes.value.docs  : [];

      // Exclude cancelled/rejected orders from revenue
      const EXCLUDED = ["cancelled", "rejected"];
      const revenue = orders
        .filter((o) => !EXCLUDED.includes(o.status as string))
        .reduce((sum, o) => sum + ((o.totalAmount as number) ?? 0), 0);

      setRecentOrders(orders.slice(0, 5));

      setStats({
        orders: orders.length,
        revenue,
        institutions: insts.length,
        products: prods.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const stagger = { show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-1">
          Welcome back
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Stitzzy Admin Dashboard
        </h1>
      </div>

      {/* Stats grid */}
      <motion.div
        initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10"
      >
        <StatCard label="Total orders"    value={stats.orders}       icon={ShoppingBag} color="#3E63E0" sub="All time" />
        <StatCard label="Revenue"         value={`₹${stats.revenue.toLocaleString("en-IN")}`} icon={TrendingUp} color="#2E8B57" sub="All time (WhatsApp orders)" />
        <StatCard label="Institutions"    value={stats.institutions}  icon={Building2}   color="#B8892E" sub="Active" />
        <StatCard label="Products listed" value={stats.products}      icon={Package}     color="#7C3AED" sub="Active SKUs" />
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/admin/orders",       icon: Clock,         color: "#B8892E", label: "Pending orders",    sub: "Review & confirm"     },
          { href: "/admin/products",     icon: AlertTriangle, color: "#C1502E", label: "Manage products",   sub: "Add / edit uniforms"   },
          { href: "/admin/institutions", icon: CheckCircle2,  color: "#2E8B57", label: "Institutions",      sub: "Add new campuses"      },
        ].map(({ href, icon: Icon, color, label, sub }) => (
          <Link
            key={href} href={href}
            className="stitch-card p-5 flex items-center gap-4 group transition-all duration-150 hover:bg-canvas-2"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-ink">{label}</p>
              <p className="font-mono text-[11px] text-ink-muted">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="stitch-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="font-mono text-xs text-blue-600 hover:text-blue-700 transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Recent orders">
            <thead>
              <tr className="border-b border-ink/5">
                {["Tracking", "Customer", "Institution", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">Loading...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">No recent orders.</td>
                </tr>
              ) : (
                recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-ink/5 hover:bg-canvas-2 transition-colors last:border-0"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-blue-600">{order.trackingCode}</td>
                    <td className="px-6 py-3.5 font-display font-medium text-ink text-sm">{order.customerName}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink-muted">{order.institution}</td>
                    <td className="px-6 py-3.5 font-display font-semibold text-ink">
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{
                              background: `${STATUS_COLORS[order.status || 'pending']}20`,
                              color: STATUS_COLORS[order.status || 'pending'],
                            }}>
                        {(order.status || "pending").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink-muted">
                      {order.createdAt
                        ? (() => {
                            const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                            return <time dateTime={d.toISOString()}>{d.toLocaleDateString("en-IN")}</time>;
                          })()
                        : "N/A"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
