"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingBag, Eye, Edit2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

const STATUS_OPTIONS = [
  "pending",
  "whatsapp_sent",
  "confirmed",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "rejected",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status Update Modal State
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), limit(100));
      const snap = await getDocs(q);
      const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; createdAt?: string; [key: string]: unknown }));
      
      fetchedOrders.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      setOrders(fetchedOrders as never[]);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());

      toast.success(`Order ${editingOrder.trackingCode} updated to ${newStatus.replace("_", " ")}`);
      setEditingOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">Manage and track student uniform orders</p>
        </div>
      </div>

      <div className="stitch-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Orders">
            <thead>
              <tr className="border-b border-ink/5">
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Tracking Code</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Customer</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Amount</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Status</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Date</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">No orders found.</td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-ink/5 hover:bg-canvas-2 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-blue-600">{order.trackingCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-display font-medium text-ink text-sm">{order.customerName || "Unknown"}</p>
                      <p className="font-mono text-[10px] text-ink-muted mt-0.5">{order.institution || "Unknown Institution"}</p>
                    </td>
                    <td className="px-6 py-4 font-display font-semibold text-ink">₹{(order.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{
                              background: `${STATUS_COLORS[order.status || 'pending']}20`,
                              color: STATUS_COLORS[order.status || 'pending'],
                            }}>
                        {(order.status || "pending").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted">
                      {order.createdAt
                        ? (() => {
                            const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                            return <time dateTime={d.toISOString()}>{d.toLocaleDateString("en-IN")}</time>;
                          })()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/order/${order.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-ink-muted hover:text-blue-600 transition-colors"
                          aria-label={`View order ${order.trackingCode}`}
                        >
                          <Eye size={14} aria-hidden="true" />
                        </a>
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setNewStatus(order.status || "pending");
                          }}
                          className="p-1.5 text-ink-muted hover:text-green-600 transition-colors"
                          aria-label={`Update status of order ${order.trackingCode}`}
                        >
                          <Edit2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="stitch-card w-full max-w-sm overflow-hidden shadow-2xl p-0"
            >
              <div className="px-6 py-4 border-b border-ink/5 flex items-center justify-between bg-canvas">
                <h3 className="font-display font-semibold text-ink">Update Order Status</h3>
                <button onClick={() => setEditingOrder(null)} className="text-ink-muted hover:text-ink transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 bg-white">
                <p className="font-mono text-xs text-ink-muted mb-4">
                  Updating status for <strong className="text-ink">{editingOrder.trackingCode}</strong>
                </p>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">New Status</label>
                  <select 
                    required 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                       {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-ink/10 text-ink font-mono text-xs uppercase tracking-wide hover:bg-canvas-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating || newStatus === editingOrder.status}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-mono text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
