import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Ruler,
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Order your institution's official uniform in four steps: find your institution, pick your department and size, review your cart, and confirm on WhatsApp for delivery.",
};

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Find your institution",
    body: "Search for your college or university and open its page. Everything listed is scoped to that institution — no sifting through a generic catalogue.",
  },
  {
    n: "02",
    icon: Ruler,
    title: "Pick your department and size",
    body: "Filter to your department and the exact uniform you need, then choose your size using the built-in size chart and full size guide.",
  },
  {
    n: "03",
    icon: ShoppingCart,
    title: "Review your cart and check out",
    body: "Add your items, review the sizes, quantities, and total, and enter your delivery address before you hand off — so nothing is missed.",
  },
  {
    n: "04",
    icon: MessageCircle,
    title: "Confirm on WhatsApp and get it delivered",
    body: "Checkout generates a formatted order message that opens in WhatsApp. Send it, our team confirms the details, and your uniform is delivered.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Institution verified",
    body: "Every product is checked against the official uniform code before it goes live.",
  },
  {
    icon: Ruler,
    title: "Size guide included",
    body: "Men's and women's charts for shirts, pants, and blazers to help you order the right fit.",
  },
  {
    icon: Truck,
    title: "Delivered to you",
    body: "Most orders are delivered within 3 to 5 working days after confirmation.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp confirmed",
    body: "A real person confirms your order and answers questions before anything ships.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            How it works
          </p>
          <h1
            id="how-it-works-heading"
            className="font-display text-3xl md:text-4xl font-semibold mb-4"
          >
            From your institution to your door
          </h1>
          <p
            className="font-sans text-sm md:text-base max-w-2xl"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            Ordering your official uniform takes four simple steps. No guesswork,
            no wrong fabric, no rejected order at the gate.
          </p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="stitch-card p-6 flex flex-col animate-reveal">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-sm tnum text-[var(--navy)] font-medium">
                    {step.n}
                  </span>
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--navy-100)] text-[var(--navy)]"
                    aria-hidden="true"
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold mb-2 text-ink">
                  {step.title}
                </h2>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Trust row ── */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <p className="eyebrow mb-6">Why students trust Stitzzy</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--navy-100)] text-[var(--navy)] mb-3"
                  aria-hidden="true"
                >
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-sm font-semibold mb-1.5 text-ink">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="stitch-card p-8 md:p-10 text-center bg-[var(--navy)]">
          <h2 className="font-display text-2xl font-semibold mb-2 text-white">
            Find your institution
          </h2>
          <p
            className="font-sans text-sm max-w-xl mx-auto mb-6"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            Browse verified institutions and order your official uniform today.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/institutions"
              className="inline-flex items-center gap-2 font-mono text-sm rounded-lg px-5 py-2.5 bg-white text-[var(--navy)] font-medium transition-opacity hover:opacity-90"
            >
              Browse institutions
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link
              href="/size-guide"
              className="inline-flex items-center gap-2 font-mono text-sm rounded-lg px-5 py-2.5 border border-white/25 text-white transition-colors hover:bg-white/10"
            >
              <Ruler size={16} strokeWidth={2} />
              View size guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
