"use client";

import { useRef, useState } from "react";
import { AdminError, adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type ProductImageRow = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export function ProductImagesPanel({ productId }: { productId: string }) {
  const { data, error, reload } = useAdminData<ProductImageRow[]>(`/admin/products/${productId}/images`);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onUpload() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    setMessage("");
    const body = new FormData();
    body.append("file", file);
    try {
      await adminFetch(`/admin/products/${productId}/images`, { method: "POST", body });
      if (input) input.value = "";
      setMessage("تصویر با موفقیت آپلود شد.");
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
      <h2 className="mb-4 text-xl font-bold">تصاویر محصول</h2>
      <Notice text={message || error} />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="grid min-w-[14rem] flex-1 gap-1 text-sm">
          انتخاب تصویر
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            disabled={uploading || reordering}
            className={inputClass}
          />
        </label>
        <button
          type="button"
          disabled={uploading || reordering}
          aria-busy={uploading}
          onClick={() => void onUpload()}
          className={primaryButton}
        >
          {uploading ? "در حال آپلود..." : "آپلود تصویر"}
        </button>
      </div>

      {!data?.length ? (
        <p className="text-sm text-muted-foreground">هنوز تصویری برای این محصول اضافه نشده است.</p>
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
                    {primary ? " · تصویر اصلی" : ""}
                  </span>
                  <span className="truncate text-muted-foreground" dir="ltr">
                    {image.url}
                  </span>
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
