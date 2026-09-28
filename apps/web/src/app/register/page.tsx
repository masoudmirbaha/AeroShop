"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
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
    router.push("/account");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">ثبت‌نام</h1>
      <form action={submit} className="flex flex-col gap-3">
        <input name="firstName" required placeholder="نام" className="rounded-md border px-3 py-2" />
        <input name="lastName" required placeholder="نام خانوادگی" className="rounded-md border px-3 py-2" />
        <input name="email" type="email" required placeholder="ایمیل" className="rounded-md border px-3 py-2" />
        <input name="password" type="password" required minLength={8} placeholder="رمز عبور" className="rounded-md border px-3 py-2" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">ساخت حساب</button>
      </form>
      {error ? <p className="mt-3 text-sm">{error}</p> : null}
    </main>
  );
}
