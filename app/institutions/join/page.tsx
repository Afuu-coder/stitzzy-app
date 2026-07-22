"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2, CheckCircle2, ShieldCheck, Truck, Loader2, ArrowRight,
} from "lucide-react";

/* ── Value props ── */
const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Official & verified",
    body: "Only approved designs, fabrics and specifications go live — no counterfeits, no guesswork.",
  },
  {
    icon: Building2,
    title: "Your institution's own storefront",
    body: "A dedicated page with your departments, sizes and pricing, managed with your approval.",
  },
  {
    icon: Truck,
    title: "Delivered to students",
    body: "Students order online and receive uniforms directly — no queues, no stock-outs at the counter.",
  },
];

const ROLES = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "admin",   label: "Administration" },
];

const inputCls =
  "w-full px-4 py-3 rounded-lg border font-mono text-sm bg-white transition-all duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-400 " +
  "placeholder:text-ink-muted/50 border-ink/15";

function Field({
  label, htmlFor, error, optional, children,
}: {
  label: string; htmlFor: string; error?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">
        {label}{" "}
        {optional && <span className="text-ink-faint normal-case tracking-normal">(optional)</span>}
      </label>
      {children}
      {error && <p className="font-mono text-[11px] text-[var(--danger)] mt-1" role="alert">{error}</p>}
    </div>
  );
}

export default function InstitutionsJoinPage() {
  const shouldReduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    name: "", role: "student", institution: "", city: "", email: "", phone: "", message: "",
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (form.institution.trim().length < 2) next.institution = "Institution name is required.";
    if (form.city.trim().length < 2) next.city = "City is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = "Enter a valid 10-digit Indian mobile number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    setSubmitError("");

    try {
      // /api/subscribe accepts { email, source } today. We send those plus a
      // `meta` object carrying the full lead so no data is lost, without
      // breaking the existing contract.
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:  form.email.trim(),
          source: "institutions-join",
          meta: {
            name:        form.name.trim(),
            role:        form.role,
            institution: form.institution.trim(),
            city:        form.city.trim(),
            phone:       form.phone.trim(),
            message:     form.message.trim(),
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (err) {
      console.error("Institution lead submit failed:", err);
      setSubmitError("Something went wrong. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Navy hero strip ── */}
      <section className="bg-[var(--navy)] text-white py-14 px-6" aria-labelledby="join-heading">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Onboard your institution
          </motion.p>
          <motion.h1
            id="join-heading"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-3"
          >
            Get my college onboarded
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.1 }}
            className="font-mono text-sm max-w-xl"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            Bring official, verified uniforms online for your institution. Tell us a little about it and our team will reach out.
          </motion.p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-3xl mx-auto px-6 py-12">

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="stitch-card p-10 text-center flex flex-col items-center gap-4"
            role="status"
            aria-label="Request received"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--navy-100)" }}>
              <CheckCircle2 size={30} className="text-[var(--success)]" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Request received</h2>
            <p className="font-mono text-sm text-ink-muted max-w-md leading-relaxed">
              Thank you. Our team will review your institution and reach out on the email or phone you shared.
              Onboarding official uniforms usually takes a short call to confirm approved designs and departments.
            </p>
            <Link href="/institutions" className="btn-primary font-mono text-xs uppercase tracking-wide inline-flex items-center gap-2 mt-2">
              Browse institutions <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Benefits */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="eyebrow mb-2">Why Stitzzy</p>
                <h2 className="font-display text-xl font-semibold">
                  Official uniforms, online and verified
                </h2>
              </div>
              <ul className="space-y-5">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--navy-100)" }}>
                      <b.icon size={18} className="text-[var(--navy)]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1">{b.title}</h3>
                      <p className="font-mono text-xs text-ink-muted leading-relaxed">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="lg:col-span-3 stitch-card p-6 md:p-8 space-y-5" noValidate>
              <Field label="Your name" htmlFor="join-name" error={errors.name}>
                <input
                  id="join-name" type="text" autoComplete="name" className={inputCls}
                  placeholder="Full name"
                  value={form.name} onChange={(e) => update("name", e.target.value)}
                  aria-required="true"
                />
              </Field>

              <Field label="Your role" htmlFor="join-role">
                <select
                  id="join-role" className={inputCls}
                  value={form.role} onChange={(e) => update("role", e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="College / institution name" htmlFor="join-institution" error={errors.institution}>
                <input
                  id="join-institution" type="text" autoComplete="organization" className={inputCls}
                  placeholder="e.g. Dibrugarh University Institute of Engineering & Technology"
                  value={form.institution} onChange={(e) => update("institution", e.target.value)}
                  aria-required="true"
                />
              </Field>

              <Field label="City" htmlFor="join-city" error={errors.city}>
                <input
                  id="join-city" type="text" autoComplete="address-level2" className={inputCls}
                  placeholder="City"
                  value={form.city} onChange={(e) => update("city", e.target.value)}
                  aria-required="true"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" htmlFor="join-email" error={errors.email}>
                  <input
                    id="join-email" type="email" autoComplete="email" className={inputCls}
                    placeholder="you@example.com"
                    value={form.email} onChange={(e) => update("email", e.target.value)}
                    aria-required="true"
                  />
                </Field>
                <Field label="Phone" htmlFor="join-phone" error={errors.phone}>
                  <input
                    id="join-phone" type="tel" inputMode="numeric" autoComplete="tel" className={inputCls}
                    placeholder="10-digit mobile"
                    value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    aria-required="true"
                  />
                </Field>
              </div>

              <Field label="Message" htmlFor="join-message" optional>
                <textarea
                  id="join-message" rows={3} className={inputCls}
                  placeholder="Anything we should know — departments, student count, timelines…"
                  value={form.message} onChange={(e) => update("message", e.target.value)}
                />
              </Field>

              {submitError && (
                <p className="font-mono text-[11px] text-[var(--danger)]" role="alert">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="btn-primary font-mono text-xs uppercase tracking-wide inline-flex items-center gap-2 w-full justify-center py-3"
              >
                {sending ? (
                  <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Sending</>
                ) : (
                  <>Get my college onboarded <ArrowRight size={13} aria-hidden="true" /></>
                )}
              </button>

              <p className="font-mono text-[10px] text-ink-faint text-center leading-relaxed">
                We only use your details to onboard your institution and will not share them.
              </p>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
