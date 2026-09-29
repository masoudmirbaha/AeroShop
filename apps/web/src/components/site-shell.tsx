import { Mail } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/site-header";

const columns = [
  {
    title: "محصولات",
    links: [
      { label: "همه محصولات", href: "/products" },
      { label: "محصولات تکی", href: "/products?type=SINGLE_PRODUCT" },
      { label: "بسته‌های آموزشی", href: "/products?type=BUNDLE" },
      { label: "محصولات رایگان", href: "/products?type=FREE" },
    ],
  },
  {
    title: "دوره‌ها",
    links: [
      { label: "همه دوره‌ها", href: "/courses" },
      { label: "آموزش خصوصی", href: "/services/private-training" },
      { label: "یادداشت‌ها", href: "/blog" },
      { label: "پرسش‌های متداول", href: "/faq" },
    ],
  },
  {
    title: "خدمات",
    links: [
      { label: "همه خدمات", href: "/services" },
      { label: "مشاوره رایگان", href: "/consultation" },
      { label: "سفارش پروژه", href: "/request-project" },
      { label: "پشتیبانی فنی", href: "/services/technical-support" },
    ],
  },
  {
    title: "ارتباط",
    links: [
      { label: "تماس با ما", href: "/contact" },
      { label: "درباره ما", href: "/about" },
      { label: "حساب کاربری", href: "/account" },
    ],
  },
];

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      {children}
    </svg>
  );
}

const socials = [
  {
    label: "Telegram",
    href: "#",
    icon: (
      <SvgIcon>
        <path d="M21 4 3 11l6 2 2 6 3-4 5 4 2-15Z" />
        <path d="m9 13 8-6" />
      </SvgIcon>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <SvgIcon>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </SvgIcon>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <SvgIcon>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
      </SvgIcon>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <SvgIcon>
        <rect x="2.5" y="5" width="19" height="14" rx="4" />
        <path d="m10 9 5 3-5 3V9Z" />
      </SvgIcon>
    ),
  },
];

export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border/80 bg-card">
      <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-50 mask-[linear-gradient(to_bottom,black,transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-primary/40 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <div className="max-w-xs sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-7 text-muted-foreground">مرجع آموزش، شبیه‌سازی و خدمات مهندسی CFD و CAE برای دانشجویان و مهندسان.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
              <Mail className="size-4" aria-hidden="true" />
              ارسال پیام از فرم تماس
            </Link>
            <ul className="mt-5 flex gap-2" aria-label="شبکه‌های اجتماعی">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    className="grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-[color,border-color,background-color,translate] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary hover:text-primary"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="relative border-t border-border/70 bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground">
          <p>© {year} AeroShop — تمامی حقوق محفوظ است. محصولات دیجیتال هستند و ارسال پستی ندارند.</p>
          <p dir="ltr">Engineering &amp; Simulation</p>
        </div>
      </div>
    </footer>
  );
}
