"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, ChevronRight, ArrowLeft, Check,
  User, Phone, MapPin, BookOpen, Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { generateWhatsAppLink } from "@/lib/whatsapp";

/* ── Zod schema ─────────────────────────────────────────── */
const schema = z.object({
  fullName:    z.string().min(2,  "Name must be at least 2 characters"),
  phone:       z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine: z.string().min(5,  "Address is required"),
  city:        z.string().min(2,  "City is required"),
  state:       z.string().min(2,  "State is required"),
  pincode:     z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  institution: z.string().min(2,  "Institution is required"),
  department:  z.string().min(2,  "Department is required"),
  semester:    z.string().transform((v) => parseInt(v, 10)).pipe(z.number().int().min(1).max(10)),
  gender:      z.enum(["male", "female", "unisex"]),
  notes:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

/* ── Step config ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Personal details",   icon: User      },
  { id: 2, label: "Delivery address",   icon: MapPin    },
  { id: 3, label: "Academic details",   icon: BookOpen  },
  { id: 4, label: "Review & send",      icon: MessageCircle },
];

/* ── Field component — auto-associates label with input ── */
function Field({
  label, error, htmlFor, children,
}: {
  label: string; error?: string; htmlFor?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="font-mono text-[11px] text-red-500 mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}

/* ── Input styles ────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-3 rounded-lg border font-mono text-sm bg-white transition-all duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-400 " +
  "placeholder:text-ink-muted/50";

const errorBorder = "border-red-400";
const normalBorder = "border-ink/15";

/* ── Page ───────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { items, totalAmount, subTotal, discountAmount, clearCart } = useCartStore();
  const total    = totalAmount();
  const sub      = subTotal();
  const discount = discountAmount();
  const [step,   setStep]   = useState(1);
  const [sending, setSending] = useState(false);
  const [done,   setDone]   = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const fieldId = useId();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as never });

  /* fields validated per step */
  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    1: ["fullName", "phone"],
    2: ["addressLine", "city", "state", "pincode"],
    3: ["institution", "department", "semester", "gender"],
  };

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step] as (keyof FormData)[]);
    if (valid) setStep((s) => Math.min(s + 1, 4));
  }

  async function onSubmit(data: FormData) {
    if (items.length === 0) return;
    setSending(true);

    const code = `STZ-${Date.now().toString(36).toUpperCase()}`;
    const address = `${data.addressLine}, ${data.city}, ${data.state} — ${data.pincode}`;

    const link = generateWhatsAppLink({
      trackingCode: code,
      customerName:  data.fullName,
      customerPhone: `+91 ${data.phone}`,
      institution:   data.institution,
      department:    data.department,
      semester:      data.semester,
      gender:        data.gender,
      items,
      subTotal:      sub,
      discountAmount: discount,
      totalAmount:   total,
      address,
      notes:         data.notes,
    });

    // Open WhatsApp BEFORE the async Firestore write to avoid popup blocking on mobile
    window.open(link, "_blank");

    let orderSaved = true;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCode: code,
          customerName: data.fullName,
          customerPhone: `+91 ${data.phone}`,
          institution: data.institution,
          department: data.department,
          subTotal: sub,
          discountAmount: discount,
          totalAmount: total,
          address,
          notes: data.notes || "",
          items: items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            size: i.size,
            qty: i.qty,
            unitPrice: i.unitPrice,
            imageUrl: i.imageUrl ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Order save failed:", err);
      orderSaved = false;
    }

    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setDone(true);
    setTrackingCode(orderSaved ? code : "");
    clearCart();
  }

  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-xl font-semibold">Your cart is empty</p>
        <p className="font-mono text-xs text-ink-muted">Add uniform items to your cart before checking out.</p>
        <Link
          href="/institutions"
          className="font-mono text-xs text-brand-600 hover:underline flex items-center gap-1 mt-2"
        >
          Browse uniforms
        </Link>
      </div>
    );
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="stitch-card p-10 max-w-md w-full text-center"
          role="status"
          aria-label="Order successfully sent"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-success" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-3">Order sent!</h1>
          <p className="font-mono text-sm text-ink-muted mb-6 leading-relaxed">
            WhatsApp opened with your pre-filled order. Once our team confirms,
            you&apos;ll receive a reply with your delivery details.
          </p>
          <div className="space-y-3">
            {trackingCode ? (
              <Link
                href={`/order/${trackingCode}`}
                className="block w-full py-3 rounded-xl btn-primary font-mono text-sm uppercase tracking-wide text-center"
              >
                Track your order
              </Link>
            ) : (
              <p className="font-mono text-xs text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
                Order sent via WhatsApp but tracking could not be saved.
                Please contact support if you need tracking info.
              </p>
            )}
            <Link
              href="/"
              className="block w-full py-3 rounded-xl border border-ink/10 font-mono text-sm uppercase tracking-wide text-ink hover:bg-canvas-2 transition-colors text-center"
            >
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const values = getValues();

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Header ── */}
      <section className="bg-ink text-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 font-mono text-xs mb-5 hover:opacity-70 transition-opacity"
              style={{ color: "rgba(244,246,250,0.5)" }}
              aria-label="Go to previous step"
            >
              <ArrowLeft size={13} aria-hidden="true" /> Back
            </button>
          ) : (
            <Link
              href="/cart"
              className="flex items-center gap-1.5 font-mono text-xs mb-5 hover:opacity-70 transition-opacity"
              style={{ color: "rgba(244,246,250,0.5)" }}
            >
              <ArrowLeft size={13} aria-hidden="true" /> Return to cart
            </Link>
          )}
          <h1 className="font-display text-3xl font-semibold mb-6">Checkout</h1>

          {/* Step progress */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center gap-2 ${active ? "opacity-100" : done ? "opacity-80" : "opacity-35"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                      ${done ? "bg-green-500" : active ? "bg-white" : "bg-white/20"}`}
                    >
                      {done
                        ? <Check size={13} className="text-white" />
                        : <s.icon size={13} className={active ? "text-ink" : "text-white"} />
                      }
                    </div>
                    <span className="hidden sm:block font-mono text-[10px] uppercase tracking-widest">
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-6 sm:w-12 h-px mx-2 sm:mx-3"
                         style={{ background: "rgba(244,246,250,0.2)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">

            {/* Step 1: Personal details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <h2 className="font-display text-xl font-semibold mb-6">Personal details</h2>

                <Field label="Full name" error={errors.fullName?.message} htmlFor={`${fieldId}-fullName`}>
                  <input
                    id={`${fieldId}-fullName`}
                    {...register("fullName")}
                    placeholder="Priya Sharma"
                    autoComplete="name"
                    className={`${inputCls} ${errors.fullName ? errorBorder : normalBorder}`}
                  />
                </Field>

                <Field label="Mobile number" error={errors.phone?.message} htmlFor={`${fieldId}-phone`}>
                  <div className="flex">
                    <span className={`flex items-center px-3 rounded-l-lg border-y border-l font-mono text-sm bg-canvas-2 text-ink-muted ${normalBorder}`}>
                      +91
                    </span>
                    <input
                      id={`${fieldId}-phone`}
                      {...register("phone")}
                      placeholder="9876543210"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className={`${inputCls} rounded-l-none ${errors.phone ? errorBorder : normalBorder}`}
                    />
                  </div>
                </Field>
              </motion.div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <h2 className="font-display text-xl font-semibold mb-6">Delivery address</h2>

                <Field label="Address" error={errors.addressLine?.message} htmlFor={`${fieldId}-address`}>
                  <input
                    id={`${fieldId}-address`}
                    {...register("addressLine")}
                    placeholder="Hostel C, Block 2, Room 14"
                    autoComplete="street-address"
                    className={`${inputCls} ${errors.addressLine ? errorBorder : normalBorder}`}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" error={errors.city?.message} htmlFor={`${fieldId}-city`}>
                    <input
                      id={`${fieldId}-city`}
                      {...register("city")}
                      placeholder="Dibrugarh"
                      autoComplete="address-level2"
                      className={`${inputCls} ${errors.city ? errorBorder : normalBorder}`}
                    />
                  </Field>
                  <Field label="State" error={errors.state?.message} htmlFor={`${fieldId}-state`}>
                    <input
                      id={`${fieldId}-state`}
                      {...register("state")}
                      placeholder="Assam"
                      autoComplete="address-level1"
                      className={`${inputCls} ${errors.state ? errorBorder : normalBorder}`}
                    />
                  </Field>
                </div>

                <Field label="Pincode" error={errors.pincode?.message} htmlFor={`${fieldId}-pincode`}>
                  <input
                    id={`${fieldId}-pincode`}
                    {...register("pincode")}
                    placeholder="786004"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={`${inputCls} ${errors.pincode ? errorBorder : normalBorder}`}
                  />
                </Field>
              </motion.div>
            )}

            {/* Step 3: Academic details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <h2 className="font-display text-xl font-semibold mb-6">Academic details</h2>

                <Field label="Institution" error={errors.institution?.message}>
                  <input
                    {...register("institution")}
                    placeholder="Dibrugarh University"
                    className={`${inputCls} ${errors.institution ? errorBorder : normalBorder}`}
                  />
                </Field>

                <Field label="Department" error={errors.department?.message}>
                  <input
                    {...register("department")}
                    placeholder="B.Sc — Science"
                    className={`${inputCls} ${errors.department ? errorBorder : normalBorder}`}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Semester" error={errors.semester?.message}>
                    <select
                      {...register("semester")}
                      className={`${inputCls} ${errors.semester ? errorBorder : normalBorder}`}
                    >
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <option key={n} value={n}>Semester {n}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Gender" error={errors.gender?.message}>
                    <select
                      {...register("gender")}
                      className={`${inputCls} ${errors.gender ? errorBorder : normalBorder}`}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </Field>
                </div>

                <Field label="Delivery notes (optional)">
                  <textarea
                    {...register("notes")}
                    placeholder="Any special delivery instructions…"
                    rows={3}
                    className={`${inputCls} resize-none ${normalBorder}`}
                  />
                </Field>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-xl font-semibold mb-6">Review your order</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Customer & address */}
                  <div className="stitch-card p-5 space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Customer</p>
                    <p className="font-display font-semibold">{values.fullName}</p>
                    <p className="font-mono text-sm text-ink-muted">+91 {values.phone}</p>
                    <div className="h-px" style={{ background: "rgba(20,22,27,0.07)" }} />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Delivery</p>
                    <p className="font-mono text-sm text-ink">
                      {values.addressLine}<br />
                      {values.city}, {values.state} — {values.pincode}
                    </p>
                  </div>

                  {/* Academic */}
                  <div className="stitch-card p-5 space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Academic</p>
                    <p className="font-display font-semibold">{values.institution}</p>
                    <p className="font-mono text-sm text-ink-muted">
                      {values.department} · Sem {values.semester} · {values.gender}
                    </p>
                    {values.notes && (
                      <>
                        <div className="h-px" style={{ background: "rgba(20,22,27,0.07)" }} />
                        <p className="font-mono text-xs text-ink-muted">📝 {values.notes}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="stitch-card p-5 mb-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-4">Items</p>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-display font-semibold text-sm">{item.productName}</p>
                          <p className="font-mono text-xs text-ink-muted">
                            {item.qty}× · Size {item.size}
                          </p>
                        </div>
                        <p className="font-display font-semibold text-brand-600">
                          ₹{(item.unitPrice * item.qty).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="h-px my-4" style={{ background: "rgba(20,22,27,0.08)" }} />
                  
                  <div className="space-y-2 mb-4">
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

                  <div className="flex justify-between items-baseline pt-4 border-t border-ink/10">
                    <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">Total</span>
                    <span className="font-display text-xl font-semibold text-brand-600">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div
                  className="rounded-xl p-4 mb-6 flex items-start gap-3"
                  style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
                >
                  <MessageCircle size={18} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="font-mono text-xs text-green-800 leading-relaxed">
                    Clicking <strong>Send on WhatsApp</strong> will open WhatsApp with
                    your full order pre-filled. No payment is taken — our team will
                    confirm and share payment details.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Navigation buttons ── */}
          <div className="flex gap-3 mt-8">
            {step < 4 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                           btn-primary font-mono text-sm uppercase tracking-wide"
              >
                Continue <ChevronRight size={15} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={sending}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                           font-mono text-sm uppercase tracking-wide transition-all
                           bg-success hover:bg-green-700 text-white disabled:opacity-60"
              >
                {sending ? (
                  <><Loader2 size={16} className="animate-spin" /> Preparing…</>
                ) : (
                  <><MessageCircle size={16} /> Send on WhatsApp</>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
