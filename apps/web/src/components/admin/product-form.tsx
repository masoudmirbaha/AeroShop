"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AdminError, adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

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
  sortOrder: number;
};
type Option = { id: string; name: string };
type FieldName = keyof typeof fieldCopy;

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

// Same limits as the API schema, used only to phrase an error the API already reported.
const fieldCopy = {
  title: "عنوان باید بین ۲ تا ۱۶۰ نویسه باشد.",
  slug: "فقط حروف کوچک انگلیسی، عدد و خط تیره؛ بین ۲ تا ۱۲۰ نویسه.",
  price: "قیمت باید عدد صحیح و صفر یا بیشتر باشد.",
  comparePrice: "قیمت قبل از تخفیف باید عدد صحیح و صفر یا بیشتر باشد.",
  categoryId: "دسته انتخاب‌شده معتبر نیست.",
  topicId: "موضوع انتخاب‌شده معتبر نیست.",
  summary: "خلاصه باید بین ۲ تا ۳۰۰ نویسه باشد.",
  description: "توضیحات باید بین ۲ تا ۲۰۰۰۰ نویسه باشد.",
  sortOrder: "ترتیب نمایش باید عدد صحیح بین ۰ تا ۱۰۰۰۰ باشد.",
} as const;

const SLUG_TAKEN = "این slug قبلاً استفاده شده است.";
const LEAVE = "تغییرات ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید خارج شوید؟";
const DUPLICATE_VALUE = "این مقدار قبلاً ثبت شده است";
const MISSING_ID = "محصول ذخیره شد اما شناسه آن دریافت نشد. آن را از فهرست محصولات باز کنید تا تصاویر و فایل‌ها را مدیریت کنید.";
const PRODUCT_ID = /^[A-Za-z0-9_-]+$/;

function readableFieldError(name: string, apiText: string) {
  if (/[\u0600-\u06FF]/.test(apiText)) return apiText;
  return fieldCopy[name as FieldName] ?? apiText;
}

