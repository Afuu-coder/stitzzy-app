"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Loader2, Package, MessageCircle } from "lucide-react";
import { getInstitutionBySlug, getProductsByDept } from "@/lib/firestore";
import { useCartStore } from "@/store/cart";
import { ProductCard } from "@/components/shared/product-card";
import type { Institution, Product } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};


/* ── Skeleton product card ── */
function SkeletonProduct() {
  return (
    <div className="stitch-card p-5 animate-pulse" aria-hidden="true">
      <div className="w-full h-48 rounded bg-canvas-2 mb-4" />
      <div className="h-4 bg-canvas-2 rounded w-3/4 mb-2" />
      <div className="h-3 bg-canvas-2 rounded w-1/3 mb-4" />
      <div className="h-6 bg-canvas-2 rounded w-1/2 mb-4" />
      <div className="flex gap-1.5 mb-4">
        {[...Array(4)].map((_, i) => <div key={i} className="w-10 h-8 bg-canvas-2 rounded" />)}
      </div>
      <div className="h-9 bg-canvas-2 rounded" />
    </div>
  );
}

/* ── Page ── */
export default function DeptProductsPage() {
  const params            = useParams<{ slug: string; deptId: string }>();
  const { slug, deptId }  = params;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [deptName,    setDeptName]    = useState<string>("");
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);

  useEffect(() => {
    if (!slug || !deptId) return;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const inst = await getInstitutionBySlug(slug);
        if (!inst) { setError(true); return; }
        setInstitution(inst);

        // Fetch dept name from institution's departments
        const { getDepartmentsByInstitution } = await import("@/lib/firestore");
        const depts = await getDepartmentsByInstitution(inst.id);
        const thisDept = depts.find((d) => d.id === deptId);
        setDeptName(thisDept?.name ?? "");

        const prods = await getProductsByDept(inst.id, deptId);
        setProducts(prods);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, deptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <section className="bg-ink text-white py-10 px-6">
          <div className="max-w-6xl mx-auto h-16 animate-pulse" aria-label="Loading department" />
        </section>
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5" aria-busy="true">
            {[...Array(4)].map((_, i) => <SkeletonProduct key={i} />)}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Package size={40} className="text-ink-muted opacity-50" aria-hidden="true" />
        <p className="font-display text-xl font-semibold">Could not load products</p>
        <p className="font-mono text-xs text-ink-muted max-w-xs">
          Please check your connection and try again.
        </p>
        <Link href={`/institutions/${slug}`} className="btn-outline font-mono text-xs px-4 py-2.5 mt-2">
          <ArrowLeft size={13} className="inline mr-1.5" aria-hidden="true" />
          Back to departments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Header with breadcrumb ── */}
      <section className="bg-ink text-white py-10 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol
              className="flex items-center gap-1.5 font-mono text-xs flex-wrap"
              style={{ color: "rgba(244,246,250,0.45)" }}
            >
              <li>
                <Link href="/institutions" className="hover:opacity-80 transition-opacity">
                  Institutions
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/institutions/${slug}`} className="hover:opacity-80 transition-opacity">
                  {institution?.name ?? slug}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                style={{ color: "rgba(244,246,250,0.75)" }}
                aria-current="page"
              >
                {deptName || "Uniforms"}
              </li>
            </ol>
          </nav>

          <h1 className="font-display text-2xl md:text-3xl font-semibold">
            {deptName ? `${deptName} Uniforms` : "Department Uniforms"}
          </h1>
          {institution && (
            <p className="font-mono text-xs mt-1" style={{ color: "rgba(244,246,250,0.5)" }}>
              {institution.name}
            </p>
          )}
        </div>
      </section>

      {/* ── Products grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-12" aria-labelledby="products-heading">
        {products.length === 0 ? (
          <div className="stitch-card p-12 text-center">
            <Package size={36} className="mx-auto text-ink-muted mb-4 opacity-40" aria-hidden="true" />
            <p className="font-display font-semibold text-lg mb-2">No uniforms added yet</p>
            <p className="font-mono text-xs text-ink-muted mb-6 max-w-xs mx-auto">
              Products for this department are being added. Check back soon or enquire directly.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
            >
              <MessageCircle size={14} aria-hidden="true" />
              Enquire on WhatsApp
            </a>
          </div>
        ) : (
          <>
            <p
              className="font-mono text-xs text-ink-muted mb-6"
              role="status"
              aria-live="polite"
            >
              {products.length} item{products.length !== 1 ? "s" : ""} available
            </p>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
              id="products-heading"
              aria-label={`Uniforms for ${deptName || "this department"}`}
            >
              {products.map((p) => (
                <motion.div key={p.id} variants={fadeUp} className="h-full">
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
}
