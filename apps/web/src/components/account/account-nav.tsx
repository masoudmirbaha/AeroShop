"use client";

import { Download, LayoutDashboard, Package, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/account", label: "داشبورد", icon: LayoutDashboard },
  { href: "/account/profile", label: "پروفایل", icon: UserRound },
  { href: "/account/orders", label: "سفارش‌ها", icon: Package },
  { href: "/account/downloads", label: "دانلودها", icon: Download },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="بخش‌های حساب کاربری" className="-mx-4 mb-8 overflow-x-auto px-4">
      <ul className="inline-flex min-w-full gap-1 rounded-xl border border-border/80 bg-card p-1 shadow-[0_1px_2px_0] shadow-navy/[0.04] sm:min-w-0">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1 sm:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "bg-secondary text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: { icon: LucideIcon; label: string; value: ReactNode; hint?: string; tone?: "primary" | "cyan" | "accent" }) {
  const tones = {
    primary: "from-primary/15 to-primary/5 text-primary",
    cyan: "from-brand-cyan/20 to-brand-cyan/5 text-primary",
    accent: "from-accent to-secondary text-accent-foreground",
  } as const;
  return (
    <div className="surface card-glow relative overflow-hidden p-5">
      <div aria-hidden="true" className="absolute -end-8 -top-8 size-24 rounded-full bg-primary/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br ring-1 ring-primary/10 ring-inset", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
