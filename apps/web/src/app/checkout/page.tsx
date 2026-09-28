"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function pay(result: "SUCCESS" | "FAILED") {
    const response = await fetch("/api/v1/orders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (!response.ok) {
      setMessage("ثبت سفارش انجام نشد. سبد را بررسی کنید.");
      return;
    }
    const order = await response.json();
    router.push(`/checkout/result?status=${order.status}&id=${order.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">تسویه</h1>
      <p className="mt-3 text-muted-foreground">پرداخت آزمایشی است. درگاه بانکی وصل نیست.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => pay("SUCCESS")} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          پرداخت موفق
        </button>
        <button type="button" onClick={() => pay("FAILED")} className="rounded-md border px-4 py-2">
          پرداخت ناموفق
        </button>
      </div>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </main>
  );
}
