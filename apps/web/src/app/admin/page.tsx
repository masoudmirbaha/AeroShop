"use client";

import { ArrowLeft, CheckCircle2, Inbox, Mail, Package, ShoppingBag, Users, Workflow, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Notice, useAdminData } from "@/components/admin/admin-client";
import { IconTile } from "@/components/page";

type Summary = {
  products: number;
  orders: number;
  paidOrders: number;
  users: number;
  requests: number;
  openRequests: number;
  messages: number;
};

export default function AdminDashboardPage() {
  const { data, error } = useAdminData<Summary>("/admin/summary");
  const cards: [string, number | undefined, string, LucideIcon][] = [
    ["محصولات", data?.products, "/admin/products", Package],
    ["سفارش‌ها", data?.orders, "/admin/orders", ShoppingBag],
    ["سفارش‌های پرداخت‌شده", data?.paidOrders, "/admin/orders", CheckCircle2],
    ["کاربران", data?.users, "/admin/users", Users],
    ["درخواست‌های باز", data?.openRequests, "/admin/service-requests", Inbox],
    ["همه درخواست‌ها", data?.requests, "/admin/service-requests", Workflow],
    ["پیام‌های تماس", data?.messages, "/admin/messages", Mail],
  ];

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-xl border border-border/70 bg-linear-to-l from-secondary/70 via-background to-background p-5 md:p-6">
        <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-70 mask-[linear-gradient(to_right,black,transparent_65%)]" />
        <div className="relative">
          <p className="eyebrow mb-2">پنل مدیریت</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">داشبورد</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">نمای کلی فروشگاه و درخواست‌ها</p>
        </div>
      </div>
      <Notice text={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href, icon]) => (
          <Link
            key={label}
            href={href}
            className="surface card-glow group relative flex items-center gap-4 overflow-hidden p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div aria-hidden="true" className="absolute -end-8 -top-8 size-24 rounded-full bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10" />
            <IconTile icon={icon} className="relative size-11" />
            <div className="relative min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">{value == null ? "…" : value.toLocaleString("fa-IR")}</p>
            </div>
            <ArrowLeft
              aria-hidden="true"
              className="relative size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,translate,color] duration-200 group-hover:-translate-x-1 group-hover:text-primary group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </>
  );
}
