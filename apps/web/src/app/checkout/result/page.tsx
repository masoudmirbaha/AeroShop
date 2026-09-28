import Link from "next/link";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>;
}) {
  const { status, id } = await searchParams;
  const paid = status === "PAID";
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">{paid ? "سفارش ثبت شد" : "پرداخت انجام نشد"}</h1>
      <p className="mt-3 text-muted-foreground">
        {paid
          ? "فایل‌های محصول در بخش دانلودها در دسترس است."
          : "سبد خرید حفظ شده است و می‌توانید دوباره تلاش کنید."}
      </p>
      {id ? <p className="mt-2 text-sm">شماره سفارش: {id}</p> : null}
      <div className="mt-6 flex gap-3">
        <Link href="/account/orders" className="rounded-md border px-4 py-2">سفارش‌ها</Link>
        <Link href="/account/downloads" className="rounded-md border px-4 py-2">دانلودها</Link>
      </div>
    </main>
  );
}
