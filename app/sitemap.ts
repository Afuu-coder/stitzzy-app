import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stitzzy.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/institutions`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/uniforms`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  ];

  // Dynamic routes from Firebase (server-side)
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore }                 = await import("firebase-admin/firestore");

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    const db = getFirestore();

    // Institutions
    const instSnap = await db
      .collection("institutions")
      .where("isActive", "==", true)
      .get();
    const instRoutes: MetadataRoute.Sitemap = instSnap.docs.map((d) => ({
      url:             `${BASE_URL}/institutions/${d.data().slug}`,
      lastModified:    new Date(d.data().updatedAt ?? d.data().createdAt),
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));

    // Products
    const prodSnap = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();
    const prodRoutes: MetadataRoute.Sitemap = prodSnap.docs.map((d) => ({
      url:             `${BASE_URL}/products/${d.id}`,
      lastModified:    new Date(d.data().updatedAt ?? d.data().createdAt),
      changeFrequency: "weekly" as const,
      priority:        0.7,
    }));

    return [...staticRoutes, ...instRoutes, ...prodRoutes];
  } catch {
    // If Firebase fails (e.g. missing env vars), return static only
    return staticRoutes;
  }
}
