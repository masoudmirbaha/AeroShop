"use client";

import { CircleCheck, Package, Receipt, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountNav, StatCard } from "@/components/account/account-nav";
import { orderStatusLabels } from "@/components/admin/labels";
import { EmptyState, IconTile, Page } from "@/components/page";
import { authFetch, useRequireAuth } from "@/components/session-provider";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  total: number;
  items: { id: string; productName: string; quantity: number }[];
};

const statusTone: Record<string, string> = {
  PAID: "badge-accent",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "badge-muted",
};

export default function OrdersPage() {
  const { status, expired } = useRequireAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void authFetch("/api/v1/orders").then(async (response) => {
      if (cancelled) return;
      if (response.status === 401) return expired();
      setOrders(response.ok ? await response.json() : []);
    });
    return () => {
      cancelled = true;
    };
  }, [status, expired]);

  const paid = orders?.filter((order) => order.status === "PAID").length ?? 0;

  return (
    <Page
      title="سفارش‌های من"
      description="تاریخچه سفارش‌ها و وضعیت پرداخت هر کدام."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "داشبورد", href: "/account" }, { label: "سفارش‌ها" }]}
    >
      <AccountNav />
      {orders === null ? (
        <div className="grid gap-4" aria-busy="true">
          {[0, 1].map((key) => (
            <div key={key} className="surface h-28 animate-pulse bg-card/60" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="هنوز سفارشی ثبت نکرده‌اید"
          description="بعد از خرید، سفارش‌ها و وضعیت پرداخت آن‌ها این‌جا نمایش داده می‌شوند."
          action={
            <Link href="/products" className="btn btn-primary">
              مشاهده محصولات
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard icon={Package} label="کل سفارش‌ها" value={orders.length.toLocaleString("fa-IR")} />
            <StatCard icon={CircleCheck} label="پرداخت‌شده" value={paid.toLocaleString("fa-IR")} tone="accent" />
          </div>
          <div className="grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="surface card-glow p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <IconTile icon={Receipt} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">شماره سفارش</p>
                    <p className="truncate text-xs font-medium text-foreground/80" dir="ltr">
                      {order.id}
                    </p>
                  </div>
                  <span className={`badge ${statusTone[order.status] ?? ""}`}>{orderStatusLabels[order.status] ?? order.status}</span>
                </div>
                <ul className="mt-4 grid gap-2 border-t border-border/70 pt-4 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-foreground/85">{item.productName}</span>
                      <span className="text-muted-foreground tabular-nums">× {item.quantity.toLocaleString("fa-IR")}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">مبلغ کل</span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
