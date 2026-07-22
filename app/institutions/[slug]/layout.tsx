import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stitzzy.com";

// ISR: regenerate this segment's metadata at most once per hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore }                  = await import("firebase-admin/firestore");

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    const db   = getFirestore();
    const snap = await db
      .collection("institutions")
      .where("slug", "==", params.slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {
      return { title: "Institution Not Found", robots: { index: false, follow: false } };
    }

    const inst = snap.docs[0].data();
    const name = inst.name as string;
    const city = (inst.city as string) ?? "";

    return {
      title: `${name} Uniforms — Order Online`,
      description: `Browse and order official uniforms for ${name}${city ? ` in ${city}` : ""}. Filter by department, semester and size. Order via WhatsApp on Stitzzy.`,
      keywords: [
        `${name} uniform`, `${name} uniform online`, `${city} college uniform`,
        "buy college uniform India", "official uniform order WhatsApp",
      ],
      openGraph: {
        title: `${name} Official Uniforms — Stitzzy`,
        description: `Order ${name} uniforms online. Filtered by department and size.`,
        url: `${BASE_URL}/institutions/${params.slug}`,
        images: inst.coverImageUrl ? [{ url: inst.coverImageUrl }] : [],
      },
      alternates: { canonical: `${BASE_URL}/institutions/${params.slug}` },
    };
  } catch {
    return {
      title: "Institution Uniforms — Stitzzy",
      description: "Browse and order official college uniforms on Stitzzy.",
    };
  }
}

export default function InstitutionSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
