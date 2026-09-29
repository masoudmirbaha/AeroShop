"use client";

import { useState } from "react";
import { adminFetch, Notice, Pager, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatDate } from "@/components/admin/labels";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const { data, error, reload } = useAdminData<Paged<ContactMessage>>(`/admin/contact-messages?page=${page}`);

  async function remove(item: ContactMessage) {
    if (!confirm(`پیام «${item.subject}» حذف شود؟`)) return;
    try {
      await adminFetch(`/admin/contact-messages/${item.id}`, { method: "DELETE" });
      setNotice("پیام حذف شد.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "انجام نشد.");
    }
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">پیام‌های تماس</h1>
      <Notice text={error || notice} />
      {data?.items.length === 0 ? <p className="text-muted-foreground">پیامی نیست.</p> : null}
      <div className="grid gap-3">
        {data?.items.map((item) => (
          <article key={item.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">{item.subject}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.name} · <span dir="ltr">{item.email}</span>
              {item.phone ? (
                <>
                  {" "}
                  · <span dir="ltr">{item.phone}</span>
                </>
              ) : null}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{item.message}</p>
            <button type="button" onClick={() => remove(item)} className="mt-3 text-sm text-destructive underline">
              حذف
            </button>
          </article>
        ))}
      </div>
      {data ? <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} /> : null}
    </>
  );
}
