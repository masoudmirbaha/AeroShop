"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  total: number;
  items: { id: string; productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/v1/orders", { credentials: "include" }).then(async (response) => {
        if (response.ok) setOrders(await response.json());
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">سفارش‌ها</h1>
      {orders.map((order) => (
        <article key={order.id} className="mb-4 rounded-xl border p-4">
          <p className="font-medium">{order.status} · {formatPrice(order.total)}</p>
          <ul className="mt-2 text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li key={item.id}>{item.productName} × {item.quantity}</li>
            ))}
          </ul>
        </article>
      ))}
    </main>
  );
}
