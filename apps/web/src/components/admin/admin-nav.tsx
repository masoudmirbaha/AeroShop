"use client";

import { FolderTree, HelpCircle, Inbox, LayoutDashboard, Mail, Package, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { label: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { label: "محصولات", href: "/admin/products", icon: Package },
  { label: "دسته‌ها", href: "/admin/categories", icon: FolderTree },
  { label: "سفارش‌ها", href: "/admin/orders", icon: ShoppingBag },
  { label: "کاربران", href: "/admin/users", icon: Users },
  { label: "درخواست‌های خدمات", href: "/admin/service-requests", icon: Inbox },
  { label: "پیام‌های تماس", href: "/admin/messages", icon: Mail },
  { label: "پرسش‌های متداول", href: "/admin/faq", icon: HelpCircle },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="منوی مدیریت" className="surface overflow-hidden p-2 md:sticky md:top-24">
      <div className="relative mb-2 hidden overflow-hidden rounded-xl bg-navy p-4 text-navy-foreground md:block">
        <div aria-hidden="true" className="absolute -end-6 -top-8 size-24 rounded-full bg-radial from-primary/30 from-20% to-transparent to-70%" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-brand-cyan ring-1 ring-white/15">
            <ShieldCheck className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">پنل مدیریت</p>
            <p className="text-[11px] text-navy-foreground/65">AeroShop Admin</p>
          </div>
        </div>
      </div>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {sections.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  active ? "bg-secondary text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 start-0 hidden w-0.5 accent-line rounded-full transition-opacity md:block ${active ? "opacity-100" : "opacity-0"}`}
                />
                <Icon
                  className={`size-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
