"use client";

import { Download, FileDown, FolderDown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { EmptyState, IconTile, Page } from "@/components/page";
import { authFetch, useRequireAuth } from "@/components/session-provider";

type Grant = { id: string; filename: string; productTitle: string };

export default function DownloadsPage() {
  const { status, expired } = useRequireAuth();
  const [grants, setGrants] = useState<Grant[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void authFetch("/api/v1/downloads").then(async (response) => {
      if (cancelled) return;
      if (response.status === 401) return expired();
      setGrants(response.ok ? await response.json() : []);
    });
    return () => {
      cancelled = true;
    };
  }, [status, expired]);

  return (
    <Page
      title="دانلودهای من"
      description="فایل‌های محصولاتی که خریده‌اید. لینک‌ها با مجوز اختصاصی حساب شما باز می‌شوند."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "داشبورد", href: "/account" }, { label: "دانلودها" }]}
    >
      <AccountNav />
      {grants === null ? (
        <div className="grid gap-3" aria-busy="true">
          {[0, 1].map((key) => (
            <div key={key} className="surface h-20 animate-pulse bg-card/60" />
          ))}
        </div>
      ) : grants.length === 0 ? (
        <EmptyState
          icon={FolderDown}
          title="فایلی برای دانلود ندارید"
          description="بعد از خرید، فایل‌های محصول این‌جا نمایش داده می‌شوند."
          action={
            <Link href="/products" className="btn btn-primary">
              مشاهده محصولات
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          <p className="flex items-center gap-2 rounded-xl border border-primary/15 bg-secondary/50 px-4 py-3 text-sm text-secondary-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {grants.length.toLocaleString("fa-IR")} فایل در دسترس شماست. لینک‌ها فقط با حساب خودتان کار می‌کنند.
          </p>
          <div className="grid gap-3">
            {grants.map((grant) => (
              <div key={grant.id} className="surface card-glow group flex flex-wrap items-center gap-4 p-4">
                <IconTile icon={FileDown} className="transition-transform duration-300 group-hover:scale-105" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{grant.productTitle}</p>
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {grant.filename}
                  </p>
                </div>
                <a href={`/api/v1/downloads/${grant.id}`} className="btn btn-primary btn-sm">
                  <Download aria-hidden="true" />
                  دانلود
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
