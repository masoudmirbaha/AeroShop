"use client";

import { LogIn, ShieldAlert, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AdminError, adminFetch } from "@/components/admin/admin-client";

type GateState = "loading" | "allowed" | "anonymous" | "forbidden";

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ user: { role: string } }>("/auth/me").then(
      (body) => {
        if (!cancelled) setState(body.user.role === "ADMIN" ? "allowed" : "forbidden");
      },
      (reason: unknown) => {
        if (!cancelled) setState(reason instanceof AdminError && reason.status === 401 ? "anonymous" : "forbidden");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" aria-busy="true">
        <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
        در حال بررسی دسترسی...
      </p>
    );
  }
  if (state === "anonymous") {
    return (
      <GateMessage icon={LogIn} title="برای ورود به پنل مدیریت وارد حساب شوید.">
        <Link href="/login" className="btn btn-primary">
          ورود
        </Link>
      </GateMessage>
    );
  }
  if (state === "forbidden") return <GateMessage icon={ShieldAlert} title="این بخش فقط برای نقش ADMIN است." />;
  return children;
}

function GateMessage({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10 ring-inset">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
