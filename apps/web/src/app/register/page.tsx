"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/page";
import { useSession } from "@/components/session-provider";

export default function RegisterPage() {
  const router = useRouter();
  const session = useSession();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
      }),
    });
    if (!response.ok) {
      setError("ثبت‌نام انجام نشد. ایمیل ممکن است تکراری باشد.");
      return;
    }
    await session.refresh();
    router.push("/account");
  }

  return (
    <AuthShell
      title="ساخت حساب کاربری"
      description="با ساخت حساب، خریدها و فایل‌ها و درخواست‌های خدمات در یک جا در دسترس شما هستند."
      footer={
        <>
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-link">
            ورود
          </Link>
        </>
      }
    >
      <form action={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">نام</span>
            <input name="firstName" required placeholder="نام" autoComplete="given-name" className="field" />
          </label>
          <label>
            <span className="field-label">نام خانوادگی</span>
            <input name="lastName" required placeholder="نام خانوادگی" autoComplete="family-name" className="field" />
          </label>
        </div>
        <label>
          <span className="field-label">ایمیل</span>
          <input name="email" type="email" required placeholder="ایمیل" autoComplete="email" dir="ltr" className="field text-end" />
        </label>
        <label>
          <span className="field-label">رمز عبور</span>
          <input name="password" type="password" required minLength={8} placeholder="رمز عبور" autoComplete="new-password" dir="ltr" className="field text-end" />
          <span className="mt-1.5 block text-xs text-muted-foreground">حداقل ۸ کاراکتر</span>
        </label>
        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-lg mt-1 w-full">
          ساخت حساب
        </button>
      </form>
    </AuthShell>
  );
}
