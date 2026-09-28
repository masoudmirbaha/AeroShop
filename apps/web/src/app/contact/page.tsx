"use client";

import { useState } from "react";

export default function ContactPage() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    setMessage(response.ok ? "پیام ثبت شد." : "ارسال پیام انجام نشد.");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">تماس با ما</h1>
      <form action={submit} className="flex flex-col gap-3">
        <input name="name" required placeholder="نام" className="rounded-md border px-3 py-2" />
        <input name="email" type="email" required placeholder="ایمیل" className="rounded-md border px-3 py-2" />
        <input name="subject" required placeholder="موضوع" className="rounded-md border px-3 py-2" />
        <textarea name="message" required minLength={10} placeholder="پیام" className="min-h-32 rounded-md border px-3 py-2" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">ارسال</button>
      </form>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </main>
  );
}
