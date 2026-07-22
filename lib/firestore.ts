import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Institution, Department, Product, Review } from "@/types";

// ── Institutions ────────────────────────────────────────────
export async function getInstitutions(): Promise<Institution[]> {
  const q = query(
    collection(db, "institutions"),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Institution));
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getInstitutionBySlug(
  slug: string
): Promise<Institution | null> {
  const q = query(
    collection(db, "institutions"),
    where("slug", "==", slug),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Institution;
}

// ── Departments ─────────────────────────────────────────────
export async function getDepartmentsByInstitution(
  institutionId: string
): Promise<Department[]> {
  const q = query(
    collection(db, "departments"),
    where("institutionId", "==", institutionId),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Department));
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

// ── Products by dept ────────────────────────────────────────
export async function getProductsByDept(
  institutionId: string,
  departmentId: string
): Promise<Product[]> {
  // If deptId is 'all', return all active products for the institution
  if (departmentId === "all") {
    return getProductsByInstitution(institutionId);
  }
  const q = query(
    collection(db, "products"),
    where("institutionId", "==", institutionId),
    where("departmentId", "==", departmentId),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  return data.sort((a, b) => a.title.localeCompare(b.title));
}

// ── All products for an institution ────────────────────────
export async function getProductsByInstitution(
  institutionId: string
): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("institutionId", "==", institutionId),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  return data.sort((a, b) => a.title.localeCompare(b.title));
}

// ── Single product by ID ─────────────────────────────────────
export async function getProductById(id: string): Promise<Product | null> {
  const ref  = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

// ── Reviews for a product ────────────────────────────────────
export async function getProductReviews(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    limit(50) // Cap at 50 reviews to avoid unbounded reads
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}
