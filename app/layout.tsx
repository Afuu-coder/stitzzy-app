import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/shared/navbar";
import { ConditionalFooter } from "@/components/shared/conditional-footer";
import { BrandLoader } from "@/components/shared/brand-loader";
import { Toaster } from "sonner";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Stitzzy — Official School & College Uniforms",
    template: "%s | Stitzzy",
  },
  description:
    "Find and order your institution's official uniform online. Filtered by department, semester, and size. Confirmed on WhatsApp.",
  keywords: [
    // Brand
    "Stitzzy", "stitzzy.in", "stitzzy uniform",
    // Primary
    "school uniform online India",
    "college uniform online India",
    "official college uniform",
    "buy uniform online Assam",
    // Dibrugarh specific
    "Dibrugarh University uniform",
    "DUIET uniform", "Dibrugarh college uniform",
    "uniform Dibrugarh online",
    // Generic long-tail
    "university uniform WhatsApp order",
    "department uniform India",
    "semester uniform kit",
    "official approved uniform India",
    "engineering college uniform",
    "uniform size chart India",
  ],
  authors: [{ name: "Stitzzy" }],
  creator: "Stitzzy",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stitzzy.in"
  ),
  alternates: {
    // Tells Google the ONE canonical URL, so web.app / firebaseapp.com copies
    // are never indexed as duplicates.
    canonical: "https://stitzzy.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://stitzzy.in",
    siteName: "Stitzzy",
    title: "Stitzzy — Official School & College Uniforms",
    description:
      "Find and order your institution's official uniform. Filtered by department, semester, and size. Confirmed on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stitzzy — Official School & College Uniforms",
    description:
      "Find your exact official uniform in under 2 minutes. Order on WhatsApp.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${bricolage.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] btn-primary"
        >
          Skip to main content
        </a>
        
        {/* ClerkProvider MUST be inside <body>, not wrapping <html> */}
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            variables: {
              colorPrimary:    "#1B2A4A",
              colorBackground: "#FAF9F6",
              borderRadius:    "0.5rem",
              fontFamily:      "Inter, system-ui, sans-serif",
            },
          }}
        >
          <Providers>
            <BrandLoader />
            <Navbar />
            <main id="main-content">{children}</main>
            <ConditionalFooter />
          </Providers>
        </ClerkProvider>

        <Toaster
          richColors
          position="bottom-center"
          toastOptions={{
            classNames: { toast: "font-mono text-sm" },
          }}
        />
      </body>
    </html>
  );
}
