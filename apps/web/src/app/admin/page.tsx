"use client";

import { useEffect, useState } from "react";

type Summary = { products: number; orders: number; users: number; requests: number; messages: number };

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/v1/admin/summary", { credentials: "include" }).then(async (response) => {
        if (!response.ok) {
          setError("این صفحه فقط برای نقش ADMIN است.");
          return;
        }
        setSummary(await response.json());
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">پنل مدیریت</h1>
      {error ? <p>{error}</p> : null}
      {summary ? (
        <ul className="grid gap-3 md:grid-cols-3 text-sm">
          <li className="rounded-xl border p-4">محصولات: {summary.products}</li>
          <li className="rounded-xl border p-4">سفارش‌ها: {summary.orders}</li>
          <li className="rounded-xl border p-4">کاربران: {summary.users}</li>
          <li className="rounded-xl border p-4">درخواست‌ها: {summary.requests}</li>
          <li className="rounded-xl border p-4">پیام‌ها: {summary.messages}</li>
        </ul>
      ) : null}
    </main>
  );
}
