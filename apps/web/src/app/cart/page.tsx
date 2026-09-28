"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Cart = {
  subtotal: number;
  items: { id: string; quantity: number; lineTotal: number; product: { title: string; price: number } }[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");

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
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/v1/cart/items/${id}`, { method: "DELETE", credentials: "include" });
    await load();
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p>{error}</p>
        <Link href="/login" className="mt-4 inline-block underline">ورود</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">سبد خرید</h1>
      {cart?.items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border-b py-4">
          <div>
            <p className="font-medium">{item.product.title}</p>
            <p className="text-sm text-muted-foreground">{formatPrice(item.lineTotal)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => change(item.id, Math.max(1, item.quantity - 1))} className="rounded border px-2">-</button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => change(item.id, item.quantity + 1)} className="rounded border px-2">+</button>
            <button type="button" onClick={() => remove(item.id)} className="text-sm text-destructive">حذف</button>
          </div>
        </div>
      ))}
      <p className="mt-6 text-lg">جمع: {formatPrice(cart?.subtotal ?? 0)}</p>
      <p className="text-sm text-muted-foreground">تخفیف در این نسخه صفر است. ارسال پستی نداریم.</p>
      <Link href="/checkout" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">
        ادامه خرید
      </Link>
    </main>
  );
}
