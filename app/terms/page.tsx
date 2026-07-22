import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that govern your use of Stitzzy and orders for official institution uniforms placed through the platform.",
};

const LAST_UPDATED = "20 July 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="terms-heading"
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Legal
          </p>
          <h1
            id="terms-heading"
            className="font-display text-3xl md:text-4xl font-semibold"
          >
            Terms of service
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
        <div className="stitch-card p-5 mb-12">
          <p className="eyebrow mb-2">Template notice</p>
          <p className="font-sans text-sm text-ink-muted leading-relaxed">
            This document is a working template provided for reference. It should
            be reviewed and adapted by qualified legal counsel before it is
            relied upon as your published terms of service.
          </p>
        </div>

        <p className="font-sans text-ink-muted leading-relaxed mb-12">
          These terms govern your access to and use of Stitzzy (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;) and any order you place for official,
          institution-verified uniforms. Please read them carefully.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Acceptance of terms
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              By using the platform or placing an order, you agree to these terms.
              If you do not agree, please do not use the platform. We may update
              these terms from time to time, and continued use after an update
              means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Eligibility
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              The platform is intended for students of verified institutions and
              their guardians. If you are below the age of majority, you should
              use the platform under the supervision of a parent or guardian who
              accepts these terms on your behalf. You are responsible for
              providing accurate institution, department, and semester details so
              we can fulfil the correct approved uniform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Orders via WhatsApp
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              You browse and assemble your uniform on the platform, then confirm
              your order over WhatsApp. An order is only accepted once we confirm
              it with you on WhatsApp. We may decline or cancel an order if
              details cannot be verified, an item is unavailable, or we suspect
              misuse.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Pricing and payment
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              Prices are shown in Indian Rupees and are confirmed at the time your
              order is accepted on WhatsApp. Payment is collected as cash on
              delivery or through the method agreed during WhatsApp confirmation.
              We make reasonable efforts to keep prices accurate, but if a pricing
              error is found before your order is confirmed, we will inform you and
              you may choose to proceed or cancel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Delivery
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              We deliver to the address you provide during order confirmation.
              Delivery timelines are estimates and may vary with location and
              availability. Please ensure the delivery address and contact number
              are correct, as we are not responsible for delays caused by
              incorrect details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Returns and exchanges
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              Uniforms are sized items, so returns and size exchanges follow the
              conditions set out in our{" "}
              <Link
                href="/refund-policy"
                className="text-[var(--navy)] underline underline-offset-2"
              >
                refund and return policy
              </Link>
              . Please review it before ordering.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Acceptable use
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              You agree not to misuse the platform, including attempting to place
              fraudulent orders, impersonating others, interfering with the
              platform&apos;s operation, or using it for any unlawful purpose. We
              may suspend access where these terms are breached.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Limitation of liability
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              The platform is provided on an &quot;as is&quot; basis. To the
              extent permitted by law, we are not liable for indirect or
              consequential losses arising from your use of the platform. Nothing
              in these terms limits any rights you have that cannot be excluded
              under applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Governing law
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              These terms are governed by the laws of India, and any disputes are
              subject to the jurisdiction of the courts of Assam. For any question
              about these terms, please reach us through our{" "}
              <Link
                href="/contact"
                className="text-[var(--navy)] underline underline-offset-2"
              >
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
