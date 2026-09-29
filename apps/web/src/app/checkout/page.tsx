"use client";

import { CreditCard, FlaskConical, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, Page } from "@/components/page";
import { useSession } from "@/components/session-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useSession();
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
    await refreshCart();
    router.push(`/checkout/result?status=${order.status}&id=${order.id}`);
  }

  return (
    <Page
      width="form"
      title="تسویه حساب"
      description="پرداخت را تکمیل کنید تا فایل‌ها در حساب شما فعال شوند."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "سبد خرید", href: "/cart" }, { label: "تسویه" }]}
    >
      <Card className="p-6 md:p-8">
        <div className="flex items-start gap-3 rounded-xl bg-accent/70 p-4 text-sm leading-6 text-accent-foreground">
          <FlaskConical className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          پرداخت آزمایشی است. درگاه بانکی وصل نیست.
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => pay("SUCCESS")} className="btn btn-primary btn-lg">
            <CreditCard aria-hidden="true" />
            پرداخت موفق
          </button>
          <button type="button" onClick={() => pay("FAILED")} className="btn btn-outline btn-lg">
            <XCircle aria-hidden="true" />
            پرداخت ناموفق
          </button>
        </div>
        {message ? (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        ) : null}
      </Card>
    </Page>
  );
}
