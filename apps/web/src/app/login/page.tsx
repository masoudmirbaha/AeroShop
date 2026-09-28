"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
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
    router.push("/account");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">ورود</h1>
      <form action={submit} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="ایمیل" className="rounded-md border px-3 py-2" />
        <input name="password" type="password" required placeholder="رمز عبور" className="rounded-md border px-3 py-2" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">ورود</button>
      </form>
      {error ? <p className="mt-3 text-sm">{error}</p> : null}
      <Link href="/register" className="mt-4 inline-block text-sm">ثبت‌نام</Link>
    </main>
  );
}
