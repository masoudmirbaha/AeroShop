"use client";

import { useRef, useState } from "react";
import { AdminError, adminFetch, inputClass, Notice, primaryButton, useAdminData } from "@/components/admin/admin-client";

type ProductFileRow = {
  id: string;
  productId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProductFilesPanel({ productId }: { productId: string }) {
  const { data, error, reload } = useAdminData<ProductFileRow[]>(`/admin/products/${productId}/files`);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      await adminFetch(`/admin/products/${productId}/files`, { method: "POST", body });
      if (input) input.value = "";
      setMessage("فایل با موفقیت آپلود شد.");
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "آپلود انجام نشد.");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(fileId: string) {
    if (deletingId || !confirm("این فایل حذف شود؟")) return;
    setDeletingId(fileId);
    setMessage("");
    try {
      await adminFetch(`/admin/products/${productId}/files/${fileId}`, { method: "DELETE" });
      setMessage("فایل حذف شد.");
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "حذف انجام نشد.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!data && !error) {
    return <Notice text="در حال بارگذاری فایل‌ها..." />;
  }

  return (
    <section className="mt-10 max-w-2xl border-t pt-8">
      <h2 className="mb-4 text-xl font-bold">فایل‌های قابل دانلود</h2>
      <Notice text={message || error} />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="grid min-w-[14rem] flex-1 gap-1 text-sm">
          انتخاب فایل
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.pdf,.txt,.7z,application/zip,application/pdf,text/plain,application/x-7z-compressed"
            disabled={uploading}
            className={inputClass}
          />
        </label>
        <button type="button" disabled={uploading} aria-busy={uploading} onClick={() => void onUpload()} className={primaryButton}>
          {uploading ? "در حال آپلود..." : "آپلود فایل"}
        </button>
      </div>

      {!data?.length ? (
        <p className="text-sm text-muted-foreground">هنوز فایلی اضافه نشده است.</p>
      ) : (
        <ul className="grid gap-3">
          {data.map((file) => (
            <li key={file.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border px-3 py-3 text-sm">
              <div className="grid gap-1">
                <span className="font-medium">{file.filename}</span>
                <span className="text-muted-foreground" dir="ltr">
                  {file.mimeType}
                </span>
                <span className="text-muted-foreground">
                  {formatSize(file.sizeBytes)} · {formatCreatedAt(file.createdAt)}
                </span>
              </div>
              <button
                type="button"
                className="text-destructive underline disabled:opacity-50"
                disabled={deletingId === file.id}
                aria-busy={deletingId === file.id}
                onClick={() => void onDelete(file.id)}
              >
                {deletingId === file.id ? "در حال حذف..." : "حذف"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
