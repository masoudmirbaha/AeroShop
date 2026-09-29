"use client";

import { LogIn, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Page } from "@/components/page";
import { useSession } from "@/components/session-provider";
import { formatPrice } from "@/lib/format";

type Cart = {
  subtotal: number;
  items: { id: string; quantity: number; lineTotal: number; product: { title: string; price: number } }[];
};

const breadcrumbs = [{ label: "خانه", href: "/" }, { label: "سبد خرید" }];

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const { refreshCart } = useSession();

  async function load() {
    const response = await fetch("/api/v1/cart", { credentials: "include" });
    if (response.status === 401) {
      setError("برای دیدن سبد وارد شوید.");
      return;
    }
    setCart(await response.json());
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function change(id: string, quantity: number) {
    await fetch(`/api/v1/cart/items/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await Promise.all([load(), refreshCart()]);
  }

  async function remove(id: string) {
    await fetch(`/api/v1/cart/items/${id}`, { method: "DELETE", credentials: "include" });
    await Promise.all([load(), refreshCart()]);
  }

  if (error) {
    return (
      <Page title="سبد خرید" breadcrumbs={breadcrumbs}>
        <EmptyState
          icon={LogIn}
          title={error}
          action={
            <Link href="/login" className="btn btn-primary">
              ورود
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page title="سبد خرید" description="محصولات دیجیتال هستند و بعد از پرداخت در بخش دانلودها در دسترس قرار می‌گیرند." breadcrumbs={breadcrumbs}>
      {cart === null ? (
        <div className="surface h-40 animate-pulse bg-card/60" aria-busy="true" />
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="سبد خرید خالی است"
          description="محصولات و دوره‌ها را ببینید و موارد دلخواه را به سبد اضافه کنید."
          action={
            <Link href="/products" className="btn btn-primary">
              مشاهده محصولات
            </Link>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="surface divide-y divide-border/70">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-medium">{item.product.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.lineTotal)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                    <button
                      type="button"
                      aria-label="افزایش تعداد"
                      onClick={() => change(item.id, item.quantity + 1)}
                      className="grid size-8 place-items-center rounded-md text-foreground/70 transition-colors hover:bg-card hover:text-primary"
                    >
                      <Plus className="size-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium tabular-nums">{item.quantity.toLocaleString("fa-IR")}</span>
                    <button
                      type="button"
                      aria-label="کاهش تعداد"
                      onClick={() => change(item.id, Math.max(1, item.quantity - 1))}
                      className="grid size-8 place-items-center rounded-md text-foreground/70 transition-colors hover:bg-card hover:text-primary"
                    >
                      <Minus className="size-4" />
                    </button>
                  </div>
                  <button type="button" onClick={() => remove(item.id)} className="btn btn-danger btn-sm">
                    <Trash2 aria-hidden="true" />
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="surface p-6 lg:sticky lg:top-24">
            <h2 className="font-semibold">خلاصه سفارش</h2>
            <dl className="mt-4 grid gap-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>جمع اقلام</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>تخفیف</dt>
                <dd>۰</dd>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-3 text-base font-bold">
                <dt>مبلغ قابل پرداخت</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn btn-primary btn-lg mt-5 w-full">
              ادامه خرید
            </Link>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">تخفیف در این نسخه صفر است. ارسال پستی نداریم.</p>
          </aside>
        </div>
      )}
    </Page>
  );
}
