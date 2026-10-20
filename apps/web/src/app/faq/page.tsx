import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { FaqList, type FaqEntry } from "@/components/faq-list";
import { EmptyState, Page } from "@/components/page";
import { demoFaq } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { tryApi } from "@/lib/try-api";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description: "پاسخ پرسش‌های رایج درباره خرید، دانلود و خدمات NtoPiran.",
};

export default async function FaqPage() {
  const load = await tryApi<FaqEntry[]>("/faq");
  const demoEnabled = demoCatalogEnabled();

  let items: FaqEntry[] = [];
  let usingDemo = false;
  let apiFailed = false;

  if (load.status === "ok") {
    items = load.data;
    if (!items.length && demoEnabled) {
      items = demoFaq;
      usingDemo = true;
    }
  } else {
    apiFailed = true;
    if (demoEnabled) {
      items = demoFaq;
      usingDemo = true;
    } else {
      throw new Error(load.message);
    }
  }

  return (
    <Page
      width="narrow"
      title="پرسش‌های متداول"
      description="پاسخ پرسش‌های رایج درباره خرید، دانلود و خدمات. اگر پاسخ خود را پیدا نکردید، با ما تماس بگیرید."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "پرسش‌ها" }]}
    >
      {apiFailed ? <ApiErrorNotice message="بارگذاری پرسش‌ها از سرور انجام نشد." /> : null}
      {usingDemo ? <DemoNotice message="پرسش‌های نمایشی برای دمو." /> : null}
      {items.length ? <FaqList items={items} /> : <EmptyState icon={HelpCircle} title="هنوز پرسشی ثبت نشده است" />}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        پاسخ خود را پیدا نکردید؟{" "}
        <Link href="/contact" className="text-link">
          پیام بفرستید
        </Link>
      </p>
    </Page>
  );
}
