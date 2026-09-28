"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ServiceRequestForm({ serviceSlug, title }: { serviceSlug: string; title: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/service-requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceSlug,
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    setMessage(response.ok ? "درخواست ثبت شد و وضعیت آن NEW است." : "ثبت درخواست انجام نشد.");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <form action={submit} className="flex flex-col gap-3">
        <input name="subject" required minLength={3} placeholder="موضوع" className="rounded-md border px-3 py-2" />
        <textarea name="message" required minLength={10} placeholder="شرح درخواست" className="min-h-32 rounded-md border px-3 py-2" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">ارسال</button>
      </form>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </main>
  );
}
