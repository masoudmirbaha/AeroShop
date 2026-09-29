"use client";

import Link from "next/link";
import { useState } from "react";
import { adminFetch, inputClass, Notice, Pager, primaryButton, sendJson, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatPrice, typeLabel } from "@/lib/format";

type Row = {
  id: string;
  type: string;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  isFeatured: boolean;
  category: string | null;
  topic: string | null;
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const params = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
  const { data, error, reload } = useAdminData<Paged<Row>>(`/admin/products?${params}`);

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      setMessage(done);
      reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "انجام نشد.");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">محصولات</h1>
        <Link href="/admin/products/new" className={primaryButton}>
          محصول جدید
        </Link>
      </div>
      <form
        className="mb-4 flex gap-2"
        action={(formData) => {
          setPage(1);
          setQ(String(formData.get("q") ?? "").trim());
        }}
      >
        <input name="q" defaultValue={q} placeholder="جستجو در عنوان یا slug" className={`${inputClass} flex-1`} />
        <button type="submit" className="rounded-md border px-4 py-2">
          جستجو
        </button>
      </form>
      <Notice text={error || message} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-start text-muted-foreground">
            <tr>
              <th className="p-2 text-start">عنوان</th>
              <th className="p-2 text-start">نوع</th>
              <th className="p-2 text-start">قیمت</th>
              <th className="p-2 text-start">دسته / موضوع</th>
              <th className="p-2 text-start">وضعیت</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data?.items.map((product) => (
              <tr key={product.id} className="border-b align-top">
                <td className="p-2">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {product.slug}
                  </p>
                </td>
                <td className="p-2">{typeLabel(product.type)}</td>
                <td className="p-2">{formatPrice(product.price)}</td>
                <td className="p-2 text-muted-foreground">
                  {product.category ?? "—"} / {product.topic ?? "—"}
                </td>
                <td className="p-2">
                  {product.isPublished ? "منتشرشده" : "پیش‌نویس"}
                  {product.isFeatured ? " · ویژه" : ""}
                </td>
                <td className="flex flex-wrap gap-2 p-2">
                  <Link href={`/admin/products/${product.id}`} className="underline">
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    className="underline"
                    onClick={() =>
                      run(
                        () => adminFetch(`/admin/products/${product.id}`, sendJson("PATCH", { isPublished: !product.isPublished })),
                        product.isPublished ? "از انتشار خارج شد." : "منتشر شد.",
                      )
                    }
                  >
                    {product.isPublished ? "لغو انتشار" : "انتشار"}
                  </button>
                  <button
                    type="button"
                    className="text-destructive underline"
                    onClick={() => {
                      if (confirm(`«${product.title}» حذف شود؟`)) {
                        void run(() => adminFetch(`/admin/products/${product.id}`, { method: "DELETE" }), "محصول حذف شد.");
                      }
                    }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data ? <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} /> : null}
    </>
  );
}
