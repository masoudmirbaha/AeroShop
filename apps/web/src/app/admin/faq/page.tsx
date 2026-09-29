"use client";

import { useState } from "react";
import { adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type Faq = { id: string; question: string; answer: string; sortOrder: number; isPublished: boolean };

function payload(formData: FormData) {
  return {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
    isPublished: formData.get("isPublished") === "on",
  };
}

function FaqFields({ item }: { item: Faq | null }) {
  return (
    <>
      <input name="question" required minLength={3} placeholder="پرسش" defaultValue={item?.question} className={inputClass} />
      <textarea name="answer" required minLength={3} placeholder="پاسخ" defaultValue={item?.answer} className={`${inputClass} min-h-24`} />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          ترتیب
          <input name="sortOrder" type="number" min={0} step={1} defaultValue={item?.sortOrder ?? 0} className={`${inputClass} w-24`} />
        </label>
        <label className="flex items-center gap-2">
          <input name="isPublished" type="checkbox" defaultChecked={item?.isPublished ?? true} />
          منتشر شود
        </label>
      </div>
    </>
  );
}

export default function AdminFaqPage() {
  const { data, error, reload } = useAdminData<Faq[]>("/admin/faq");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      setMessage(done);
      setEditing(null);
      reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "انجام نشد.");
    }
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">پرسش‌های متداول</h1>
      <Notice text={error || message} />
      <form
        action={(formData) => run(() => adminFetch("/admin/faq", sendJson("POST", payload(formData))), "پرسش اضافه شد.")}
        className="mb-8 grid gap-2 rounded-xl border p-4"
      >
        <p className="font-medium">پرسش جدید</p>
        <FaqFields item={null} />
        <button type="submit" className={`${primaryButton} justify-self-start`}>
          افزودن
        </button>
      </form>
      <div className="grid gap-3">
        {data?.map((item) =>
          editing === item.id ? (
            <form
              key={item.id}
              action={(formData) => run(() => adminFetch(`/admin/faq/${item.id}`, sendJson("PATCH", payload(formData))), "پرسش ذخیره شد.")}
              className="grid gap-2 rounded-xl border p-4"
            >
              <FaqFields item={item} />
              <div className="flex gap-2">
                <button type="submit" className={primaryButton}>
                  ذخیره
                </button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-md border px-4 py-2">
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            <article key={item.id} className="rounded-xl border p-4">
              <p className="font-medium">
                {item.question}
                {item.isPublished ? "" : " (پیش‌نویس)"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => setEditing(item.id)} className="underline">
                  ویرایش
                </button>
                <button
                  type="button"
                  className="text-destructive underline"
                  onClick={() => {
                    if (confirm("این پرسش حذف شود؟")) {
                      void run(() => adminFetch(`/admin/faq/${item.id}`, { method: "DELETE" }), "پرسش حذف شد.");
                    }
                  }}
                >
                  حذف
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </>
  );
}
