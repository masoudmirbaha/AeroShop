"use client";

import Link from "next/link";
import { useState } from "react";
import { adminFetch, inputClass, Notice, Pager, primaryButton, sendJson, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatPrice } from "@/lib/format";

type Row = {
  id: string;
  type: string;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  category: string | null;
  topic: string | null;
};

const statuses = [
  ["", "همه"],
  ["published", "منتشرشده"],
  ["draft", "پیش‌نویس"],
];

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const params = new URLSearchParams({
    page: String(page),
    type: "COURSE",
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
  });
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
        <h1 className="text-3xl font-bold">دوره‌ها</h1>
        <Link href="/admin/products/new?type=COURSE" className={primaryButton}>
          دوره جدید
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <form
          className="flex min-w-60 flex-1 gap-2"
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
        <label className="grid min-w-36 flex-1 gap-1 text-sm sm:flex-none">
          وضعیت
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className={inputClass}
          >
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Notice text={error || message} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-start text-muted-foreground">
            <tr>
              <th className="p-2 text-start">عنوان</th>
              <th className="p-2 text-start">قیمت</th>
              <th className="p-2 text-start">ترتیب</th>
              <th className="p-2 text-start">دسته / موضوع</th>
              <th className="p-2 text-start">وضعیت</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data?.items.map((course) => (
              <tr key={course.id} className="border-b align-top">
                <td className="p-2">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {course.slug}
                  </p>
                </td>
                <td className="p-2">{formatPrice(course.price)}</td>
                <td className="p-2 tabular-nums text-muted-foreground">{course.sortOrder}</td>
                <td className="p-2 text-muted-foreground">
                  {course.category ?? "—"} / {course.topic ?? "—"}
                </td>
                <td className="p-2">
                  {course.isPublished ? "منتشرشده" : "پیش‌نویس"}
                  {course.isFeatured ? " · ویژه" : ""}
                </td>
                <td className="flex flex-wrap gap-2 p-2">
                  <Link href={`/admin/products/${course.id}`} className="underline">
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    className="underline"
                    onClick={() =>
                      run(
                        () => adminFetch(`/admin/products/${course.id}`, sendJson("PATCH", { isPublished: !course.isPublished })),
                        course.isPublished ? "از انتشار خارج شد." : "منتشر شد.",
                      )
                    }
                  >
                    {course.isPublished ? "لغو انتشار" : "انتشار"}
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
