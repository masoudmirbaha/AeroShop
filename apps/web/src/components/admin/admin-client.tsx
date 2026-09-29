"use client";

import { useCallback, useEffect, useState } from "react";

export class AdminError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Paged<T> = { items: T[]; page: number; pageSize: number; total: number };

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = () =>
    fetch(`/api/v1${path}`, {
      ...init,
      credentials: "include",
      headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
    });
  let response = await send();
  if (response.status === 401) {
    const refreshed = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" });
    if (refreshed.ok) response = await send();
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new AdminError(errorMessage(body), response.status);
  return body as T;
}

export function sendJson(method: "POST" | "PATCH", data: unknown): RequestInit {
  return { method, body: JSON.stringify(data) };
}

function errorMessage(body: unknown) {
  if (!body || typeof body !== "object") return "درخواست انجام نشد.";
  const { message, errors } = body as { message?: unknown; errors?: Record<string, unknown> };
  const text = typeof message === "string" ? message : "درخواست انجام نشد.";
  const fields = errors ? Object.keys(errors) : [];
  return fields.length ? `${text} (${fields.join("، ")})` : text;
}

export function useAdminData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    adminFetch<T>(path).then(
      (body) => {
        if (cancelled) return;
        setData(body);
        setError("");
      },
      (reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "بارگذاری انجام نشد.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { data, error, reload };
}

export function Pager({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-3 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn btn-outline btn-sm">
        قبلی
      </button>
      <span className="text-muted-foreground tabular-nums">
        صفحه {page} از {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn btn-outline btn-sm">
        بعدی
      </button>
    </div>
  );
}

export function Notice({ text }: { text: string }) {
  return text ? (
    <p role="status" className="my-3 rounded-lg border border-primary/15 bg-secondary/60 px-3 py-2 text-sm text-secondary-foreground">
      {text}
    </p>
  ) : null;
}

export const inputClass = "field field-inline";
export const primaryButton = "btn btn-primary";
