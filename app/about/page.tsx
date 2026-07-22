import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About Stitzzy",
  description:
    "Stitzzy is the verified layer between a student and their institution's official uniform. Learn how institution verification works and why parents and colleges trust us.",
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to know more about Stitzzy.",
)}`;

const VERIFICATION_STEPS = [
  {
    title: "Institution confirms the specification",
    body: "We work directly with the college or school to confirm the exact approved uniform — fabric, colour, cut, and department variations. Nothing is listed on guesswork.",
  },
  {
    title: "Products are marked verified",
    body: "Once confirmed, each uniform is published under that institution with a verified badge. What you see on the product page is the same uniform the institution approved.",
  },
  {
    title: "You order with confidence",
    body: "Filtered by department, semester, and size, you order the exact item — no wrong fabric, no rejected uniform at the gate.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="about-heading"
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            About Stitzzy
          </p>
          <h1
            id="about-heading"
            className="font-display text-3xl md:text-4xl font-semibold max-w-2xl"
          >
            The verified layer between a student and their official uniform
          </h1>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-12">
          <section>
            <p className="eyebrow mb-3">Who we are</p>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              An official uniform platform, not a clothing store
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              Stitzzy is an institution-verified uniform ordering platform. The
              single thing we care most about is trust: a student should be able
              to believe, in seconds, that the uniform they are looking at is the
              exact one their institution approved. We are Assam-rooted and
              expanding nationally, working with colleges and schools to bring
              their official uniforms online.
            </p>
          </section>

          <section>
            <p className="eyebrow mb-3">The promise</p>
            <h2 className="font-display text-xl font-semibold mb-4 text-ink">
              Verified official uniforms
            </h2>
            <p className="font-sans text-ink-muted leading-relaxed">
              Every uniform on Stitzzy is tied to a real institution and confirmed
              against its approved specification. No guesswork, no wrong fabric, no
              uniform turned away at the gate. When you see the verified badge, it
              means the institution stands behind that exact item.
            </p>
          </section>

          <section>
            <p className="eyebrow mb-3">How verification works</p>
            <h2 className="font-display text-xl font-semibold mb-6 text-ink">
              Our core trust story
            </h2>
            <ol className="space-y-6">
              {VERIFICATION_STEPS.map((step, i) => (
                <li key={i} className="stitch-card p-6 flex gap-4">
                  <span
                    className="font-mono text-sm tabular-nums shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "var(--navy-100)", color: "var(--navy)" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-ink mb-1">
                      {step.title}
                    </p>
                    <p className="font-sans text-sm text-ink-muted leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <p className="eyebrow mb-3">Why it matters</p>
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="stitch-card p-5">
                <ShieldCheck
                  size={20}
                  strokeWidth={1.75}
                  className="text-[var(--navy)] mb-3"
                  aria-hidden="true"
                />
                <p className="font-display font-semibold text-ink text-sm mb-1">
                  Institution-backed
                </p>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Uniforms are confirmed with the institution, not sourced
                  generically.
                </p>
              </div>
              <div className="stitch-card p-5">
                <BadgeCheck
                  size={20}
                  strokeWidth={1.75}
                  className="text-[var(--navy)] mb-3"
                  aria-hidden="true"
                />
                <p className="font-display font-semibold text-ink text-sm mb-1">
                  Exact specification
                </p>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Right fabric, colour, and cut for your department and semester.
                </p>
              </div>
              <div className="stitch-card p-5">
                <MapPin
                  size={20}
                  strokeWidth={1.75}
                  className="text-[var(--navy)] mb-3"
                  aria-hidden="true"
                />
                <p className="font-display font-semibold text-ink text-sm mb-1">
                  Assam-rooted
                </p>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Built locally, expanding to institutions across India.
                </p>
              </div>
            </div>
          </section>

          <section className="stitch-card p-8 text-center">
            <p className="eyebrow mb-2">Talk to us</p>
            <p className="font-display text-lg font-semibold text-ink mb-2">
              Questions before you order?
            </p>
            <p className="font-sans text-sm text-ink-muted mb-6 max-w-md mx-auto leading-relaxed">
              Whether you are a parent, a student, or an institution looking to get
              your uniform listed, we are happy to help.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
              >
                <MessageCircle size={14} aria-hidden="true" />
                Message us on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 btn-outline font-mono text-xs px-4 py-2.5"
              >
                Contact &amp; support
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
