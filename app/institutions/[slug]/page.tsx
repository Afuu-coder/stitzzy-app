"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, ChevronRight,
  BookOpen, Loader2, MessageCircle,
} from "lucide-react";
import { getInstitutionBySlug, getDepartmentsByInstitution } from "@/lib/firestore";
import type { Institution, Department } from "@/types";

const DEPT_COLORS = [
  "#3E63E0", "#B8892E", "#C1502E", "#2E8B57", "#7C3AED", "#0891B2",
];

const TYPE_LABELS: Record<Institution["type"], string> = {
  university: "University",
  college:    "College",
  school:     "School",
  coaching:   "Coaching",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ── Skeleton department card ── */
function SkeletonDept() {
  return (
    <div className="stitch-card p-5 animate-pulse flex items-center gap-3" aria-hidden="true">
      <div className="w-10 h-10 rounded-lg bg-canvas-2 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-canvas-2 rounded w-1/2 mb-2" />
        <div className="h-3 bg-canvas-2 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function InstitutionDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);

  async function fetchData() {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const inst = await getInstitutionBySlug(slug);
      if (!inst) {
        setError(true);
        return;
      }
      setInstitution(inst);
      const depts = await getDepartmentsByInstitution(inst.id);
      
      // Always inject a generic "All Uniforms" department so products assigned to "all" are accessible
      depts.unshift({
        id: "all",
        name: "All Uniforms",
        institutionId: inst.id,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      setDepartments(depts);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center" aria-label="Loading institution">
        <Loader2 size={32} className="animate-spin text-ink-muted" aria-hidden="true" />
      </div>
    );
  }

  /* ── Error / not found state ── */
  if (error || !institution) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 px-6 text-center">
        <BookOpen size={40} className="text-ink-muted opacity-50" aria-hidden="true" />
        <p className="font-display text-xl font-semibold">Institution not found</p>
        <p className="font-mono text-xs text-ink-muted max-w-xs">
          We couldn&apos;t find that institution. It may have been removed or the link may be incorrect.
        </p>
        <Link href="/institutions" className="btn-outline font-mono text-xs px-4 py-2.5 mt-2">
          <ArrowLeft size={13} className="inline mr-1.5" aria-hidden="true" />
          Back to institutions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">

      {/* ── Hero banner ── */}
      <section
        className={`relative text-white ${institution.coverImageUrl ? "" : "bg-ink"}`}
        aria-labelledby="inst-heading"
      >
        {/* Cover Image Background */}
        {institution.coverImageUrl && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={institution.coverImageUrl}
              alt={`${institution.name} campus`}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 pt-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "rgba(244,246,250,0.7)" }}>
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft size={11} aria-hidden="true" />
                  Institutions
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white" aria-current="page">
                {institution.name}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Logo / initials */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl bg-white p-2"
              aria-hidden="true"
            >
              {institution.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={institution.logoUrl}
                  alt={`${institution.name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-canvas-2 rounded-lg flex items-center justify-center">
                  <span className="font-display text-ink text-4xl font-semibold">
                    {institution.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="pb-2">
              <span className="badge bg-white/20 text-white border-white/20 backdrop-blur-md mb-3 inline-block">
                {TYPE_LABELS[institution.type]}
              </span>
              <h1
                id="inst-heading"
                className="font-display text-3xl md:text-4xl font-semibold mb-2 shadow-sm"
              >
                {institution.name}
              </h1>
              {(institution.city || institution.state) && (
                <p
                  className="font-mono text-sm flex items-center gap-1.5 text-white/80"
                >
                  <MapPin size={13} aria-hidden="true" />
                  {[institution.city, institution.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Departments grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-12" aria-labelledby="depts-heading">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8">
            <p className="eyebrow mb-2">Browse by department</p>
            <h2 id="depts-heading" className="font-display text-xl font-semibold">
              Select your department to see uniforms
            </h2>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" aria-busy="true">
              {[...Array(6)].map((_, i) => <SkeletonDept key={i} />)}
            </div>
          ) : departments.length === 0 ? (
            <div className="stitch-card p-10 text-center">
              <BookOpen size={32} className="mx-auto text-ink-muted mb-3 opacity-50" aria-hidden="true" />
              <p className="font-display font-semibold mb-1">No departments yet</p>
              <p className="font-mono text-xs text-ink-muted mb-4">
                Uniforms for this institution are being added. Check back soon.
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918473083827"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-whatsapp font-mono text-xs px-4 py-2.5"
              >
                <MessageCircle size={13} aria-hidden="true" />
                Enquire on WhatsApp
              </a>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              role="list"
              aria-label={`Departments at ${institution.name}`}
            >
              {departments.map((dept, idx) => (
                <motion.div key={dept.id} variants={fadeUp} role="listitem">
                  <Link
                    href={`/institutions/${slug}/${dept.id}`}
                    className="stitch-card p-5 flex items-center justify-between group
                               hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    aria-label={`${dept.name} department — view uniforms`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${DEPT_COLORS[idx % DEPT_COLORS.length]}20`,
                          border:     `1px solid ${DEPT_COLORS[idx % DEPT_COLORS.length]}40`,
                        }}
                        aria-hidden="true"
                      >
                        <BookOpen
                          size={16}
                          style={{ color: DEPT_COLORS[idx % DEPT_COLORS.length] }}
                        />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm group-hover:text-blue-600 transition-colors">
                          {dept.name}
                        </p>
                        <p className="font-mono text-[10px] text-ink-muted">View uniforms</p>
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-ink-muted group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
