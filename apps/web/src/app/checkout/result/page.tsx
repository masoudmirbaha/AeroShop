import { CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/page";

export const metadata: Metadata = { title: "نتیجه پرداخت", robots: { index: false } };

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>;
}) {
  const { status, id } = await searchParams;
  const paid = status === "PAID";
  const Icon = paid ? CheckCircle2 : XCircle;
  return (
    <Page width="form" title="نتیجه پرداخت" breadcrumbs={[{ label: "خانه", href: "/" }, { label: "سبد خرید", href: "/cart" }, { label: "نتیجه پرداخت" }]}>
      <div className="surface flex flex-col items-center px-6 py-10 text-center">
        <span className={`grid size-14 place-items-center rounded-full ${paid ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold">{paid ? "سفارش ثبت شد" : "پرداخت انجام نشد"}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {paid ? "فایل‌های محصول در بخش دانلودها در دسترس است." : "سبد خرید حفظ شده است و می‌توانید دوباره تلاش کنید."}
        </p>
        {id ? (
          <p className="mt-3 text-xs text-muted-foreground">
            شماره سفارش: <span dir="ltr">{id}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {paid ? (
            <Link href="/account/downloads" className="btn btn-primary">
              دانلودها
            </Link>
          ) : (
            <Link href="/cart" className="btn btn-primary">
              بازگشت به سبد
            </Link>
          )}
          <Link href="/account/orders" className="btn btn-outline">
            سفارش‌ها
          </Link>
        </div>
      </div>
    </Page>
  );
}
