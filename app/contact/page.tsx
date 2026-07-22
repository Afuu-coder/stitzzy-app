import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, Clock, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Reach Stitzzy support on WhatsApp for orders, sizing, exchanges, and institution enquiries. Calm, direct help from a real team.",
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I need help with Stitzzy.",
)}`;
const SUPPORT_EMAIL = "support@stitzzy.in";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Contact &amp; support
          </p>
          <h1
            id="contact-heading"
            className="font-display text-3xl md:text-4xl font-semibold"
          >
            We are here to help
          </h1>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-12">
          <section>
            <p className="font-sans text-ink-muted leading-relaxed">
              WhatsApp is the fastest way to reach us. Whether it is a question
              about sizing, an order confirmation, an exchange, or an institution
              enquiry, message us and a member of our team will get back to you.
            </p>
          </section>

          {/* Primary channel — WhatsApp */}
          <section className="stitch-card p-8">
            <div className="flex items-start gap-4">
              <span
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(37,211,102,0.12)" }}
                aria-hidden="true"
              >
                <MessageCircle size={18} strokeWidth={1.75} style={{ color: "#25D366" }} />
              </span>
              <div className="flex-1">
                <p className="eyebrow mb-1">Primary channel</p>
                <p className="font-display text-lg font-semibold text-ink mb-1">
                  WhatsApp
                </p>
                <p className="font-sans text-sm text-ink-muted leading-relaxed mb-4">
                  Orders are confirmed on WhatsApp, and it is where we answer
                  questions quickest. Tap below to start a chat.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  Message us on WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* Secondary channels */}
          <section className="grid sm:grid-cols-2 gap-5">
            <div className="stitch-card p-6">
              <Mail
                size={18}
                strokeWidth={1.75}
                className="text-[var(--navy)] mb-3"
                aria-hidden="true"
              />
              <p className="font-display font-semibold text-ink text-sm mb-1">
                Email
              </p>
              <p className="font-sans text-sm text-ink-muted leading-relaxed mb-2">
                For detailed queries or attachments.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-mono text-xs text-[var(--navy)] hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>

            <div className="stitch-card p-6">
              <Clock
                size={18}
                strokeWidth={1.75}
                className="text-[var(--navy)] mb-3"
                aria-hidden="true"
              />
              <p className="font-display font-semibold text-ink text-sm mb-1">
                Response time
              </p>
              <p className="font-sans text-sm text-ink-muted leading-relaxed">
                We usually reply within a few hours during working hours,
                Monday to Saturday, 10:00 to 18:00 IST.
              </p>
            </div>
          </section>

          {/* Institution enquiries */}
          <section className="stitch-card p-6">
            <Building2
              size={18}
              strokeWidth={1.75}
              className="text-[var(--navy)] mb-3"
              aria-hidden="true"
            />
            <p className="font-display font-semibold text-ink text-sm mb-1">
              Institution enquiries
            </p>
            <p className="font-sans text-sm text-ink-muted leading-relaxed">
              If you represent a college or school and would like your official
              uniform listed on Stitzzy, message us on WhatsApp or see the{" "}
              <Link href="/institutions" className="text-[var(--navy)] hover:underline">
                institutions page
              </Link>
              . You can also read more{" "}
              <Link href="/about" className="text-[var(--navy)] hover:underline">
                about how we work
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
