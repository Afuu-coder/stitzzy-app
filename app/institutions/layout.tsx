import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutions — Find Your College or School",
  description:
    "Find your institution on Stitzzy and browse official uniforms by department, semester and size. Currently serving Dibrugarh University and more.",
  keywords: [
    "college uniform institution India", "university uniform India",
    "Dibrugarh University uniform", "find college uniform online",
    "institution uniform shop", "Stitzzy institutions",
  ],
  openGraph: {
    title: "Institutions — Stitzzy",
    description: "Find your college or school on Stitzzy and order official uniforms via WhatsApp.",
    url: "https://stitzzy.com/institutions",
  },
};

export default function InstitutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
