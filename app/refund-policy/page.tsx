import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & return policy",
  description:
    "How size exchanges, defective items, and refunds work for official uniforms ordered through Stitzzy, including timelines and how to initiate a request.",
};

const LAST_UPDATED = "20 July 2026";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to request a return or size exchange for my Stitzzy order.",
)}`;

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="refund-heading"
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Policy
          </p>
          <h1
            id="refund-heading"
            className="font-display text-3xl md:text-4xl font-semibold"
          >
            Refund &amp; return policy
          </h1>
          <p
            className="font-mono text-xs mt-4"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Last updated {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-sans text-ink-muted leading-relaxed mb-12">
          Uniforms are made to institution specifications and to size, so this
          policy is written to be fair to students while keeping the process
          simple. Please read it before placing your order.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Return window
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              You may request a size exchange or report a defect within{" "}
              <span className="font-mono tabular-nums">7 days</span> of delivery.
              Requests made after this window may not be accepted, as uniforms are
              tied to a specific academic term.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Size exchanges
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              If a uniform does not fit, we will exchange it for a different size
              of the same item, subject to availability. The item must be unworn,
              unwashed, unaltered, and returned with all original tags. We
              recommend checking the size chart on each product page before
              ordering to reduce the need for exchanges.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Defective or incorrect items
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              If an item arrives defective, damaged, or different from what you
              ordered, we will replace it or issue a refund at no cost to you.
              Please report the issue within the return window and share photos so
              we can verify it quickly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Non-returnable conditions
            </h2>
            <ul className="font-sans text-ink-muted leading-relaxed space-y-2 list-disc pl-5">
              <li>Items that have been worn, washed, or used.</li>
              <li>Items that have been altered, tailored, or customised.</li>
              <li>Items returned without original tags or packaging.</li>
              <li>Requests made after the 7-day return window.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              How to initiate a request
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed mb-6">
              All returns and exchanges are handled over WhatsApp. Message us with
              your order ID and the reason for the request, and our team will guide
              you through the next steps.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
            >
              Start a return on WhatsApp
            </a>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Refund timelines
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              Where a refund is approved, it is processed once we receive and
              inspect the returned item. Approved refunds are typically completed
              within{" "}
              <span className="font-mono tabular-nums">7&ndash;10 business days</span>{" "}
              to your original payment method or an agreed alternative. For cash on
              delivery orders, we will arrange the refund method with you on
              WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Questions
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              If anything is unclear, our{" "}
              <Link
                href="/contact"
                className="text-[var(--navy)] underline underline-offset-2"
              >
                support team
              </Link>{" "}
              is happy to help before or after you order.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
