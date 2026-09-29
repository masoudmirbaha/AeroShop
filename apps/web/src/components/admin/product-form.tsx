"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type Product = {
  type: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  comparePrice: number | null;
  level: string | null;
  categoryId: string | null;
  topicId: string | null;
  isPublished: boolean;
  isFeatured: boolean;
};
type Option = { id: string; name: string };

const types = [
  ["SINGLE_PRODUCT", "محصول"],
  ["BUNDLE", "بسته"],
  ["COURSE", "دوره"],
  ["FREE", "رایگان"],
];
const levels = [
  ["", "بدون سطح"],
  ["BEGINNER", "مبتدی"],
  ["INTERMEDIATE", "متوسط"],
  ["ADVANCED", "پیشرفته"],
];

export function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const product = useAdminData<Product>(id ? `/admin/products/${id}` : null);
  const categories = useAdminData<Option[]>("/admin/categories");
  const topics = useAdminData<Option[]>("/topics");
  const current = product.data;

  if ((id && !current) || !categories.data || !topics.data) {
    return <Notice text={product.error || categories.error || topics.error || "در حال بارگذاری..."} />;
  }

  async function submit(formData: FormData) {
    const text = (name: string) => String(formData.get(name) ?? "").trim();
    const comparePrice = text("comparePrice");
    const payload = {
      type: text("type"),
      title: text("title"),
      slug: text("slug"),
      summary: text("summary"),
      description: text("description"),
      price: Number(text("price") || 0),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      level: text("level") || null,
      categoryId: text("categoryId") || null,
      topicId: text("topicId") || null,
      isPublished: formData.get("isPublished") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    };
    try {
      await adminFetch(id ? `/admin/products/${id}` : "/admin/products", sendJson(id ? "PATCH" : "POST", payload));
      router.push("/admin/products");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "ذخیره انجام نشد.");
    }
  }

  return (
    <form action={submit} className="grid max-w-2xl gap-3">
      <Notice text={message} />
      <label className="grid gap-1 text-sm">
        عنوان
        <input name="title" required minLength={2} defaultValue={current?.title} className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        slug (انگلیسی، با خط تیره)
        <input name="slug" required dir="ltr" pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={current?.slug} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          نوع
          <select name="type" defaultValue={current?.type ?? "SINGLE_PRODUCT"} className={inputClass}>
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          سطح
          <select name="level" defaultValue={current?.level ?? ""} className={inputClass}>
            {levels.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          قیمت (تومان)
          <input name="price" type="number" min={0} step={1} required defaultValue={current?.price ?? 0} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          قیمت قبل از تخفیف (اختیاری)
          <input name="comparePrice" type="number" min={0} step={1} defaultValue={current?.comparePrice ?? ""} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          دسته
          <select name="categoryId" defaultValue={current?.categoryId ?? ""} className={inputClass}>
            <option value="">بدون دسته</option>
            {categories.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          موضوع
          <select name="topicId" defaultValue={current?.topicId ?? ""} className={inputClass}>
            <option value="">بدون موضوع</option>
            {topics.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        خلاصه
        <input name="summary" required minLength={2} maxLength={300} defaultValue={current?.summary} className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        توضیحات
        <textarea name="description" required minLength={2} defaultValue={current?.description} className={`${inputClass} min-h-40`} />
      </label>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input name="isPublished" type="checkbox" defaultChecked={current?.isPublished ?? false} />
          منتشر شود
        </label>
        <label className="flex items-center gap-2">
          <input name="isFeatured" type="checkbox" defaultChecked={current?.isFeatured ?? false} />
          ویژه
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" className={primaryButton}>
          ذخیره
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-md border px-4 py-2">
          انصراف
        </button>
      </div>
    </form>
  );
}
