"use client";

import { useEffect, useRef, useState } from "react";
import { AdminError, adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type ProductImageRow = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

const MAX_HINT = "حداکثر ۵ مگابایت · JPG، PNG یا WebP";

export function ProductImagesPanel({ productId }: { productId: string }) {
  const { data, error, reload } = useAdminData<ProductImageRow[]>(`/admin/products/${productId}/images`);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [replacePrimary, setReplacePrimary] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPickFile() {
    const file = inputRef.current?.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      setSelectedLabel("");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedLabel(`${file.name} · ${(file.size / 1024).toFixed(1)} کیلوبایت`);
  }

  function clearPicker() {
    if (inputRef.current) inputRef.current.value = "";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedLabel("");
  }

  async function onUpload() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!file || uploading) return;

    const previousPrimary = data?.[0];
    const keepIds = (data ?? []).filter((item) => item.id !== previousPrimary?.id).map((item) => item.id);
    setUploading(true);
    setMessage("");
    const body = new FormData();
    body.append("file", file);
    try {
      const uploaded = await adminFetch<ProductImageRow>(`/admin/products/${productId}/images`, { method: "POST", body });
      if (replacePrimary && previousPrimary) {
        await adminFetch(`/admin/products/${productId}/images/${previousPrimary.id}`, { method: "DELETE" });
        const order = [{ id: uploaded.id, sortOrder: 0 }, ...keepIds.map((id, sortOrder) => ({ id, sortOrder: sortOrder + 1 }))];
        await adminFetch(`/admin/products/${productId}/images/order`, sendJson("PATCH", order));
        setMessage("تصویر اصلی جایگزین شد.");
      } else {
        setMessage("تصویر با موفقیت آپلود شد.");
      }
      clearPicker();
      setReplacePrimary(false);
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "آپلود انجام نشد.");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(imageId: string) {
    if (busyId || reordering || !confirm("این تصویر حذف شود؟")) return;
    setBusyId(imageId);
    setMessage("");
    try {
      await adminFetch(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
      setMessage("تصویر حذف شد.");
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "حذف انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(imageId: string, direction: -1 | 1) {
    if (!data?.length || busyId || reordering) return;
    const index = data.findIndex((item) => item.id === imageId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= data.length) return;

    const next = data.map((item) => item.id);
    const temp = next[index]!;
    next[index] = next[swapWith]!;
    next[swapWith] = temp;
    const payload = next.map((id, sortOrder) => ({ id, sortOrder }));

    setReordering(true);
    setMessage("");
    try {
      await adminFetch(`/admin/products/${productId}/images/order`, sendJson("PATCH", payload));
      setMessage("ترتیب تصاویر به‌روز شد.");
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "جابه‌جایی انجام نشد.");
    } finally {
      setReordering(false);
    }
  }

  if (!data && !error) {
    return <Notice text="در حال بارگذاری تصاویر..." />;
  }

  return (
    <section className="mt-10 max-w-2xl border-t pt-8">
      <h2 className="mb-2 text-xl font-bold">تصاویر محصول</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        تصویر اول به‌عنوان کاور در فهرست و صفحه عمومی نمایش داده می‌شود. فایل روی دیسک پایدار سرور ذخیره می‌شود، نه فقط در حافظه مرورگر.
      </p>
      <Notice text={message || error} />

      <div className="mb-5 grid gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-[14rem] flex-1 gap-1 text-sm">
            انتخاب تصویر
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={uploading || reordering}
              className={inputClass}
              onChange={onPickFile}
            />
            <span className="text-xs text-muted-foreground">{MAX_HINT}</span>
          </label>
          <button
            type="button"
            disabled={uploading || reordering || !previewUrl}
            aria-busy={uploading}
            onClick={() => void onUpload()}
            className={primaryButton}
          >
            {uploading ? "در حال آپلود..." : "آپلود تصویر"}
          </button>
        </div>
        {data?.length ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={replacePrimary}
              disabled={uploading || reordering}
              onChange={(event) => setReplacePrimary(event.target.checked)}
            />
            پس از آپلود، تصویر اصلی فعلی حذف و با تصویر جدید جایگزین شود
          </label>
        ) : null}
        {previewUrl ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed px-3 py-3">
            <div className="relative size-24 overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload */}
              <img src={previewUrl} alt="پیش‌نمایش تصویر انتخاب‌شده" className="size-full object-cover" />
            </div>
            <div className="text-sm">
              <p className="font-medium">پیش‌نمایش قبل از آپلود</p>
              <p className="text-muted-foreground" dir="ltr">
                {selectedLabel}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!data?.length ? (
        <p className="text-sm text-muted-foreground">هنوز تصویری برای این محصول اضافه نشده است. تا قبل از آپلود، کارت عمومی از تصویر شبیه‌سازی استفاده می‌کند.</p>
      ) : (
        <ul className="grid gap-3">
          {data.map((image, index) => {
            const primary = index === 0;
            const rowBusy = busyId === image.id || reordering;
            return (
              <li key={image.id} className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3 text-sm">
                <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of API-streamed image */}
                  <img src={image.url} alt={image.alt || "تصویر محصول"} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 grid gap-1">
                  <span className="font-medium">
                    ترتیب {image.sortOrder + 1}
                    {primary ? " · تصویر اصلی / کاور" : ""}
                  </span>
                  {image.alt ? <span className="text-muted-foreground">{image.alt}</span> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="underline disabled:opacity-50"
                    disabled={rowBusy || index === 0}
                    onClick={() => void move(image.id, -1)}
                  >
                    بالا
                  </button>
                  <button
                    type="button"
                    className="underline disabled:opacity-50"
                    disabled={rowBusy || index === data.length - 1}
                    onClick={() => void move(image.id, 1)}
                  >
                    پایین
                  </button>
                  <button
                    type="button"
                    className="text-destructive underline disabled:opacity-50"
                    disabled={rowBusy}
                    aria-busy={busyId === image.id}
                    onClick={() => void onDelete(image.id)}
                  >
                    {busyId === image.id ? "در حال حذف..." : "حذف"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
