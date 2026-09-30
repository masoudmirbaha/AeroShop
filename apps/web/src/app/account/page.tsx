"use client";

import { ArrowLeft, CircleCheck, Download, LayoutDashboard, LogOut, Package, UserRound, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountNav, StatCard } from "@/components/account/account-nav";
import { orderStatusLabels } from "@/components/admin/labels";
import { IconTile, Page } from "@/components/page";
import { authFetch, useRequireAuth } from "@/components/session-provider";
import { formatPrice } from "@/lib/format";

type Order = { id: string; status: string; total: number; items: { id: string; productName: string; quantity: number }[] };
type Summary = { orders: Order[]; downloads: number };

const tiles: { href: string; title: string; text: string; icon: LucideIcon; adminOnly?: boolean }[] = [
  { href: "/account/profile", title: "پروفایل", text: "نام، ایمیل و نوع حساب", icon: UserRound },
  { href: "/account/orders", title: "سفارش‌های من", text: "وضعیت پرداخت و اقلام هر سفارش", icon: Package },
  { href: "/account/downloads", title: "دانلودهای من", text: "فایل‌های محصولات خریداری‌شده", icon: Download },
  { href: "/admin", title: "پنل مدیریت", text: "محصولات، سفارش‌ها، کاربران و درخواست‌ها", icon: LayoutDashboard, adminOnly: true },
];

const statusTone: Record<string, string> = {
  PAID: "badge-accent",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "badge-muted",
};

async function loadSummary(): Promise<Summary | null> {
  const [orders, downloads] = await Promise.all([authFetch("/api/v1/orders"), authFetch("/api/v1/downloads")]);
  if (orders.status === 401 || downloads.status === 401) return null;
  return {
    orders: orders.ok ? ((await orders.json()) as Order[]) : [],
    downloads: downloads.ok ? ((await downloads.json()) as unknown[]).length : 0,
  };
}

export default function AccountPage() {
  const { status, user, logout, expired } = useRequireAuth();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    loadSummary()
      .then((result) => {
        if (cancelled) return;
        if (result) setSummary(result);
        else expired();
      })
      .catch(() => {
        if (!cancelled) setSummary({ orders: [], downloads: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [status, expired]);

  const name = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "";
  const initial = user ? (user.firstName || user.email).charAt(0).toUpperCase() : "";
  const paid = summary?.orders.filter((order) => order.status === "PAID") ?? [];
  const spent = paid.reduce((sum, order) => sum + order.total, 0);
  const stat = (value: number) => (summary ? value.toLocaleString("fa-IR") : "—");

  return (
    <Page
      title={user ? `سلام، ${name}` : "داشبورد"}
      description="سفارش‌ها، فایل‌های قابل دانلود و اطلاعات حساب خود را از این‌جا مدیریت کنید."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "داشبورد" }]}
    >
      <AccountNav />
      {!user ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="در حال بارگذاری حساب">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="surface h-28 animate-pulse bg-card/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy={summary === null}>
            <StatCard icon={Package} label="کل سفارش‌ها" value={stat(summary?.orders.length ?? 0)} />
            <StatCard icon={CircleCheck} label="سفارش‌های پرداخت‌شده" value={stat(paid.length)} tone="accent" />
            <StatCard icon={Download} label="فایل‌های قابل دانلود" value={stat(summary?.downloads ?? 0)} tone="cyan" />
            <StatCard icon={Wallet} label="مجموع خرید" value={summary ? formatPrice(spent) : "—"} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="surface overflow-hidden">
              <div className="relative h-20 bg-navy">
                <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:18px_18px]" />
              </div>
              <div className="-mt-8 px-6 pb-6">
                <span aria-hidden="true" className="relative grid size-16 place-items-center avatar-fill rounded-full text-xl font-semibold ring-4 ring-card">
                  {initial}
                </span>
                <p className="mt-3 truncate font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {user.email}
                </p>
                <span className={`badge mt-3 ${user.role === "ADMIN" ? "badge-accent" : "badge-muted"}`}>{user.role === "ADMIN" ? "مدیر سایت" : "کاربر"}</span>
                <button type="button" onClick={() => void logout()} className="btn btn-outline btn-danger mt-6 w-full hover:border-destructive/30">
                  <LogOut aria-hidden="true" />
                  خروج از حساب
                </button>
              </div>
            </aside>

            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {tiles
                  .filter((tile) => !tile.adminOnly || user.role === "ADMIN")
                  .map(({ href, title, text, icon }) => (
                    <Link key={href} href={href} className="surface card-glow group flex items-center gap-4 p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                      <IconTile icon={icon} className="transition-transform duration-300 group-hover:scale-105" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold transition-colors group-hover:text-primary">{title}</span>
                        <span className="mt-0.5 block text-sm leading-6 text-muted-foreground">{text}</span>
                      </span>
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-[color,translate] group-hover:-translate-x-1 group-hover:text-primary" aria-hidden="true" />
                    </Link>
                  ))}
              </div>

              <section className="surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">آخرین سفارش‌ها</h2>
                  <Link href="/account/orders" className="text-link text-sm">
                    همه سفارش‌ها
                  </Link>
                </div>
                {summary === null ? (
                  <div className="mt-4 grid gap-2" aria-busy="true">
                    {[0, 1].map((key) => (
                      <div key={key} className="h-12 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : summary.orders.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    هنوز سفارشی ثبت نکرده‌اید.{" "}
                    <Link href="/products" className="text-link">
                      مشاهده محصولات
                    </Link>
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-border/70">
                    {summary.orders.slice(0, 3).map((order) => (
                      <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="min-w-0 flex-1 truncate text-sm">{order.items.map((item) => item.productName).join("، ") || "سفارش"}</span>
                        <span className={`badge ${statusTone[order.status] ?? ""}`}>{orderStatusLabels[order.status] ?? order.status}</span>
                        <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
