"use client";

import { useEffect, useId, useState } from "react";
import { useUser, useAuth, useClerk, SignOutButton } from "@clerk/nextjs";
import {
  Package, User as UserIcon, Ruler, Building2,
  ArrowRight, Loader2, Save, ShoppingBag,
  CheckCircle2, Truck, Clock, Home, X,
  ChevronDown, ChevronUp, Phone, MapPin,
  BookOpen, Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ── */
interface UserProfile {
  height:      string;
  weight:      string;
  institution: string;
  department:  string;
  phone:       string;
  address:     string;
  pincode:     string;
}

interface OrderItem {
  productName: string;
  size:        string;
  qty:         number;
  unitPrice:   number;
  imageUrl?:   string;
}

interface OrderSummary {
  id:           string;
  trackingCode: string;
  status:       string;
  totalAmount:  number;
  subTotal?:    number;
  discountAmount?: number;
  createdAt:    string;
  customerName: string;
  institution:  string;
  department:   string;
  address:      string;
  items:        OrderItem[];
}

/* ── Status config ── */
const STATUS_STEPS = [
  { id: "whatsapp_sent", label: "Sent",       icon: Package       },
  { id: "confirmed",     label: "Confirmed",  icon: CheckCircle2  },
  { id: "packed",        label: "Packed",     icon: ShoppingBag   },
  { id: "dispatched",    label: "Dispatched", icon: Truck         },
  { id: "delivered",     label: "Delivered",  icon: Home          },
];

const STATUS_INDEX: Record<string, number> = {
  pending: -1, whatsapp_sent: 0, confirmed: 1,
  packed: 2, dispatched: 3, delivered: 4,
  cancelled: -2, rejected: -2,
};

const STATUS_LABEL: Record<string, string> = {
  pending:       "Pending",
  whatsapp_sent: "Sent via WhatsApp",
  confirmed:     "Confirmed",
  packed:        "Packed & ready",
  dispatched:    "Out for delivery",
  delivered:     "Delivered",
  cancelled:     "Cancelled",
  rejected:      "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  delivered:     "bg-green-100 text-green-700",
  dispatched:    "bg-blue-100 text-blue-700",
  confirmed:     "bg-blue-50 text-blue-600",
  packed:        "bg-indigo-50 text-indigo-600",
  whatsapp_sent: "bg-amber-50 text-amber-700",
  pending:       "bg-canvas-2 text-ink-muted",
  cancelled:     "bg-red-50 text-red-600",
  rejected:      "bg-red-50 text-red-600",
};

/* ── Mini stepper ── */
function OrderStepper({ status }: { status: string }) {
  const idx = STATUS_INDEX[status] ?? -1;
  if (idx < -1) return null;
  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= idx;
        const current = i === idx;
        const Icon    = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                ${done
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-ink/15 text-ink-muted"
                }
                ${current ? "ring-4 ring-blue-500/20" : ""}
              `}
              title={step.label}
            >
              <Icon size={13} />
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-0.5 transition-all"
                style={{ background: i < idx ? "#3E63E0" : "rgba(18,32,58,0.1)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Single order card ── */
function OrderCard({ order }: { order: OrderSummary }) {
  const [expanded, setExpanded] = useState(false);
  const isCancelled = ["cancelled", "rejected"].includes(order.status);

  return (
    <motion.div
      layout
      className="border rounded-xl overflow-hidden transition-colors hover:border-ink/20"
      style={{ borderColor: "rgba(18,32,58,0.1)" }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "var(--canvas-2)" }}>
            <Package size={16} className="text-ink-muted" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-mono text-xs font-bold text-blue-600">
                #{order.trackingCode}
              </span>
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-canvas-2 text-ink"}`}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
            <p className="font-mono text-sm">
              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""} ·{" "}
              <span className="font-semibold">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
            </p>
            <time className="font-mono text-[10px] text-ink-muted">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </time>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/order/${order.trackingCode}`}
            onClick={e => e.stopPropagation()}
            className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Track <ArrowRight size={11} />
          </Link>
          {expanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 pb-5 pt-4 space-y-4" style={{ borderColor: "rgba(18,32,58,0.08)" }}>

              {/* Status stepper */}
              {!isCancelled && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2">Delivery progress</p>
                  <OrderStepper status={order.status} />
                  <div className="flex justify-between mt-1.5">
                    {STATUS_STEPS.map(s => (
                      <span key={s.id} className="font-mono text-[8px] text-ink-muted text-center" style={{ width: "20%" }}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {isCancelled && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
                  <X size={14} className="text-red-500" />
                  <p className="font-mono text-xs text-red-600">
                    This order was {order.status}. Contact WhatsApp support for help.
                  </p>
                </div>
              )}

              {/* Items list */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2.5">Items ordered</p>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-none" style={{ borderColor: "rgba(18,32,58,0.07)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-canvas-2 flex items-center justify-center flex-shrink-0">
                          {item.imageUrl
                            /* eslint-disable-next-line @next/next/no-img-element */
                            ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                            : <ShoppingBag size={13} className="text-ink-muted" />
                          }
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold">{item.productName}</p>
                          <p className="font-mono text-[10px] text-ink-muted">Size: {item.size} · Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-mono text-xs font-semibold">₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing + delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg p-3" style={{ background: "var(--canvas-2)" }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-1.5">
                    <MapPin size={11} /> Delivery address
                  </p>
                  <p className="font-mono text-xs leading-relaxed">{order.address || "—"}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "var(--canvas-2)" }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-1.5">
                    <BookOpen size={11} /> Academic info
                  </p>
                  <p className="font-mono text-xs">{order.institution}</p>
                  <p className="font-mono text-[10px] text-ink-muted">{order.department}</p>
                </div>
              </div>

              {/* Billing summary */}
              <div className="rounded-lg p-3" style={{ background: "var(--canvas-2)" }}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2">Billing</p>
                <div className="space-y-1">
                  {order.subTotal != null && (
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-ink-muted">Subtotal</span>
                      <span>₹{order.subTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between font-mono text-xs text-green-600">
                      <span>Discount</span>
                      <span>−₹{order.discountAmount!.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-mono text-sm font-semibold border-t pt-1.5 mt-1" style={{ borderColor: "rgba(18,32,58,0.1)" }}>
                    <span>Total</span>
                    <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────── Main page ─────────────────────── */
type Tab = "orders" | "profile" | "settings";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { userId }          = useAuth();
  const { openUserProfile } = useClerk();
  const router              = useRouter();
  const fieldId             = useId();

  const [tab,     setTab]     = useState<Tab>("orders");
  const [orders,  setOrders]  = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    height: "", weight: "", institution: "",
    department: "", phone: "", address: "", pincode: "",
  });

  /* Filter for active orders */
  const activeOrders    = orders.filter(o => !["delivered", "cancelled", "rejected"].includes(o.status));
  const completedOrders = orders.filter(o => ["delivered", "cancelled", "rejected"].includes(o.status));

  /* Total spent — exclude cancelled/rejected orders (mirrors admin revenue logic) */
  const totalSpent = orders
    .filter(o => !["cancelled", "rejected"].includes(o.status))
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) { router.push("/sign-in"); return; }

    (async () => {
      try {
        const res = await fetch("/api/account");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data.profile) setProfile(data.profile as UserProfile);
        setOrders((data.orders ?? []) as OrderSummary[]);
      } catch {
        toast.error("Could not load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, userId, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading ── */
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-ink-muted mx-auto mb-3" size={28} />
          <p className="font-mono text-xs text-ink-muted">Loading your account…</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg border font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-ink-muted/50 transition-all";
  const borderColor = "rgba(18,32,58,0.15)";

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--canvas)", color: "var(--ink)" }}>

      {/* ── Hero header ── */}
      <div style={{ background: "var(--ink)", color: "#fff" }} className="py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-display font-semibold flex-shrink-0">
              {user?.firstName?.[0] ?? "U"}
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--brass)" }}>My Account</p>
              <h1 className="font-display text-2xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(244,246,250,0.55)" }}>
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          {/* Quick stats */}
          <div className="flex gap-5">
            <div className="text-center">
              <p className="font-display text-2xl font-semibold">{orders.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "rgba(244,246,250,0.5)" }}>Orders</p>
            </div>
            <div className="w-px" style={{ background: "rgba(244,246,250,0.1)" }} />
            <div className="text-center">
              <p className="font-display text-2xl font-semibold">{activeOrders.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "rgba(244,246,250,0.5)" }}>Active</p>
            </div>
            <div className="w-px" style={{ background: "rgba(244,246,250,0.1)" }} />
            <div className="text-center">
              <p className="font-display text-2xl font-semibold">
                ₹{totalSpent.toLocaleString("en-IN")}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "rgba(244,246,250,0.5)" }}>Spent</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-5xl mx-auto mt-6 flex gap-1">
          {([
            { id: "orders",   label: "Orders",   icon: Package   },
            { id: "profile",  label: "Profile",  icon: UserIcon  },
            { id: "settings", label: "Settings", icon: Settings  },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-all
                ${tab === t.id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
            >
              <t.icon size={13} />
              {t.label}
              {t.id === "orders" && activeOrders.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ════ ORDERS TAB ════ */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {orders.length === 0 ? (
              <div className="text-center py-20 stitch-card">
                <Package size={40} className="mx-auto text-ink-muted opacity-30 mb-4" />
                <p className="font-display font-semibold text-lg mb-1">No orders yet</p>
                <p className="font-mono text-sm text-ink-muted mb-6 max-w-xs mx-auto">
                  You haven&apos;t placed any uniform orders yet. Browse institutions to get started.
                </p>
                <Link href="/institutions" className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg font-mono text-xs uppercase tracking-wide">
                  <ShoppingBag size={13} /> Browse uniforms
                </Link>
              </div>
            ) : (
              <>
                {/* Active orders */}
                {activeOrders.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className="font-display font-semibold text-lg">Active orders</h2>
                      <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                    </div>
                    <div className="space-y-3">
                      {activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                  </div>
                )}

                {/* Past orders */}
                {completedOrders.length > 0 && (
                  <div>
                    <h2 className="font-display font-semibold text-lg mb-4 text-ink-muted">Past orders</h2>
                    <div className="space-y-3">
                      {completedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ════ PROFILE TAB ════ */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Personal info */}
              <div className="stitch-card p-6 space-y-4">
                <h2 className="font-display font-semibold flex items-center gap-2">
                  <UserIcon size={16} /> Personal info
                </h2>
                <div>
                  <label htmlFor={`${fieldId}-phone`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      id={`${fieldId}-phone`}
                      type="tel"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className={inputCls + " pl-9"}
                      style={{ borderColor }}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${fieldId}-address`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Default address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-ink-muted" />
                    <textarea
                      id={`${fieldId}-address`}
                      value={profile.address}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      className={inputCls + " pl-9 resize-none"}
                      style={{ borderColor }}
                      placeholder="House/Flat, Street, Area"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${fieldId}-pincode`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Pincode</label>
                  <input
                    id={`${fieldId}-pincode`}
                    type="text"
                    value={profile.pincode}
                    onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                    className={inputCls}
                    style={{ borderColor }}
                    placeholder="786001"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Academic + sizing */}
              <div className="space-y-6">
                <div className="stitch-card p-6 space-y-4">
                  <h2 className="font-display font-semibold flex items-center gap-2">
                    <Building2 size={16} /> Academic details
                  </h2>
                  <div>
                    <label htmlFor={`${fieldId}-institution`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Institution</label>
                    <input
                      id={`${fieldId}-institution`}
                      type="text"
                      value={profile.institution}
                      onChange={e => setProfile({ ...profile, institution: e.target.value })}
                      className={inputCls}
                      style={{ borderColor }}
                      placeholder="Dibrugarh University"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-department`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Department / Course</label>
                    <input
                      id={`${fieldId}-department`}
                      type="text"
                      value={profile.department}
                      onChange={e => setProfile({ ...profile, department: e.target.value })}
                      className={inputCls}
                      style={{ borderColor }}
                      placeholder="B.Sc Computer Science"
                    />
                  </div>
                </div>

                <div className="stitch-card p-6 space-y-4">
                  <h2 className="font-display font-semibold flex items-center gap-2">
                    <Ruler size={16} /> Body measurements
                    <span className="font-mono text-[10px] text-ink-muted font-normal">(for size suggestions)</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${fieldId}-height`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Height (cm)</label>
                      <input
                        id={`${fieldId}-height`}
                        type="number"
                        value={profile.height}
                        onChange={e => setProfile({ ...profile, height: e.target.value })}
                        className={inputCls}
                        style={{ borderColor }}
                        placeholder="175"
                        min={100} max={250}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${fieldId}-weight`} className="block font-mono text-[10px] uppercase text-ink-muted mb-1.5">Weight (kg)</label>
                      <input
                        id={`${fieldId}-weight`}
                        type="number"
                        value={profile.weight}
                        onChange={e => setProfile({ ...profile, weight: e.target.value })}
                        className={inputCls}
                        style={{ borderColor }}
                        placeholder="70"
                        min={30} max={200}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button full width */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary py-3 rounded-xl font-mono text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  {saving
                    ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                    : <><Save size={14} /> Save profile</>
                  }
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ════ SETTINGS TAB ════ */}
        {tab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="stitch-card p-6 space-y-5 max-w-lg">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Settings size={16} /> Account settings
              </h2>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: "rgba(18,32,58,0.1)" }}>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold">Manage Clerk account</p>
                    <p className="font-mono text-[10px] text-ink-muted mt-0.5">Change email, password, connected accounts</p>
                  </div>
                  <button
                    onClick={() => openUserProfile()}
                    className="font-mono text-xs btn-primary px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    Manage <ArrowRight size={11} />
                  </button>
                </div>
                <div className="border-t p-4 flex items-center justify-between" style={{ borderColor: "rgba(18,32,58,0.1)" }}>
                  <div>
                    <p className="font-mono text-xs font-semibold">Sign out</p>
                    <p className="font-mono text-[10px] text-ink-muted mt-0.5">Sign out from this device</p>
                  </div>
                  <SignOutButton redirectUrl="/">
                    <button
                      className="font-mono text-xs border border-ink/20 px-3 py-1.5 rounded-lg hover:bg-canvas-2 transition-colors"
                    >
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
                <div className="border-t p-4 flex items-center justify-between" style={{ borderColor: "rgba(18,32,58,0.1)" }}>
                  <div>
                    <p className="font-mono text-xs font-semibold">WhatsApp support</p>
                    <p className="font-mono text-[10px] text-ink-muted mt-0.5">Need help? Chat with us directly</p>
                  </div>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors"
                  >
                    <Clock size={11} /> Chat
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
