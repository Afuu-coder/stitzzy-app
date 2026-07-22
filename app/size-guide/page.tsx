"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ruler, ArrowRight, MessageCircle } from "lucide-react";

/* ── Size chart data (mirrors components/shared/size-chart-modal.tsx) ── */

const BLAZER_MEN = [
  { size: "XS", chest: "36", length: "27", sleeve: "23.5" },
  { size: "S", chest: "38", length: "28", sleeve: "24" },
  { size: "M", chest: "40", length: "29", sleeve: "24.5" },
  { size: "L", chest: "42", length: "30", sleeve: "25" },
  { size: "XL", chest: "44", length: "31", sleeve: "25.5" },
  { size: "2XL", chest: "46", length: "32", sleeve: "26" },
  { size: "3XL", chest: "48", length: "33", sleeve: "26.5" },
  { size: "4XL", chest: "50", length: "34", sleeve: "27" },
  { size: "5XL", chest: "52", length: "35", sleeve: "27.5" },
];

const BLAZER_WOMEN = [
  { size: "XS", chest: "32", length: "24.5", sleeve: "22.5" },
  { size: "S", chest: "34", length: "25.5", sleeve: "23" },
  { size: "M", chest: "36", length: "26.5", sleeve: "23.5" },
  { size: "L", chest: "38", length: "27.5", sleeve: "24" },
  { size: "XL", chest: "40", length: "28.5", sleeve: "24.5" },
  { size: "2XL", chest: "42", length: "29.5", sleeve: "25" },
  { size: "3XL", chest: "44", length: "30.5", sleeve: "25.5" },
  { size: "4XL", chest: "46", length: "31.5", sleeve: "26" },
  { size: "5XL", chest: "48", length: "32.5", sleeve: "26.5" },
];

const PANT_MEN = [
  { size: "28", waist: "28", hip: "36", length: "40" },
  { size: "30", waist: "30", hip: "38", length: "40.5" },
  { size: "32", waist: "32", hip: "40", length: "41" },
  { size: "34", waist: "34", hip: "42", length: "41.5" },
  { size: "36", waist: "36", hip: "44", length: "42" },
  { size: "38", waist: "38", hip: "46", length: "42.5" },
  { size: "40", waist: "40", hip: "48", length: "43" },
  { size: "42", waist: "42", hip: "50", length: "43.5" },
  { size: "44", waist: "44", hip: "52", length: "44" },
];

const PANT_WOMEN = [
  { size: "26", waist: "26", hip: "36", length: "38" },
  { size: "28", waist: "28", hip: "38", length: "38.5" },
  { size: "30", waist: "30", hip: "40", length: "39" },
  { size: "32", waist: "32", hip: "42", length: "39.5" },
  { size: "34", waist: "34", hip: "44", length: "40" },
  { size: "36", waist: "36", hip: "46", length: "40.5" },
  { size: "38", waist: "38", hip: "48", length: "41" },
  { size: "40", waist: "40", hip: "50", length: "41.5" },
  { size: "42", waist: "42", hip: "52", length: "42" },
];

const TSHIRT_CHART = [
  { size: "XS", chest: "36", length: "25", sleeve: "7" },
  { size: "S", chest: "38", length: "26", sleeve: "7" },
  { size: "M", chest: "40", length: "27", sleeve: "7.5" },
  { size: "L", chest: "42", length: "28", sleeve: "8" },
  { size: "XL", chest: "44", length: "29", sleeve: "8.5" },
  { size: "2XL", chest: "46", length: "30", sleeve: "9" },
  { size: "3XL", chest: "48", length: "31", sleeve: "9.5" },
  { size: "4XL", chest: "50", length: "32", sleeve: "10" },
  { size: "5XL", chest: "52", length: "33", sleeve: "10" },
];

type Row = Record<string, string>;
type Gender = "men" | "women";
type Category = "shirt" | "pant" | "blazer";

