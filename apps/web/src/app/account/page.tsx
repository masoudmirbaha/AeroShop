"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { email: string; firstName: string; lastName: string; role: string };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/v1/auth/me", { credentials: "include" }).then(async (response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const body = await response.json();
        setUser(body.user);
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }

  if (!user) return <main className="px-4 py-10">در حال بارگذاری حساب...</main>;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">حساب کاربری</h1>
      <p className="mt-3">{user.firstName} {user.lastName}</p>
      <p className="text-sm text-muted-foreground">{user.email} · {user.role}</p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link href="/account/orders" className="rounded-md border px-3 py-2">سفارش‌ها</Link>
        <Link href="/account/downloads" className="rounded-md border px-3 py-2">دانلودها</Link>
        <Link href="/account/profile" className="rounded-md border px-3 py-2">پروفایل</Link>
        {user.role === "ADMIN" ? <Link href="/admin" className="rounded-md border px-3 py-2">مدیریت</Link> : null}
      </div>
      <button type="button" onClick={logout} className="mt-6 text-sm underline">خروج</button>
    </main>
  );
}
