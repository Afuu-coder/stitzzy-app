"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "Find your institution, open your department or uniform, pick your size and quantity, and add the items to your cart. When you review your cart and check out, we generate a formatted order message that opens in WhatsApp. Send it to us and our team confirms the details with you from there.",
  },
  {
    q: "How do I know this is my institution's official approved uniform?",
    a: "Every product listed for an institution is checked against that institution's official uniform code before it goes live. Verified items carry a verified badge. If you ever have doubts, you can confirm with us on WhatsApp before ordering.",
  },
  {
    q: "How do I pick the right size?",
    a: "Each product page links to the size chart, and there is a full size guide with a men's and women's split for shirts, pants, and blazers. Measurements are the finished garment size in inches — compare them with a garment that fits you well. If you are between sizes or unsure, message us on WhatsApp and we will help.",
  },
  {
    q: "What if the wrong size arrives, or it does not fit?",
    a: "If the item that arrives does not match what you ordered, message us on WhatsApp with your order code and we will arrange a replacement. If it fits differently than expected, contact us with your order code to arrange an exchange for another size.",
  },
  {
    q: "How do I pay for my order?",
    a: "There is no card or online payment on the site. You review your cart, then send it as a formatted message on WhatsApp. Our team confirms the order and payment is arranged directly in that chat.",
  },
  {
    q: "How long does delivery take, and which areas do you cover?",
    a: "Most orders are confirmed within a few hours and delivered within 3 to 5 working days after confirmation. We currently focus on Assam and are expanding to more areas — we will confirm delivery availability for your address when we process your order.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. After your order is confirmed you can follow its status — pending, confirmed, in production, shipped, and delivered — in your account under your orders. We also send status updates on WhatsApp.",
  },
  {
    q: "My college is not listed. Can you add it?",
    a: "We are onboarding new institutions regularly. Message us on WhatsApp with your college name and department and we will let you know when it is available, and prioritise it where we can.",
  },
  {
    q: "Is my information safe?",
    a: "Your order details are shared only with our team to process and deliver your order. We do not sell or share your information with anyone else.",
  },
  {
    q: "Can I order for a whole batch or department?",
    a: "Yes. For bulk or batch orders, message us on WhatsApp with the institution, department, and the sizes and quantities you need, and we will help you coordinate the order.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Frequently asked
          </motion.p>
          <motion.h1
            id="faq-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-4"
          >
            Questions, answered
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans text-sm md:text-base max-w-2xl"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            How ordering, sizing, delivery, and payment work on Stitzzy. If your
            question is not here, we are a WhatsApp message away.
          </motion.p>
        </div>
      </section>

      {/* ── Accordion ── */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div>
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <button
                className="faq-btn"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span className="font-display font-semibold text-sm pr-4 text-ink">
                  {f.q}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`faq-chevron flex-shrink-0 ${
                    open === i ? "open" : ""
                  }`}
                  style={{ color: "var(--ink-muted)" }}
                />
              </button>
              {open === i && (
                <p
                  className="font-sans text-sm pb-5 pr-8 leading-relaxed"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 stitch-card p-6 md:p-8 text-center">
          <h2 className="font-display text-xl font-semibold mb-2">
            Still have a question?
          </h2>
          <p className="font-sans text-sm text-ink-muted max-w-xl mx-auto mb-6">
            Our team replies on WhatsApp and can help with sizing, your order, or
            adding your institution.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/918473083827"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2 font-mono text-sm"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Message us
            </a>
            <Link
              href="/institutions"
              className="btn-outline inline-flex items-center gap-2 font-mono text-sm"
            >
              Browse uniforms
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
