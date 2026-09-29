"use client";

import { useState } from "react";
import { inputClass, Notice, Pager, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatDate, orderStatusLabels } from "@/components/admin/labels";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  user: { email: string; firstName: string; lastName: string };
  payment: { provider: string; status: string } | null;
  items: { id: string; productName: string; unitPrice: number; quantity: number; lineTotal: number }[];
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const params = new URLSearchParams({ page: String(page), ...(status ? { status } : {}) });
  const { data, error } = useAdminData<Paged<Order>>(`/admin/orders?${params}`);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">سفارش‌ها</h1>
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Notice text={error} />
      {data?.items.length === 0 ? <p className="text-muted-foreground">سفارشی یافت نشد.</p> : null}
      <div className="grid gap-3">
        {data?.items.map((order) => (
          <details key={order.id} className="rounded-xl border p-4">
            <summary className="flex cursor-pointer flex-wrap justify-between gap-2">
              <span className="font-medium">
                {order.user.firstName} {order.user.lastName} · <span dir="ltr">{order.user.email}</span>
              </span>
              <span className="text-sm">
                {orderStatusLabels[order.status] ?? order.status} · {formatPrice(order.total)} · {formatDate(order.createdAt)}
              </span>
            </summary>
            <ul className="mt-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between border-b py-1">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              شناسه <span dir="ltr">{order.id}</span> · پرداخت {order.payment ? `${order.payment.provider} / ${order.payment.status}` : "ندارد"} · تخفیف {formatPrice(order.discount)}
            </p>
          </details>
        ))}
      </div>
      {data ? <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} /> : null}
    </>
  );
}
