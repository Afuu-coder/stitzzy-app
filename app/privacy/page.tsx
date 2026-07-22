import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Stitzzy collects, uses, and protects your personal information when you order official institution uniforms.",
};

const LAST_UPDATED = "20 July 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="privacy-heading"
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Legal
          </p>
          <h1
            id="privacy-heading"
            className="font-display text-3xl md:text-4xl font-semibold"
          >
            Privacy policy
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
            be reviewed and adapted by qualified legal counsel before it is relied
            upon as your published privacy policy.
          </p>
        </div>

        <p className="font-sans text-ink-muted leading-relaxed mb-12">
          Stitzzy (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates an
          online platform for ordering official, institution-verified uniforms.
          This policy explains what personal information we collect, why we
          collect it, and the choices you have. It applies to our website and to
          orders placed with us over WhatsApp.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Information we collect
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed mb-3">
              We collect only what we need to verify your institution, prepare
              your order, and deliver it:
            </p>
            <ul className="font-sans text-ink-muted leading-relaxed space-y-2 list-disc pl-5">
              <li>
                Your name, phone number, and delivery address, so we can confirm
                and ship your order.
              </li>
              <li>
                Your institution, department, semester, and selected sizes, so we
                fulfil the correct approved uniform.
              </li>
              <li>
                Account details managed through our authentication provider
                (Clerk), such as your email or phone identity.
              </li>
              <li>
                Basic technical data (device, browser, and usage information)
                collected automatically to keep the platform secure and working.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              How we use your information
            </h2>
            <ul className="font-sans text-ink-muted leading-relaxed space-y-2 list-disc pl-5">
              <li>To process, confirm, and deliver your uniform order.</li>
              <li>
                To contact you about your order status, exchanges, or support
                requests.
              </li>
              <li>To verify eligibility against your institution.</li>
              <li>
                To improve the platform and prevent fraud or misuse. We do not
                sell your personal information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              WhatsApp and third-party services
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed mb-3">
              Orders are confirmed over WhatsApp. When you contact us there, the
              order details you send are processed through WhatsApp (Meta) under
              their own terms and privacy policy. We rely on a small set of
              trusted service providers:
            </p>
            <ul className="font-sans text-ink-muted leading-relaxed space-y-2 list-disc pl-5">
              <li>
                <span className="text-ink">WhatsApp (Meta)</span> — order
                confirmation and support messaging.
              </li>
              <li>
                <span className="text-ink">Clerk</span> — account authentication
                and sign-in.
              </li>
              <li>
                <span className="text-ink">Firebase (Google)</span> — secure
                storage of order and catalogue data.
              </li>
            </ul>
            <p className="font-sans text-ink-muted leading-relaxed mt-3">
              These providers process data on our behalf and are permitted to use
              it only to deliver their service to us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Cookies and similar technologies
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              We use essential cookies and similar technologies to keep you signed
              in, remember your cart, and secure the platform. We do not use them
              for advertising. You can control cookies through your browser
              settings, though disabling essential cookies may affect how the site
              works.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Data retention
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              We keep order and account information for as long as your account is
              active, and afterwards only as long as needed to meet legal,
              accounting, or dispute-resolution obligations. When information is no
              longer required, we delete or anonymise it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Your rights
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              You may request access to the personal information we hold about
              you, ask us to correct inaccurate details, or ask us to delete your
              data where we are not required to retain it. To make a request,
              contact us using the details below and we will respond within a
              reasonable time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Contact us
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              For any privacy question or request, reach us through our{" "}
              <Link
                href="/contact"
                className="text-[var(--navy)] underline underline-offset-2"
              >
                contact page
              </Link>
              . We aim to respond to privacy enquiries within a few working days.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
