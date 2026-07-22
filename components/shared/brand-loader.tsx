"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LOGO_FULL_WHITE } from "@/components/landing/constants";

/**
 * Branded first-load screen. Calm, institutional — a centered logo mark with a
 * single thin navy progress sweep, then a soft fade out. Shows once per browser
 * session so it never nags returning users (brand voice: "uncomplicated").
 */
export function BrandLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on a true first paint of the session.
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("stz_loaded");
    if (seen) return;

    setVisible(true);
    const done = () => {
      sessionStorage.setItem("stz_loaded", "1");
      setVisible(false);
    };
    // Hold briefly for the reveal, then release. Kept short on purpose.
    const t = setTimeout(done, reduce ? 250 : 1100);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="brand-loader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: "var(--canvas)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <motion.img
            src={LOGO_FULL_WHITE}
            alt="Stitzzy"
            className="h-12 w-auto md:h-14 mb-7 select-none"
            style={{ filter: "brightness(0)" }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            draggable={false}
          />
          {/* Thin progress sweep — the only motion, deliberately quiet */}
          <div
            className="relative h-[2px] w-32 overflow-hidden rounded-full"
            style={{ background: "var(--border-hairline)" }}
          >
            {!reduce && (
              <span
                className="absolute inset-y-0 left-0 w-1/2 rounded-full animate-loader-bar"
                style={{ background: "var(--navy)" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
