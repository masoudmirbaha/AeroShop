"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import Link from "next/link";
import { EmptyState, Page } from "@/components/page";

export default function RouteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Page width="narrow" title="خطا در بارگذاری صفحه">
      <EmptyState
        icon={ServerCrash}
        title="دریافت اطلاعات این صفحه ممکن نشد"
        description="ممکن است ارتباط با سرور موقتاً قطع شده باشد. چند لحظه بعد دوباره تلاش کنید."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={retry} className="btn btn-primary">
              <RefreshCw aria-hidden="true" />
              تلاش دوباره
            </button>
            <Link href="/" className="btn btn-outline">
              صفحه اصلی
            </Link>
          </div>
        }
      />
    </Page>
  );
}
