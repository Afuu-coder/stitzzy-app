"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutDashboard, Building2, ShoppingBag, Package,
  Users, Activity, MessageSquare, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin",               icon: LayoutDashboard, label: "Overview"      },
  { href: "/admin/institutions",  icon: Building2,       label: "Institutions"  },
  { href: "/admin/products",      icon: Package,         label: "Products"      },
  { href: "/admin/orders",        icon: ShoppingBag,     label: "Orders"        },
  { href: "/admin/users",         icon: Users,           label: "Users"         },
  { href: "/admin/tickets",       icon: MessageSquare,   label: "Tickets"       },
  { href: "/admin/activity",      icon: Activity,        label: "Activity"      },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      {/* ── Mobile Warning Overlay ── */}
      <div className="md:hidden fixed inset-0 z-[100] bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <LayoutDashboard size={40} className="text-brand-500 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Desktop Required</h2>
        <p className="font-mono text-sm text-ink-muted max-w-xs">
          The Stitzzy admin dashboard requires a larger screen. Please access it from a desktop or tablet device.
        </p>
      </div>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-ink/10 bg-canvas">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-ink/10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Admin
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin navigation">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs
                            uppercase tracking-wide transition-all duration-150
                  ${active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-ink-muted hover:text-ink hover:bg-canvas-2"
                  }`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
                {active && <ChevronRight size={11} className="ml-auto text-blue-400" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-ink/10 flex items-center gap-3">
          <UserButton />
          <p className="font-mono text-xs font-semibold text-ink">Admin</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto bg-canvas">
        {children}
      </main>
    </div>
  );
}
