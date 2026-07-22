import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Uniforms — Browse & Order Online",
  description:
    "Browse all official school and college uniforms available on Stitzzy. Filter by institution, category, gender and size. Order via WhatsApp in minutes.",
  keywords: [
    "buy uniform online", "college uniform catalogue", "school uniform India",
    "uniform by department", "uniform filter size", "Stitzzy uniforms",
  ],
  openGraph: {
    title: "All Uniforms — Stitzzy",
    description: "Browse official uniforms by institution, category and size. Order via WhatsApp.",
    url: "https://stitzzy.in/uniforms",
  },
};

export default function UniformsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

