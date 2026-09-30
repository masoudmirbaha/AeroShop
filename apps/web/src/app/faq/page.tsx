import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { FaqList, type FaqEntry } from "@/components/faq-list";
import { EmptyState, Page } from "@/components/page";
import { api } from "@/lib/api";

export default async function FaqPage() {
  const items = await api<FaqEntry[]>("/faq");
  return (
    <Page
      width="narrow"
      title="پرسش‌های متداول"
      description="پاسخ پرسش‌های رایج درباره خرید، دانلود و خدمات. اگر پاسخ خود را پیدا نکردید، با ما تماس بگیرید."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "پرسش‌ها" }]}
    >
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
