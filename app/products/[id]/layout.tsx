import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stitzzy.in";

// ISR: regenerate this segment's metadata at most once per hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
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
    const snap = await db.collection("products").doc(params.id).get();

    if (!snap.exists) {
      return { title: "Product Not Found", robots: { index: false, follow: false } };
    }

    const p        = snap.data()!;
    const name     = p.title as string;
    const category = (p.category as string) ?? "Uniform";
    const price    = p.price as number;
    const images   = (p.images as string[]) ?? [];

    return {
      title: `${name} — Official ${category}`,
      description: `Buy ${name} officially approved uniform on Stitzzy. Available in multiple sizes. ₹${price.toLocaleString("en-IN")}. Order via WhatsApp instantly.`,
      keywords: [
        name, `${name} uniform`, `${category} uniform India`,
        "college uniform online", "buy uniform WhatsApp India",
      ],
      openGraph: {
        title: `${name} — Stitzzy`,
        description: `Order ${name} (${category}) for ₹${price.toLocaleString("en-IN")} on Stitzzy.`,
        url: `${BASE_URL}/products/${params.id}`,
        images: images.slice(0, 1).map((url) => ({ url })),
        type: "website",
      },
      alternates: { canonical: `${BASE_URL}/products/${params.id}` },
    };
  } catch {
    return {
      title: "Uniform Product — Stitzzy",
      description: "Browse and order official college uniforms on Stitzzy.",
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
