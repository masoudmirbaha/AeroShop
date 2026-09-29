"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/page";
import { useSession } from "@/components/session-provider";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    if (!response.ok) {
      setError("ورود انجام نشد.");
      return;
    }
    await session.refresh();
    router.push("/account");
    router.refresh();
  }

  return (
    <AuthShell
      title="ورود به حساب"
      description="برای دسترسی به سفارش‌ها، دانلودها و درخواست‌های خدمات وارد شوید."
      footer={
        <>
          حساب ندارید؟{" "}
          <Link href="/register" className="text-link">
            ثبت‌نام
          </Link>
        </>
      }
    >
      <form action={submit} className="grid gap-4">
        <label>
          <span className="field-label">ایمیل</span>
          <input name="email" type="email" required placeholder="ایمیل" autoComplete="email" dir="ltr" className="field text-end" />
        </label>
        <label>
          <span className="field-label">رمز عبور</span>
          <input name="password" type="password" required placeholder="رمز عبور" autoComplete="current-password" dir="ltr" className="field text-end" />
        </label>
        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-lg mt-1 w-full">
          ورود
        </button>
      </form>
    </AuthShell>
  );
}