export function ProductForm({
  id,
  defaultType,
  onSaved,
  cancelHref = "/admin/products",
}: {
  id?: string;
  defaultType?: string;
  onSaved?: () => void;
  cancelHref?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const dirty = useRef(false);
  const savingLock = useRef(false);
  const product = useAdminData<Product>(id ? `/admin/products/${id}` : null);
  const categories = useAdminData<Option[]>("/admin/categories");
  const topics = useAdminData<Option[]>("/topics");
  const current = product.data;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      event.preventDefault();
    };
    const interceptLink = (event: MouseEvent) => {
      if (!dirty.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (window.confirm(LEAVE)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", interceptLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", interceptLink, true);
    };
  }, []);

  if ((id && !current) || !categories.data || !topics.data) {
    return <Notice text={product.error || categories.error || topics.error || "در حال بارگذاری..."} />;
  }

  function markDirty() {
    dirty.current = true;
  }

  function clearField(name: string) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function showInvalid(event: FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    event.preventDefault();
    const el = event.currentTarget;
    setFieldErrors((prev) => ({ ...prev, [el.name]: readableFieldError(el.name, el.validationMessage) }));
  }

  function explain(reason: unknown) {
    if (!(reason instanceof AdminError)) {
      setMessage("ذخیره انجام نشد.");
      return;
    }
    if (reason.status === 409 && reason.message === DUPLICATE_VALUE) {
      setFieldErrors({ slug: SLUG_TAKEN });
      setMessage("");
      return;
    }
    const next: Record<string, string> = {};
    for (const [name, text] of Object.entries(reason.fields)) next[name] = readableFieldError(name, text);
    setFieldErrors(next);
    setMessage(Object.keys(next).length ? "" : reason.message);
  }

  // Use onSubmit (not form action): React 19 resets uncontrolled fields after a
  // fulfilled action, which would wipe values when we catch and show API errors.
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    setMessage("");
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
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
      sortOrder: Number(text("sortOrder") || 0),
    };
    try {
      const saved = await adminFetch<{ id?: unknown } | null>(id ? `/admin/products/${id}` : "/admin/products", sendJson(id ? "PATCH" : "POST", payload));
      if (id) {
        dirty.current = false;
        product.reload();
        setFormKey((value) => value + 1);
        onSaved?.();
        setMessage("تغییرات ذخیره شد.");
        savingLock.current = false;
        setSaving(false);
        return;
      }
      const createdId = typeof saved?.id === "string" && PRODUCT_ID.test(saved.id) ? saved.id : null;
      if (!createdId) {
        savingLock.current = false;
        setSaving(false);
        setMessage(MISSING_ID);
        return;
      }
      dirty.current = false;
      router.push(`/admin/products/${createdId}`);
    } catch (reason) {
      savingLock.current = false;
      setSaving(false);
      explain(reason);
    }
  }

  function leave() {
    if (dirty.current && !window.confirm(LEAVE)) return;
    dirty.current = false;
    router.push(cancelHref);
  }

  function errorFor(name: string) {
    const text = fieldErrors[name];
    if (!text) return null;
    return (
      <p id={`${name}-error`} role="alert" className="text-xs text-destructive">
        {text}
      </p>
    );
  }

  function invalidProps(name: string) {
    return {
      "aria-invalid": fieldErrors[name] ? true : undefined,
      "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
      onInvalid: showInvalid,
      onInput: () => clearField(name),
      onChange: () => clearField(name),
    };
  }

  const initialType = current?.type ?? defaultType ?? "SINGLE_PRODUCT";

  return (
    <form key={formKey} onSubmit={onSubmit} onInput={markDirty} onChange={markDirty} className="grid max-w-2xl gap-3">
      <Notice text={message} />
      <label className="grid gap-1 text-sm">
        عنوان
        <input name="title" required minLength={2} maxLength={160} defaultValue={current?.title} className={inputClass} {...invalidProps("title")} />
        {errorFor("title")}
      </label>
      <label className="grid gap-1 text-sm">
        slug (انگلیسی، با خط تیره)
        <input name="slug" required dir="ltr" minLength={2} maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={current?.slug} className={inputClass} {...invalidProps("slug")} />
        {errorFor("slug")}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          نوع
          <select name="type" defaultValue={initialType} className={inputClass}>
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
          <input name="price" type="number" min={0} step={1} required defaultValue={current?.price ?? 0} className={inputClass} {...invalidProps("price")} />
          {errorFor("price")}
        </label>
        <label className="grid gap-1 text-sm">
          قیمت قبل از تخفیف (اختیاری)
          <input name="comparePrice" type="number" min={0} step={1} defaultValue={current?.comparePrice ?? ""} className={inputClass} {...invalidProps("comparePrice")} />
          {errorFor("comparePrice")}
        </label>
        <label className="grid gap-1 text-sm">
          دسته
          <select name="categoryId" defaultValue={current?.categoryId ?? ""} className={inputClass} {...invalidProps("categoryId")}>
            <option value="">بدون دسته</option>
            {categories.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {errorFor("categoryId")}
        </label>
        <label className="grid gap-1 text-sm">
          موضوع
          <select name="topicId" defaultValue={current?.topicId ?? ""} className={inputClass} {...invalidProps("topicId")}>
            <option value="">بدون موضوع</option>
            {topics.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {errorFor("topicId")}
        </label>
        <label className="grid gap-1 text-sm">
          ترتیب نمایش
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={10000}
            step={1}
            required
            defaultValue={current?.sortOrder ?? 0}
            className={inputClass}
            {...invalidProps("sortOrder")}
          />
          <span className="text-xs text-muted-foreground">عدد کوچک‌تر = نمایش زودتر در فهرست‌ها.</span>
          {errorFor("sortOrder")}
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        خلاصه
        <input name="summary" required minLength={2} maxLength={300} defaultValue={current?.summary} className={inputClass} {...invalidProps("summary")} />
        {errorFor("summary")}
      </label>
      <label className="grid gap-1 text-sm">
        توضیحات
        <textarea name="description" required minLength={2} maxLength={20000} defaultValue={current?.description} className={`${inputClass} min-h-40`} {...invalidProps("description")} />
        {errorFor("description")}
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
        <button type="submit" disabled={saving} aria-busy={saving} className={primaryButton}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
        <button type="button" onClick={leave} className="rounded-md border px-4 py-2">
          انصراف
        </button>
      </div>
    </form>
  );
}
