"use client";

import { useState } from "react";
import { adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: string | null;
  productCount: number;
  childCount: number;
};

export default function AdminCategoriesPage() {
  const { data, error, reload } = useAdminData<Category[]>("/admin/categories");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      setMessage(done);
      setEditing(null);
      reload();
      return true;
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "انجام نشد.");
      return false;
    }
  }

  function payload(formData: FormData) {
    const text = (name: string) => String(formData.get(name) ?? "").trim();
    return {
      name: text("name"),
      slug: text("slug"),
      description: text("description") || null,
      parentId: text("parentId") || null,
    };
  }

  function fields(category: Category | null) {
    return (
      <>
        <input name="name" required minLength={2} placeholder="نام" defaultValue={category?.name} className={inputClass} />
        <input name="slug" required dir="ltr" pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="slug" defaultValue={category?.slug} className={inputClass} />
        <input name="description" placeholder="توضیح (اختیاری)" defaultValue={category?.description ?? ""} className={inputClass} />
        <select name="parentId" defaultValue={category?.parentId ?? ""} className={inputClass}>
          <option value="">بدون والد</option>
          {data
            ?.filter((item) => item.id !== category?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">دسته‌ها</h1>
      <Notice text={error || message} />
      {data ? (
        <form
          action={async (formData) => {
            await run(() => adminFetch("/admin/categories", sendJson("POST", payload(formData))), "دسته ساخته شد.");
          }}
          className="mb-8 grid gap-2 rounded-xl border p-4 sm:grid-cols-2"
        >
          <p className="font-medium sm:col-span-2">دسته جدید</p>
          {fields(null)}
          <button type="submit" className={`${primaryButton} sm:col-span-2 sm:justify-self-start`}>
            افزودن
          </button>
        </form>
      ) : null}
      <ul className="grid gap-3">
        {data?.map((category) =>
          editing === category.id ? (
            <li key={category.id} className="rounded-xl border p-4">
              <form
                action={async (formData) => {
                  await run(() => adminFetch(`/admin/categories/${category.id}`, sendJson("PATCH", payload(formData))), "دسته ذخیره شد.");
                }}
                className="grid gap-2 sm:grid-cols-2"
              >
                {fields(category)}
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className={primaryButton}>
                    ذخیره
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="rounded-md border px-4 py-2">
                    انصراف
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span dir="ltr">{category.slug}</span>
                  {category.parent ? ` · زیرمجموعه ${category.parent}` : ""} · {category.productCount} محصول
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" onClick={() => setEditing(category.id)} className="underline">
                  ویرایش
                </button>
                <button
                  type="button"
                  className="text-destructive underline"
                  onClick={() => {
                    if (confirm(`دسته «${category.name}» حذف شود؟ محصولات آن بدون دسته می‌شوند.`)) {
                      void run(() => adminFetch(`/admin/categories/${category.id}`, { method: "DELETE" }), "دسته حذف شد.");
                    }
                  }}
                >
                  حذف
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </>
  );
}
