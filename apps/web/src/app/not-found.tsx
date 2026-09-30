import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, Page } from "@/components/page";

export const metadata: Metadata = { title: "صفحه پیدا نشد", robots: { index: false } };

export default function NotFound() {
  return (
    <Page width="narrow" title="صفحه پیدا نشد">
      <EmptyState
        icon={SearchX}
        title="صفحه‌ای با این نشانی وجود ندارد"
        description="ممکن است نشانی اشتباه وارد شده باشد یا این محتوا حذف شده باشد."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn btn-primary">
              مشاهده محصولات
            </Link>
            <Link href="/" className="btn btn-outline">
              صفحه اصلی
            </Link>
          </div>
        }
      />
    </Page>
  );
}
