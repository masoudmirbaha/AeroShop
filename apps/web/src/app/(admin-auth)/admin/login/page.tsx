"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-client";
import { AuthShell } from "@/components/page";
import { useSession } from "@/components/session-provider";

const PANEL = "/admin";
const NO_ACCESS = "این حساب دسترسی مدیریت ندارد.";

/** Only in-panel paths are followed, so a crafted returnTo cannot send the admin off-site. */
function safeReturnTo(value: string | null) {
  if (!value || (value !== PANEL && !value.startsWith("/admin/"))) return PANEL;
  if (value.startsWith("/admin/login")) return PANEL;
  if (value.includes("//") || value.includes("\\")) return PANEL;
  return value;
}

function AdminLogin() {
  const router = useRouter();
  const session = useSession();
  const target = safeReturnTo(useSearchParams().get("returnTo"));
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // The access cookie lasts 15 minutes while the refresh cookie lasts a week, so a still-valid
  // session is renewed here (adminFetch retries once after a 401) instead of asking again.
  useEffect(() => {
    let cancelled = false;
    adminFetch<{ user: { role: string } }>("/auth/me").then(
      (body) => {
        if (cancelled) return;
        if (body.user.role === "ADMIN") {
          router.replace(target);
          return;
        }
        setError(NO_ACCESS);
        setChecking(false);
      },
      () => {
        if (!cancelled) setChecking(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [router, target]);

  async function submit(formData: FormData) {
    setError("");
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const body = (await response.json().catch(() => null)) as { user?: { role?: string } } | null;
    if (!response.ok || !body?.user) {
      setError("ورود انجام نشد.");
      return;
    }
    if (body.user.role !== "ADMIN") {
      setError(NO_ACCESS);
      return;
    }
    await session.refresh();
    router.replace(target);
    router.refresh();
  }

  return (
    <AuthShell title="ورود به پنل مدیریت" description="این بخش فقط برای حساب‌های با نقش مدیر است.">
      {checking ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground" aria-busy="true">
          <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          در حال بررسی نشست...
        </p>
      ) : (
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
      )}
    </AuthShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
