"use client";

import { useState } from "react";
import { adminFetch, inputClass, Notice, Pager, primaryButton, sendJson, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatDate, requestStatusLabels } from "@/components/admin/labels";
import { formatPrice } from "@/lib/format";

type Request = {
  id: string;
  status: string;
  subject: string;
  message: string;
  quotedAmount: number | null;
  createdAt: string;
  service: { title: string };
  user: { email: string; firstName: string; lastName: string };
  messageCount: number;
};

export default function AdminServiceRequestsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const params = new URLSearchParams({ page: String(page), ...(status ? { status } : {}) });
  const { data, error, reload } = useAdminData<Paged<Request>>(`/admin/service-requests?${params}`);

  async function save(request: Request, formData: FormData) {
    const amount = String(formData.get("quotedAmount") ?? "").trim();
    try {
      await adminFetch(
        `/service-requests/${request.id}`,
        sendJson("PATCH", { status: formData.get("status"), ...(amount ? { quotedAmount: Number(amount) } : {}) }),
      );
      setMessage(`درخواست «${request.subject}» ذخیره شد.`);
      reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "انجام نشد.");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">درخواست‌های خدمات</h1>
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(requestStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Notice text={error || message} />
      {data?.items.length === 0 ? <p className="text-muted-foreground">درخواستی یافت نشد.</p> : null}
      <div className="grid gap-3">
        {data?.items.map((request) => (
          <article key={request.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">
                {request.subject} · {request.service.title}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {request.user.firstName} {request.user.lastName} · <span dir="ltr">{request.user.email}</span> · {request.messageCount} پیام
              {request.quotedAmount != null ? ` · قیمت: ${formatPrice(request.quotedAmount)}` : ""}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{request.message}</p>
            <form action={(formData) => save(request, formData)} className="mt-3 flex flex-wrap gap-2">
              <select name="status" defaultValue={request.status} className={inputClass}>
                {Object.entries(requestStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input name="quotedAmount" type="number" min={0} step={1} placeholder="مبلغ پیشنهادی (تومان)" defaultValue={request.quotedAmount ?? ""} className={inputClass} />
              <button type="submit" className={primaryButton}>
                ذخیره
              </button>
            </form>
          </article>
        ))}
      </div>
      {data ? <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} /> : null}
    </>
  );
}
