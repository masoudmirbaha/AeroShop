"use client";

import { BadgeCheck, Mail, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { IconTile, Page } from "@/components/page";
import { useRequireAuth } from "@/components/session-provider";

function Field({ icon, label, value, ltr }: { icon: LucideIcon; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <IconTile icon={icon} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-0.5 truncate font-medium ${ltr ? "text-end" : ""}`} dir={ltr ? "ltr" : undefined}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useRequireAuth();

  const name = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "";
  const initial = user ? (user.firstName || user.email).charAt(0).toUpperCase() : "";

  return (
    <Page
      title="پروفایل"
      description="اطلاعات حساب شما در AeroShop."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "داشبورد", href: "/account" }, { label: "پروفایل" }]}
    >
      <AccountNav />
      {!user ? (
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]" aria-busy="true">
          <div className="surface h-56 animate-pulse bg-card/60" />
          <div className="surface h-56 animate-pulse bg-card/60" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="surface flex flex-col items-center p-6 text-center">
            <span aria-hidden="true" className="grid size-20 place-items-center avatar-fill rounded-full text-2xl font-semibold shadow-lg shadow-navy/15">
              {initial}
            </span>
            <p className="mt-4 max-w-full truncate font-semibold">{name}</p>
            <span className={`badge mt-2 ${user.role === "ADMIN" ? "badge-accent" : "badge-muted"}`}>{user.role === "ADMIN" ? "مدیر سایت" : "کاربر"}</span>
            <Link href="/account/orders" className="btn btn-outline btn-sm mt-6 w-full">
              مشاهده سفارش‌ها
            </Link>
          </aside>

          <section className="surface px-5">
            <div className="flex items-center gap-2 border-b border-border/70 py-4">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">مشخصات حساب</h2>
            </div>
            <div className="divide-y divide-border/70">
              <Field icon={UserRound} label="نام" value={user.firstName} />
              <Field icon={UserRound} label="نام خانوادگی" value={user.lastName} />
              <Field icon={Mail} label="ایمیل" value={user.email} ltr />
              <Field icon={ShieldCheck} label="نوع حساب" value={user.role === "ADMIN" ? "مدیر سایت" : "کاربر عادی"} />
            </div>
          </section>
        </div>
      )}
    </Page>
  );
}