const CATEGORIES: { key: Category; label: string; hasGender: boolean }[] = [
  { key: "shirt", label: "Shirt / T-shirt", hasGender: false },
  { key: "pant", label: "Pants", hasGender: true },
  { key: "blazer", label: "Blazer", hasGender: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Measurement guidance ── */
const MEASUREMENTS = [
  {
    label: "Chest / bust",
    how: "Measure around the fullest part of your chest, keeping the tape level and snug under the arms.",
  },
  {
    label: "Waist",
    how: "Measure around your natural waistline — the narrowest part of your torso — without pulling the tape tight.",
  },
  {
    label: "Length",
    how: "Measure from the highest point of the shoulder straight down to where you want the garment to end.",
  },
  {
    label: "Sleeve",
    how: "Measure from the shoulder seam along the outside of the arm to the end of the cuff.",
  },
];

function ChartTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Row[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center border-collapse tnum">
        <thead>
          <tr className="bg-[var(--navy)]">
            {headers.map((h) => (
              <th
                key={h}
                className="font-mono font-medium text-[11px] uppercase tracking-wider py-3 px-3 text-white"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-[var(--border-hairline)] hover:bg-[var(--navy-100)] transition-colors"
            >
              {Object.values(row).map((val, i) => (
                <td
                  key={i}
                  className={`py-2.5 px-3 tnum ${
                    i === 0
                      ? "font-display font-semibold text-sm text-ink"
                      : "font-mono text-xs text-ink-muted"
                  }`}
                >
                  {val}
                  {i > 0 && '"'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  const [category, setCategory] = useState<Category>("shirt");
  const [gender, setGender] = useState<Gender>("men");

  const active = CATEGORIES.find((c) => c.key === category)!;

  let headers: string[];
  let rows: Row[];
  let note: string;

  if (category === "blazer") {
    const isWomen = gender === "women";
    headers = [
      "Size",
      isWomen ? "Bust (in)" : "Chest (in)",
      "Length (in)",
      "Sleeve (in)",
    ];
    rows = isWomen ? BLAZER_WOMEN : BLAZER_MEN;
    note =
      "Our blazers are tailored to a regular fit for a smart, professional appearance. All measurements are in inches.";
  } else if (category === "pant") {
    headers = ["Size", "Waist (in)", "Hip (in)", "Length (in)"];
    rows = gender === "women" ? PANT_WOMEN : PANT_MEN;
    note =
      "Our trousers are tailored to a regular fit for comfort and a professional look. All measurements are in inches. Pant length is provided with standard extra length and can be altered if required.";
  } else {
    headers = ["Size", "Chest (in)", "Length (in)", "Sleeve (in)"];
    rows = TSHIRT_CHART;
    note =
      "Our shirts are tailored to a regular fit; not too tight, not too loose. All measurements are in inches.";
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero strip ── */}
      <section
        className="bg-[var(--navy)] text-white py-14 px-6"
        aria-labelledby="size-guide-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "rgba(244,246,250,0.55)" }}
          >
            Size guide
          </motion.p>
          <motion.h1
            id="size-guide-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-semibold mb-4"
          >
            Find your size before you order
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans text-sm md:text-base max-w-2xl"
            style={{ color: "rgba(244,246,250,0.7)" }}
          >
            All measurements are the finished garment size in inches. Compare
            them with a garment that fits you well, or measure yourself using the
            guide below.
          </motion.p>
        </div>
      </section>

      {/* ── Chart section ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Category tabs */}
        <div
          className="flex flex-wrap gap-6 border-b border-[var(--border-hairline)] mb-6"
          role="tablist"
          aria-label="Uniform category"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={category === c.key}
              onClick={() => setCategory(c.key)}
              className={`tab-btn ${category === c.key ? "active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Gender toggle (only where a gender split exists) */}
        {active.hasGender && (
          <div
            className="inline-flex rounded-lg border border-[var(--border-hairline)] overflow-hidden mb-6"
            role="group"
            aria-label="Fit"
          >
            {(["men", "women"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                aria-pressed={gender === g}
                className={`px-5 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                  gender === g
                    ? "bg-[var(--navy)] text-white"
                    : "bg-white text-ink-muted hover:bg-[var(--canvas-2)]"
                }`}
              >
                {g === "men" ? "Men's" : "Women's"}
              </button>
            ))}
          </div>
        )}

        <motion.div
          key={`${category}-${active.hasGender ? gender : "unisex"}`}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="stitch-card p-5 md:p-6"
        >
          <ChartTable headers={headers} rows={rows} />

          <div
            className="mt-6 p-4 rounded-lg flex gap-3 items-start"
            style={{ background: "var(--gold-100)" }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--gold)" }}
            >
              <Ruler size={15} strokeWidth={2} className="text-white" />
            </div>
            <p
              className="font-mono text-[11px] leading-relaxed"
              style={{ color: "#8A6A2E" }}
            >
              {note}
            </p>
          </div>
        </motion.div>

        {/* ── How to measure yourself ── */}
        <div className="mt-14">
          <p className="eyebrow mb-2">Measuring</p>
          <h2 className="font-display text-2xl font-semibold mb-2">
            How to measure yourself
          </h2>
          <p className="font-sans text-sm text-ink-muted max-w-2xl mb-8">
            Use a soft measuring tape and keep it level and snug — not tight.
            Measuring over a light layer, or measuring a garment that already
            fits you well, gives the most reliable result.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MEASUREMENTS.map((m) => (
              <div key={m.label} className="stitch-card p-5">
                <h3 className="font-display font-semibold text-sm text-ink mb-1.5">
                  {m.label}
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  {m.how}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Help / CTA ── */}
        <div className="mt-14 stitch-card p-6 md:p-8 text-center">
          <h2 className="font-display text-xl font-semibold mb-2">
            Still unsure about your size?
          </h2>
          <p className="font-sans text-sm text-ink-muted max-w-xl mx-auto mb-6">
            Message us on WhatsApp with your usual size or measurements and we
            will help you pick the right fit before you order.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/918473083827"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2 font-mono text-sm"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Ask on WhatsApp
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
