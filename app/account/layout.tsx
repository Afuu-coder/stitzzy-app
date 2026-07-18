import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account — Orders & Profile",
  description: "View your order history, track deliveries, and manage your profile on Stitzzy.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
